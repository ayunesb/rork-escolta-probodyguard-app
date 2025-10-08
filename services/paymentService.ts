import { collection, addDoc, updateDoc, doc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db as getDbInstance } from '@/lib/firebase';
import { SavedPaymentMethod } from '@/types';
import { PAYMENT_CONFIG, ENV } from '@/config/env';

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  requiresAction?: boolean;
  actionUrl?: string;
}

export interface PaymentBreakdown {
  subtotal: number;
  processingFee: number;
  platformCut: number;
  guardPayout: number;
  total: number;
}

export const paymentService = {
  async getClientToken(userId: string): Promise<string> {
    console.log('[Payment] Requesting client token for user:', userId);
    
    try {
      const response = await fetch(`${ENV.API_URL}/payments/client-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to get client token');
      }

      const data = await response.json();
      console.log('[Payment] Client token received');
      return data.clientToken;
    } catch (error) {
      console.error('[Payment] Error getting client token:', error);
      throw error;
    }
  },

  async processPayment(
    nonce: string,
    amount: number,
    bookingId: string,
    userId: string,
    saveCard: boolean = false
  ): Promise<PaymentResult> {
    console.log('[Payment] Processing payment:', { amount, bookingId, userId, saveCard });
    
    try {
      const response = await fetch(`${ENV.API_URL}/payments/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nonce,
          amount,
          bookingId,
          userId,
          saveCard,
          currency: ENV.PAYMENTS_CURRENCY,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[Payment] Payment failed:', data.error);
        return {
          success: false,
          error: data.error || 'Payment processing failed',
        };
      }

      if (data.requiresAction) {
        console.log('[Payment] 3DS authentication required');
        return {
          success: false,
          requiresAction: true,
          actionUrl: data.actionUrl,
        };
      }

      console.log('[Payment] Payment successful:', data.transactionId);
      
      await addDoc(collection(getDbInstance(), 'payments'), {
        bookingId,
        userId,
        amount,
        transactionId: data.transactionId,
        status: 'completed',
        createdAt: serverTimestamp(),
      });

      return {
        success: true,
        transactionId: data.transactionId,
      };
    } catch (error) {
      console.error('[Payment] Payment processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
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

  async calculateBookingCost(
    hourlyRate: number,
    duration: number,
    vehicleType: 'standard' | 'armored',
    protectionType: 'armed' | 'unarmed',
    numberOfProtectees: number
  ): Promise<{
    subtotal: number;
    vehicleFee: number;
    protectionFee: number;
    platformFee: number;
    total: number;
  }> {
    const subtotal = hourlyRate * duration;
    const vehicleFee = vehicleType === 'armored' ? 500 * duration : 0;
    const protectionFee = protectionType === 'armed' ? 200 * duration : 0;
    const platformFee = (subtotal + vehicleFee + protectionFee) * 0.1;
    const total = subtotal + vehicleFee + protectionFee + platformFee;

    return {
      subtotal,
      vehicleFee,
      protectionFee,
      platformFee,
      total,
    };
  },

  async getSavedPaymentMethods(userId: string): Promise<SavedPaymentMethod[]> {
    try {
      const response = await fetch(`${ENV.API_URL}/payments/methods/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }

      const data = await response.json();
      return data.paymentMethods || [];
    } catch (error) {
      console.error('[Payment] Error loading saved cards:', error);
      return [];
    }
  },

  async removePaymentMethod(userId: string, token: string): Promise<void> {
    try {
      const response = await fetch(`${ENV.API_URL}/payments/methods/${userId}/${token}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove payment method');
      }

      console.log('[Payment] Removed payment method');
    } catch (error) {
      console.error('[Payment] Error removing payment method:', error);
      throw error;
    }
  },

  async processRefund(transactionId: string, bookingId: string, amount?: number): Promise<PaymentResult> {
    console.log('[Payment] Processing refund:', { transactionId, bookingId, amount });
    
    try {
      const response = await fetch(`${ENV.API_URL}/payments/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          bookingId,
          amount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[Payment] Refund failed:', data.error);
        return {
          success: false,
          error: data.error || 'Refund processing failed',
        };
      }

      console.log('[Payment] Refund successful:', data.refundId);
      
      const paymentQuery = query(
        collection(getDbInstance(), 'payments'),
        where('transactionId', '==', transactionId)
      );
      const paymentSnapshot = await getDocs(paymentQuery);
      
      if (!paymentSnapshot.empty) {
        const paymentDoc = paymentSnapshot.docs[0];
        await updateDoc(doc(getDbInstance(), 'payments', paymentDoc.id), {
          status: 'refunded',
          refundId: data.refundId,
          refundedAt: serverTimestamp(),
        });
      }

      return {
        success: true,
        transactionId: data.refundId,
      };
    } catch (error) {
      console.error('[Payment] Refund processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund failed',
      };
    }
  },
};
