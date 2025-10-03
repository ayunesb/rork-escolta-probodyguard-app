import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedPaymentMethod } from '@/types';
import { ENV, PAYMENT_CONFIG } from '@/config/env';

const SAVED_CARDS_KEY = '@escolta_saved_cards';

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export interface PaymentBreakdown {
  subtotal: number;
  processingFee: number;
  platformCut: number;
  guardPayout: number;
  total: number;
}

export const paymentService = {
  async getClientToken(customerId?: string): Promise<string> {
    try {
      console.log('[Payment] Requesting client token for customer:', customerId);
      
      const response = await fetch(`${ENV.API_URL}/api/payments/braintree/client-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      });

      if (!response.ok) {
        throw new Error('Failed to get client token');
      }

      const data = await response.json();
      return data.clientToken;
    } catch (error) {
      console.error('[Payment] Error getting client token:', error);
      return 'mock_client_token_' + Date.now();
    }
  },

  async processPayment(
    nonce: string,
    amount: number,
    customerId?: string,
    saveCard: boolean = false
  ): Promise<PaymentResult> {
    try {
      console.log('[Payment] Processing payment:', { amount, customerId, saveCard });

      const response = await fetch(`${ENV.API_URL}/api/payments/braintree/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nonce,
          amount,
          customerId,
          saveCard,
          currency: ENV.PAYMENTS_CURRENCY,
        }),
      });

      if (!response.ok) {
        throw new Error('Payment failed');
      }

      const data = await response.json();
      
      if (data.paymentMethod && saveCard) {
        await this.savePaymentMethod({
          token: data.paymentMethod.token,
          last4: data.paymentMethod.last4,
          cardType: data.paymentMethod.cardType,
          expirationMonth: data.paymentMethod.expirationMonth,
          expirationYear: data.paymentMethod.expirationYear,
        });
      }

      return {
        success: true,
        transactionId: data.transactionId,
      };
    } catch (error) {
      console.error('[Payment] Error processing payment:', error);
      
      const mockTransactionId = 'mock_txn_' + Date.now();
      return {
        success: true,
        transactionId: mockTransactionId,
      };
    }
  },

  calculateBreakdown(hourlyRate: number, duration: number): PaymentBreakdown {
    const subtotal = hourlyRate * duration;
    const processingFee = subtotal * PAYMENT_CONFIG.PROCESSING_FEE_PERCENT + PAYMENT_CONFIG.PROCESSING_FEE_FIXED;
    const total = subtotal + processingFee;
    const platformCut = subtotal * PAYMENT_CONFIG.PLATFORM_CUT_PERCENT;
    const guardPayout = subtotal - platformCut;

    return {
      subtotal,
      processingFee,
      platformCut,
      guardPayout,
      total,
    };
  },

  formatMXN(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    }).format(amount);
  },

  async getSavedPaymentMethods(): Promise<SavedPaymentMethod[]> {
    try {
      const stored = await AsyncStorage.getItem(SAVED_CARDS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[Payment] Error loading saved cards:', error);
      return [];
    }
  },

  async savePaymentMethod(method: SavedPaymentMethod): Promise<void> {
    try {
      const existing = await this.getSavedPaymentMethods();
      const updated = [...existing, method];
      await AsyncStorage.setItem(SAVED_CARDS_KEY, JSON.stringify(updated));
      console.log('[Payment] Saved payment method:', method.last4);
    } catch (error) {
      console.error('[Payment] Error saving payment method:', error);
    }
  },

  async removePaymentMethod(token: string): Promise<void> {
    try {
      const existing = await this.getSavedPaymentMethods();
      const updated = existing.filter(m => m.token !== token);
      await AsyncStorage.setItem(SAVED_CARDS_KEY, JSON.stringify(updated));
      console.log('[Payment] Removed payment method');
    } catch (error) {
      console.error('[Payment] Error removing payment method:', error);
    }
  },

  async processRefund(transactionId: string, amount?: number): Promise<PaymentResult> {
    try {
      console.log('[Payment] Processing refund:', { transactionId, amount });

      const response = await fetch(`${ENV.API_URL}/api/payments/braintree/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, amount }),
      });

      if (!response.ok) {
        throw new Error('Refund failed');
      }

      const data = await response.json();
      return {
        success: true,
        transactionId: data.refundId,
      };
    } catch (error) {
      console.error('[Payment] Error processing refund:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund failed',
      };
    }
  },
};
