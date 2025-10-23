/**
 * Booking Service Unit Tests
 * Tests for booking creation, status transitions, and real-time updates
 */

import { bookingService, _shouldShowGuardLocationByRule } from '@/services/bookingService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Booking } from '@/types';

// Mock logger first to prevent Firebase imports
jest.mock('@/utils/logger', () => ({
  logger: {
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock Firebase Realtime Database
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  set: jest.fn(),
  onValue: jest.fn(),
  off: jest.fn(),
  update: jest.fn(),
}));

jest.mock('@/lib/firebase', () => ({
  realtimeDb: jest.fn(() => ({})),
}));

// Mock notification service
jest.mock('@/services/notificationService', () => ({
  notificationService: {
    notifyNewBookingRequest: jest.fn(),
    notifyBookingStatusChange: jest.fn(),
  },
}));

// Mock rate limit service
jest.mock('@/services/rateLimitService', () => ({
  rateLimitService: {
    checkRateLimit: jest.fn(() => Promise.resolve({ allowed: true })),
    getRateLimitError: jest.fn(),
  },
}));

// Mock React Native AppState
jest.mock('react-native', () => ({
  AppState: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

// Helper function to create booking test data
function createBookingData(overrides: Partial<Omit<Booking, 'id' | 'createdAt' | 'startCode' | 'status' | 'bookingType'>> = {}): Omit<Booking, 'id' | 'createdAt' | 'startCode' | 'status' | 'bookingType'> {
  const now = new Date();
  const futureTime = new Date(now.getTime() + 2 * 60 * 60000); // 2 hours from now

  return {
    clientId: 'client-123',
    scheduledDate: formatLocalDate(futureTime),
    scheduledTime: formatLocalTime(futureTime),
    duration: 4,
    vehicleType: 'standard',
    protectionType: 'armed',
    dressCode: 'suit',
    numberOfProtectees: 1,
    numberOfProtectors: 1,
    pickupAddress: '123 Main St',
    pickupLatitude: 19.4326,
    pickupLongitude: -99.1332,
    totalAmount: 800,
    processingFee: 23.2,
    platformCut: 80,
    guardPayout: 696.8,
    ...overrides,
  };
}

// Helper to format local date as YYYY-MM-DD
function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to format local time as HH:MM:SS
function formatLocalTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

describe('BookingService - Booking Creation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('should create an instant booking (within 30 minutes)', async () => {
    const now = new Date();
    // Create time just within instant threshold (<= 30 mins)
    const scheduledTime = new Date(now.getTime() + 20 * 60000); // 20 minutes from now

    const bookingData = createBookingData({
      scheduledDate: formatLocalDate(scheduledTime),
      scheduledTime: formatLocalTime(scheduledTime),
    });

    const booking = await bookingService.createBooking(bookingData);

    expect(booking.id).toBeDefined();
    expect(booking.bookingType).toBe('instant');
    expect(booking.startCode).toHaveLength(6);
    expect(booking.status).toBe('pending');
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it('should create a scheduled booking (more than 30 minutes away)', async () => {
    const now = new Date();
    const scheduledTime = new Date(now.getTime() + 2 * 60 * 60000); // 2 hours from now

    const bookingData = createBookingData({
      scheduledDate: scheduledTime.toISOString().split('T')[0],
      scheduledTime: scheduledTime.toTimeString().split(' ')[0],
    });

    const booking = await bookingService.createBooking(bookingData);

    expect(booking.bookingType).toBe('scheduled');
    expect(booking.status).toBe('pending');
  });

  it('should create a cross-city booking', async () => {
    const now = new Date();
    const scheduledTime = new Date(now.getTime() + 2 * 60 * 60000);

    const bookingData = createBookingData({
      scheduledDate: scheduledTime.toISOString().split('T')[0],
      scheduledTime: scheduledTime.toTimeString().split(' ')[0],
      pickupCity: 'Mexico City',
      destinationCity: 'Guadalajara',
      destinationAddress: '456 Dest Ave',
      destinationLatitude: 20.6597,
      destinationLongitude: -103.3496,
      duration: 8,
      totalAmount: 2000,
    });

    const booking = await bookingService.createBooking(bookingData);

    expect(booking.bookingType).toBe('cross-city');
  });

  it('should generate unique booking ID and start code', async () => {
    const bookingData = createBookingData();

    const booking1 = await bookingService.createBooking(bookingData);
    
    // Small delay to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const booking2 = await bookingService.createBooking(bookingData);

    expect(booking1.id).not.toBe(booking2.id);
    expect(booking1.startCode).not.toBe(booking2.startCode);
  });
});

describe('BookingService - Status Transitions', () => {
  const mockBooking: Booking = {
    id: 'booking-123',
    clientId: 'client-123',
    guardId: 'guard-456',
    scheduledDate: '2024-12-20',
    scheduledTime: '14:00:00',
    duration: 4,
    vehicleType: 'standard',
    protectionType: 'armed',
    dressCode: 'suit',
    numberOfProtectees: 1,
    numberOfProtectors: 1,
    pickupAddress: '123 Main St',
    pickupLatitude: 19.4326,
    pickupLongitude: -99.1332,
    pickupCity: 'Mexico City',
    totalAmount: 800,
    processingFee: 23.2,
    platformCut: 80,
    guardPayout: 696.8,
    status: 'pending',
    bookingType: 'scheduled',
    startCode: '123456',
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([mockBooking]));
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('should accept a booking', async () => {
    await bookingService.acceptBooking('booking-123', 'guard-456');

    expect(AsyncStorage.setItem).toHaveBeenCalled();
    const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
    const bookings = JSON.parse(savedData);
    const updatedBooking = bookings.find((b: Booking) => b.id === 'booking-123');
    
    expect(updatedBooking.status).toBe('accepted');
    expect(updatedBooking.acceptedAt).toBeDefined();
  });

  it('should verify start code correctly', async () => {
    const isValid = await bookingService.verifyStartCode('booking-123', '123456');
    expect(isValid).toBe(true);
  });

  it('should reject invalid start code', async () => {
    const isValid = await bookingService.verifyStartCode('booking-123', '999999');
    expect(isValid).toBe(false);
  });

  it('should update booking status', async () => {
    await bookingService.updateBookingStatus('booking-123', 'active');

    const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
    const bookings = JSON.parse(savedData);
    const updatedBooking = bookings.find((b: Booking) => b.id === 'booking-123');
    
    expect(updatedBooking.status).toBe('active');
  });

  it('should cancel a booking', async () => {
    await bookingService.cancelBooking('booking-123', 'client', 'Client changed plans');

    const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
    const bookings = JSON.parse(savedData);
    const updatedBooking = bookings.find((b: Booking) => b.id === 'booking-123');
    
    expect(updatedBooking.status).toBe('cancelled');
    expect(updatedBooking.cancellationReason).toBe('Client changed plans');
    expect(updatedBooking.cancelledBy).toBe('client');
  });
});

describe('BookingService - Guard Location Visibility', () => {
  it('should show guard location when booking is active', () => {
    const booking: Booking = {
      id: 'booking-123',
      clientId: 'client-123',
      guardId: 'guard-456',
      scheduledDate: '2024-12-20',
      scheduledTime: '14:00:00',
      duration: 4,
      vehicleType: 'standard',
      protectionType: 'armed',
      dressCode: 'suit',
      numberOfProtectees: 1,
      numberOfProtectors: 1,
      pickupAddress: '123 Main St',
      pickupLatitude: 19.4326,
      pickupLongitude: -99.1332,
      pickupCity: 'Mexico City',
      totalAmount: 800,
      processingFee: 23.2,
      platformCut: 80,
      guardPayout: 696.8,
      status: 'active',
      bookingType: 'scheduled',
      startCode: '123456',
      createdAt: new Date().toISOString(),
    };

    expect(_shouldShowGuardLocationByRule(booking)).toBe(true);
  });

  it('should show guard location for scheduled booking within 10 minutes', () => {
    const now = new Date();
    // Set time exactly 8 minutes in the future to be within the 10-minute window
    const scheduledTime = new Date(now.getTime() + 8 * 60000);

    const booking: Booking = {
      id: 'booking-123',
      clientId: 'client-123',
      guardId: 'guard-456',
      scheduledDate: formatLocalDate(scheduledTime),
      scheduledTime: formatLocalTime(scheduledTime),
      duration: 4,
      vehicleType: 'standard',
      protectionType: 'armed',
      dressCode: 'suit',
      numberOfProtectees: 1,
      numberOfProtectors: 1,
      pickupAddress: '123 Main St',
      pickupLatitude: 19.4326,
      pickupLongitude: -99.1332,
      pickupCity: 'Mexico City',
      totalAmount: 800,
      processingFee: 23.2,
      platformCut: 80,
      guardPayout: 696.8,
      status: 'accepted',
      bookingType: 'scheduled',
      startCode: '123456',
      createdAt: new Date().toISOString(),
    };

    expect(_shouldShowGuardLocationByRule(booking)).toBe(true);
  });

  it('should not show guard location for scheduled booking too far in future', () => {
    const now = new Date();
    const scheduledTime = new Date(now.getTime() + 60 * 60000); // 1 hour from now

    const booking: Booking = {
      id: 'booking-123',
      clientId: 'client-123',
      guardId: 'guard-456',
      scheduledDate: scheduledTime.toISOString().split('T')[0],
      scheduledTime: scheduledTime.toTimeString().split(' ')[0],
      duration: 4,
      vehicleType: 'standard',
      protectionType: 'armed',
      dressCode: 'suit',
      numberOfProtectees: 1,
      numberOfProtectors: 1,
      pickupAddress: '123 Main St',
      pickupLatitude: 19.4326,
      pickupLongitude: -99.1332,
      pickupCity: 'Mexico City',
      totalAmount: 800,
      processingFee: 23.2,
      platformCut: 80,
      guardPayout: 696.8,
      status: 'accepted',
      bookingType: 'scheduled',
      startCode: '123456',
      createdAt: new Date().toISOString(),
    };

    expect(_shouldShowGuardLocationByRule(booking)).toBe(false);
  });
});

describe('BookingService - Polling Behavior', () => {
  it('should set polling mode to active', () => {
    bookingService.setPollingActive(true);
    expect(bookingService.getCurrentPollingInterval()).toBe(10000);
  });

  it('should set polling mode to idle', () => {
    bookingService.setPollingActive(false);
    expect(bookingService.getCurrentPollingInterval()).toBe(30000);
  });
});

describe('BookingService - Data Retrieval', () => {
  const mockBookings: Booking[] = [
    {
      id: 'booking-1',
      clientId: 'client-123',
      guardId: 'guard-456',
      scheduledDate: '2024-12-20',
      scheduledTime: '14:00:00',
      duration: 4,
      vehicleType: 'standard',
      protectionType: 'armed',
      dressCode: 'suit',
      numberOfProtectees: 1,
      numberOfProtectors: 1,
      pickupAddress: '123 Main St A',
      pickupLatitude: 19.4326,
      pickupLongitude: -99.1332,
      pickupCity: 'Mexico City',
      totalAmount: 800,
      processingFee: 23.2,
      platformCut: 80,
      guardPayout: 696.8,
      status: 'pending',
      bookingType: 'scheduled',
      startCode: '111111',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'booking-2',
      clientId: 'client-456',
      guardId: 'guard-456',
      scheduledDate: '2024-12-20',
      scheduledTime: '15:00:00',
      duration: 3,
      vehicleType: 'armored',
      protectionType: 'armed',
      dressCode: 'casual',
      numberOfProtectees: 1,
      numberOfProtectors: 1,
      pickupAddress: '123 Main St B',
      pickupLatitude: 19.4326,
      pickupLongitude: -99.1332,
      pickupCity: 'Mexico City',
      totalAmount: 600,
      processingFee: 17.4,
      platformCut: 60,
      guardPayout: 522.6,
      status: 'accepted',
      bookingType: 'instant',
      startCode: '222222',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'booking-3',
      clientId: 'client-789',
      guardId: 'guard-789',
      scheduledDate: '2024-12-20',
      scheduledTime: '16:00:00',
      duration: 2,
      vehicleType: 'standard',
      protectionType: 'unarmed',
      dressCode: 'tactical',
      numberOfProtectees: 1,
      numberOfProtectors: 1,
      pickupAddress: '123 Main St C',
      pickupLatitude: 19.4326,
      pickupLongitude: -99.1332,
      pickupCity: 'Mexico City',
      totalAmount: 400,
      processingFee: 11.6,
      platformCut: 40,
      guardPayout: 348.4,
      status: 'completed',
      bookingType: 'scheduled',
      startCode: '333333',
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockBookings));
  });

  it('should get all bookings', async () => {
    const bookings = await bookingService.getAllBookings();
    expect(bookings).toHaveLength(3);
  });

  it('should filter pending bookings for guard', async () => {
    const pending = await bookingService.getPendingBookingsForGuard('guard-456');
    expect(pending).toHaveLength(1);
    expect(pending[0].id).toBe('booking-1');
  });

  it('should get booking by ID', async () => {
    const booking = await bookingService.getBookingById('booking-2');
    expect(booking).not.toBeNull();
    expect(booking?.id).toBe('booking-2');
    expect(booking?.status).toBe('accepted');
  });

  it('should get bookings by user role (client)', async () => {
    const bookings = await bookingService.getBookingsByUser('client-123', 'client');
    expect(bookings).toHaveLength(1);
    expect(bookings[0].clientId).toBe('client-123');
  });

  it('should get bookings by user role (guard)', async () => {
    const bookings = await bookingService.getBookingsByUser('guard-456', 'guard');
    expect(bookings).toHaveLength(2);
  });
});

describe('BookingService - Helper Functions', () => {
  it('should get correct booking type label', () => {
    expect(bookingService.getBookingTypeLabel('instant')).toBe('Instant');
    expect(bookingService.getBookingTypeLabel('scheduled')).toBe('Scheduled');
    expect(bookingService.getBookingTypeLabel('cross-city')).toBe('Cross-city');
  });

  it('should calculate minutes until start correctly', () => {
    const now = new Date();
    const futureTime = new Date(now.getTime() + 30 * 60000); // 30 minutes from now

    const booking: Booking = {
      id: 'booking-123',
      clientId: 'client-123',
      scheduledDate: formatLocalDate(futureTime),
      scheduledTime: formatLocalTime(futureTime),
      duration: 4,
      vehicleType: 'standard',
      protectionType: 'armed',
      dressCode: 'suit',
      numberOfProtectees: 1,
      numberOfProtectors: 1,
      pickupAddress: '123 Main St',
      pickupLatitude: 19.4326,
      pickupLongitude: -99.1332,
      totalAmount: 800,
      processingFee: 23.2,
      platformCut: 80,
      guardPayout: 696.8,
      status: 'pending',
      bookingType: 'scheduled',
      startCode: '123456',
      createdAt: new Date().toISOString(),
    };

    const minutes = bookingService.getMinutesUntilStart(booking);
    // Allow for small timing variations
    expect(minutes).toBeGreaterThan(28);
    expect(minutes).toBeLessThan(32);
  });
});
