import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedPaymentMethod } from '@/types';
import { PAYMENT_CONFIG } from '@/config/env';

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
    console.log('[Payment] Generating mock client token for customer:', customerId);
    await new Promise(resolve => setTimeout(resolve, 500));
    return 'mock_client_token_' + Date.now();
  },

  async processPayment(
    nonce: string,
    amount: number,
    customerId?: string,
    saveCard: boolean = false
  ): Promise<PaymentResult> {
    console.log('[Payment] Processing mock payment:', { amount, customerId, saveCard });
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockTransactionId = 'mock_txn_' + Date.now();
    
    if (saveCard) {
      const last4 = Math.floor(1000 + Math.random() * 9000).toString();
      await this.savePaymentMethod({
        token: 'mock_token_' + Date.now(),
        last4,
        cardType: 'Visa',
        expirationMonth: '12',
        expirationYear: '2025',
      });
    }
    
    return {
      success: true,
      transactionId: mockTransactionId,
    };
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
    console.log('[Payment] Processing mock refund:', { transactionId, amount });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      transactionId: 'mock_refund_' + Date.now(),
    };
  },
};
