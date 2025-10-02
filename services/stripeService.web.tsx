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

let stripePromise: Promise<any> | null = null;

const getStripe = async () => {
  if (!stripePromise) {
    const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      throw new Error('Stripe publishable key not configured');
    }

    if (typeof window !== 'undefined' && !(window as any).Stripe) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      document.head.appendChild(script);
      
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });
    }

    stripePromise = Promise.resolve((window as any).Stripe(publishableKey));
  }
  return stripePromise;
};

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

    console.log('[Stripe Web] Payment intent created:', result);

    return {
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
    };
  } catch (error) {
    console.error('[Stripe Web] Create payment intent error:', error);
    console.error('[Stripe Web] Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
};

export const confirmPayment = async (
  clientSecret: string
): Promise<PaymentResult> => {
  try {
    console.log('[Stripe Web] Confirming payment with client secret');

    const stripe = await getStripe();
    
    const cardElement = document.createElement('div');
    cardElement.id = 'card-element';
    document.body.appendChild(cardElement);

    const elements = stripe.elements();
    const card = elements.create('card');
    card.mount('#card-element');

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: card,
      },
    });

    document.body.removeChild(cardElement);

    if (error) {
      console.error('[Stripe Web] Confirm payment error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log('[Stripe Web] Payment confirmed:', paymentIntent.id);

    return {
      success: true,
      paymentIntentId: paymentIntent.id,
      paymentMethodId: paymentIntent.payment_method as string,
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
