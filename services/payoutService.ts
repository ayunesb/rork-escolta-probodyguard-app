import { collection, addDoc, updateDoc, doc, getDocs, query, where, orderBy, limit, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db as getDbInstance } from '@/lib/firebase';
import { ENV, PAYMENT_CONFIG } from '@/config/env';

export interface PayoutRequest {
  guardId: string;
  amount: number;
  bookingIds: string[];
}

export interface PayoutRecord {
  id: string;
  guardId: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  bookingIds: string[];
  createdAt: Timestamp;
  processedAt?: Timestamp;
  failureReason?: string;
  braintreePayoutId?: string;
}

export interface GuardBalance {
  guardId: string;
  availableBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  totalPayouts: number;
  lastPayoutAt?: Timestamp;
}

export interface LedgerEntry {
  id: string;
  guardId: string;
  bookingId: string;
  type: 'earning' | 'payout' | 'adjustment';
  amount: number;
  description: string;
  createdAt: Timestamp;
}

export const payoutService = {
  async getGuardBalance(guardId: string): Promise<GuardBalance> {
    console.log('[Payout] Fetching balance for guard:', guardId);
    
    try {
      const ledgerQuery = query(
        collection(getDbInstance(), 'ledger'),
        where('guardId', '==', guardId),
        orderBy('createdAt', 'desc')
      );
      
      const ledgerSnapshot = await getDocs(ledgerQuery);
      
      let availableBalance = 0;
      let pendingBalance = 0;
      let totalEarnings = 0;
      let totalPayouts = 0;
      let lastPayoutAt: Timestamp | undefined;
      
      ledgerSnapshot.forEach((doc) => {
        const entry = doc.data() as LedgerEntry;
        
        if (entry.type === 'earning') {
          totalEarnings += entry.amount;
          availableBalance += entry.amount;
        } else if (entry.type === 'payout') {
          totalPayouts += Math.abs(entry.amount);
          availableBalance += entry.amount;
          if (!lastPayoutAt || entry.createdAt > lastPayoutAt) {
            lastPayoutAt = entry.createdAt;
          }
        } else if (entry.type === 'adjustment') {
          availableBalance += entry.amount;
        }
      });
      
      const pendingPayoutsQuery = query(
        collection(getDbInstance(), 'payouts'),
        where('guardId', '==', guardId),
        where('status', 'in', ['pending', 'processing'])
      );
      
      const pendingPayoutsSnapshot = await getDocs(pendingPayoutsQuery);
      pendingPayoutsSnapshot.forEach((doc) => {
        const payout = doc.data() as PayoutRecord;
        pendingBalance += payout.amount;
      });
      
      return {
        guardId,
        availableBalance: Math.max(0, availableBalance),
        pendingBalance,
        totalEarnings,
        totalPayouts,
        lastPayoutAt,
      };
    } catch (error) {
      console.error('[Payout] Error fetching guard balance:', error);
      throw error;
    }
  },

  async recordEarning(guardId: string, bookingId: string, amount: number): Promise<void> {
    console.log('[Payout] Recording earning:', { guardId, bookingId, amount });
    
    try {
      await addDoc(collection(getDbInstance(), 'ledger'), {
        guardId,
        bookingId,
        type: 'earning',
        amount,
        description: `Earning from booking ${bookingId}`,
        createdAt: serverTimestamp(),
      });
      
      console.log('[Payout] Earning recorded successfully');
    } catch (error) {
      console.error('[Payout] Error recording earning:', error);
      throw error;
    }
  },

  async requestPayout(guardId: string, amount: number, bookingIds: string[]): Promise<string> {
    console.log('[Payout] Requesting payout:', { guardId, amount, bookingIds });
    
    try {
      const balance = await this.getGuardBalance(guardId);
      
      if (balance.availableBalance < amount) {
        throw new Error('Insufficient balance for payout');
      }
      
      const payoutDoc = await addDoc(collection(getDbInstance(), 'payouts'), {
        guardId,
        amount,
        bookingIds,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      
      console.log('[Payout] Payout request created:', payoutDoc.id);
      return payoutDoc.id;
    } catch (error) {
      console.error('[Payout] Error requesting payout:', error);
      throw error;
    }
  },

  async processPayout(payoutId: string): Promise<void> {
    console.log('[Payout] Processing payout:', payoutId);
    
    try {
      const response = await fetch(`${ENV.API_URL}/api/payouts/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Payout processing failed');
      }
      
      await updateDoc(doc(getDbInstance(), 'payouts', payoutId), {
        status: 'completed',
        processedAt: serverTimestamp(),
        braintreePayoutId: data.braintreePayoutId,
      });
      
      const payoutDoc = await getDocs(query(collection(getDbInstance(), 'payouts'), where('__name__', '==', payoutId)));
      if (!payoutDoc.empty) {
        const payout = payoutDoc.docs[0].data() as PayoutRecord;
        
        await addDoc(collection(getDbInstance(), 'ledger'), {
          guardId: payout.guardId,
          bookingId: payout.bookingIds[0] || 'multiple',
          type: 'payout',
          amount: -payout.amount,
          description: `Payout ${payoutId}`,
          createdAt: serverTimestamp(),
        });
      }
      
      console.log('[Payout] Payout processed successfully');
    } catch (error) {
      console.error('[Payout] Error processing payout:', error);
      
      await updateDoc(doc(getDbInstance(), 'payouts', payoutId), {
        status: 'failed',
        failureReason: error instanceof Error ? error.message : 'Unknown error',
      });
      
      throw error;
    }
  },

  async getPayoutHistory(guardId: string, limitCount: number = 20): Promise<PayoutRecord[]> {
    console.log('[Payout] Fetching payout history for guard:', guardId);
    
    try {
      const payoutsQuery = query(
        collection(getDbInstance(), 'payouts'),
        where('guardId', '==', guardId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const payoutsSnapshot = await getDocs(payoutsQuery);
      
      const payouts: PayoutRecord[] = [];
      payoutsSnapshot.forEach((doc) => {
        payouts.push({
          id: doc.id,
          ...doc.data(),
        } as PayoutRecord);
      });
      
      return payouts;
    } catch (error) {
      console.error('[Payout] Error fetching payout history:', error);
      return [];
    }
  },

  async getLedgerEntries(guardId: string, limitCount: number = 50): Promise<LedgerEntry[]> {
    console.log('[Payout] Fetching ledger entries for guard:', guardId);
    
    try {
      const ledgerQuery = query(
        collection(getDbInstance(), 'ledger'),
        where('guardId', '==', guardId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const ledgerSnapshot = await getDocs(ledgerQuery);
      
      const entries: LedgerEntry[] = [];
      ledgerSnapshot.forEach((doc) => {
        entries.push({
          id: doc.id,
          ...doc.data(),
        } as LedgerEntry);
      });
      
      return entries;
    } catch (error) {
      console.error('[Payout] Error fetching ledger entries:', error);
      return [];
    }
  },

  calculateGuardPayout(hourlyRate: number, duration: number): number {
    const subtotal = hourlyRate * duration;
    const platformCut = subtotal * PAYMENT_CONFIG.PLATFORM_CUT_PERCENT;
    return subtotal - platformCut;
  },

  formatMXN(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    }).format(amount);
  },
};
