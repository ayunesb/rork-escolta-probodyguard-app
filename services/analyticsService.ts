import { Platform } from 'react-native';

export enum AnalyticsEvent {
  USER_SIGNUP = 'user_signup',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  BOOKING_STARTED = 'booking_started',
  BOOKING_COMPLETED = 'booking_completed',
  BOOKING_CANCELLED = 'booking_cancelled',
  PAYMENT_INITIATED = 'payment_initiated',
  PAYMENT_COMPLETED = 'payment_completed',
  PAYMENT_FAILED = 'payment_failed',
  EMERGENCY_TRIGGERED = 'emergency_triggered',
  SCREEN_VIEW = 'screen_view',
  API_ERROR = 'api_error',
}

class FirebaseAnalyticsHelper {
  private static instance: FirebaseAnalyticsHelper;
  private initialized = false;

  static getInstance() {
    if (!FirebaseAnalyticsHelper.instance) {
      FirebaseAnalyticsHelper.instance = new FirebaseAnalyticsHelper();
    }
    return FirebaseAnalyticsHelper.instance;
  }

  async initialize(): Promise<void> {
    try {
      console.log('[Analytics] Initialized (stub in Expo Go)');
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Firebase Analytics:', error);
    }
  }

  async logEvent(
    event: AnalyticsEvent,
    parameters?: Record<string, string | number | boolean>
  ): Promise<void> {
    if (!this.initialized) {
      console.warn('Analytics not initialized');
      return;
    }

    console.log(`[Analytics] Event: ${event}`, parameters);
  }

  async setUserId(userId: string): Promise<void> {
    if (!this.initialized) return;
    console.log(`[Analytics] User ID: ${userId}`);
  }

  async trackUserSignup(method: string, userType: string): Promise<void> {
    await this.logEvent(AnalyticsEvent.USER_SIGNUP, {
      method,
      user_type: userType,
      timestamp: Date.now(),
    });
  }

  async trackBookingCompleted(bookingId: string, amount: number): Promise<void> {
    await this.logEvent(AnalyticsEvent.BOOKING_COMPLETED, {
      booking_id: bookingId,
      amount,
      timestamp: Date.now(),
    });
  }

  async trackPaymentCompleted(transactionId: string, amount: number): Promise<void> {
    await this.logEvent(AnalyticsEvent.PAYMENT_COMPLETED, {
      transaction_id: transactionId,
      amount,
      timestamp: Date.now(),
    });
  }
}

export const analyticsService = FirebaseAnalyticsHelper.getInstance();
