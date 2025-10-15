import { Platform } from 'react-native';

// Conditionally import React Native Firebase Analytics
let analytics: any = null;
if (Platform.OS !== 'web' && !__DEV__) {
  try {
    // Dynamic import for React Native Firebase in production builds only
    import('@react-native-firebase/analytics').then((module) => {
      analytics = module.default;
    });
  } catch {
    console.log('React Native Firebase Analytics not available in development mode');
  }
}

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
      if (!analytics) {
        console.log('Analytics not available in development mode');
        this.initialized = true;
        return;
      }
      
      await analytics().setAnalyticsCollectionEnabled(true);
      await analytics().setDefaultEventParameters({
        platform: Platform.OS,
        app_version: '1.0.0',
      });
      this.initialized = true;
      console.log('Firebase Analytics initialized successfully');
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

    if (!analytics) {
      console.log(`[Dev] Analytics event: ${event}`, parameters);
      return;
    }

    try {
      await analytics().logEvent(event, parameters);
    } catch (error) {
      console.error('Failed to log event:', error);
    }
  }

  async setUserId(userId: string): Promise<void> {
    if (!this.initialized) return;
    if (!analytics) {
      console.log(`[Dev] Analytics user ID: ${userId}`);
      return;
    }
    try {
      await analytics().setUserId(userId);
    } catch (error) {
      console.error('Failed to set user ID:', error);
    }
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
