import AsyncStorage from '@react-native-async-storage/async-storage';
import { walletService } from './walletService';

const REFERRALS_KEY = '@escolta_referrals';

export interface Referral {
  id: string;
  referrerId: string;
  referredUserId?: string;
  referralCode: string;
  status: 'pending' | 'completed' | 'expired';
  bonusAmount: number;
  referredUserBonus: number;
  createdAt: string;
  completedAt?: string;
  expiresAt: string;
}

export interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalEarned: number;
  referralCode: string;
}

function generateReferralCode(userId: string): string {
  const prefix = userId.substring(0, 4).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${random}`;
}

export const referralService = {
  async getUserReferralCode(userId: string): Promise<string> {
    try {
      const stored = await AsyncStorage.getItem(`${REFERRALS_KEY}_code_${userId}`);
      if (stored) {
        return stored;
      }

      const code = generateReferralCode(userId);
      await AsyncStorage.setItem(`${REFERRALS_KEY}_code_${userId}`, code);
      console.log('[Referral] Generated code for user:', userId, code);
      return code;
    } catch (error) {
      console.error('[Referral] Error getting referral code:', error);
      throw error;
    }
  },

  async createReferral(referrerId: string): Promise<Referral> {
    try {
      const referralCode = await this.getUserReferralCode(referrerId);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const referral: Referral = {
        id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        referrerId,
        referralCode,
        status: 'pending',
        bonusAmount: 25,
        referredUserBonus: 15,
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
      };

      const referrals = await this.getReferrals(referrerId);
      referrals.push(referral);
      
      await AsyncStorage.setItem(
        `${REFERRALS_KEY}_${referrerId}`,
        JSON.stringify(referrals)
      );

      console.log('[Referral] Created referral:', referral.id);
      return referral;
    } catch (error) {
      console.error('[Referral] Error creating referral:', error);
      throw error;
    }
  },

  async applyReferralCode(userId: string, referralCode: string): Promise<boolean> {
    try {
      const allUsers = await this.getAllReferralCodes();
      const referrerId = allUsers.get(referralCode);
      
      if (!referrerId) {
        console.log('[Referral] Invalid referral code:', referralCode);
        return false;
      }

      if (referrerId === userId) {
        console.log('[Referral] Cannot use own referral code');
        return false;
      }

      const referrals = await this.getReferrals(referrerId);
      const pendingReferral = referrals.find(
        r => r.referralCode === referralCode && r.status === 'pending' && !r.referredUserId
      );

      if (!pendingReferral) {
        console.log('[Referral] No pending referral found');
        return false;
      }

      if (new Date(pendingReferral.expiresAt) < new Date()) {
        pendingReferral.status = 'expired';
        await AsyncStorage.setItem(
          `${REFERRALS_KEY}_${referrerId}`,
          JSON.stringify(referrals)
        );
        console.log('[Referral] Referral code expired');
        return false;
      }

      pendingReferral.referredUserId = userId;
      pendingReferral.status = 'completed';
      pendingReferral.completedAt = new Date().toISOString();

      await AsyncStorage.setItem(
        `${REFERRALS_KEY}_${referrerId}`,
        JSON.stringify(referrals)
      );

      await walletService.addTransaction({
        userId: referrerId,
        type: 'referral_bonus',
        amount: pendingReferral.bonusAmount,
        currency: 'USD',
        status: 'completed',
        description: `Referral bonus for inviting new user`,
        referralId: pendingReferral.id,
      });

      await walletService.addTransaction({
        userId,
        type: 'referral_bonus',
        amount: pendingReferral.referredUserBonus,
        currency: 'USD',
        status: 'completed',
        description: `Welcome bonus from referral code ${referralCode}`,
        referralId: pendingReferral.id,
      });

      console.log('[Referral] Applied referral code successfully');
      return true;
    } catch (error) {
      console.error('[Referral] Error applying referral code:', error);
      return false;
    }
  },

  async getReferrals(userId: string): Promise<Referral[]> {
    try {
      const stored = await AsyncStorage.getItem(`${REFERRALS_KEY}_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[Referral] Error loading referrals:', error);
      return [];
    }
  },

  async getReferralStats(userId: string): Promise<ReferralStats> {
    try {
      const referrals = await this.getReferrals(userId);
      const referralCode = await this.getUserReferralCode(userId);

      const totalReferrals = referrals.length;
      const completedReferrals = referrals.filter(r => r.status === 'completed').length;
      const pendingReferrals = referrals.filter(r => r.status === 'pending').length;
      const totalEarned = referrals
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + r.bonusAmount, 0);

      return {
        totalReferrals,
        completedReferrals,
        pendingReferrals,
        totalEarned,
        referralCode,
      };
    } catch (error) {
      console.error('[Referral] Error getting referral stats:', error);
      return {
        totalReferrals: 0,
        completedReferrals: 0,
        pendingReferrals: 0,
        totalEarned: 0,
        referralCode: '',
      };
    }
  },

  async getAllReferralCodes(): Promise<Map<string, string>> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const codeKeys = keys.filter(k => k.startsWith(`${REFERRALS_KEY}_code_`));
      const codes = new Map<string, string>();

      for (const key of codeKeys) {
        const userId = key.replace(`${REFERRALS_KEY}_code_`, '');
        const code = await AsyncStorage.getItem(key);
        if (code) {
          codes.set(code, userId);
        }
      }

      return codes;
    } catch (error) {
      console.error('[Referral] Error getting all referral codes:', error);
      return new Map();
    }
  },

  async validateReferralCode(code: string): Promise<boolean> {
    try {
      const allCodes = await this.getAllReferralCodes();
      return allCodes.has(code);
    } catch (error) {
      console.error('[Referral] Error validating referral code:', error);
      return false;
    }
  },
};
