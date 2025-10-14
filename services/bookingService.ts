import AsyncStorage from '@react-native-async-storage/async-storage';
import { Booking, BookingStatus, BookingType } from '@/types';
import { ref, set, onValue, off, update } from 'firebase/database';
import { realtimeDb as getRealtimeDb } from '@/lib/firebase';
import { notificationService } from './notificationService';
import { rateLimitService } from './rateLimitService';
import { AppState, AppStateStatus } from 'react-native';

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

let pollingTimer: ReturnType<typeof setTimeout> | null = null;
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
    console.log('[Booking] Polling mode:', isActive ? 'active (10s)' : 'idle (30s)');
  },

  getCurrentPollingInterval(): number {
    return pollingConfig.isActive ? pollingConfig.activeInterval : pollingConfig.idleInterval;
  },

  subscribeToBookings(callback: BookingListener): () => void {
    const bookingsRef = ref(getRealtimeDb(), 'bookings');

    onValue(bookingsRef, async (snapshot) => {
      try {
        const data = snapshot.val();
        const bookings: Booking[] = data ? Object.values(data) : [];

        await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
        console.log('[Booking] Real-time update received:', bookings.length, 'bookings');
        callback(bookings);
      } catch (error) {
        console.error('[Booking] Error processing real-time update:', error);
      }
    });

    return () => {
      off(bookingsRef);
      console.log('[Booking] Unsubscribed from real-time updates');
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
        console.error('[Booking] Polling error:', error);
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
        } catch (e) {
          // ignore
        }
        appStateSubscription = null;
      }
      console.log('[Booking] Stopped polling');
    };
  },

  subscribeToGuardBookings(guardId: string, callback: BookingListener): () => void {
    const bookingsRef = ref(getRealtimeDb(), 'bookings');

    onValue(bookingsRef, async (snapshot) => {
      try {
        const data = snapshot.val();
        const allBookings: Booking[] = data ? Object.values(data) : [];
        const guardBookings = allBookings.filter(
          (b) =>
            ((b.status === 'pending' || b.status === 'confirmed') && (!b.guardId || b.guardId === guardId)) ||
            b.guardId === guardId
        );

        console.log('[Booking] Guard real-time update:', guardBookings.length, 'bookings for guard', guardId);
        callback(guardBookings);
      } catch (error) {
        console.error('[Booking] Error processing guard real-time update:', error);
      }
    });

    return () => {
      off(bookingsRef);
      console.log('[Booking] Unsubscribed from guard real-time updates');
    };
  },

  async createBooking(
    bookingData: Omit<Booking, 'id' | 'createdAt' | 'startCode' | 'status' | 'bookingType'>
  ): Promise<Booking> {
    try {
      const rateLimitCheck = await rateLimitService.checkRateLimit('booking', bookingData.clientId);
      if (!rateLimitCheck.allowed) {
        const errorMessage = rateLimitService.getRateLimitError('booking', rateLimitCheck.blockedUntil!);
        console.log('[Booking] Rate limit exceeded for client:', bookingData.clientId);
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

      console.log('[Booking] Created booking type:', bookingType, 'scheduled:', `${bookingData.scheduledDate}T${bookingData.scheduledTime}`);

      const bookings = await this.getAllBookings();
      bookings.push(booking);
      await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));

      try {
        const bookingsRef = ref(getRealtimeDb(), 'bookings');
        const bookingsData = bookings.reduce((acc, b) => ({ ...acc, [b.id]: cleanUndefined(b) }), {});
        await set(bookingsRef, bookingsData);
        console.log('[Booking] Synced to Firebase Realtime Database');

        if (booking.guardId) {
          await notificationService.notifyNewBookingRequest('Client', booking.id);
        }
      } catch (firebaseError) {
        console.error('[Booking] Firebase sync error (non-critical):', firebaseError);
      }

      console.log('[Booking] Created booking:', booking.id, 'guardId:', booking.guardId, 'Start code:', booking.startCode);
      return booking;
    } catch (error) {
      console.error('[Booking] Error creating booking:', error);
      throw error;
    }
  },

  async getAllBookings(): Promise<Booking[]> {
    try {
      const stored = await AsyncStorage.getItem(BOOKINGS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[Booking] Error loading bookings:', error);
      return [];
    }
  },

  async getBookingById(id: string): Promise<Booking | null> {
    try {
      const bookings = await this.getAllBookings();
      return bookings.find((b) => b.id === id) || null;
    } catch (error) {
      console.error('[Booking] Error getting booking:', error);
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
      console.error('[Booking] Error getting user bookings:', error);
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
          console.log('[Booking] Synced status update to Firebase');
          await notificationService.notifyBookingStatusChange(id, status, undefined, rejectionReason);
        } catch {
          console.error('[Booking] Firebase sync error (non-critical)');
        }

        console.log('[Booking] Updated booking status:', id, status);
      }
    } catch (error) {
      console.error('[Booking] Error updating booking status:', error);
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
          console.log('[Booking] Synced payment confirmation to Firebase');
          await notificationService.notifyBookingStatusChange(id, 'confirmed');
        } catch (firebaseError) {
          console.error('[Booking] Firebase sync error (non-critical):', firebaseError);
        }

        console.log('[Booking] Confirmed booking payment:', id, transactionId);
      }
    } catch (error) {
      console.error('[Booking] Error confirming booking payment:', error);
      throw error;
    }
  },
};
