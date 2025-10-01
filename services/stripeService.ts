import { Platform } from 'react-native';
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
}

export interface PaymentResult {
  success: boolean;
  error?: string;
  paymentIntentId?: string;
}

export const createPaymentIntent = async (
  bookingId: string,
  amount: number
): Promise<PaymentIntent> => {
  try {
    console.log('[Stripe] Creating payment intent:', { bookingId, amount });

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_TOOLKIT_URL}/api/trpc/payments.createIntent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          amount: Math.round(amount * 100),
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    const data = await response.json();
    return {
      clientSecret: data.result.data.clientSecret,
      paymentIntentId: data.result.data.paymentIntentId,
    };
  } catch (error) {
    console.error('[Stripe] Create payment intent error:', error);
    throw error;
  }
};

export const confirmPayment = async (
  clientSecret: string
): Promise<PaymentResult> => {
  try {
    console.log('[Stripe] Confirming payment:', clientSecret);

    if (Platform.OS === 'web') {
      return {
        success: true,
        paymentIntentId: clientSecret.split('_secret_')[0],
      };
    }

    const { error: initError } = await initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
      merchantDisplayName: 'Escolta Pro',
      returnURL: 'escoltapro://payment-return',
    });

    if (initError) {
      console.error('[Stripe] Init payment sheet error:', initError);
      return {
        success: false,
        error: initError.message,
      };
    }

    const { error: presentError } = await presentPaymentSheet();

    if (presentError) {
      console.error('[Stripe] Present payment sheet error:', presentError);
      return {
        success: false,
        error: presentError.message,
      };
    }

    return {
      success: true,
      paymentIntentId: clientSecret.split('_secret_')[0],
    };
  } catch (error: any) {
    console.error('[Stripe] Confirm payment error:', error);
    return {
      success: false,
      error: error.message || 'Payment failed',
    };
  }
};

export const refundPayment = async (
  paymentIntentId: string,
  amount?: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('[Stripe] Refunding payment:', { paymentIntentId, amount });

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_TOOLKIT_URL}/api/trpc/payments.refund`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId,
          amount: amount ? Math.round(amount * 100) : undefined,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to process refund');
    }

    return { success: true };
  } catch (error: any) {
    console.error('[Stripe] Refund error:', error);
    return {
      success: false,
      error: error.message || 'Refund failed',
    };
  }
};
