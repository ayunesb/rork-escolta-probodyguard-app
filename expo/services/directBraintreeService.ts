import { Platform } from 'react-native';

export interface BraintreePaymentResult {
  id: string;
  status: string;
  amount: number;
  currency: string;
  paymentRecordId: string;
}

class DirectBraintreeService {
  private getBaseUrl(): string {
    if (Platform.OS === 'web') {
      // For web development, use Firebase Functions emulator
      return 'http://127.0.0.1:5001/escolta-pro-fe90e/us-central1/api';
    }
    // For mobile, would use actual Firebase Functions URL
    return 'http://127.0.0.1:5001/escolta-pro-fe90e/us-central1/api';
  }

  async getClientToken(customerId?: string): Promise<string> {
    console.log('[DirectBraintreeService] Getting client token for customer:', customerId);
    
    try {
      const url = `${this.getBaseUrl()}/payments/client-token`;
      const params = new URLSearchParams();
      if (customerId) {
        params.append('userId', customerId);
      }
      
      const response = await fetch(`${url}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[DirectBraintreeService] Client token received');
      return data.clientToken;
    } catch (error: any) {
      console.error('[DirectBraintreeService] Error getting client token:', error);
      // For development, return a mock token so the form can load
      console.warn('[DirectBraintreeService] Returning mock token for development');
      return 'mock-client-token-for-development';
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
    console.log('[DirectBraintreeService] Processing payment:', {
      amount: params.amount,
      currency: params.currency || 'MXN',
      bookingId: params.bookingId,
    });

    try {
      const url = `${this.getBaseUrl()}/payments/process`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nonce: params.nonce,
          amount: params.amount,
          currency: params.currency || 'MXN',
          userId: params.customerId,
          bookingId: params.bookingId,
          description: params.description,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[DirectBraintreeService] Payment successful:', data.transactionId);
      
      return {
        id: data.transactionId,
        status: data.status || 'success',
        amount: params.amount,
        currency: params.currency || 'MXN',
        paymentRecordId: data.transactionId,
      };
    } catch (error: any) {
      console.error('[DirectBraintreeService] Payment error:', error);
      throw new Error(`Payment failed: ${error.message}`);
    }
  }
}

export const directBraintreeService = new DirectBraintreeService();