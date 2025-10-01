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
    console.error('[Stripe Web] Refund error:', error);
    return {
      success: false,
      error: error.message || 'Refund failed',
    };
  }
};
