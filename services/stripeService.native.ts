import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';
import { trpcClient } from '@/lib/trpc';

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

    const result = await trpcClient.payments.createIntent.mutate({
      bookingId,
      amount: Math.round(amount * 100),
    });

    return {
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
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

    await trpcClient.payments.refund.mutate({
      paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });

    return { success: true };
  } catch (error: any) {
    console.error('[Stripe] Refund error:', error);
    return {
      success: false,
      error: error.message || 'Refund failed',
    };
  }
};
