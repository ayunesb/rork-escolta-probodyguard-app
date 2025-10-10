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
    console.error("[Notifications] Failed to register:", err);
    return null;
  }
}
