import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

export async function registerForPushNotificationsAsync() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("[Notifications] Permission denied");
      return null;
    }

    // ✅ Use fallback to avoid "No projectId found" error
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId ??
      process.env.EXPO_PUBLIC_EAS_PROJECT_ID ??
      "7cee6c31-9a1c-436d-9baf-57fc8a43b651";

    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    console.log("[Notifications] Push token obtained:", token.data);
    return token.data;
  } catch (err: any) {
    // Helpful guidance: Expo Go on Android no longer supports remote push tokens on SDK 53
    if (err?.message && err.message.includes('No projectId found')) {
      console.warn('[Notifications] getExpoPushTokenAsync failed: No projectId found. Ensure EAS build or provide EXPO_PUBLIC_EAS_PROJECT_ID');
    }
    console.error('[Notifications] Failed to register:', err);
    return null;
  }
}

// Backwards-compatible alias used across the codebase. Many modules import
// `notificationService` from this file; provide a simple object with the
// registerForPushNotificationsAsync method and stub methods for compatibility.
// 
// To avoid circular dependencies, we DO NOT import pushNotificationService here.
// Other parts of the app that need full push notification features should import
// pushNotificationService directly.
export const notificationService = {
  registerForPushNotificationsAsync,
  
  // Stub methods for backward compatibility - these will log warnings
  requestPermissions: async (...args: any[]) => {
    console.warn('[NotificationService] requestPermissions called on stub - use pushNotificationService directly');
    return false;
  },
  
  registerDevice: async (...args: any[]) => {
    console.warn('[NotificationService] registerDevice called on stub - use pushNotificationService directly');
  },
  
  unregisterDevice: async (...args: any[]) => {
    console.warn('[NotificationService] unregisterDevice called on stub - use pushNotificationService directly');
  },
  
  sendPushNotification: async (...args: any[]) => {
    console.warn('[NotificationService] sendPushNotification called on stub - use pushNotificationService directly');
  },
  
  sendLocalNotification: async (title: string, body: string, data?: any) => {
    console.warn('[NotificationService] sendLocalNotification called on stub - use pushNotificationService directly');
  },

  notifyPaymentSuccess: async (...args: any[]) => {
    console.warn('[NotificationService] notifyPaymentSuccess called on stub - use pushNotificationService directly');
  },

  notifyNewBookingRequest: async (...args: any[]) => {
    console.warn('[NotificationService] notifyNewBookingRequest called on stub - use pushNotificationService directly');
  },

  notifyBookingStatusChange: async (userId: string, status: string, guardName?: string, rejectionReason?: string) => {
    console.warn('[NotificationService] notifyBookingStatusChange called on stub - use pushNotificationService directly');
  },

  notifyBookingCreated: async (...a: any[]) => {
    console.warn('[NotificationService] notifyBookingCreated called on stub - use pushNotificationService directly');
  },
  
  notifyBookingAccepted: async (...a: any[]) => {
    console.warn('[NotificationService] notifyBookingAccepted called on stub - use pushNotificationService directly');
  },
  
  notifyBookingRejected: async (...a: any[]) => {
    console.warn('[NotificationService] notifyBookingRejected called on stub - use pushNotificationService directly');
  },
  
  notifyGuardEnRoute: async (...a: any[]) => {
    console.warn('[NotificationService] notifyGuardEnRoute called on stub - use pushNotificationService directly');
  },
  
  notifyServiceStarted: async (...a: any[]) => {
    console.warn('[NotificationService] notifyServiceStarted called on stub - use pushNotificationService directly');
  },
  
  notifyServiceCompleted: async (...a: any[]) => {
    console.warn('[NotificationService] notifyServiceCompleted called on stub - use pushNotificationService directly');
  },
  
  notifyNewMessage: async (...a: any[]) => {
    console.warn('[NotificationService] notifyNewMessage called on stub - use pushNotificationService directly');
  },
  
  notifyPaymentFailed: async (...a: any[]) => {
    console.warn('[NotificationService] notifyPaymentFailed called on stub - use pushNotificationService directly');
  },
  
  notifyEmergency: async (...a: any[]) => {
    console.warn('[NotificationService] notifyEmergency called on stub - use pushNotificationService directly');
  },
  
  updateNotificationPreferences: async (...a: any[]) => {
    console.warn('[NotificationService] updateNotificationPreferences called on stub - use pushNotificationService directly');
  },
  
  getNotificationPreferences: async (...a: any[]) => {
    console.warn('[NotificationService] getNotificationPreferences called on stub - use pushNotificationService directly');
  },
  
  setupNotificationListeners: (...a: any[]) => {
    console.warn('[NotificationService] setupNotificationListeners called on stub - use pushNotificationService directly');
  },
  
  setBadgeCount: async (...a: any[]) => {
    console.warn('[NotificationService] setBadgeCount called on stub - use pushNotificationService directly');
  },
  
  getBadgeCount: async (...a: any[]) => {
    console.warn('[NotificationService] getBadgeCount called on stub - use pushNotificationService directly');
    return 0;
  },
  
  clearBadge: async (...a: any[]) => {
    console.warn('[NotificationService] clearBadge called on stub - use pushNotificationService directly');
  },
  
  cancelAllNotifications: async (...a: any[]) => {
    console.warn('[NotificationService] cancelAllNotifications called on stub - use pushNotificationService directly');
  },
};
