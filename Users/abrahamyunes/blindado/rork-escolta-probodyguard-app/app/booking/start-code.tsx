import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle } from 'lucide-react-native';
import StartCodeInput from '../../components/StartCodeInput';

export default function StartCodeScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    try {
      setLoading(true);
      setError('');

      console.log('Verifying start code:', code, 'for booking:', bookingId);

      await new Promise(resolve => setTimeout(resolve, 1000));

      if (code === '123456') {
        Alert.alert(
          'Success',
          'Start code verified! Service is now active.',
          [
            {
              text: 'Start Tracking',
              onPress: () => router.push(`/tracking/${bookingId}`),
            },
          ]
        );
      } else {
        setError('Invalid start code. Please try again.');
      }
    } catch (err) {
      console.error('Failed to verify start code:', err);
      setError('Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Stack.Screen options={{ title: 'Enter Start Code', headerShown: false }} />

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <CheckCircle size={64} color="#007AFF" />
        </View>

        <Text style={styles.title}>Enter Start Code</Text>
        <Text style={styles.subtitle}>
          Ask your client for the 6-digit start code to begin the service
        </Text>

        <View style={styles.inputContainer}>
          <StartCodeInput
            value={code}
            onChange={setCode}
            onComplete={handleVerifyCode}
          />
        </View>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.button, (!code || code.length !== 6 || loading) && styles.buttonDisabled]}
          onPress={handleVerifyCode}
          disabled={!code || code.length !== 6 || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Verify & Start Service</Text>
          )}
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Important:</Text>
          <Text style={styles.infoText}>
            • The client will provide you with a 6-digit code{'\n'}
            • Enter the code to activate live tracking{'\n'}
            • Service officially begins after code verification{'\n'}
            • You have 3 attempts before the code is locked
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#000',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 24,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: '#CCC',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  infoCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#000',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
