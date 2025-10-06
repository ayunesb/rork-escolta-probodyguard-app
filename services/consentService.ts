import { db } from '@/config/firebase';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, query, getDocs } from 'firebase/firestore';

export interface ConsentRecord {
  userId: string;
  termsOfService: boolean;
  privacyPolicy: boolean;
  dataProcessing: boolean;
  marketing: boolean;
  analytics: boolean;
  locationTracking: boolean;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  version: string;
}

export interface ConsentUpdate {
  marketing?: boolean;
  analytics?: boolean;
  locationTracking?: boolean;
}

class ConsentService {
  private readonly CURRENT_VERSION = '1.0.0';
  private readonly COLLECTION = 'consents';

  async recordConsent(
    userId: string,
    consents: Omit<ConsentRecord, 'userId' | 'timestamp' | 'version'>,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<void> {
    try {
      const dbInstance = db;
      const consentRef = doc(dbInstance, this.COLLECTION, userId);

      const consentRecord: any = {
        userId,
        ...consents,
        timestamp: serverTimestamp(),
        version: this.CURRENT_VERSION,
        ...metadata,
      };

      await setDoc(consentRef, consentRecord);
      console.log('[Consent] Recorded consent for user:', userId);
    } catch (error) {
      console.error('[Consent] Error recording consent:', error);
      throw new Error('Failed to record consent');
    }
  }

  async getConsent(userId: string): Promise<ConsentRecord | null> {
    try {
      const dbInstance = db;
      const consentRef = doc(dbInstance, this.COLLECTION, userId);
      const consentDoc = await getDoc(consentRef);

      if (!consentDoc.exists()) {
        return null;
      }

      const data = consentDoc.data();
      return {
        userId: data.userId,
        termsOfService: data.termsOfService,
        privacyPolicy: data.privacyPolicy,
        dataProcessing: data.dataProcessing,
        marketing: data.marketing,
        analytics: data.analytics,
        locationTracking: data.locationTracking,
        timestamp: data.timestamp?.toDate() || new Date(),
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        version: data.version,
      };
    } catch (error) {
      console.error('[Consent] Error getting consent:', error);
      throw new Error('Failed to get consent');
    }
  }

  async updateConsent(userId: string, updates: ConsentUpdate): Promise<void> {
    try {
      const dbInstance = db;
      const consentRef = doc(dbInstance, this.COLLECTION, userId);

      const updateData: any = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(consentRef, updateData);
      console.log('[Consent] Updated consent for user:', userId);
    } catch (error) {
      console.error('[Consent] Error updating consent:', error);
      throw new Error('Failed to update consent');
    }
  }

  async hasValidConsent(userId: string): Promise<boolean> {
    try {
      const consent = await this.getConsent(userId);
      
      if (!consent) {
        return false;
      }

      return (
        consent.termsOfService &&
        consent.privacyPolicy &&
        consent.dataProcessing
      );
    } catch (error) {
      console.error('[Consent] Error checking consent:', error);
      return false;
    }
  }

  async getConsentHistory(userId: string): Promise<ConsentRecord[]> {
    try {
      const dbInstance = db;
      const historyRef = collection(dbInstance, `${this.COLLECTION}/${userId}/history`);
      const historyQuery = query(historyRef);
      const historyDocs = await getDocs(historyQuery);

      return historyDocs.docs.map(doc => {
        const data = doc.data();
        return {
          userId: data.userId,
          termsOfService: data.termsOfService,
          privacyPolicy: data.privacyPolicy,
          dataProcessing: data.dataProcessing,
          marketing: data.marketing,
          analytics: data.analytics,
          locationTracking: data.locationTracking,
          timestamp: data.timestamp?.toDate() || new Date(),
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          version: data.version,
        };
      });
    } catch (error) {
      console.error('[Consent] Error getting consent history:', error);
      return [];
    }
  }

  async withdrawConsent(userId: string, consentType: keyof ConsentUpdate): Promise<void> {
    try {
      await this.updateConsent(userId, { [consentType]: false });
      console.log(`[Consent] Withdrew ${consentType} consent for user:`, userId);
    } catch (error) {
      console.error('[Consent] Error withdrawing consent:', error);
      throw new Error('Failed to withdraw consent');
    }
  }

  async archiveConsentToHistory(userId: string): Promise<void> {
    try {
      const currentConsent = await this.getConsent(userId);
      
      if (!currentConsent) {
        return;
      }

      const dbInstance = db;
      const historyRef = doc(
        dbInstance,
        `${this.COLLECTION}/${userId}/history`,
        Date.now().toString()
      );

      await setDoc(historyRef, currentConsent);
      console.log('[Consent] Archived consent to history for user:', userId);
    } catch (error) {
      console.error('[Consent] Error archiving consent:', error);
    }
  }
}

export const consentService = new ConsentService();
