import AsyncStorage from '@react-native-async-storage/async-storage';
import { Booking, BookingStatus, BookingType } from '@/types';
import { ref, set, onValue, off, update, get } from 'firebase/database';
import { realtimeDb as getRealtimeDb } from '@/lib/firebase';
import { notificationService } from './notificationService';
import { rateLimitService } from './rateLimitService';
import { AppState, AppStateStatus } from 'react-native';
import { logger } from '@/utils/logger';

const BOOKINGS_KEY = '@escolta_bookings';

type BookingListener = (bookings: Booking[]) => void;

interface PollingConfig {
  idleInterval: number;
  activeInterval: number;
  isActive: boolean;
}

const pollingConfig: PollingConfig = {
  idleInterval: 30000,
  activeInterval: 10000,
  isActive: false,
};

let pollingTimer: NodeJS.Timeout | null = null;
let appStateSubscription: { remove: () => void } | null = null;

function generateStartCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function determineBookingType(
  scheduledDate: string,
  scheduledTime: string,
  pickupCity?: string,
  destinationCity?: string
): BookingType {
  const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
  const now = new Date();
  const minutesUntilStart = (scheduledDateTime.getTime() - now.getTime()) / (1000 * 60);

  if (pickupCity && destinationCity && pickupCity.toLowerCase() !== destinationCity.toLowerCase()) {
    return 'cross-city';
  }

  if (minutesUntilStart <= 30) {
    return 'instant';
  }

  return 'scheduled';
}

export function _shouldShowGuardLocationByRule(booking: Booking): boolean {
  if (booking.status === 'active') return true;

  if (booking.status !== 'accepted' && booking.status !== 'en_route') return false;

  const scheduledDateTime = new Date(`${booking.scheduledDate}T${booking.scheduledTime}`);
  const now = new Date();
  const minutesUntilStart = (scheduledDateTime.getTime() - now.getTime()) / (1000 * 60);

  if (booking.bookingType === 'instant') return false;

  if (booking.bookingType === 'scheduled' || booking.bookingType === 'cross-city') {
    return minutesUntilStart <= 10;
  }

  return false;
}

function cleanUndefined(obj: any) {
  return JSON.parse(JSON.stringify(obj)); // converts undefined → null for Firebase compatibility
}

export const bookingService = {
  setPollingActive(isActive: boolean): void {
    pollingConfig.isActive = isActive;
    logger.log('[Booking] Polling mode:', { mode: isActive ? 'active (10s)' : 'idle (30s)' });
  },

  getCurrentPollingInterval(): number {
    return pollingConfig.isActive ? pollingConfig.activeInterval : pollingConfig.idleInterval;
  },

  subscribeToBookings(callback: BookingListener): () => void {
    const bookingsRef = ref(getRealtimeDb(), 'bookings');

    onValue(
      bookingsRef,
      async (snapshot) => {
        try {
          const data = snapshot.val();
          const bookings: Booking[] = data ? Object.values(data) : [];

          await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
          logger.log('[Booking] Real-time update received:', { count: bookings.length });
          callback(bookings);
        } catch (error) {
          logger.error('[Booking] Error processing real-time update:', error);
          callback(await this.getAllBookings());
        }
      },
      (error) => {
        // Without this, a denied read (e.g. no rule grants a list read of
        // /bookings for this role) leaves callers waiting on isLoading
        // forever instead of ever hearing back. Fall back to the last
        // locally cached snapshot so the screen can at least render.
        logger.error('[Booking] subscribeToBookings denied or failed:', error);
        this.getAllBookings().then(callback);
      }
    );

    return () => {
      off(bookingsRef);
      logger.log('[Booking] Unsubscribed from real-time updates');
    };
  },

  startPolling(callback: BookingListener): () => void {
    const poll = async () => {
      try {
        const bookings = await this.getAllBookings();
        callback(bookings);

        const interval = this.getCurrentPollingInterval();
        pollingTimer = setTimeout(poll, interval);
      } catch (error) {
        logger.error('[Booking] Polling error:', error);
        pollingTimer = setTimeout(poll, pollingConfig.idleInterval);
      }
    };

    // Listen to AppState to switch polling interval dynamically
    if (!appStateSubscription) {
      appStateSubscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
        const isActive = nextState === 'active';
        this.setPollingActive(isActive);
      }) as unknown as { remove: () => void };
    }

    // Start initial poll
    poll();

    return () => {
      if (pollingTimer) {
        clearTimeout(pollingTimer);
        pollingTimer = null;
      }
      if (appStateSubscription) {
        try {
          appStateSubscription.remove();
        } catch {
          // ignore
        }
        appStateSubscription = null;
      }
      logger.log('[Booking] Stopped polling');
    };
  },

  // No lee /bookings completo: las reglas solo dejan leer un booking a la
  // vez (ahi viven direcciones de clientes, no se puede listar sin filtro).
  // En vez de eso, lee un indice {indexPath}/{ownerId} que createBooking
  // mantiene, y trae cada reserva por su ID.
  _subscribeViaIndex(indexPath: string, ownerId: string, label: string, callback: BookingListener): () => void {
    const indexRef = ref(getRealtimeDb(), `${indexPath}/${ownerId}`);

    const loadFromIndex = async (bookingIds: string[]) => {
      const results = await Promise.all(
        bookingIds.map(async (id) => {
          try {
            const snap = await get(ref(getRealtimeDb(), `bookings/${id}`));
            return snap.exists() ? (snap.val() as Booking) : null;
          } catch (error) {
            logger.error(`[Booking] Failed to load indexed booking ${id}:`, error);
            return null;
          }
        })
      );
      const bookings = results.filter((b): b is Booking => b !== null);
      logger.log(`[Booking] ${label} real-time update:`, { count: bookings.length, ownerId });
      callback(bookings);
    };

    onValue(
      indexRef,
      (snapshot) => {
        const ids = snapshot.exists() ? Object.keys(snapshot.val()) : [];
        loadFromIndex(ids);
      },
      (error) => {
        logger.error(`[Booking] ${label} subscription denied or failed:`, error);
        callback([]);
      }
    );

    return () => {
      off(indexRef);
      logger.log(`[Booking] Unsubscribed from ${label} real-time updates`);
    };
  },

  subscribeToGuardBookings(guardId: string, callback: BookingListener): () => void {
    return this._subscribeViaIndex('guardBookingIndex', guardId, 'guard', callback);
  },

  subscribeToClientBookings(clientId: string, callback: BookingListener): () => void {
    return this._subscribeViaIndex('clientBookingIndex', clientId, 'client', callback);
  },

  async createBooking(
    bookingData: Omit<Booking, 'id' | 'createdAt' | 'startCode' | 'status' | 'bookingType'>
  ): Promise<Booking> {
    try {
      const rateLimitCheck = await rateLimitService.checkRateLimit('booking', bookingData.clientId);
      if (!rateLimitCheck.allowed) {
        const errorMessage = rateLimitService.getRateLimitError('booking', rateLimitCheck.blockedUntil!);
        logger.log('[Booking] Rate limit exceeded for client:', bookingData.clientId);
        throw new Error(errorMessage);
      }

      const bookingType = determineBookingType(
        bookingData.scheduledDate,
        bookingData.scheduledTime,
        bookingData.pickupCity,
        bookingData.destinationCity
      );

      const booking: Booking = {
        ...bookingData,
        id: 'booking_' + Date.now(),
        status: 'pending',
        bookingType,
        startCode: generateStartCode(),
        createdAt: new Date().toISOString(),
      };

      logger.log('[Booking] Created booking type:', { 
        bookingType, 
        scheduled: `${bookingData.scheduledDate}T${bookingData.scheduledTime}` 
      });

      const bookings = await this.getAllBookings();
      bookings.push(booking);
      await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));

        // Se escribe SOLO el nodo de esta reserva.
        //
        // Antes esto hacia `set` sobre /bookings entero, con la lista local del
        // telefono. Dos problemas graves:
        //
        //  1. Las reglas dan permiso de escritura en /bookings/$bookingId, no en
        //     /bookings. La escritura se rechazaba siempre con permission_denied,
        //     el error se tragaba como "non-critical" y la app anunciaba exito.
        //     La reserva quedaba solo en el AsyncStorage de ese telefono, sin que
        //     el escolta ni el administrador la vieran nunca. De ahi que la base
        //     tenga cero reservas.
        //  2. Aunque las reglas lo hubieran permitido, era peor: cada cliente
        //     habria sobreescrito la lista global con su copia local, borrando
        //     las reservas de todos los demas.
        //
        // Si la escritura falla se deshace la copia local y se propaga el error:
        // una reserva que nadie mas puede ver no es una reserva, y afirmar que si
        // lo era fue justo lo que mantuvo esto oculto.
        try {
          await set(ref(getRealtimeDb(), `bookings/${booking.id}`), cleanUndefined(booking));
          logger.log('[Booking] Guardada en Realtime Database:', { bookingId: booking.id });

          // Indice para que el escolta pueda listar sus propias reservas.
          // Las reglas solo dejan leer /bookings/$id uno por uno, nunca la
          // lista completa (con razon: ahi viven direcciones de clientes).
          // Sin este indice el escolta no tenia como enterarse de que IDs
          // buscar, y su pantalla de trabajos se quedaba vacia o pensando
          // para siempre.
          if (booking.guardId) {
            try {
              await set(ref(getRealtimeDb(), `guardBookingIndex/${booking.guardId}/${booking.id}`), true);
            } catch (indexError) {
              logger.error('[Booking] No se pudo indexar la reserva para el escolta:', { error: indexError });
            }
          }
          try {
            await set(ref(getRealtimeDb(), `clientBookingIndex/${booking.clientId}/${booking.id}`), true);
          } catch (indexError) {
            logger.error('[Booking] No se pudo indexar la reserva para el cliente:', { error: indexError });
          }
        } catch (firebaseError) {
          logger.error('[Booking] No se pudo guardar la reserva en el servidor:', { error: firebaseError });
          await AsyncStorage.setItem(
            BOOKINGS_KEY,
            JSON.stringify(bookings.filter((b) => b.id !== booking.id))
          );
          throw new Error('No se pudo guardar la reserva en el servidor. Intenta de nuevo.');
        }

        // El aviso al escolta va aparte: que falle no invalida la reserva.
        if (booking.guardId) {
          try {
            await notificationService.notifyNewBookingRequest('Client', booking.id);
          } catch (avisoError) {
            logger.error('[Booking] La reserva se guardo pero no se pudo avisar al escolta:', { error: avisoError });
          }
        }
      logger.log('[Booking] Created booking:', { 
        bookingId: booking.id, 
        guardId: booking.guardId, 
        startCode: booking.startCode 
      });
      return booking;
    } catch (error) {
      logger.error('[Booking] Error creating booking:', error);
      throw error;
    }
  },

  async getAllBookings(): Promise<Booking[]> {
    try {
      const stored = await AsyncStorage.getItem(BOOKINGS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      logger.error('[Booking] Error loading bookings:', error);
      return [];
    }
  },

  // --- Compatibility wrappers ---
  async getPendingBookingsForGuard(guardId: string): Promise<Booking[]> {
    const all = await this.getAllBookings();
    return all.filter((b) => b.status === 'pending' && (!b.guardId || b.guardId === guardId));
  },

  async acceptBooking(bookingId: string, guardId: string): Promise<void> {
    await this.updateBookingStatus(bookingId, 'accepted');
    // assign guard
    const bookings = await this.getAllBookings();
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx !== -1) {
      bookings[idx].guardId = guardId;
      await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
      const bookingsRef = ref(getRealtimeDb(), `bookings/${bookingId}`);
      await update(bookingsRef, cleanUndefined(bookings[idx]));
      await set(ref(getRealtimeDb(), `guardBookingIndex/${guardId}/${bookingId}`), true);
    }
  },

  async rejectBooking(bookingId: string, reason?: string): Promise<void> {
    await this.updateBookingStatus(bookingId, 'rejected', reason);
  },

  async cancelBooking(bookingId: string, cancelledByOrReason?: string, maybeReason?: string): Promise<void> {
    // Signature compatibility: cancelBooking(bookingId, reason?) OR cancelBooking(bookingId, 'client'|'guard', reason)
    let cancelledBy: 'client' | 'guard' | undefined;
    let reason: string | undefined;

    if (maybeReason !== undefined) {
      // called with (id, cancelledBy, reason)
      cancelledBy = (cancelledByOrReason as 'client' | 'guard') || undefined;
      reason = maybeReason;
    } else {
      // called with (id, reason)
      reason = cancelledByOrReason;
    }

    try {
      const bookings = await this.getAllBookings();
      const idx = bookings.findIndex((b) => b.id === bookingId);
      if (idx === -1) return;
      const b = bookings[idx];
      b.status = 'cancelled';
      b.cancelledAt = new Date().toISOString();
      if (cancelledBy) b.cancelledBy = cancelledBy as any;
      if (reason) b.cancellationReason = reason;

      await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));

      try {
        const bookingRef = ref(getRealtimeDb(), `bookings/${bookingId}`);
        await update(bookingRef, cleanUndefined(b));
        logger.log('[Booking] Synced cancellation to Firebase');
        await notificationService.notifyBookingStatusChange(bookingId, 'cancelled', cancelledBy as any, reason);
      } catch {
        logger.error('[Booking] Firebase sync error (non-critical)');
      }
    } catch (error) {
      logger.error('[Booking] Error cancelling booking:', error);
      throw error;
    }
  },

  async extendBooking(bookingId: string, extraHours: number): Promise<void> {
    const bookings = await this.getAllBookings();
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) return;
    bookings[idx].extensionCount = (bookings[idx].extensionCount || 0) + 1;
    bookings[idx].duration = (bookings[idx].duration || 0) + extraHours;
    await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    const bookingsRef = ref(getRealtimeDb(), `bookings/${bookingId}`);
    await update(bookingsRef, cleanUndefined(bookings[idx]));
  },

  async rateBooking(
    bookingId: string,
    rating: number,
    ratingBreakdown?: { professionalism: number; punctuality: number; communication: number; languageClarity: number } | null,
    review?: string
  ): Promise<void> {
    const bookings = await this.getAllBookings();
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) return;
    bookings[idx].rating = rating;
    if (ratingBreakdown) bookings[idx].ratingBreakdown = ratingBreakdown as any;
    bookings[idx].review = review;
    await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    const bookingsRef = ref(getRealtimeDb(), `bookings/${bookingId}`);
    await update(bookingsRef, cleanUndefined(bookings[idx]));
  },

  async reassignGuard(bookingId: string, guardId: string): Promise<void> {
    const bookings = await this.getAllBookings();
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) return;
    bookings[idx].guardId = guardId;
    await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    const bookingsRef = ref(getRealtimeDb(), `bookings/${bookingId}`);
    await update(bookingsRef, cleanUndefined(bookings[idx]));
  },

  shouldShowGuardLocation(booking: Booking): boolean {
    return _shouldShowGuardLocationByRule(booking);
  },

  getMinutesUntilStart(booking: Booking): number {
    const scheduledDateTime = new Date(`${booking.scheduledDate}T${booking.scheduledTime}`);
    const now = new Date();
    return Math.max(0, Math.floor((scheduledDateTime.getTime() - now.getTime()) / (1000 * 60)));
  },

  async verifyStartCode(bookingId: string, code: string, userId?: string): Promise<boolean> {
    const booking = await this.getBookingById(bookingId);
    if (!booking) return false;
    return booking.startCode === code;
  },

  getBookingTypeLabel(bookingType: BookingType): string {
    switch (bookingType) {
      case 'instant': return 'Instant';
      case 'scheduled': return 'Scheduled';
      case 'cross-city': return 'Cross-city';
      default: return 'Unknown';
    }
  },

  async getBookingById(id: string): Promise<Booking | null> {
    // Antes esto SOLO leia el cache local (AsyncStorage), nunca el
    // servidor. Un escolta que entra desde un dispositivo que nunca
    // sincronizo esa reserva veia "Booking not found" aunque la reserva
    // existiera y las reglas le dieran permiso de leerla — comprobado en
    // vivo: la pantalla de detalle, el codigo de inicio y el chat dependen
    // todos de esta funcion.
    try {
      const snap = await get(ref(getRealtimeDb(), `bookings/${id}`));
      if (snap.exists()) {
        return snap.val() as Booking;
      }
    } catch (error) {
      logger.error(`[Booking] Server read failed for ${id}, falling back to local cache:`, error);
    }

    try {
      const bookings = await this.getAllBookings();
      return bookings.find((b) => b.id === id) || null;
    } catch (error) {
      logger.error('[Booking] Error getting booking from local cache:', error);
      return null;
    }
  },

  async getBookingsByUser(userId: string, role: 'client' | 'guard' | 'company' | 'admin'): Promise<Booking[]> {
    try {
      const bookings = await this.getAllBookings();
      if (role === 'client' || role === 'company') return bookings.filter((b) => b.clientId === userId);
      if (role === 'guard') return bookings.filter((b) => b.guardId === userId);
      return bookings;
    } catch (error) {
      logger.error('[Booking] Error getting user bookings:', error);
      return [];
    }
  },

  async updateBookingStatus(id: string, status: BookingStatus, rejectionReason?: string): Promise<void> {
    try {
      const bookings = await this.getAllBookings();
      const index = bookings.findIndex((b) => b.id === id);

      if (index !== -1) {
        const b = bookings[index];
        b.status = status;

        if (status === 'accepted') b.acceptedAt = new Date().toISOString();
        if (status === 'rejected') {
          b.rejectedAt = new Date().toISOString();
          b.rejectionReason = rejectionReason ?? undefined;
        }
        if (status === 'active') b.startedAt = new Date().toISOString();
        if (status === 'completed') b.completedAt = new Date().toISOString();

        await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));

        try {
          const bookingRef = ref(getRealtimeDb(), `bookings/${id}`);
          await update(bookingRef, cleanUndefined(b));
          logger.log('[Booking] Synced status update to Firebase');
          await notificationService.notifyBookingStatusChange(id, status, undefined, rejectionReason);
        } catch {
          logger.error('[Booking] Firebase sync error (non-critical)');
        }

        logger.log('[Booking] Updated booking status:', { id, status });
      }
    } catch (error) {
      logger.error('[Booking] Error updating booking status:', error);
      throw error;
    }
  },

  async confirmBookingPayment(id: string, transactionId: string): Promise<void> {
    try {
      const bookings = await this.getAllBookings();
      const index = bookings.findIndex((b) => b.id === id);

      if (index !== -1) {
        const b = bookings[index];
        b.status = 'confirmed';
        b.transactionId = transactionId;
        b.confirmedAt = new Date().toISOString();

        await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));

        try {
          const bookingRef = ref(getRealtimeDb(), `bookings/${id}`);
          await update(bookingRef, cleanUndefined(b));
          logger.log('[Booking] Synced payment confirmation to Firebase');
          await notificationService.notifyBookingStatusChange(id, 'confirmed');
        } catch (firebaseError) {
          logger.error('[Booking] Firebase sync error (non-critical):', { error: firebaseError });
        }

        logger.log('[Booking] Confirmed booking payment:', { bookingId: id, transactionId });
      }
    } catch (error) {
      logger.error('[Booking] Error confirming booking payment:', error);
      throw error;
    }
  },
};
