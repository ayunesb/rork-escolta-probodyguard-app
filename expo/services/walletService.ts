import AsyncStorage from '@react-native-async-storage/async-storage';

const WALLET_KEY = '@escolta_wallet';
const TRANSACTIONS_KEY = '@escolta_transactions';

export type TransactionType = 
  | 'booking_payment'
  | 'booking_refund'
  | 'payout'
  | 'deposit'
  | 'withdrawal'
  | 'referral_bonus'
  | 'platform_fee';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  bookingId?: string;
  referralId?: string;
  createdAt: string;
  completedAt?: string;
  metadata?: Record<string, any>;
}

export interface Wallet {
  userId: string;
  balance: number;
  currency: string;
  pendingBalance: number;
  totalEarnings: number;
  totalSpent: number;
  lastUpdated: string;
}

export const walletService = {
  async getWallet(userId: string): Promise<Wallet> {
    try {
      const stored = await AsyncStorage.getItem(`${WALLET_KEY}_${userId}`);
      if (stored) {
        return JSON.parse(stored);
      }

      const newWallet: Wallet = {
        userId,
        balance: 0,
        currency: 'USD',
        pendingBalance: 0,
        totalEarnings: 0,
        totalSpent: 0,
        lastUpdated: new Date().toISOString(),
      };

      await this.saveWallet(newWallet);
      return newWallet;
    } catch (error) {
      console.error('[Wallet] Error loading wallet:', error);
      throw error;
    }
  },

  async saveWallet(wallet: Wallet): Promise<void> {
    try {
      wallet.lastUpdated = new Date().toISOString();
      await AsyncStorage.setItem(
        `${WALLET_KEY}_${wallet.userId}`,
        JSON.stringify(wallet)
      );
      console.log('[Wallet] Saved wallet for user:', wallet.userId);
    } catch (error) {
      console.error('[Wallet] Error saving wallet:', error);
      throw error;
    }
  },

  async addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    try {
      const newTransaction: Transaction = {
        ...transaction,
        id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      };

      const transactions = await this.getTransactions(transaction.userId);
      transactions.push(newTransaction);
      
      await AsyncStorage.setItem(
        `${TRANSACTIONS_KEY}_${transaction.userId}`,
        JSON.stringify(transactions)
      );

      if (transaction.status === 'completed') {
        await this.updateWalletBalance(transaction.userId, transaction.type, transaction.amount);
      }

      console.log('[Wallet] Added transaction:', newTransaction.id);
      return newTransaction;
    } catch (error) {
      console.error('[Wallet] Error adding transaction:', error);
      throw error;
    }
  },

  async getTransactions(userId: string): Promise<Transaction[]> {
    try {
      const stored = await AsyncStorage.getItem(`${TRANSACTIONS_KEY}_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[Wallet] Error loading transactions:', error);
      return [];
    }
  },

  async getTransactionById(userId: string, transactionId: string): Promise<Transaction | null> {
    try {
      const transactions = await this.getTransactions(userId);
      return transactions.find(t => t.id === transactionId) || null;
    } catch (error) {
      console.error('[Wallet] Error getting transaction:', error);
      return null;
    }
  },

  async updateTransactionStatus(
    userId: string,
    transactionId: string,
    status: Transaction['status']
  ): Promise<void> {
    try {
      const transactions = await this.getTransactions(userId);
      const index = transactions.findIndex(t => t.id === transactionId);
      
      if (index !== -1) {
        const oldStatus = transactions[index].status;
        transactions[index].status = status;
        
        if (status === 'completed') {
          transactions[index].completedAt = new Date().toISOString();
          
          if (oldStatus !== 'completed') {
            await this.updateWalletBalance(
              userId,
              transactions[index].type,
              transactions[index].amount
            );
          }
        }
        
        await AsyncStorage.setItem(
          `${TRANSACTIONS_KEY}_${userId}`,
          JSON.stringify(transactions)
        );
        
        console.log('[Wallet] Updated transaction status:', transactionId, status);
      }
    } catch (error) {
      console.error('[Wallet] Error updating transaction status:', error);
      throw error;
    }
  },

  async updateWalletBalance(
    userId: string,
    transactionType: TransactionType,
    amount: number
  ): Promise<void> {
    try {
      const wallet = await this.getWallet(userId);

      switch (transactionType) {
        case 'payout':
        case 'deposit':
        case 'referral_bonus':
          wallet.balance += amount;
          wallet.totalEarnings += amount;
          break;
        
        case 'booking_payment':
        case 'withdrawal':
        case 'platform_fee':
          wallet.balance -= amount;
          wallet.totalSpent += amount;
          break;
        
        case 'booking_refund':
          wallet.balance += amount;
          break;
      }

      await this.saveWallet(wallet);
      console.log('[Wallet] Updated balance:', wallet.balance);
    } catch (error) {
      console.error('[Wallet] Error updating balance:', error);
      throw error;
    }
  },

  async requestPayout(userId: string, amount: number): Promise<Transaction> {
    try {
      const wallet = await this.getWallet(userId);
      
      if (wallet.balance < amount) {
        throw new Error('Insufficient balance');
      }

      if (amount < 10) {
        throw new Error('Minimum payout amount is $10');
      }

      const transaction = await this.addTransaction({
        userId,
        type: 'withdrawal',
        amount,
        currency: 'USD',
        status: 'pending',
        description: `Payout request for $${amount.toFixed(2)}`,
      });

      wallet.balance -= amount;
      wallet.pendingBalance += amount;
      await this.saveWallet(wallet);

      console.log('[Wallet] Payout requested:', amount);
      return transaction;
    } catch (error) {
      console.error('[Wallet] Error requesting payout:', error);
      throw error;
    }
  },

  async completePayout(userId: string, transactionId: string): Promise<void> {
    try {
      const wallet = await this.getWallet(userId);
      const transaction = await this.getTransactionById(userId, transactionId);
      
      if (!transaction || transaction.type !== 'withdrawal') {
        throw new Error('Invalid payout transaction');
      }

      wallet.pendingBalance -= transaction.amount;
      await this.saveWallet(wallet);
      
      await this.updateTransactionStatus(userId, transactionId, 'completed');
      
      console.log('[Wallet] Payout completed:', transactionId);
    } catch (error) {
      console.error('[Wallet] Error completing payout:', error);
      throw error;
    }
  },

  async getTransactionHistory(
    userId: string,
    filters?: {
      type?: TransactionType;
      status?: Transaction['status'];
      startDate?: string;
      endDate?: string;
    }
  ): Promise<Transaction[]> {
    try {
      let transactions = await this.getTransactions(userId);

      if (filters?.type) {
        transactions = transactions.filter(t => t.type === filters.type);
      }

      if (filters?.status) {
        transactions = transactions.filter(t => t.status === filters.status);
      }

      if (filters?.startDate) {
        transactions = transactions.filter(
          t => new Date(t.createdAt) >= new Date(filters.startDate!)
        );
      }

      if (filters?.endDate) {
        transactions = transactions.filter(
          t => new Date(t.createdAt) <= new Date(filters.endDate!)
        );
      }

      return transactions.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('[Wallet] Error getting transaction history:', error);
      return [];
    }
  },
};
