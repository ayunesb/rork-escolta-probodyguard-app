import AsyncStorage from '@react-native-async-storage/async-storage';

const PAYMENT_METHODS_KEY = '@escolta_payment_methods';
const TRANSACTIONS_KEY = '@escolta_transactions';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
  paymentMethodId: string;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
  refundedAt?: string;
  refundAmount?: number;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  clientSecret: string;
}

class PaymentService {
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const stored = await AsyncStorage.getItem(PAYMENT_METHODS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting payment methods:', error);
      return [];
    }
  }

  async addPaymentMethod(method: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> {
    try {
      const methods = await this.getPaymentMethods();
      
      const newMethod: PaymentMethod = {
        ...method,
        id: 'pm_' + Date.now(),
      };

      if (newMethod.isDefault) {
        methods.forEach(m => m.isDefault = false);
      }

      methods.push(newMethod);
      await AsyncStorage.setItem(PAYMENT_METHODS_KEY, JSON.stringify(methods));
      
      return newMethod;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }

  async removePaymentMethod(methodId: string): Promise<void> {
    try {
      const methods = await this.getPaymentMethods();
      const filtered = methods.filter(m => m.id !== methodId);
      await AsyncStorage.setItem(PAYMENT_METHODS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw error;
    }
  }

  async setDefaultPaymentMethod(methodId: string): Promise<void> {
    try {
      const methods = await this.getPaymentMethods();
      methods.forEach(m => {
        m.isDefault = m.id === methodId;
      });
      await AsyncStorage.setItem(PAYMENT_METHODS_KEY, JSON.stringify(methods));
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    bookingId: string
  ): Promise<PaymentIntent> {
    try {
      console.log('Creating payment intent:', { amount, currency, bookingId });

      await new Promise(resolve => setTimeout(resolve, 1000));

      const paymentIntent: PaymentIntent = {
        id: 'pi_' + Date.now(),
        amount,
        currency,
        status: 'requires_payment_method',
        clientSecret: 'pi_secret_' + Date.now(),
      };

      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  async confirmPayment(
    paymentIntentId: string,
    paymentMethodId: string
  ): Promise<Transaction> {
    try {
      console.log('Confirming payment:', { paymentIntentId, paymentMethodId });

      await new Promise(resolve => setTimeout(resolve, 1500));

      const transaction: Transaction = {
        id: 'txn_' + Date.now(),
        bookingId: 'booking_' + Date.now(),
        amount: 0,
        currency: 'usd',
        status: 'succeeded',
        paymentMethodId,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };

      const transactions = await this.getTransactions();
      transactions.push(transaction);
      await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));

      return transaction;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  async getTransactions(): Promise<Transaction[]> {
    try {
      const stored = await AsyncStorage.getItem(TRANSACTIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  async getTransaction(transactionId: string): Promise<Transaction | null> {
    try {
      const transactions = await this.getTransactions();
      return transactions.find(t => t.id === transactionId) || null;
    } catch (error) {
      console.error('Error getting transaction:', error);
      return null;
    }
  }

  async refundTransaction(
    transactionId: string,
    amount?: number,
    reason?: string
  ): Promise<Transaction> {
    try {
      console.log('Refunding transaction:', { transactionId, amount, reason });

      const transactions = await this.getTransactions();
      const transaction = transactions.find(t => t.id === transactionId);

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.status !== 'succeeded') {
        throw new Error('Can only refund succeeded transactions');
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      transaction.status = 'refunded';
      transaction.refundedAt = new Date().toISOString();
      transaction.refundAmount = amount || transaction.amount;

      await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));

      return transaction;
    } catch (error) {
      console.error('Error refunding transaction:', error);
      throw error;
    }
  }

  async calculateBookingCost(
    hourlyRate: number,
    hours: number,
    vehicleType: 'standard' | 'armored',
    protectionType: 'armed' | 'unarmed',
    numberOfProtectors: number = 1
  ): Promise<{
    subtotal: number;
    vehicleFee: number;
    protectionFee: number;
    platformFee: number;
    total: number;
  }> {
    const subtotal = hourlyRate * hours * numberOfProtectors;
    const vehicleFee = vehicleType === 'armored' ? subtotal * 0.25 : 0;
    const protectionFee = protectionType === 'armed' ? subtotal * 0.15 : 0;
    const platformFee = (subtotal + vehicleFee + protectionFee) * 0.10;
    const total = subtotal + vehicleFee + protectionFee + platformFee;

    return {
      subtotal,
      vehicleFee,
      protectionFee,
      platformFee,
      total: Math.round(total * 100) / 100,
    };
  }
}

export const paymentService = new PaymentService();
