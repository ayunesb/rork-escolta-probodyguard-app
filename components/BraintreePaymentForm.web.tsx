import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
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

declare global {
  interface Window {
    braintree: any;
  }
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
  const [hostedFieldsInstance, setHostedFieldsInstance] = useState<any>(null);
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(false);

  useEffect(() => {
    loadBraintreeScript();
  }, []);

  useEffect(() => {
    if (scriptLoaded && clientToken) {
      initializeHostedFields();
    }
  }, [scriptLoaded, clientToken]);

  useEffect(() => {
    if (scriptLoaded) {
      loadClientToken();
    }
  }, [scriptLoaded, customerId]);

  const loadBraintreeScript = () => {
    if (typeof window === 'undefined') return;

    if (window.braintree) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.braintreegateway.com/web/3.97.2/js/client.min.js';
    script.async = true;
    script.onload = () => {
      const hostedFieldsScript = document.createElement('script');
      hostedFieldsScript.src = 'https://js.braintreegateway.com/web/3.97.2/js/hosted-fields.min.js';
      hostedFieldsScript.async = true;
      hostedFieldsScript.onload = () => {
        console.log('[BraintreePaymentForm Web] Braintree scripts loaded');
        setScriptLoaded(true);
      };
      document.body.appendChild(hostedFieldsScript);
    };
    document.body.appendChild(script);
  };

  const loadClientToken = async () => {
    try {
      const token = await braintreeService.getClientToken(customerId);
      setClientToken(token);
      console.log('[BraintreePaymentForm Web] Client token loaded');
    } catch (error: any) {
      console.error('[BraintreePaymentForm Web] Error loading client token:', error);
      Alert.alert('Error', 'Failed to initialize payment. Please try again.');
    }
  };

  const initializeHostedFields = async () => {
    if (!window.braintree || !clientToken) return;

    try {
      const clientInstance = await window.braintree.client.create({
        authorization: clientToken,
      });

      const hostedFields = await window.braintree.hostedFields.create({
        client: clientInstance,
        styles: {
          input: {
            'font-size': '16px',
            'font-family': 'system-ui, -apple-system, sans-serif',
            color: '#000',
          },
          ':focus': {
            color: '#000',
          },
          '.valid': {
            color: '#28a745',
          },
          '.invalid': {
            color: '#dc3545',
          },
        },
        fields: {
          number: {
            selector: '#card-number',
            placeholder: '4111 1111 1111 1111',
          },
          cvv: {
            selector: '#cvv',
            placeholder: '123',
          },
          expirationDate: {
            selector: '#expiration-date',
            placeholder: 'MM/YY',
          },
        },
      });

      setHostedFieldsInstance(hostedFields);
      console.log('[BraintreePaymentForm Web] Hosted Fields initialized');
    } catch (error: any) {
      console.error('[BraintreePaymentForm Web] Error initializing Hosted Fields:', error);
      Alert.alert('Error', 'Failed to initialize payment form. Please refresh the page.');
    }
  };

  const handlePayment = async () => {
    if (!hostedFieldsInstance) {
      Alert.alert('Error', 'Payment form not ready. Please wait...');
      return;
    }

    setLoading(true);

    try {
      console.log('[BraintreePaymentForm Web] Tokenizing card');
      const { nonce } = await hostedFieldsInstance.tokenize();

      console.log('[BraintreePaymentForm Web] Processing payment');
      const result = await braintreeService.processPayment({
        nonce,
        amount,
        currency,
        customerId,
        bookingId,
        description,
      });

      console.log('[BraintreePaymentForm Web] Payment successful');
      onSuccess(result);
    } catch (error: any) {
      console.error('[BraintreePaymentForm Web] Payment error:', error);
      
      if (error.code === 'HOSTED_FIELDS_FIELDS_EMPTY') {
        Alert.alert('Error', 'Please fill in all card details');
      } else if (error.code === 'HOSTED_FIELDS_FIELDS_INVALID') {
        Alert.alert('Error', 'Please check your card details');
      } else {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!scriptLoaded || !clientToken) {
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

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Card Number</Text>
        <div id="card-number" style={webInputStyle}></div>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Text style={styles.label}>Expiry Date</Text>
          <div id="expiration-date" style={webInputStyle}></div>
        </View>

        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Text style={styles.label}>CVV</Text>
          <div id="cvv" style={webInputStyle}></div>
        </View>
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

const webInputStyle = {
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: '12px',
  fontSize: '16px',
  backgroundColor: '#f9f9f9',
  height: '48px',
};

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
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
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
