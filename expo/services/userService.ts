import { collection, deleteField, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db as getDb } from '@/lib/firebase';
import type { Guard, KYCStatus, User, UserRole } from '@/types';
import { logger } from '@/utils/logger';

type GuardDocumentFields = Partial<
  Pick<Guard, 'photos' | 'governmentIdUrls' | 'licenseUrls' | 'insuranceUrls' | 'vehicleDocUrls' | 'outfitPhotos' | 'kycStatus'>
>;

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

  // Usado por una empresa para subir documentos/foto de SU escolta (o por
  // admin para cualquiera). Las reglas de Firestore restringen que campos se
  // pueden tocar cuando quien escribe no es ni el dueno ni admin.
  async updateGuardDocuments(guardId: string, updates: GuardDocumentFields): Promise<void> {
    await updateDoc(doc(getDb(), 'users', guardId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },

  async updateUserFields(
    userId: string,
    updates: Partial<Pick<User, 'firstName' | 'lastName' | 'phone'>> & { hourlyRate?: number }
  ): Promise<void> {
    await updateDoc(doc(getDb(), 'users', userId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },
};
