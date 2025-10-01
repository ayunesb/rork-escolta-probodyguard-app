import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PUSH_TOKEN_KEY = '@escolta_push_token';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  type: 'booking_assigned' | 'guard_en_route' | 'payment_success' | 'booking_started' | 'booking_completed' | 'message_received' | 'booking_extended';
  bookingId?: string;
  guardId?: string;
  amount?: number;
  message?: string;
}

class NotificationService {
  private pushToken: string | null = null;

  async initialize(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        console.log('Push notifications not supported on web');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.error('Push notification permission denied');
        return false;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id',
      });
      
      this.pushToken = tokenData.data;
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, this.pushToken);
      
      console.log('Push token:', this.pushToken);

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#D4AF37',
        });
      }

      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  async getPushToken(): Promise<string | null> {
    if (this.pushToken) return this.pushToken;
    
    try {
      const stored = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
      if (stored) {
        this.pushToken = stored;
        return stored;
      }
    } catch (error) {
      console.error('Error getting push token:', error);
    }
    
    return null;
  }

  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: NotificationData,
    delaySeconds: number = 0
  ): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        console.log('Local notifications not supported on web');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: (data ? { ...data } : {}) as Record<string, unknown>,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: delaySeconds > 0 ? { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: delaySeconds, repeats: false } : null,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      if (Platform.OS === 'web') return;
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      if (Platform.OS === 'web') return;
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  async getBadgeCount(): Promise<number> {
    try {
      if (Platform.OS === 'web') return 0;
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  async setBadgeCount(count: number): Promise<void> {
    try {
      if (Platform.OS === 'web') return;
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  }

  addNotificationResponseReceivedListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  async notifyBookingAssigned(bookingId: string, guardName: string): Promise<void> {
    await this.scheduleLocalNotification(
      'Guard Assigned',
      `${guardName} has been assigned to your booking`,
      { type: 'booking_assigned', bookingId }
    );
  }

  async notifyGuardEnRoute(bookingId: string, guardName: string, eta: string): Promise<void> {
    await this.scheduleLocalNotification(
      'Guard En Route',
      `${guardName} is on the way. ETA: ${eta}`,
      { type: 'guard_en_route', bookingId }
    );
  }

  async notifyPaymentSuccess(bookingId: string, amount: number): Promise<void> {
    await this.scheduleLocalNotification(
      'Payment Successful',
      `Your payment of $${amount} has been processed`,
      { type: 'payment_success', bookingId, amount }
    );
  }

  async notifyBookingStarted(bookingId: string): Promise<void> {
    await this.scheduleLocalNotification(
      'Service Started',
      'Your protection service has begun',
      { type: 'booking_started', bookingId }
    );
  }

  async notifyBookingCompleted(bookingId: string): Promise<void> {
    await this.scheduleLocalNotification(
      'Service Completed',
      'Your protection service has ended. Please rate your experience',
      { type: 'booking_completed', bookingId }
    );
  }

  async notifyMessageReceived(guardName: string, message: string): Promise<void> {
    await this.scheduleLocalNotification(
      `Message from ${guardName}`,
      message,
      { type: 'message_received', message }
    );
  }

  async notifyBookingExtended(bookingId: string, additionalHours: number): Promise<void> {
    await this.scheduleLocalNotification(
      'Booking Extended',
      `Your service has been extended by ${additionalHours} hour(s)`,
      { type: 'booking_extended', bookingId }
    );
  }
}

export const notificationService = new NotificationService();
