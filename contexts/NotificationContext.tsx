import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '@/services/notificationService';

interface NotificationContextProps {
  expoPushToken?: string;
  notification?: Notifications.Notification;
}

const NotificationContext = createContext<NotificationContextProps>({});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();

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

    const notificationListener = Notifications.addNotificationReceivedListener(setNotification);
    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('[Notification] User responded:', response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ expoPushToken, notification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
