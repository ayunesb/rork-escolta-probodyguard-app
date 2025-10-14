import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { pushNotificationService } from './pushNotificationService';

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
// `notificationService` from this file; re-export the pushNotificationService
// so existing imports keep working without large-scale code changes.
// Backwards-compatible adapter with permissive signatures.
// Many call sites in the app use a different, older signature for notification
// helpers. Provide thin wrappers that accept flexible args and either forward
// to the `pushNotificationService` or gracefully no-op with a console warning.
export const notificationService: any = {
  registerForPushNotificationsAsync,
  // Forward commonly used pushNotificationService methods
  requestPermissions: (...args: any[]) => (pushNotificationService as any).requestPermissions(...args),
  registerDevice: (...args: any[]) => (pushNotificationService as any).registerDevice(...args),
  unregisterDevice: (...args: any[]) => (pushNotificationService as any).unregisterDevice(...args),
  sendPushNotification: (...args: any[]) => (pushNotificationService as any).sendPushNotification(...args),
  sendLocalNotification: (title: string, body: string, data?: any) =>
    (pushNotificationService as any).sendLocalNotification({ title, body, data }),

  // Payment notification: older callers sometimes pass (bookingId, amount)
  notifyPaymentSuccess: async (...args: any[]) => {
    if (args.length === 3) {
      const [userId, bookingId, amount] = args;
      return (pushNotificationService as any).notifyPaymentSuccess(userId, bookingId, amount);
    }
    if (args.length === 2) {
      const [bookingId, amount] = args;
      // No userId available in legacy callsites; log and skip to avoid runtime errors.
      console.warn('[NotificationAdapter] notifyPaymentSuccess called without userId; skipping push');
      return;
    }
    console.warn('[NotificationAdapter] notifyPaymentSuccess unexpected args', args);
  },

  // New booking request: permissive mapping for (guardId, bookingId, clientName) or legacy (role, bookingId)
  notifyNewBookingRequest: async (...args: any[]) => {
    if (args.length >= 2) {
      const [a, b, c] = args;
      // If first arg looks like a role string like 'Client', handle as legacy call
      if (typeof a === 'string' && (a.toLowerCase() === 'client' || a.toLowerCase() === 'guard')) {
        // legacy: notifyNewBookingRequest(role, bookingId)
        console.warn('[NotificationAdapter] Legacy notifyNewBookingRequest(role, bookingId) called; no direct recipient available.');
        return;
      }
      // Expect (guardId, bookingId, clientName)
      return (pushNotificationService as any).notifyNewBookingRequest(a, b, c);
    }
    console.warn('[NotificationAdapter] notifyNewBookingRequest unexpected args', args);
  },

  // notifyBookingStatusChange: adapt to specific push methods
  notifyBookingStatusChange: async (userId: string, status: string, guardName?: string, rejectionReason?: string) => {
    try {
      switch (status) {
        case 'confirmed':
          return (pushNotificationService as any).notifyBookingAccepted(userId, 'unknown_booking', guardName ?? '');
        case 'rejected':
          return (pushNotificationService as any).notifyBookingRejected(userId, 'unknown_booking', rejectionReason);
        case 'completed':
          return (pushNotificationService as any).notifyServiceCompleted(userId, 'unknown_booking');
        default:
          console.warn('[NotificationAdapter] notifyBookingStatusChange: unsupported status', status);
      }
    } catch (err) {
      console.error('[NotificationAdapter] notifyBookingStatusChange error:', err);
    }
  },

  // Re-export any remaining methods as passthroughs to keep the shape broad
  notifyBookingCreated: (...a: any[]) => (pushNotificationService as any).notifyBookingCreated(...a),
  notifyBookingAccepted: (...a: any[]) => (pushNotificationService as any).notifyBookingAccepted(...a),
  notifyBookingRejected: (...a: any[]) => (pushNotificationService as any).notifyBookingRejected(...a),
  notifyGuardEnRoute: (...a: any[]) => (pushNotificationService as any).notifyGuardEnRoute(...a),
  notifyServiceStarted: (...a: any[]) => (pushNotificationService as any).notifyServiceStarted(...a),
  notifyServiceCompleted: (...a: any[]) => (pushNotificationService as any).notifyServiceCompleted(...a),
  notifyNewMessage: (...a: any[]) => (pushNotificationService as any).notifyNewMessage(...a),
  notifyPaymentFailed: (...a: any[]) => (pushNotificationService as any).notifyPaymentFailed(...a),
  notifyEmergency: (...a: any[]) => (pushNotificationService as any).notifyEmergency(...a),
  updateNotificationPreferences: (...a: any[]) => (pushNotificationService as any).updateNotificationPreferences(...a),
  getNotificationPreferences: (...a: any[]) => (pushNotificationService as any).getNotificationPreferences(...a),
  setupNotificationListeners: (...a: any[]) => (pushNotificationService as any).setupNotificationListeners(...a),
  setBadgeCount: (...a: any[]) => (pushNotificationService as any).setBadgeCount(...a),
  getBadgeCount: (...a: any[]) => (pushNotificationService as any).getBadgeCount(...a),
  clearBadge: (...a: any[]) => (pushNotificationService as any).clearBadge(...a),
  cancelAllNotifications: (...a: any[]) => (pushNotificationService as any).cancelAllNotifications(...a),
};
