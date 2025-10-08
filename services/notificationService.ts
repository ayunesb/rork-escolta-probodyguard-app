import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db as getDbInstance } from '@/lib/firebase';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      console.log('[Notifications] Limited support on web');
      return true;
    }

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
    if (Platform.OS === 'web') {
      console.log('[Notifications] Push notifications not supported on web');
      return null;
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('[Notifications] Push token:', token);

      await updateDoc(doc(getDbInstance(), 'users', userId), {
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
    if (Platform.OS === 'web') {
      console.log('[Notifications] Web notification:', title, body);
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(title, { body });
        } catch (error) {
          console.error('[Notifications] Web notification error:', error);
        }
      }
      return;
    }

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

  async notifyBookingStatusChange(bookingId: string, status: string, guardName?: string, rejectionReason?: string): Promise<void> {
    const statusMessages: Record<string, { title: string; body: string }> = {
      pending: {
        title: 'Booking Created',
        body: 'Your booking request has been sent. Waiting for guard confirmation.',
      },
      accepted: {
        title: 'Booking Accepted',
        body: guardName ? `${guardName} accepted your booking request.` : 'Your guard accepted the booking.',
      },
      rejected: {
        title: 'Booking Declined',
        body: rejectionReason || 'The guard declined your booking request. We will find another guard for you.',
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
    if (Platform.OS === 'web') {
      console.log('[Notifications] Listeners not supported on web');
      return () => {};
    }

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
    if (Platform.OS === 'web') {
      console.log('[Notifications] Cancel not supported on web');
      return;
    }
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[Notifications] All notifications cancelled');
  },

  async getBadgeCount(): Promise<number> {
    if (Platform.OS === 'web') {
      return 0;
    }
    return await Notifications.getBadgeCountAsync();
  },

  async setBadgeCount(count: number): Promise<void> {
    if (Platform.OS === 'web') {
      return;
    }
    await Notifications.setBadgeCountAsync(count);
  },
};
