import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { doc, updateDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db as getDbInstance } from '@/lib/firebase';
import { UserRole } from '@/types';

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: boolean;
  badge?: number;
  priority?: 'default' | 'high' | 'max';
  categoryId?: string;
}

export interface NotificationPreferences {
  bookingUpdates: boolean;
  chatMessages: boolean;
  paymentAlerts: boolean;
  promotions: boolean;
  emergencyAlerts: boolean;
}

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

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('booking-updates', {
      name: 'Booking Updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#D4AF37',
      sound: 'default',
    });

    Notifications.setNotificationChannelAsync('chat-messages', {
      name: 'Chat Messages',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 150, 150, 150],
      lightColor: '#D4AF37',
      sound: 'default',
    });

    Notifications.setNotificationChannelAsync('emergency', {
      name: 'Emergency Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: '#FF0000',
      sound: 'default',
    });

    Notifications.setNotificationChannelAsync('payments', {
      name: 'Payment Alerts',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 200],
      lightColor: '#D4AF37',
      sound: 'default',
    });
  }
}

export const pushNotificationService = {
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[Push] Permission denied');
        return false;
      }

      console.log('[Push] Permission granted');
      return true;
    } catch (error) {
      console.error('[Push] Error requesting permissions:', error);
      return false;
    }
  },

  async registerDevice(userId: string, role: UserRole): Promise<string | null> {
    if (Platform.OS === 'web') {
      console.log('[Push] Web push notifications limited');
      return null;
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('[Push] Device token:', token);

      await updateDoc(doc(getDbInstance(), 'users', userId), {
        pushToken: token,
        pushTokenUpdatedAt: new Date().toISOString(),
        devicePlatform: Platform.OS,
      });

      await addDoc(collection(getDbInstance(), 'deviceTokens'), {
        userId,
        token,
        platform: Platform.OS,
        role,
        createdAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString(),
      });

      return token;
    } catch (error) {
      console.error('[Push] Error registering device:', error);
      return null;
    }
  },

  async unregisterDevice(userId: string): Promise<void> {
    try {
      const tokensQuery = query(
        collection(getDbInstance(), 'deviceTokens'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(tokensQuery);
      
      const deletePromises = snapshot.docs.map(doc => 
        updateDoc(doc.ref, { 
          active: false,
          deactivatedAt: new Date().toISOString() 
        })
      );
      
      await Promise.all(deletePromises);
      console.log('[Push] Device unregistered');
    } catch (error) {
      console.error('[Push] Error unregistering device:', error);
    }
  },

  async sendPushNotification(
    userId: string,
    payload: PushNotificationPayload
  ): Promise<void> {
    try {
      const userDoc = await getDocs(
        query(collection(getDbInstance(), 'users'), where('id', '==', userId))
      );

      if (userDoc.empty) {
        console.log('[Push] User not found');
        return;
      }

      const userData = userDoc.docs[0].data();
      const pushToken = userData.pushToken;

      if (!pushToken) {
        console.log('[Push] No push token for user');
        return;
      }

      await addDoc(collection(getDbInstance(), 'notifications'), {
        userId,
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        pushToken,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      console.log('[Push] Notification queued for:', userId);
    } catch (error) {
      console.error('[Push] Error sending push notification:', error);
    }
  },

  async sendLocalNotification(payload: PushNotificationPayload): Promise<void> {
    if (Platform.OS === 'web') {
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(payload.title, {
            body: payload.body,
            icon: '/icon.png',
            badge: '/icon.png',
          });
        } catch (error) {
          console.error('[Push] Web notification error:', error);
        }
      }
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: payload.title,
          body: payload.body,
          data: payload.data || {},
          sound: payload.sound !== false,
          badge: payload.badge,
          priority: payload.priority === 'max' 
            ? Notifications.AndroidNotificationPriority.MAX 
            : Notifications.AndroidNotificationPriority.HIGH,
          categoryIdentifier: payload.categoryId,
        },
        trigger: null,
      });
      console.log('[Push] Local notification sent');
    } catch (error) {
      console.error('[Push] Error sending local notification:', error);
    }
  },

  async notifyBookingCreated(userId: string, bookingId: string): Promise<void> {
    await this.sendPushNotification(userId, {
      title: 'Booking Created',
      body: 'Your booking request has been submitted successfully.',
      data: { type: 'booking_created', bookingId },
      categoryId: 'booking-updates',
      priority: 'high',
    });
  },

  async notifyBookingAccepted(
    userId: string,
    bookingId: string,
    guardName: string
  ): Promise<void> {
    await this.sendPushNotification(userId, {
      title: 'Booking Accepted',
      body: `${guardName} has accepted your booking request.`,
      data: { type: 'booking_accepted', bookingId },
      categoryId: 'booking-updates',
      priority: 'high',
    });
  },

  async notifyBookingRejected(
    userId: string,
    bookingId: string,
    reason?: string
  ): Promise<void> {
    await this.sendPushNotification(userId, {
      title: 'Booking Declined',
      body: reason || 'Your booking request was declined. We will find another guard.',
      data: { type: 'booking_rejected', bookingId },
      categoryId: 'booking-updates',
      priority: 'high',
    });
  },

  async notifyGuardEnRoute(
    userId: string,
    bookingId: string,
    guardName: string,
    eta: string
  ): Promise<void> {
    await this.sendPushNotification(userId, {
      title: 'Guard En Route',
      body: `${guardName} is on the way. ETA: ${eta}`,
      data: { type: 'guard_en_route', bookingId },
      categoryId: 'booking-updates',
      priority: 'high',
    });
  },

  async notifyServiceStarted(
    userId: string,
    bookingId: string
  ): Promise<void> {
    await this.sendPushNotification(userId, {
      title: 'Service Started',
      body: 'Your protection service has started. Stay safe!',
      data: { type: 'service_started', bookingId },
      categoryId: 'booking-updates',
      priority: 'high',
    });
  },

  async notifyServiceCompleted(
    userId: string,
    bookingId: string
  ): Promise<void> {
    await this.sendPushNotification(userId, {
      title: 'Service Completed',
      body: 'Your protection service has been completed. Please rate your experience.',
      data: { type: 'service_completed', bookingId },
      categoryId: 'booking-updates',
      priority: 'high',
    });
  },

  async notifyNewMessage(
    userId: string,
    bookingId: string,
    senderName: string,
    messagePreview: string
  ): Promise<void> {
    await this.sendPushNotification(userId, {
      title: `Message from ${senderName}`,
      body: messagePreview,
      data: { type: 'new_message', bookingId },
      categoryId: 'chat-messages',
      priority: 'high',
    });
  },

  async notifyPaymentSuccess(
    userId: string,
    bookingId: string,
    amount: number
  ): Promise<void> {
    await this.sendPushNotification(userId, {
      title: 'Payment Successful',
      body: `Payment of $${amount.toFixed(2)} MXN processed successfully.`,
      data: { type: 'payment_success', bookingId },
      categoryId: 'payments',
      priority: 'default',
    });
  },

  async notifyPaymentFailed(
    userId: string,
    bookingId: string,
    reason: string
  ): Promise<void> {
    await this.sendPushNotification(userId, {
      title: 'Payment Failed',
      body: `Payment failed: ${reason}. Please update your payment method.`,
      data: { type: 'payment_failed', bookingId },
      categoryId: 'payments',
      priority: 'high',
    });
  },

  async notifyEmergency(
    userId: string,
    bookingId: string,
    message: string
  ): Promise<void> {
    await this.sendPushNotification(userId, {
      title: 'EMERGENCY ALERT',
      body: message,
      data: { type: 'emergency', bookingId },
      categoryId: 'emergency',
      priority: 'max',
    });
  },

  async notifyNewBookingRequest(
    guardId: string,
    bookingId: string,
    clientName: string
  ): Promise<void> {
    await this.sendPushNotification(guardId, {
      title: 'New Booking Request',
      body: `${clientName} has requested your protection services.`,
      data: { type: 'new_booking_request', bookingId },
      categoryId: 'booking-updates',
      priority: 'high',
    });
  },

  async updateNotificationPreferences(
    userId: string,
    preferences: NotificationPreferences
  ): Promise<void> {
    try {
      await updateDoc(doc(getDbInstance(), 'users', userId), {
        notificationPreferences: preferences,
        preferencesUpdatedAt: new Date().toISOString(),
      });
      console.log('[Push] Preferences updated');
    } catch (error) {
      console.error('[Push] Error updating preferences:', error);
    }
  },

  async getNotificationPreferences(
    userId: string
  ): Promise<NotificationPreferences> {
    try {
      const userDoc = await getDocs(
        query(collection(getDbInstance(), 'users'), where('id', '==', userId))
      );

      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data();
        return userData.notificationPreferences || {
          bookingUpdates: true,
          chatMessages: true,
          paymentAlerts: true,
          promotions: false,
          emergencyAlerts: true,
        };
      }
    } catch (error) {
      console.error('[Push] Error getting preferences:', error);
    }

    return {
      bookingUpdates: true,
      chatMessages: true,
      paymentAlerts: true,
      promotions: false,
      emergencyAlerts: true,
    };
  },

  setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationTapped?: (response: Notifications.NotificationResponse) => void
  ): () => void {
    if (Platform.OS === 'web') {
      console.log('[Push] Listeners not supported on web');
      return () => {};
    }

    const receivedSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('[Push] Notification received:', notification);
        onNotificationReceived?.(notification);
      }
    );

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('[Push] Notification tapped:', response);
        onNotificationTapped?.(response);
      }
    );

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  },

  async setBadgeCount(count: number): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('[Push] Error setting badge count:', error);
    }
  },

  async getBadgeCount(): Promise<number> {
    if (Platform.OS === 'web') return 0;
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('[Push] Error getting badge count:', error);
      return 0;
    }
  },

  async clearBadge(): Promise<void> {
    await this.setBadgeCount(0);
  },

  async cancelAllNotifications(): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.dismissAllNotificationsAsync();
      console.log('[Push] All notifications cancelled');
    } catch (error) {
      console.error('[Push] Error cancelling notifications:', error);
    }
  },
};
