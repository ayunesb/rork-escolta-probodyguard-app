import { Platform } from 'react-native';

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

    return {
      clientSecret: 'mock_client_secret_' + Date.now(),
      paymentIntentId: 'pi_' + Date.now(),
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
        paymentIntentId: 'pi_' + Date.now(),
      };
    }

    return {
      success: true,
      paymentIntentId: 'pi_' + Date.now(),
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

    return { success: true };
  } catch (error: any) {
    console.error('[Stripe] Refund error:', error);
    return {
      success: false,
      error: error.message || 'Refund failed',
    };
  }
};
