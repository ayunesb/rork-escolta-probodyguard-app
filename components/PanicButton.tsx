import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { AlertTriangle, X } from 'lucide-react-native';
import { emergencyService } from '@/services/emergencyService';
import Colors from '@/constants/colors';

interface PanicButtonProps {
  userId: string;
  bookingId?: string;
  size?: 'small' | 'medium' | 'large';
  onAlertTriggered?: (alertId: string) => void;
}

export default function PanicButton({
  userId,
  bookingId,
  size = 'medium',
  onAlertTriggered,
}: PanicButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);

  const handlePress = () => {
    setShowConfirm(true);
  };

  const handleConfirm = async (type: 'panic' | 'sos' | 'medical' | 'security') => {
    setIsTriggering(true);

    const result = await emergencyService.triggerPanicButton(userId, bookingId, type);

    setIsTriggering(false);
    setShowConfirm(false);

    if (result.success && result.alertId) {
      Alert.alert(
        'Emergency Alert Sent',
        'Emergency services and contacts have been notified of your location.',
        [{ text: 'OK' }]
      );
      onAlertTriggered?.(result.alertId);
    } else {
      Alert.alert(
        'Alert Failed',
        result.error || 'Failed to send emergency alert. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const buttonSize = size === 'small' ? 60 : size === 'large' ? 100 : 80;
  const iconSize = size === 'small' ? 28 : size === 'large' ? 48 : 36;

  return (
    <>
      <TouchableOpacity
        style={[
          styles.panicButton,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <AlertTriangle size={iconSize} color="#fff" strokeWidth={2.5} />
        <Text style={styles.panicText}>SOS</Text>
      </TouchableOpacity>

      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => !isTriggering && setShowConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => !isTriggering && setShowConfirm(false)}
              disabled={isTriggering}
            >
              <X size={24} color={Colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <AlertTriangle size={48} color={Colors.error} strokeWidth={2} />
              </View>
              <Text style={styles.modalTitle}>Emergency Alert</Text>
              <Text style={styles.modalSubtitle}>
                Select the type of emergency. Your location will be shared with emergency contacts.
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.emergencyButton, styles.panicButtonStyle]}
                onPress={() => handleConfirm('panic')}
                disabled={isTriggering}
              >
                {isTriggering ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.emergencyButtonTitle}>🚨 Panic</Text>
                    <Text style={styles.emergencyButtonSubtitle}>
                      Immediate danger
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.emergencyButton, styles.sosButtonStyle]}
                onPress={() => handleConfirm('sos')}
                disabled={isTriggering}
              >
                <Text style={styles.emergencyButtonTitle}>🆘 SOS</Text>
                <Text style={styles.emergencyButtonSubtitle}>
                  Need urgent help
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.emergencyButton, styles.medicalButtonStyle]}
                onPress={() => handleConfirm('medical')}
                disabled={isTriggering}
              >
                <Text style={styles.emergencyButtonTitle}>🏥 Medical</Text>
                <Text style={styles.emergencyButtonSubtitle}>
                  Medical emergency
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.emergencyButton, styles.securityButtonStyle]}
                onPress={() => handleConfirm('security')}
                disabled={isTriggering}
              >
                <Text style={styles.emergencyButtonTitle}>🛡️ Security</Text>
                <Text style={styles.emergencyButtonSubtitle}>
                  Security threat
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowConfirm(false)}
              disabled={isTriggering}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  panicButton: {
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  panicText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700' as const,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  closeButton: {
    position: 'absolute' as const,
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 12,
  },
  emergencyButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  panicButtonStyle: {
    backgroundColor: '#DC2626',
  },
  sosButtonStyle: {
    backgroundColor: '#EA580C',
  },
  medicalButtonStyle: {
    backgroundColor: '#0891B2',
  },
  securityButtonStyle: {
    backgroundColor: '#7C3AED',
  },
  emergencyButtonTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
  },
  emergencyButtonSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  cancelButton: {
    marginTop: 16,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
});
