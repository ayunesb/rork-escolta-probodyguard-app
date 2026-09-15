import { Alert, Platform } from 'react-native';
import { installAlertWebPolyfill } from '../alertWebPolyfill';

describe('installAlertWebPolyfill', () => {
  const originalAlert = Alert.alert;
  const originalOS = Platform.OS;

  afterEach(() => {
    Alert.alert = originalAlert;
    Platform.OS = originalOS;
  });

  it('leaves Alert.alert untouched on native platforms', () => {
    Platform.OS = 'ios';
    installAlertWebPolyfill();
    expect(Alert.alert).toBe(originalAlert);
  });

  it('makes a single-button alert call window.alert and fire onPress on web', () => {
    Platform.OS = 'web';
    installAlertWebPolyfill();

    const windowAlert = jest.fn();
    (window as unknown as { alert: typeof windowAlert }).alert = windowAlert;
    const onPress = jest.fn();

    Alert.alert('Title', 'Message', [{ text: 'OK', onPress }]);

    expect(windowAlert).toHaveBeenCalledWith('Title\n\nMessage');
    expect(onPress).toHaveBeenCalled();
  });

  it('confirms via window.confirm and fires the confirm button on web', () => {
    Platform.OS = 'web';
    installAlertWebPolyfill();

    (window as unknown as { confirm: () => boolean }).confirm = () => true;
    const onCancel = jest.fn();
    const onConfirm = jest.fn();

    Alert.alert('Cerrar sesion', 'Seguro?', [
      { text: 'Cancelar', style: 'cancel', onPress: onCancel },
      { text: 'Cerrar sesion', style: 'destructive', onPress: onConfirm },
    ]);

    expect(onConfirm).toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('fires the cancel button when window.confirm is dismissed', () => {
    Platform.OS = 'web';
    installAlertWebPolyfill();

    (window as unknown as { confirm: () => boolean }).confirm = () => false;
    const onCancel = jest.fn();
    const onConfirm = jest.fn();

    Alert.alert('Cerrar sesion', 'Seguro?', [
      { text: 'Cancelar', style: 'cancel', onPress: onCancel },
      { text: 'Cerrar sesion', style: 'destructive', onPress: onConfirm },
    ]);

    expect(onCancel).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
