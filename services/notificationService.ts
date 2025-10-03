import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[Notifications] Permission denied');
        return false;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#D4AF37',
        });
      }

      console.log('[Notifications] Permission granted');
      return true;
    } catch (error) {
      console.error('[Notifications] Error requesting permissions:', error);
      return false;
    }
  },

  async registerForPushNotifications(userId: string): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('[Notifications] Push token:', token);

      await updateDoc(doc(db, 'users', userId), {
        pushToken: token,
        pushTokenUpdatedAt: new Date().toISOString(),
      });

      return token;
    } catch (error) {
      console.error('[Notifications] Error registering for push notifications:', error);
      return null;
    }
  },

  async sendLocalNotification(title: string, body: string, data?: any): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null,
      });
      console.log('[Notifications] Local notification sent:', title);
    } catch (error) {
      console.error('[Notifications] Error sending local notification:', error);
    }
  },

  async notifyBookingStatusChange(bookingId: string, status: string, guardName?: string): Promise<void> {
    const statusMessages: Record<string, { title: string; body: string }> = {
      confirmed: {
        title: 'Booking Confirmed',
        body: 'Your protection booking has been confirmed. Waiting for guard assignment.',
      },
      assigned: {
        title: 'Guard Assigned',
        body: guardName ? `${guardName} has been assigned to your booking.` : 'A guard has been assigned to your booking.',
      },
      accepted: {
        title: 'Guard Accepted',
        body: guardName ? `${guardName} accepted your booking request.` : 'Your guard accepted the booking.',
      },
      en_route: {
        title: 'Guard En Route',
        body: guardName ? `${guardName} is on the way to your location.` : 'Your guard is on the way.',
      },
      active: {
        title: 'Service Started',
        body: 'Your protection service has started. Stay safe!',
      },
      completed: {
        title: 'Service Completed',
        body: 'Your protection service has been completed. Please rate your experience.',
      },
      cancelled: {
        title: 'Booking Cancelled',
        body: 'Your booking has been cancelled.',
      },
    };

    const message = statusMessages[status];
    if (message) {
      await this.sendLocalNotification(message.title, message.body, { bookingId, status });
    }
  },

  async notifyNewMessage(senderName: string, messagePreview: string, bookingId: string): Promise<void> {
    await this.sendLocalNotification(
      `Message from ${senderName}`,
      messagePreview,
      { type: 'message', bookingId }
    );
  },

  async notifyNewBookingRequest(clientName: string, bookingId: string): Promise<void> {
    await this.sendLocalNotification(
      'New Booking Request',
      `${clientName} requested your protection services.`,
      { type: 'booking_request', bookingId }
    );
  },

  setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (response: Notifications.NotificationResponse) => void
  ) {
    const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('[Notifications] Notification received:', notification);
      onNotificationReceived?.(notification);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('[Notifications] Notification response:', response);
      onNotificationResponse?.(response);
    });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  },

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[Notifications] All notifications cancelled');
  },

  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  },

  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  },
};
