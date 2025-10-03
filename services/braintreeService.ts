import { trpcClient } from '@/lib/trpc';

export interface BraintreePaymentResult {
  id: string;
  status: string;
  amount: number;
  currency: string;
  paymentRecordId: string;
}

export interface BraintreeRefundResult {
  id: string;
  status: string;
  amount: number;
  currency: string;
  refundRecordId: string;
}

class BraintreeService {
  async getClientToken(customerId?: string): Promise<string> {
    console.log('[BraintreeService] Getting client token for customer:', customerId);
    
    try {
      const result = await trpcClient.payments.braintree.clientToken.mutate({
        customerId,
      });
      
      console.log('[BraintreeService] Client token received');
      return result.clientToken;
    } catch (error: any) {
      console.error('[BraintreeService] Error getting client token:', error);
      throw new Error(`Failed to get client token: ${error.message}`);
    }
  }

  async processPayment(params: {
    nonce: string;
    amount: number;
    currency?: string;
    customerId?: string;
    bookingId?: string;
    description?: string;
  }): Promise<BraintreePaymentResult> {
    console.log('[BraintreeService] Processing payment:', {
      amount: params.amount,
      currency: params.currency || 'MXN',
      bookingId: params.bookingId,
    });

    try {
      const result = await trpcClient.payments.braintree.checkout.mutate({
        nonce: params.nonce,
        amount: params.amount,
        currency: params.currency || 'MXN',
        customerId: params.customerId,
        bookingId: params.bookingId,
        description: params.description,
      });

      console.log('[BraintreeService] Payment successful:', result.id);
      return result;
    } catch (error: any) {
      console.error('[BraintreeService] Payment error:', error);
      throw new Error(`Payment failed: ${error.message}`);
    }
  }

  async refundPayment(params: {
    transactionId: string;
    amount?: number;
    reason?: string;
  }): Promise<BraintreeRefundResult> {
    console.log('[BraintreeService] Processing refund:', params.transactionId);

    try {
      const result = await trpcClient.payments.braintree.refund.mutate({
        transactionId: params.transactionId,
        amount: params.amount,
        reason: params.reason,
      });

      console.log('[BraintreeService] Refund successful:', result.id);
      return result;
    } catch (error: any) {
      console.error('[BraintreeService] Refund error:', error);
      throw new Error(`Refund failed: ${error.message}`);
    }
  }
}

export const braintreeService = new BraintreeService();
