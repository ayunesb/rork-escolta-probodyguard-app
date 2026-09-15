import { Alert, Platform } from 'react-native';

type AlertButton = {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

/**
 * react-native-web ships Alert.alert() as a total no-op (see
 * react-native-web/src/exports/Alert), so every Alert.alert call across the
 * app — confirmations, errors, success messages — silently did nothing on
 * web. This patches it in place with a window.confirm/window.alert-backed
 * implementation so existing Alert.alert call sites work unchanged.
 */
export function installAlertWebPolyfill(): void {
  if (Platform.OS !== 'web') return;

  Alert.alert = (
    title: string,
    message?: string,
    buttons?: AlertButton[],
  ): void => {
    const list = buttons && buttons.length > 0 ? buttons : [{ text: 'OK' } as AlertButton];
    const text = message ? `${title}\n\n${message}` : title;

    if (list.length === 1) {
      if (typeof window !== 'undefined' && typeof window.alert === 'function') {
        window.alert(text);
      }
      list[0].onPress?.();
      return;
    }

    const cancelButton = list.find((b) => b.style === 'cancel');
    const confirmButton = list.find((b) => b !== cancelButton) ?? list[list.length - 1];
    const confirmed =
      typeof window !== 'undefined' && typeof window.confirm === 'function'
        ? window.confirm(text)
        : true;

    if (confirmed) {
      confirmButton?.onPress?.();
    } else {
      cancelButton?.onPress?.();
    }
  };
}
