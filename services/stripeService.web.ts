import { trpcClient } from '@/lib/trpc';

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
}

export interface PaymentResult {
  success: boolean;
  error?: string;
  paymentIntentId?: string;
  paymentMethodId?: string;
}

export const createPaymentIntent = async (
  bookingId: string,
  amount: number,
  paymentMethodId?: string
): Promise<PaymentIntent> => {
  try {
    console.log('[Stripe Web] Creating payment intent:', { bookingId, amount, paymentMethodId });

    const result = await trpcClient.payments.createIntent.mutate({
      bookingId,
      amount: Math.round(amount * 100),
      paymentMethodId,
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

    const paymentIntentId = clientSecret.split('_secret_')[0];
    
    const result = await trpcClient.payments.getPaymentIntent.query({ paymentIntentId });

    return {
      success: true,
      paymentIntentId,
      paymentMethodId: result.paymentMethodId,
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

export const savePaymentMethod = async (
  paymentMethodId: string,
  setAsDefault: boolean
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('[Stripe Web] Saving payment method:', { paymentMethodId, setAsDefault });

    await trpcClient.payments.addPaymentMethod.mutate({
      paymentMethodId,
      setAsDefault,
    });

    return { success: true };
  } catch (error: any) {
    console.error('[Stripe Web] Save payment method error:', error);
    return {
      success: false,
      error: error.message || 'Failed to save payment method',
    };
  }
};
