import AsyncStorage from '@react-native-async-storage/async-storage';
import { Booking, BookingStatus } from '@/types';

const BOOKINGS_KEY = '@escolta_bookings';

function generateStartCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const bookingService = {
  async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'startCode' | 'status'>): Promise<Booking> {
    try {
      const booking: Booking = {
        ...bookingData,
        id: 'booking_' + Date.now(),
        status: 'confirmed',
        startCode: generateStartCode(),
        createdAt: new Date().toISOString(),
      };

      const bookings = await this.getAllBookings();
      bookings.push(booking);
      await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));

      console.log('[Booking] Created booking:', booking.id, 'Start code:', booking.startCode);
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

  async updateBookingStatus(id: string, status: BookingStatus): Promise<void> {
    try {
      const bookings = await this.getAllBookings();
      const index = bookings.findIndex(b => b.id === id);
      
      if (index !== -1) {
        bookings[index].status = status;
        
        if (status === 'active') {
          bookings[index].startedAt = new Date().toISOString();
        } else if (status === 'completed') {
          bookings[index].completedAt = new Date().toISOString();
        }
        
        await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
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
};
