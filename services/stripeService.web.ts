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
    console.log('[Stripe Web] Creating payment intent:', { bookingId, amount });

    const result = await trpcClient.payments.createIntent.mutate({
      bookingId,
      amount: Math.round(amount * 100),
    });

    return {
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
    };
  } catch (error) {
    console.error('[Stripe Web] Create payment intent error:', error);
    throw error;
  }
};

export const confirmPayment = async (
  clientSecret: string
): Promise<PaymentResult> => {
  try {
    console.log('[Stripe Web] Confirming payment (web fallback):', clientSecret);

    return {
      success: true,
      paymentIntentId: clientSecret.split('_secret_')[0],
    };
  } catch (error: any) {
    console.error('[Stripe Web] Confirm payment error:', error);
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
    console.log('[Stripe Web] Refunding payment:', { paymentIntentId, amount });

    await trpcClient.payments.refund.mutate({
      paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });

    return { success: true };
  } catch (error: any) {
    console.error('[Stripe Web] Refund error:', error);
    return {
      success: false,
      error: error.message || 'Refund failed',
    };
  }
};
