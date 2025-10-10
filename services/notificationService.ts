import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync() {
  try {
    if (!Device.isDevice) {
      console.log('[Notifications] Must use physical device for Push Notifications');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[Notifications] Permission not granted');
      return null;
    }

    // ✅ Fix: Include projectId
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.expoConfig?.extra?.projectId ??
      Constants.manifest?.extra?.projectId;

    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    console.log('Expo push token:', token);

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
    }

    return token;
  } catch (error) {
    console.error('[Notifications] Registration error:', error);
    return null;
  }
}
