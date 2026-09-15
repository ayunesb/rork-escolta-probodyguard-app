import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db as getDb } from '@/lib/firebase';
import type { Guard } from '@/types';
import { logger } from '@/utils/logger';

/**
 * Real guard accounts (created via sign-up, or by a company through
 * createCompanyGuards) don't fill in most of the Guard-only fields until the
 * guard finishes their profile — there's no "complete your profile" flow
 * yet. Every client-facing screen expects a fully-shaped Guard, so this
 * normalizes whatever is in Firestore into something safe to render instead
 * of crashing on missing arrays/numbers.
 */
function normalizeGuard(id: string, data: Record<string, unknown>): Guard {
  return {
    id,
    email: (data.email as string) ?? '',
    role: 'guard',
    firstName: (data.firstName as string) ?? '',
    lastName: (data.lastName as string) ?? '',
    phone: (data.phone as string) ?? '',
    language: (data.language as Guard['language']) ?? 'es',
    kycStatus: (data.kycStatus as Guard['kycStatus']) ?? 'pending',
    createdAt: (data.createdAt as string) ?? new Date().toISOString(),
    isActive: (data.isActive as boolean) ?? true,
    emailVerified: (data.emailVerified as boolean) ?? false,
    updatedAt: (data.updatedAt as string) ?? new Date().toISOString(),
    bio: (data.bio as string) ?? 'Professional protection specialist.',
    height: (data.height as number) ?? 0,
    weight: (data.weight as number) ?? 0,
    languages: (data.languages as Guard['languages']) ?? [(data.language as Guard['language']) ?? 'es'],
    hourlyRate: (data.hourlyRate as number) ?? 150,
    photos: (data.photos as string[]) ?? [],
    outfitPhotos: (data.outfitPhotos as string[]) ?? [],
    governmentIdUrls: (data.governmentIdUrls as string[]) ?? [],
    licenseUrls: (data.licenseUrls as string[]) ?? [],
    vehicleDocUrls: (data.vehicleDocUrls as string[]) ?? [],
    insuranceUrls: (data.insuranceUrls as string[]) ?? [],
    certifications: (data.certifications as string[]) ?? [],
    rating: (data.rating as number) ?? 0,
    ratingBreakdown: data.ratingBreakdown as Guard['ratingBreakdown'],
    completedJobs: (data.completedJobs as number) ?? 0,
    isFreelancer: (data.isFreelancer as boolean) ?? !data.companyId,
    companyId: data.companyId as string | undefined,
    availability: (data.availability as boolean) ?? true,
    latitude: (data.latitude as number) ?? 20.6296,
    longitude: (data.longitude as number) ?? -87.0739,
  };
}

export const guardService = {
  async listAvailableGuards(): Promise<Guard[]> {
    try {
      const q = query(collection(getDb(), 'users'), where('role', '==', 'guard'));
      const snapshot = await getDocs(q);
      return snapshot.docs
        .map((d) => normalizeGuard(d.id, d.data()))
        .filter((g) => g.isActive);
    } catch (error) {
      logger.error('[GuardService] Failed to list available guards:', error);
      return [];
    }
  },

  async getGuardById(guardId: string): Promise<Guard | null> {
    try {
      const snapshot = await getDoc(doc(getDb(), 'users', guardId));
      if (!snapshot.exists() || snapshot.data()?.role !== 'guard') return null;
      return normalizeGuard(snapshot.id, snapshot.data());
    } catch (error) {
      logger.error(`[GuardService] Failed to get guard: ${guardId}`, error);
      return null;
    }
  },
};
