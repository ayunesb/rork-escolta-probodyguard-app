import createContextHook from '@nkzw/create-context-hook';
import * as Notifications from 'expo-notifications';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

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
  type: 'booking_assigned' | 'guard_en_route' | 'payment_success' | 'booking_started' | 'booking_completed' | 'chat_message' | 'guard_reassignment' | 'booking_extension';
  bookingId?: string;
  guardId?: string;
  clientId?: string;
  message?: string;
}

export const [NotificationProvider, useNotifications] = createContextHook(() => {
  const { user } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined);
  const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);

  useEffect(() => {
    if (user) {
      registerForPushNotificationsAsync();
    }

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      const data = response.notification.request.content.data as unknown as NotificationData;
      handleNotificationResponse(data);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [user]);

  const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === 'web') {
      console.log('Push notifications not supported on web');
      return;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Expo push token:', token);
      
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
      setExpoPushToken(token);

    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };

  const handleNotificationResponse = (data: NotificationData) => {
    console.log('Handling notification response:', data);
  };

  const sendLocalNotification = useCallback(async (
    title: string,
    body: string,
    data?: NotificationData
  ) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data as any || {},
      },
      trigger: null,
    });
  }, []);

  const sendBookingAssignedNotification = useCallback(async (bookingId: string, guardName: string) => {
    await sendLocalNotification(
      'Guard Assigned',
      `${guardName} has been assigned to your booking`,
      { type: 'booking_assigned', bookingId }
    );
  }, [sendLocalNotification]);

  const sendGuardEnRouteNotification = useCallback(async (bookingId: string, eta: string) => {
    await sendLocalNotification(
      'Guard En Route',
      `Your guard is on the way. ETA: ${eta}`,
      { type: 'guard_en_route', bookingId }
    );
  }, [sendLocalNotification]);

  const sendPaymentSuccessNotification = useCallback(async (bookingId: string, amount: number) => {
    await sendLocalNotification(
      'Payment Successful',
      `Payment of $${amount.toFixed(2)} processed successfully`,
      { type: 'payment_success', bookingId }
    );
  }, [sendLocalNotification]);

  const sendBookingStartedNotification = useCallback(async (bookingId: string) => {
    await sendLocalNotification(
      'Service Started',
      'Your security service has started',
      { type: 'booking_started', bookingId }
    );
  }, [sendLocalNotification]);

  const sendBookingCompletedNotification = useCallback(async (bookingId: string) => {
    await sendLocalNotification(
      'Service Completed',
      'Your security service has been completed. Please rate your experience.',
      { type: 'booking_completed', bookingId }
    );
  }, [sendLocalNotification]);

  const sendChatMessageNotification = useCallback(async (bookingId: string, senderName: string, message: string) => {
    await sendLocalNotification(
      `Message from ${senderName}`,
      message,
      { type: 'chat_message', bookingId }
    );
  }, [sendLocalNotification]);

  const sendGuardReassignmentNotification = useCallback(async (bookingId: string, newGuardName: string) => {
    await sendLocalNotification(
      'Guard Reassignment Request',
      `Your guard has been changed to ${newGuardName}. Please review and approve.`,
      { type: 'guard_reassignment', bookingId }
    );
  }, [sendLocalNotification]);

  const sendBookingExtensionNotification = useCallback(async (bookingId: string, additionalHours: number) => {
    await sendLocalNotification(
      'Service Extension Request',
      `Request to extend service by ${additionalHours} hour(s)`,
      { type: 'booking_extension', bookingId }
    );
  }, [sendLocalNotification]);

  return useMemo(() => ({
    expoPushToken,
    notification,
    sendLocalNotification,
    sendBookingAssignedNotification,
    sendGuardEnRouteNotification,
    sendPaymentSuccessNotification,
    sendBookingStartedNotification,
    sendBookingCompletedNotification,
    sendChatMessageNotification,
    sendGuardReassignmentNotification,
    sendBookingExtensionNotification,
  }), [
    expoPushToken,
    notification,
    sendLocalNotification,
    sendBookingAssignedNotification,
    sendGuardEnRouteNotification,
    sendPaymentSuccessNotification,
    sendBookingStartedNotification,
    sendBookingCompletedNotification,
    sendChatMessageNotification,
    sendGuardReassignmentNotification,
    sendBookingExtensionNotification,
  ]);
});
