import { db as getDbInstance, auth as getAuthInstance } from '@/lib/firebase';
import { getStorage } from 'firebase/storage';
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { ref, listAll, deleteObject } from 'firebase/storage';
import { monitoringService } from './monitoringService';

interface DeletionRequest {
  userId: string;
  reason?: string;
  requestedAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  completedAt?: Date;
  error?: string;
}

class GDPRService {
  async requestDataDeletion(userId: string, reason?: string): Promise<string> {
    try {
      const deletionRequest: DeletionRequest = {
        userId,
        reason,
        requestedAt: new Date(),
        status: 'pending',
      };

      const docRef = await addDoc(collection(getDbInstance(), 'deletion_requests'), {
        ...deletionRequest,
        requestedAt: Timestamp.fromDate(deletionRequest.requestedAt),
      });

      await monitoringService.log('info', 'GDPR deletion requested', { userId, requestId: docRef.id }, userId);

      console.log('[GDPR] Deletion request created:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('[GDPR] Failed to create deletion request:', error);
      await monitoringService.reportError({ error: error as Error, userId, context: { action: 'requestDataDeletion' } });
      throw error;
    }
  }

  async executeDataDeletion(userId: string): Promise<void> {
    try {
      console.log('[GDPR] Starting data deletion for user:', userId);

      await this.deleteFirestoreData(userId);
      await this.deleteStorageData(userId);
      await this.deleteAuthAccount(userId);

      await monitoringService.log('info', 'GDPR deletion completed', { userId }, userId);
      console.log('[GDPR] Data deletion completed for user:', userId);
    } catch (error) {
      console.error('[GDPR] Failed to execute deletion:', error);
      await monitoringService.reportError({ error: error as Error, userId, context: { action: 'executeDataDeletion' } });
      throw error;
    }
  }

  private async deleteFirestoreData(userId: string): Promise<void> {
    const collections = [
      'users',
      'bookings',
      'messages',
      'reviews',
      'payouts',
      'ledger',
      'kyc_documents',
      'favorites',
      'notifications',
      'location_history',
      'emergency_alerts',
    ];

    for (const collectionName of collections) {
      try {
        const q = query(
          collection(getDbInstance(), collectionName),
          where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);

        for (const document of snapshot.docs) {
          await deleteDoc(doc(getDbInstance(), collectionName, document.id));
        }

        console.log(`[GDPR] Deleted ${snapshot.size} documents from ${collectionName}`);
      } catch (error) {
        console.error(`[GDPR] Error deleting from ${collectionName}:`, error);
      }
    }

    const userDocQuery = query(
      collection(getDbInstance(), 'users'),
      where('id', '==', userId)
    );
    const userSnapshot = await getDocs(userDocQuery);
    for (const document of userSnapshot.docs) {
      await deleteDoc(doc(getDbInstance(), 'users', document.id));
    }
  }

  private async deleteStorageData(userId: string): Promise<void> {
    try {
      const storage = getStorage();
      const userStorageRef = ref(storage, `users/${userId}`);
      const fileList = await listAll(userStorageRef);

      for (const fileRef of fileList.items) {
        await deleteObject(fileRef);
      }

      for (const folderRef of fileList.prefixes) {
        const folderFiles = await listAll(folderRef);
        for (const fileRef of folderFiles.items) {
          await deleteObject(fileRef);
        }
      }

      console.log('[GDPR] Deleted storage data for user:', userId);
    } catch (error) {
      console.error('[GDPR] Error deleting storage data:', error);
    }
  }

  private async deleteAuthAccount(userId: string): Promise<void> {
    try {
      const currentUser = getAuthInstance().currentUser;
      if (currentUser && currentUser.uid === userId) {
        await deleteUser(currentUser);
        console.log('[GDPR] Deleted auth account for user:', userId);
      } else {
        console.warn('[GDPR] Cannot delete auth account - user not authenticated or mismatch');
      }
    } catch (error) {
      console.error('[GDPR] Error deleting auth account:', error);
      throw error;
    }
  }

  async exportUserData(userId: string): Promise<Record<string, any>> {
    try {
      console.log('[GDPR] Exporting data for user:', userId);

      const userData: Record<string, any> = {
        exportedAt: new Date().toISOString(),
        userId,
      };

      const collections = [
        'users',
        'bookings',
        'messages',
        'reviews',
        'payouts',
        'ledger',
        'favorites',
      ];

      for (const collectionName of collections) {
        const q = query(
          collection(getDbInstance(), collectionName),
          where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);

        userData[collectionName] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
      }

      await monitoringService.log('info', 'GDPR data export completed', { userId }, userId);
      console.log('[GDPR] Data export completed for user:', userId);

      return userData;
    } catch (error) {
      console.error('[GDPR] Failed to export data:', error);
      await monitoringService.reportError({ error: error as Error, userId, context: { action: 'exportUserData' } });
      throw error;
    }
  }

  async getDeletionStatus(requestId: string): Promise<DeletionRequest | null> {
    try {

      const snapshot = await getDocs(query(collection(getDbInstance(), 'deletion_requests'), where('__name__', '==', requestId)));

      if (snapshot.empty) {
        return null;
      }

      const data = snapshot.docs[0].data();
      return {
        userId: data.userId,
        reason: data.reason,
        requestedAt: data.requestedAt.toDate(),
        status: data.status,
        completedAt: data.completedAt?.toDate(),
        error: data.error,
      };
    } catch (error) {
      console.error('[GDPR] Failed to get deletion status:', error);
      return null;
    }
  }
}

export const gdprService = new GDPRService();
