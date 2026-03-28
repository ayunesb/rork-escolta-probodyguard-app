import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIOMETRIC_ENABLED_KEY = '@escolta_biometric_enabled';

export interface BiometricCapabilities {
  isAvailable: boolean;
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
}

class BiometricAuthService {
  async checkCapabilities(): Promise<BiometricCapabilities> {
    try {
      if (Platform.OS === 'web') {
        return {
          isAvailable: false,
          hasHardware: false,
          isEnrolled: false,
          supportedTypes: [],
        };
      }

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      return {
        isAvailable: hasHardware && isEnrolled,
        hasHardware,
        isEnrolled,
        supportedTypes,
      };
    } catch (error) {
      console.error('[BiometricAuth] Error checking capabilities:', error);
      return {
        isAvailable: false,
        hasHardware: false,
        isEnrolled: false,
        supportedTypes: [],
      };
    }
  }

  async authenticate(promptMessage: string = 'Authenticate to continue'): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        console.log('[BiometricAuth] Not supported on web');
        return false;
      }

      const capabilities = await this.checkCapabilities();
      
      if (!capabilities.isAvailable) {
        console.log('[BiometricAuth] Biometric authentication not available');
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
        fallbackLabel: 'Use passcode',
      });

      if (result.success) {
        console.log('[BiometricAuth] Authentication successful');
        return true;
      } else {
        console.log('[BiometricAuth] Authentication failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('[BiometricAuth] Authentication error:', error);
      return false;
    }
  }

  async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      console.error('[BiometricAuth] Error checking if enabled:', error);
      return false;
    }
  }

  async enableBiometric(): Promise<boolean> {
    try {
      const capabilities = await this.checkCapabilities();
      
      if (!capabilities.isAvailable) {
        console.log('[BiometricAuth] Cannot enable - not available');
        return false;
      }

      const authenticated = await this.authenticate('Enable biometric authentication');
      
      if (authenticated) {
        await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
        console.log('[BiometricAuth] Biometric authentication enabled');
        return true;
      }

      return false;
    } catch (error) {
      console.error('[BiometricAuth] Error enabling biometric:', error);
      return false;
    }
  }

  async disableBiometric(): Promise<void> {
    try {
      await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
      console.log('[BiometricAuth] Biometric authentication disabled');
    } catch (error) {
      console.error('[BiometricAuth] Error disabling biometric:', error);
    }
  }

  async authenticateIfEnabled(promptMessage?: string): Promise<boolean> {
    try {
      const isEnabled = await this.isBiometricEnabled();
      
      if (!isEnabled) {
        return true;
      }

      return await this.authenticate(promptMessage);
    } catch (error) {
      console.error('[BiometricAuth] Error in authenticateIfEnabled:', error);
      return false;
    }
  }

  getBiometricTypeName(type: LocalAuthentication.AuthenticationType): string {
    switch (type) {
      case LocalAuthentication.AuthenticationType.FINGERPRINT:
        return 'Fingerprint';
      case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
        return 'Face ID';
      case LocalAuthentication.AuthenticationType.IRIS:
        return 'Iris';
      default:
        return 'Biometric';
    }
  }
}

export const biometricAuthService = new BiometricAuthService();
