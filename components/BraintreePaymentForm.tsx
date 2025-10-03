import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
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
  const [cardNumber, setCardNumber] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [cvv, setCvv] = useState<string>('');
  const [cardholderName, setCardholderName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19);
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  const validateCard = (): boolean => {
    const cleanedCardNumber = cardNumber.replace(/\s/g, '');
    
    if (cleanedCardNumber.length < 13 || cleanedCardNumber.length > 19) {
      Alert.alert('Error', 'Please enter a valid card number');
      return false;
    }

    if (expiryDate.length !== 5) {
      Alert.alert('Error', 'Please enter a valid expiry date (MM/YY)');
      return false;
    }

    const [month, year] = expiryDate.split('/');
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    
    if (parseInt(month) < 1 || parseInt(month) > 12) {
      Alert.alert('Error', 'Invalid expiry month');
      return false;
    }

    if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
      Alert.alert('Error', 'Card has expired');
      return false;
    }

    if (cvv.length < 3 || cvv.length > 4) {
      Alert.alert('Error', 'Please enter a valid CVV');
      return false;
    }

    if (cardholderName.trim().length < 3) {
      Alert.alert('Error', 'Please enter the cardholder name');
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validateCard()) {
      return;
    }

    setLoading(true);

    try {
      await braintreeService.getClientToken(customerId);
      console.log('[BraintreePaymentForm] Client token received');

      const mockNonce = `fake-valid-nonce-${Date.now()}`;

      const result = await braintreeService.processPayment({
        nonce: mockNonce,
        amount,
        currency,
        customerId,
        bookingId,
        description,
      });

      console.log('[BraintreePaymentForm] Payment successful');
      onSuccess(result);
    } catch (error: any) {
      console.error('[BraintreePaymentForm] Payment error:', error);
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Details</Text>
      <Text style={styles.amount}>
        {currency} ${amount.toFixed(2)}
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Card Number</Text>
        <TextInput
          style={styles.input}
          placeholder="1234 5678 9012 3456"
          value={cardNumber}
          onChangeText={(text) => setCardNumber(formatCardNumber(text))}
          keyboardType="numeric"
          maxLength={19}
          editable={!loading}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Text style={styles.label}>Expiry Date</Text>
          <TextInput
            style={styles.input}
            placeholder="MM/YY"
            value={expiryDate}
            onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
            keyboardType="numeric"
            maxLength={5}
            editable={!loading}
          />
        </View>

        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Text style={styles.label}>CVV</Text>
          <TextInput
            style={styles.input}
            placeholder="123"
            value={cvv}
            onChangeText={setCvv}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
            editable={!loading}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Cardholder Name</Text>
        <TextInput
          style={styles.input}
          placeholder="John Doe"
          value={cardholderName}
          onChangeText={setCardholderName}
          autoCapitalize="words"
          editable={!loading}
        />
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
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
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
