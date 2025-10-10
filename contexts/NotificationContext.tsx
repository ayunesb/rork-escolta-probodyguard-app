import React, { createContext, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '@/services/notificationService';

interface NotificationContextType {
  expoPushToken: string | null;
}

export const NotificationContext = createContext<NotificationContextType>({
  expoPushToken: null,
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) setExpoPushToken(token);
      } catch (error) {
        console.error('[NotificationContext] Failed to register for notifications:', error);
      }
    };

    setupNotifications();

    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('[NotificationContext] Notification received:', notification);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ expoPushToken }}>
      {children}
    </NotificationContext.Provider>
  );
};
