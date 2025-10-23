import { trpcClient } from '@/lib/trpc';
import { logger } from '@/utils/logger';

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
    logger.log('[BraintreeService] Getting client token for customer:', { customerId });
    
    try {
      const result = await trpcClient.payments.braintree.clientToken.mutate({
        customerId,
      });
      
      logger.log('[BraintreeService] Client token received');
      return result.clientToken;
    } catch (error: any) {
      logger.error('[BraintreeService] Error getting client token:', { error });
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
    logger.log('[BraintreeService] Processing payment:', {
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

      logger.log('[BraintreeService] Payment successful:', { transactionId: result.id });
      return result;
    } catch (error: any) {
      logger.error('[BraintreeService] Payment error:', { error });
      throw new Error(`Payment failed: ${error.message}`);
    }
  }

  async refundPayment(params: {
    transactionId: string;
    amount?: number;
    reason?: string;
  }): Promise<BraintreeRefundResult> {
    logger.log('[BraintreeService] Processing refund:', { transactionId: params.transactionId });

    try {
      const result = await trpcClient.payments.braintree.refund.mutate({
        transactionId: params.transactionId,
        amount: params.amount,
        reason: params.reason,
      });

      logger.log('[BraintreeService] Refund successful:', { refundId: result.id });
      return result;
    } catch (error: any) {
      logger.error('[BraintreeService] Refund error:', { error });
      throw new Error(`Refund failed: ${error.message}`);
    }
  }
}

export const braintreeService = new BraintreeService();
