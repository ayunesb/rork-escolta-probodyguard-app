import AsyncStorage from '@react-native-async-storage/async-storage';
import { createHash } from '@/utils/security';

const AUDIT_LOG_KEY = '@escolta_audit_logs';
const DOCUMENT_HASH_KEY = '@escolta_document_hashes';

export interface AuditLogEntry {
  id: string;
  userId: string;
  userRole: string;
  action: 'document_upload' | 'document_approve' | 'document_reject' | 'booking_create' | 'booking_cancel' | 'payment_process' | 'guard_assign' | 'guard_reassign' | 'refund_issue' | 'account_freeze' | 'account_unfreeze';
  resourceType: 'document' | 'booking' | 'payment' | 'user' | 'guard' | 'refund';
  resourceId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  timestamp: string;
}

export interface DocumentHash {
  documentId: string;
  userId: string;
  hash: string;
  uploadedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private documentHashes: Map<string, DocumentHash> = new Map();
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      const logsStored = await AsyncStorage.getItem(AUDIT_LOG_KEY);
      if (logsStored) {
        this.logs = JSON.parse(logsStored);
      }

      const hashesStored = await AsyncStorage.getItem(DOCUMENT_HASH_KEY);
      if (hashesStored) {
        const data = JSON.parse(hashesStored);
        this.documentHashes = new Map(Object.entries(data));
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize audit logger:', error);
    }
  }

  async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
    await this.initialize();

    const newEntry: AuditLogEntry = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    this.logs.push(newEntry);

    try {
      await AsyncStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(this.logs));
      console.log('Audit log entry created:', newEntry.action);
    } catch (error) {
      console.error('Failed to save audit log:', error);
    }
  }

  async storeDocumentHash(documentId: string, userId: string, fileData: string) {
    await this.initialize();

    const hash = await createHash(fileData);
    const documentHash: DocumentHash = {
      documentId,
      userId,
      hash,
      uploadedAt: new Date().toISOString(),
    };

    this.documentHashes.set(documentId, documentHash);

    try {
      const data = Object.fromEntries(this.documentHashes.entries());
      await AsyncStorage.setItem(DOCUMENT_HASH_KEY, JSON.stringify(data));
      console.log('Document hash stored:', documentId);
    } catch (error) {
      console.error('Failed to save document hash:', error);
    }

    await this.log({
      userId,
      userRole: 'client',
      action: 'document_upload',
      resourceType: 'document',
      resourceId: documentId,
      metadata: { hash },
    });
  }

  async verifyDocumentHash(documentId: string, verifiedBy: string): Promise<boolean> {
    await this.initialize();

    const documentHash = this.documentHashes.get(documentId);
    if (!documentHash) {
      console.error('Document hash not found:', documentId);
      return false;
    }

    documentHash.verifiedAt = new Date().toISOString();
    documentHash.verifiedBy = verifiedBy;
    this.documentHashes.set(documentId, documentHash);

    try {
      const data = Object.fromEntries(this.documentHashes.entries());
      await AsyncStorage.setItem(DOCUMENT_HASH_KEY, JSON.stringify(data));
      console.log('Document hash verified:', documentId);
    } catch (error) {
      console.error('Failed to update document hash:', error);
    }

    return true;
  }

  async getLogs(filters?: {
    userId?: string;
    action?: AuditLogEntry['action'];
    resourceType?: AuditLogEntry['resourceType'];
    startDate?: string;
    endDate?: string;
  }): Promise<AuditLogEntry[]> {
    await this.initialize();

    let filtered = [...this.logs];

    if (filters?.userId) {
      filtered = filtered.filter(log => log.userId === filters.userId);
    }

    if (filters?.action) {
      filtered = filtered.filter(log => log.action === filters.action);
    }

    if (filters?.resourceType) {
      filtered = filtered.filter(log => log.resourceType === filters.resourceType);
    }

    if (filters?.startDate) {
      filtered = filtered.filter(log => log.timestamp >= filters.startDate!);
    }

    if (filters?.endDate) {
      filtered = filtered.filter(log => log.timestamp <= filters.endDate!);
    }

    return filtered.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  async getDocumentHash(documentId: string): Promise<DocumentHash | undefined> {
    await this.initialize();
    return this.documentHashes.get(documentId);
  }

  async getAllDocumentHashes(userId?: string): Promise<DocumentHash[]> {
    await this.initialize();
    const hashes = Array.from(this.documentHashes.values());
    
    if (userId) {
      return hashes.filter(hash => hash.userId === userId);
    }

    return hashes;
  }

  async clearLogs() {
    this.logs = [];
    try {
      await AsyncStorage.removeItem(AUDIT_LOG_KEY);
      console.log('Audit logs cleared');
    } catch (error) {
      console.error('Failed to clear audit logs:', error);
    }
  }
}

export const auditLogger = new AuditLogger();
