import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform } from 'react-native';
import { braintreeService } from '@/services/braintreeService';

interface BraintreePaymentFormProps {
  amount: number;
  currency?: string;
  customerId?: string;
  bookingId?: string;
  description?: string;
  onSuccess: (result: { id: string; status: string }) => void;
  onError: (error: Error) => void;
}

export function BraintreePaymentForm({
  amount,
  currency = 'MXN',
  customerId,
  bookingId,
  description,
  onSuccess,
  onError,
}: BraintreePaymentFormProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [clientToken, setClientToken] = useState<string | null>(null);

  useEffect(() => {
    loadClientToken();
  }, [customerId]);

  const loadClientToken = async () => {
    try {
      const token = await braintreeService.getClientToken(customerId);
      setClientToken(token);
      console.log('[BraintreePaymentForm Native] Client token loaded');
    } catch (error: any) {
      console.error('[BraintreePaymentForm Native] Error loading client token:', error);
      Alert.alert('Error', 'Failed to initialize payment. Please try again.');
    }
  };

  const handlePayment = async () => {
    if (!clientToken) {
      Alert.alert('Error', 'Payment not ready. Please wait...');
      return;
    }

    setLoading(true);

    try {
      console.log('[BraintreePaymentForm Native] Opening Braintree Drop-in UI');
      
      const mockNonce = `fake-valid-nonce-${Date.now()}`;
      
      console.log('[BraintreePaymentForm Native] Processing payment with nonce');
      const result = await braintreeService.processPayment({
        nonce: mockNonce,
        amount,
        currency,
        customerId,
        bookingId,
        description,
      });

      console.log('[BraintreePaymentForm Native] Payment successful');
      onSuccess(result);
    } catch (error: any) {
      console.error('[BraintreePaymentForm Native] Payment error:', error);
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  if (!clientToken) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Initializing payment...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Details</Text>
      <Text style={styles.amount}>
        {currency} ${amount.toFixed(2)}
      </Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          ℹ️ Native Braintree Drop-in UI integration requires a native module that is not available in Expo Go.
        </Text>
        <Text style={styles.infoText}>
          For production, install: react-native-braintree-dropin-ui
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handlePayment}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            Pay {currency} ${amount.toFixed(2)}
          </Text>
        )}
      </TouchableOpacity>

      <Text style={styles.secureText}>🔒 Secure payment powered by Braintree</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 8,
    color: '#000',
  },
  amount: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#007AFF',
    marginBottom: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center' as const,
  },
  infoBox: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFE69C',
  },
  infoText: {
    fontSize: 13,
    color: '#856404',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center' as const,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700' as const,
  },
  secureText: {
    textAlign: 'center' as const,
    color: '#666',
    fontSize: 12,
    marginTop: 16,
  },
});
