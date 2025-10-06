import AsyncStorage from '@react-native-async-storage/async-storage';
import { Booking, BookingStatus } from '@/types';
import { ref, set, onValue, off, update } from 'firebase/database';
import { realtimeDb } from '@/config/firebase';
import { notificationService } from './notificationService';

const BOOKINGS_KEY = '@escolta_bookings';

type BookingListener = (bookings: Booking[]) => void;

function generateStartCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const bookingService = {
  subscribeToBookings(callback: BookingListener): () => void {
    const bookingsRef = ref(realtimeDb, 'bookings');
    
    const listener = onValue(bookingsRef, async (snapshot) => {
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

  subscribeToGuardBookings(guardId: string, callback: BookingListener): () => void {
    const bookingsRef = ref(realtimeDb, 'bookings');
    
    const listener = onValue(bookingsRef, async (snapshot) => {
      try {
        const data = snapshot.val();
        const allBookings: Booking[] = data ? Object.values(data) : [];
        const guardBookings = allBookings.filter(b => 
          (b.status === 'pending' && (!b.guardId || b.guardId === guardId)) ||
          (b.guardId === guardId)
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
  async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'startCode' | 'status'>): Promise<Booking> {
    try {
      const booking: Booking = {
        ...bookingData,
        id: 'booking_' + Date.now(),
        status: 'pending',
        startCode: generateStartCode(),
        createdAt: new Date().toISOString(),
      };

      const bookings = await this.getAllBookings();
      bookings.push(booking);
      await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));

      try {
        const bookingsRef = ref(realtimeDb, 'bookings');
        const bookingsData = bookings.reduce((acc, b) => ({ ...acc, [b.id]: b }), {});
        await set(bookingsRef, bookingsData);
        console.log('[Booking] Synced to Firebase Realtime Database');

        if (booking.guardId) {
          await notificationService.notifyNewBookingRequest(
            'Client',
            booking.id
          );
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
      return bookings.find(b => b.id === id) || null;
    } catch (error) {
      console.error('[Booking] Error getting booking:', error);
      return null;
    }
  },

  async getBookingsByUser(userId: string, role: 'client' | 'guard' | 'company' | 'admin'): Promise<Booking[]> {
    try {
      const bookings = await this.getAllBookings();
      if (role === 'client' || role === 'company') {
        return bookings.filter(b => b.clientId === userId);
      } else if (role === 'guard') {
        return bookings.filter(b => b.guardId === userId);
      } else {
        return bookings;
      }
    } catch (error) {
      console.error('[Booking] Error getting user bookings:', error);
      return [];
    }
  },

  async updateBookingStatus(id: string, status: BookingStatus, rejectionReason?: string): Promise<void> {
    try {
      const bookings = await this.getAllBookings();
      const index = bookings.findIndex(b => b.id === id);
      
      if (index !== -1) {
        bookings[index].status = status;
        
        if (status === 'accepted') {
          bookings[index].acceptedAt = new Date().toISOString();
        } else if (status === 'rejected') {
          bookings[index].rejectedAt = new Date().toISOString();
          bookings[index].rejectionReason = rejectionReason;
        } else if (status === 'active') {
          bookings[index].startedAt = new Date().toISOString();
        } else if (status === 'completed') {
          bookings[index].completedAt = new Date().toISOString();
        }
        
        await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));

        try {
          const bookingRef = ref(realtimeDb, `bookings/${id}`);
          await update(bookingRef, bookings[index]);
          console.log('[Booking] Synced status update to Firebase');

          await notificationService.notifyBookingStatusChange(
            id,
            status,
            undefined,
            rejectionReason
          );
        } catch (firebaseError) {
          console.error('[Booking] Firebase sync error (non-critical):', firebaseError);
        }
        
        console.log('[Booking] Updated booking status:', id, status);
      }
    } catch (error) {
      console.error('[Booking] Error updating booking status:', error);
      throw error;
    }
  },

  async verifyStartCode(bookingId: string, code: string): Promise<boolean> {
    try {
      const booking = await this.getBookingById(bookingId);
      if (!booking) return false;
      
      const isValid = booking.startCode === code;
      console.log('[Booking] Start code verification:', isValid);
      return isValid;
    } catch (error) {
      console.error('[Booking] Error verifying start code:', error);
      return false;
    }
  },

  async rateBooking(
    bookingId: string,
    rating: number,
    ratingBreakdown: {
      professionalism: number;
      punctuality: number;
      communication: number;
      languageClarity: number;
    },
    review?: string
  ): Promise<void> {
    try {
      const bookings = await this.getAllBookings();
      const index = bookings.findIndex(b => b.id === bookingId);
      
      if (index !== -1) {
        bookings[index].rating = rating;
        bookings[index].ratingBreakdown = ratingBreakdown;
        bookings[index].review = review;
        
        await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
        console.log('[Booking] Rated booking:', bookingId, rating);
      }
    } catch (error) {
      console.error('[Booking] Error rating booking:', error);
      throw error;
    }
  },

  async extendBooking(bookingId: string, additionalHours: number): Promise<void> {
    try {
      const bookings = await this.getAllBookings();
      const index = bookings.findIndex(b => b.id === bookingId);
      
      if (index !== -1) {
        const booking = bookings[index];
        const newDuration = booking.duration + additionalHours;
        
        if (newDuration > 8) {
          throw new Error('Maximum booking duration is 8 hours');
        }
        
        bookings[index].duration = newDuration;
        await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
        console.log('[Booking] Extended booking:', bookingId, 'New duration:', newDuration);
      }
    } catch (error) {
      console.error('[Booking] Error extending booking:', error);
      throw error;
    }
  },

  shouldShowGuardLocation(booking: Booking): boolean {
    if (booking.status === 'active') {
      return true;
    }

    if (booking.status === 'en_route' || booking.status === 'accepted') {
      const scheduledTime = new Date(`${booking.scheduledDate}T${booking.scheduledTime}`);
      const now = new Date();
      const minutesUntilStart = (scheduledTime.getTime() - now.getTime()) / (1000 * 60);
      
      return minutesUntilStart <= 10;
    }

    return false;
  },

  async acceptBooking(bookingId: string, guardId: string): Promise<void> {
    try {
      const bookings = await this.getAllBookings();
      const index = bookings.findIndex(b => b.id === bookingId);
      
      if (index !== -1) {
        bookings[index].guardId = guardId;
        bookings[index].status = 'accepted';
        bookings[index].acceptedAt = new Date().toISOString();
        
        await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));

        try {
          const bookingRef = ref(realtimeDb, `bookings/${bookingId}`);
          await update(bookingRef, bookings[index]);
          console.log('[Booking] Synced acceptance to Firebase');

          await notificationService.notifyBookingStatusChange(
            bookingId,
            'accepted',
            'Guard'
          );
        } catch (firebaseError) {
          console.error('[Booking] Firebase sync error (non-critical):', firebaseError);
        }
        
        console.log('[Booking] Guard accepted booking:', bookingId);
      }
    } catch (error) {
      console.error('[Booking] Error accepting booking:', error);
      throw error;
    }
  },

  async rejectBooking(bookingId: string, reason: string): Promise<void> {
    try {
      const bookings = await this.getAllBookings();
      const index = bookings.findIndex(b => b.id === bookingId);
      
      if (index !== -1) {
        bookings[index].status = 'rejected';
        bookings[index].rejectedAt = new Date().toISOString();
        bookings[index].rejectionReason = reason;
        bookings[index].guardId = undefined;
        
        await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));

        try {
          const bookingRef = ref(realtimeDb, `bookings/${bookingId}`);
          await update(bookingRef, bookings[index]);
          console.log('[Booking] Synced rejection to Firebase');

          await notificationService.notifyBookingStatusChange(
            bookingId,
            'rejected',
            'Guard',
            reason
          );
        } catch (firebaseError) {
          console.error('[Booking] Firebase sync error (non-critical):', firebaseError);
        }
        
        console.log('[Booking] Guard rejected booking:', bookingId, reason);
      }
    } catch (error) {
      console.error('[Booking] Error rejecting booking:', error);
      throw error;
    }
  },

  async reassignGuard(bookingId: string, newGuardId: string): Promise<void> {
    try {
      const bookings = await this.getAllBookings();
      const index = bookings.findIndex(b => b.id === bookingId);
      
      if (index !== -1) {
        bookings[index].guardId = newGuardId;
        bookings[index].status = 'pending';
        bookings[index].rejectedAt = undefined;
        bookings[index].rejectionReason = undefined;
        
        await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
        console.log('[Booking] Reassigned booking to new guard:', bookingId, newGuardId);
      }
    } catch (error) {
      console.error('[Booking] Error reassigning guard:', error);
      throw error;
    }
  },

  async getPendingBookingsForGuard(guardId: string): Promise<Booking[]> {
    try {
      const bookings = await this.getAllBookings();
      console.log('[Booking] Total bookings:', bookings.length);
      const pending = bookings.filter(b => {
        const isPending = b.status === 'pending';
        const isAssignedToGuard = b.guardId === guardId;
        const isUnassigned = !b.guardId;
        
        return isPending && (isAssignedToGuard || isUnassigned);
      });
      console.log('[Booking] Pending bookings for guard', guardId, ':', pending.length);
      pending.forEach(b => console.log('  - Booking', b.id, 'guardId:', b.guardId, 'status:', b.status));
      return pending;
    } catch (error) {
      console.error('[Booking] Error getting pending bookings:', error);
      return [];
    }
  },
};
