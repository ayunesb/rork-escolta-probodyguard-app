// Stripe payment form removed
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';

interface StripePaymentFormProps {
  clientSecret: string;
  amount: number;
  onSuccess: (paymentIntentId: string, paymentMethodId?: string) => void;
  onError: (error: string) => void;
}

export default function StripePaymentForm({ 
  clientSecret, 
  amount, 
  onSuccess, 
  onError 
}: StripePaymentFormProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Native Stripe payment form - Use the existing card input fields
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  text: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
  },
});
