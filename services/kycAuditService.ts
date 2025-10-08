import { db as getDbInstance } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import { monitoringService } from './monitoringService';

interface KYCDocument {
  userId: string;
  documentType: 'id' | 'license' | 'insurance' | 'outfit_photo' | 'vehicle_photo';
  fileUrl: string;
  fileHash: string;
  uploadedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

interface KYCAuditEntry {
  userId: string;
  documentId: string;
  action: 'upload' | 'review' | 'approve' | 'reject' | 'delete';
  reviewerId?: string;
  reviewerRole?: string;
  previousStatus?: string;
  newStatus?: string;
  notes?: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

class KYCAuditService {
  async logDocumentUpload(
    userId: string,
    documentId: string,
    documentType: string,
    fileHash: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const auditEntry: KYCAuditEntry = {
        userId,
        documentId,
        action: 'upload',
        metadata: {
          documentType,
          fileHash,
          ...metadata,
        },
        timestamp: new Date(),
      };

      await addDoc(collection(getDbInstance(), 'kyc_audit_log'), {
        ...auditEntry,
        timestamp: Timestamp.fromDate(auditEntry.timestamp),
      });

      await monitoringService.log('info', 'KYC document uploaded', {
        userId,
        documentId,
        documentType,
      }, userId);

      console.log('[KYCAudit] Document upload logged:', documentId);
    } catch (error) {
      console.error('[KYCAudit] Failed to log document upload:', error);
      await monitoringService.reportError({
        error: error as Error,
        userId,
        context: { action: 'logDocumentUpload', documentId },
      });
    }
  }

  async logDocumentReview(
    userId: string,
    documentId: string,
    reviewerId: string,
    reviewerRole: string,
    action: 'approve' | 'reject',
    previousStatus: string,
    newStatus: string,
    notes?: string
  ): Promise<void> {
    try {
      const auditEntry: KYCAuditEntry = {
        userId,
        documentId,
        action,
        reviewerId,
        reviewerRole,
        previousStatus,
        newStatus,
        notes,
        metadata: {},
        timestamp: new Date(),
      };

      await addDoc(collection(getDbInstance(), 'kyc_audit_log'), {
        ...auditEntry,
        timestamp: Timestamp.fromDate(auditEntry.timestamp),
      });

      await monitoringService.log('info', `KYC document ${action}ed`, {
        userId,
        documentId,
        reviewerId,
        reviewerRole,
      }, reviewerId);

      console.log(`[KYCAudit] Document ${action} logged:`, documentId);
    } catch (error) {
      console.error('[KYCAudit] Failed to log document review:', error);
      await monitoringService.reportError({
        error: error as Error,
        userId: reviewerId,
        context: { action: 'logDocumentReview', documentId },
      });
    }
  }

  async logDocumentDeletion(
    userId: string,
    documentId: string,
    deletedBy: string,
    reason?: string
  ): Promise<void> {
    try {
      const auditEntry: KYCAuditEntry = {
        userId,
        documentId,
        action: 'delete',
        reviewerId: deletedBy,
        notes: reason,
        metadata: {},
        timestamp: new Date(),
      };

      await addDoc(collection(getDbInstance(), 'kyc_audit_log'), {
        ...auditEntry,
        timestamp: Timestamp.fromDate(auditEntry.timestamp),
      });

      await monitoringService.log('info', 'KYC document deleted', {
        userId,
        documentId,
        deletedBy,
      }, deletedBy);

      console.log('[KYCAudit] Document deletion logged:', documentId);
    } catch (error) {
      console.error('[KYCAudit] Failed to log document deletion:', error);
      await monitoringService.reportError({
        error: error as Error,
        userId: deletedBy,
        context: { action: 'logDocumentDeletion', documentId },
      });
    }
  }

  async getAuditTrail(userId: string): Promise<KYCAuditEntry[]> {
    try {
      const q = query(
        collection(getDbInstance(), 'kyc_audit_log'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      const auditTrail: KYCAuditEntry[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        auditTrail.push({
          userId: data.userId,
          documentId: data.documentId,
          action: data.action,
          reviewerId: data.reviewerId,
          reviewerRole: data.reviewerRole,
          previousStatus: data.previousStatus,
          newStatus: data.newStatus,
          notes: data.notes,
          metadata: data.metadata || {},
          timestamp: data.timestamp.toDate(),
        });
      });

      console.log('[KYCAudit] Retrieved audit trail:', auditTrail.length, 'entries');
      return auditTrail;
    } catch (error) {
      console.error('[KYCAudit] Failed to get audit trail:', error);
      return [];
    }
  }

  async getDocumentHistory(documentId: string): Promise<KYCAuditEntry[]> {
    try {
      const q = query(
        collection(getDbInstance(), 'kyc_audit_log'),
        where('documentId', '==', documentId),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      const history: KYCAuditEntry[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        history.push({
          userId: data.userId,
          documentId: data.documentId,
          action: data.action,
          reviewerId: data.reviewerId,
          reviewerRole: data.reviewerRole,
          previousStatus: data.previousStatus,
          newStatus: data.newStatus,
          notes: data.notes,
          metadata: data.metadata || {},
          timestamp: data.timestamp.toDate(),
        });
      });

      console.log('[KYCAudit] Retrieved document history:', history.length, 'entries');
      return history;
    } catch (error) {
      console.error('[KYCAudit] Failed to get document history:', error);
      return [];
    }
  }

  async getReviewerActivity(reviewerId: string, startDate?: Date, endDate?: Date): Promise<KYCAuditEntry[]> {
    try {
      let q = query(
        collection(getDbInstance(), 'kyc_audit_log'),
        where('reviewerId', '==', reviewerId),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      let activity: KYCAuditEntry[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const timestamp = data.timestamp.toDate();

        if (startDate && timestamp < startDate) return;
        if (endDate && timestamp > endDate) return;

        activity.push({
          userId: data.userId,
          documentId: data.documentId,
          action: data.action,
          reviewerId: data.reviewerId,
          reviewerRole: data.reviewerRole,
          previousStatus: data.previousStatus,
          newStatus: data.newStatus,
          notes: data.notes,
          metadata: data.metadata || {},
          timestamp,
        });
      });

      console.log('[KYCAudit] Retrieved reviewer activity:', activity.length, 'entries');
      return activity;
    } catch (error) {
      console.error('[KYCAudit] Failed to get reviewer activity:', error);
      return [];
    }
  }

  async generateComplianceReport(startDate: Date, endDate: Date): Promise<{
    totalUploads: number;
    totalReviews: number;
    totalApprovals: number;
    totalRejections: number;
    averageReviewTime: number;
    reviewerStats: Record<string, { approvals: number; rejections: number }>;
  }> {
    try {
      const q = query(
        collection(getDbInstance(), 'kyc_audit_log'),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      
      let totalUploads = 0;
      let totalReviews = 0;
      let totalApprovals = 0;
      let totalRejections = 0;
      const reviewerStats: Record<string, { approvals: number; rejections: number }> = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        const timestamp = data.timestamp.toDate();

        if (timestamp < startDate || timestamp > endDate) return;

        switch (data.action) {
          case 'upload':
            totalUploads++;
            break;
          case 'review':
            totalReviews++;
            break;
          case 'approve':
            totalApprovals++;
            if (data.reviewerId) {
              if (!reviewerStats[data.reviewerId]) {
                reviewerStats[data.reviewerId] = { approvals: 0, rejections: 0 };
              }
              reviewerStats[data.reviewerId].approvals++;
            }
            break;
          case 'reject':
            totalRejections++;
            if (data.reviewerId) {
              if (!reviewerStats[data.reviewerId]) {
                reviewerStats[data.reviewerId] = { approvals: 0, rejections: 0 };
              }
              reviewerStats[data.reviewerId].rejections++;
            }
            break;
        }
      });

      const averageReviewTime = 0;

      console.log('[KYCAudit] Generated compliance report');
      return {
        totalUploads,
        totalReviews,
        totalApprovals,
        totalRejections,
        averageReviewTime,
        reviewerStats,
      };
    } catch (error) {
      console.error('[KYCAudit] Failed to generate compliance report:', error);
      return {
        totalUploads: 0,
        totalReviews: 0,
        totalApprovals: 0,
        totalRejections: 0,
        averageReviewTime: 0,
        reviewerStats: {},
      };
    }
  }
}

export const kycAuditService = new KYCAuditService();
