import AsyncStorage from '@react-native-async-storage/async-storage';
import { Booking, BookingStatus, BookingType } from '@/types';
import { ref, set, onValue, off, update, get } from 'firebase/database';
import { realtimeDb as getRealtimeDb } from '@/lib/firebase';
import { notificationService } from './notificationService';
import { rateLimitService } from './rateLimitService';
import { userService } from './userService';
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

  // Une el guardBookingIndex de cada escolta de la empresa en una sola lista.
  // Las reglas de RTDB no dejan listar /bookings completo salvo a admin, y
  // una empresa no tiene su propio indice de reservas (las reservas son de
  // sus escoltas, no de ella), asi que se compone a partir de los indices de
  // cada escolta que ya existen.
  _subscribeToGuardIndices(guardIds: string[], callback: BookingListener): () => void {
    if (guardIds.length === 0) {
      callback([]);
      return () => {};
    }

    const bookingsByGuard = new Map<string, Booking[]>();
    const emit = () => callback(Array.from(bookingsByGuard.values()).flat());

    const unsubscribes = guardIds.map((guardId) =>
      this._subscribeViaIndex('guardBookingIndex', guardId, 'company-guard', (bookings) => {
        bookingsByGuard.set(guardId, bookings);
        emit();
      })
    );

    return () => unsubscribes.forEach((unsub) => unsub());
  },

  subscribeToCompanyBookings(companyId: string, callback: BookingListener): () => void {
    let cancelled = false;
    let cleanup: () => void = () => {};

    userService
      .listGuardsForCompany(companyId)
      .then((guards) => {
        if (cancelled) return;
        cleanup = this._subscribeToGuardIndices(guards.map((g) => g.id), callback);
      })
      .catch((error) => {
        logger.error('[Booking] Failed to load company guards for booking subscription:', error);
        callback([]);
      });

    return () => {
      cancelled = true;
      cleanup();
    };
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

  // Todas las mutaciones (aceptar, rechazar, cancelar, confirmar pago...)
  // buscaban la reserva SOLO en el cache local (AsyncStorage) antes de
  // escribir nada — si esta reserva no llego a ese dispositivo por otro
  // camino (p. ej. el escolta que la va a aceptar, en un dispositivo que
  // nunca la habia visto), `findIndex` daba -1, el bloque entero se
  // saltaba, y no se escribia nada en el servidor ni se avisaba del
  // fallo. Confirmado en vivo: un escolta real no podia aceptar una
  // reserva real. Estas dos funciones son el reemplazo: leen del
  // servidor primero (cae al cache solo si el servidor falla) y escriben
  // siempre al servidor, cache aparte.
  async _fetchBookingForMutation(id: string): Promise<Booking | null> {
    try {
      const snap = await get(ref(getRealtimeDb(), `bookings/${id}`));
      if (snap.exists()) return snap.val() as Booking;
    } catch (error) {
      logger.error(`[Booking] Server read failed while mutating ${id}:`, error);
    }
    const bookings = await this.getAllBookings();
    return bookings.find((b) => b.id === id) || null;
  },

  async _writeBookingUpdate(id: string, patch: Partial<Booking>, current: Booking): Promise<Booking> {
    const merged = { ...current, ...patch };
    try {
      const bookings = await this.getAllBookings();
      const idx = bookings.findIndex((b) => b.id === id);
      if (idx !== -1) bookings[idx] = merged;
      else bookings.push(merged);
      await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    } catch (error) {
      logger.error(`[Booking] Failed to update local cache for ${id} (non-critical):`, error);
    }
    const bookingRef = ref(getRealtimeDb(), `bookings/${id}`);
    await update(bookingRef, cleanUndefined(patch));
    return merged;
  },

  // --- Compatibility wrappers ---
  async getPendingBookingsForGuard(guardId: string): Promise<Booking[]> {
    const all = await this.getAllBookings();
    return all.filter((b) => b.status === 'pending' && (!b.guardId || b.guardId === guardId));
  },

  async acceptBooking(bookingId: string, guardId: string): Promise<void> {
    const current = await this._fetchBookingForMutation(bookingId);
    if (!current) {
      throw new Error('No se pudo aceptar: la reserva no existe en el servidor.');
    }
    await this._writeBookingUpdate(
      bookingId,
      { status: 'accepted', acceptedAt: new Date().toISOString(), guardId },
      current
    );
    await set(ref(getRealtimeDb(), `guardBookingIndex/${guardId}/${bookingId}`), true);
    await Promise.resolve(notificationService.notifyBookingStatusChange(bookingId, 'accepted')).catch((error) =>
      logger.error('[Booking] No se pudo avisar la aceptacion (no critico):', error)
    );
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

    const current = await this._fetchBookingForMutation(bookingId);
    if (!current) {
      logger.error(`[Booking] Cannot cancel ${bookingId}: not found on server`);
      return;
    }
    const patch: Partial<Booking> = {
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
    };
    if (cancelledBy) patch.cancelledBy = cancelledBy;
    if (reason) patch.cancellationReason = reason;

    await this._writeBookingUpdate(bookingId, patch, current);
    await Promise.resolve(notificationService.notifyBookingStatusChange(bookingId, 'cancelled', cancelledBy, reason)).catch((error) =>
      logger.error('[Booking] No se pudo avisar la cancelacion (no critico):', error)
    );
  },

  async extendBooking(bookingId: string, extraHours: number): Promise<void> {
    const current = await this._fetchBookingForMutation(bookingId);
    if (!current) return;
    await this._writeBookingUpdate(
      bookingId,
      {
        extensionCount: (current.extensionCount || 0) + 1,
        duration: (current.duration || 0) + extraHours,
      },
      current
    );
  },

  async rateBooking(
    bookingId: string,
    rating: number,
    ratingBreakdown?: { professionalism: number; punctuality: number; communication: number; languageClarity: number } | null,
    review?: string
  ): Promise<void> {
    const current = await this._fetchBookingForMutation(bookingId);
    if (!current) return;
    const patch: Partial<Booking> = { rating, review };
    if (ratingBreakdown) patch.ratingBreakdown = ratingBreakdown;
    await this._writeBookingUpdate(bookingId, patch, current);
  },

  async reassignGuard(bookingId: string, guardId: string): Promise<void> {
    const current = await this._fetchBookingForMutation(bookingId);
    if (!current) return;
    await this._writeBookingUpdate(bookingId, { guardId }, current);
    await set(ref(getRealtimeDb(), `guardBookingIndex/${guardId}/${bookingId}`), true);
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
    const current = await this._fetchBookingForMutation(id);
    if (!current) {
      logger.error(`[Booking] Cannot update status for ${id}: not found on server`);
      return;
    }

    const patch: Partial<Booking> = { status };
    if (status === 'accepted') patch.acceptedAt = new Date().toISOString();
    if (status === 'rejected') {
      patch.rejectedAt = new Date().toISOString();
      patch.rejectionReason = rejectionReason ?? undefined;
    }
    if (status === 'active') patch.startedAt = new Date().toISOString();
    if (status === 'completed') patch.completedAt = new Date().toISOString();

    await this._writeBookingUpdate(id, patch, current);
    await Promise.resolve(notificationService.notifyBookingStatusChange(id, status, undefined, rejectionReason)).catch((error) =>
      logger.error('[Booking] No se pudo avisar el cambio de estado (no critico):', error)
    );
  },

  async confirmBookingPayment(id: string, transactionId: string): Promise<void> {
    const current = await this._fetchBookingForMutation(id);
    if (!current) {
      throw new Error('No se pudo confirmar el pago: la reserva no existe en el servidor.');
    }
    await this._writeBookingUpdate(
      id,
      { status: 'confirmed', transactionId, confirmedAt: new Date().toISOString() },
      current
    );
    await Promise.resolve(notificationService.notifyBookingStatusChange(id, 'confirmed')).catch((error) =>
      logger.error('[Booking] No se pudo avisar la confirmacion de pago (no critico):', error)
    );
  },
};
