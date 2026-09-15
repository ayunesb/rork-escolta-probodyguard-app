import { Alert, Platform } from 'react-native';

export async function confirm(
  title: string,
  message: string,
  confirmLabel: string = 'OK',
  cancelLabel: string = 'Cancelar',
  destructive: boolean = false
): Promise<boolean> {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || typeof window.confirm !== 'function') {
      return true;
    }
    return window.confirm(message ? `${title}\n\n${message}` : title);
  }
  return new Promise<boolean>((resolve) => {
    Alert.alert(title, message, [
      { text: cancelLabel, style: 'cancel', onPress: () => resolve(false) },
      {
        text: confirmLabel,
        style: destructive ? 'destructive' : 'default',
        onPress: () => resolve(true),
      },
    ]);
  });
}
