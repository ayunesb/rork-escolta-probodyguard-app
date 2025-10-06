// Stripe payment form removed
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import Colors from '@/constants/colors';
import { Lock } from 'lucide-react-native';

const stripePromise = loadStripe(process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface CheckoutFormProps {
  amount: number;
  onSuccess: (paymentIntentId: string, paymentMethodId?: string) => void;
  onError: (error: string) => void;
}

function CheckoutForm({ amount, onSuccess, onError }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking-active`,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('[Stripe] Payment error:', error);
        onError(error.message || 'Payment failed');
      } else if (paymentIntent) {
        console.log('[Stripe] Payment successful:', paymentIntent.id);
        onSuccess(paymentIntent.id, paymentIntent.payment_method as string);
      }
    } catch (err: any) {
      console.error('[Stripe] Payment exception:', err);
      onError(err.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <View style={styles.paymentElementContainer}>
        <PaymentElement />
      </View>
      
      <TouchableOpacity
        style={[styles.payButton, (!stripe || isProcessing) && styles.payButtonDisabled]}
        onPress={handleSubmit as any}
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator color={Colors.background} />
        ) : (
          <>
            <Lock size={20} color={Colors.background} />
            <Text style={styles.payButtonText}>
              Pay ${amount.toFixed(2)} MXN
            </Text>
          </>
        )}
      </TouchableOpacity>
    </form>
  );
}

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
  const [stripe, setStripe] = useState<Stripe | null>(null);

  useEffect(() => {
    stripePromise.then(setStripe);
  }, []);

  if (!clientSecret) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Payment configuration error</Text>
      </View>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'night' as const,
      variables: {
        colorPrimary: Colors.gold,
        colorBackground: Colors.surface,
        colorText: Colors.textPrimary,
        colorDanger: '#ff4444',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '12px',
      },
    },
  };

  return (
    <View style={styles.container}>
      {stripe ? (
        <Elements stripe={stripe} options={options}>
          <CheckoutForm amount={amount} onSuccess={onSuccess} onError={onError} />
        </Elements>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.gold} />
          <Text style={styles.loadingText}>Loading payment form...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  paymentElementContainer: {
    marginBottom: 20,
    minHeight: 200,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.gold,
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  errorText: {
    fontSize: 14,
    color: '#ff4444',
    textAlign: 'center' as const,
    padding: 20,
  },
});
