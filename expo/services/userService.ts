import { collection, deleteField, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db as getDb } from '@/lib/firebase';
import type { KYCStatus, User, UserRole } from '@/types';
import { logger } from '@/utils/logger';

export const userService = {
  async listByRole(role: UserRole): Promise<User[]> {
    try {
      const q = query(collection(getDb(), 'users'), where('role', '==', role));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as User));
    } catch (error) {
      logger.error(`[UserService] Failed to list users by role: ${role}`, error);
      return [];
    }
  },

  async listGuardsForCompany(companyId: string): Promise<User[]> {
    try {
      const q = query(
        collection(getDb(), 'users'),
        where('role', '==', 'guard'),
        where('companyId', '==', companyId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as User));
    } catch (error) {
      logger.error(`[UserService] Failed to list guards for company: ${companyId}`, error);
      return [];
    }
  },

  async setUserActive(userId: string, isActive: boolean): Promise<void> {
    await updateDoc(doc(getDb(), 'users', userId), {
      isActive,
      updatedAt: new Date().toISOString(),
    });
  },

  async setKYCStatus(userId: string, kycStatus: KYCStatus): Promise<void> {
    await updateDoc(doc(getDb(), 'users', userId), {
      kycStatus,
      updatedAt: new Date().toISOString(),
    });
  },

  async removeGuardFromCompany(guardId: string): Promise<void> {
    await updateDoc(doc(getDb(), 'users', guardId), {
      companyId: deleteField(),
      updatedAt: new Date().toISOString(),
    });
  },
};
