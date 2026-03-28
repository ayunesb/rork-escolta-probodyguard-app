import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { FileText, Search, User, Shield, CheckCircle, XCircle, Eye, ChevronLeft } from 'lucide-react-native';
import { kycAuditService } from '@/services/kycAuditService';
import Colors from '@/constants/colors';
import { withErrorBoundary } from '@/components/CriticalScreenErrorBoundary';

interface AuditEntry {
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

function AdminKYCAuditScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadAuditLog();
    }, [])
  );

  const loadAuditLog = async () => {
    setIsLoading(true);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const endDate = new Date();

      const report = await kycAuditService.generateComplianceReport(startDate, endDate);
      console.log('[AdminKYCAudit] Compliance report:', report);
      
      setAuditLog([]);
    } catch (error) {
      console.error('[AdminKYCAudit] Error loading audit log:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLog = auditLog.filter(entry => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      entry.userId.toLowerCase().includes(query) ||
      entry.documentId.toLowerCase().includes(query) ||
      entry.action.toLowerCase().includes(query) ||
      entry.reviewerId?.toLowerCase().includes(query)
    );
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'upload':
        return <FileText size={20} color={Colors.info} />;
      case 'approve':
        return <CheckCircle size={20} color={Colors.success} />;
      case 'reject':
        return <XCircle size={20} color={Colors.error} />;
      case 'delete':
        return <XCircle size={20} color={Colors.error} />;
      default:
        return <Eye size={20} color={Colors.textSecondary} />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'upload':
        return Colors.info;
      case 'approve':
        return Colors.success;
      case 'reject':
      case 'delete':
        return Colors.error;
      default:
        return Colors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>KYC Audit Trail</Text>
          <Text style={styles.subtitle}>Document verification history</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by user, document, or reviewer..."
          placeholderTextColor={Colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.gold} />
            <Text style={styles.loadingText}>Loading audit trail...</Text>
          </View>
        ) : filteredLog.length === 0 ? (
          <View style={styles.emptyState}>
            <FileText size={64} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No audit entries found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search query' : 'Audit trail will appear here'}
            </Text>
          </View>
        ) : (
          filteredLog.map((entry, index) => (
            <TouchableOpacity
              key={`${entry.documentId}-${index}`}
              style={styles.auditCard}
              onPress={() => setSelectedEntry(entry)}
            >
              <View style={styles.auditHeader}>
                <View style={[styles.actionBadge, { backgroundColor: getActionColor(entry.action) + '20' }]}>
                  {getActionIcon(entry.action)}
                  <Text style={[styles.actionText, { color: getActionColor(entry.action) }]}>
                    {entry.action.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.timestamp}>
                  {new Date(entry.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>

              <View style={styles.auditDetails}>
                <View style={styles.detailRow}>
                  <User size={16} color={Colors.textSecondary} />
                  <Text style={styles.detailLabel}>User ID:</Text>
                  <Text style={styles.detailValue}>{entry.userId.slice(0, 12)}...</Text>
                </View>

                <View style={styles.detailRow}>
                  <FileText size={16} color={Colors.textSecondary} />
                  <Text style={styles.detailLabel}>Document:</Text>
                  <Text style={styles.detailValue}>{entry.documentId.slice(0, 12)}...</Text>
                </View>

                {entry.reviewerId && (
                  <View style={styles.detailRow}>
                    <Shield size={16} color={Colors.textSecondary} />
                    <Text style={styles.detailLabel}>Reviewer:</Text>
                    <Text style={styles.detailValue}>
                      {entry.reviewerId.slice(0, 12)}... ({entry.reviewerRole})
                    </Text>
                  </View>
                )}

                {entry.notes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>Notes:</Text>
                    <Text style={styles.notesText}>{entry.notes}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {selectedEntry && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Audit Entry Details</Text>
              <TouchableOpacity onPress={() => setSelectedEntry(null)}>
                <XCircle size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Action</Text>
                <Text style={styles.modalValue}>{selectedEntry.action.toUpperCase()}</Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>User ID</Text>
                <Text style={styles.modalValue}>{selectedEntry.userId}</Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Document ID</Text>
                <Text style={styles.modalValue}>{selectedEntry.documentId}</Text>
              </View>

              {selectedEntry.reviewerId && (
                <>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Reviewer ID</Text>
                    <Text style={styles.modalValue}>{selectedEntry.reviewerId}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Reviewer Role</Text>
                    <Text style={styles.modalValue}>{selectedEntry.reviewerRole}</Text>
                  </View>
                </>
              )}

              {selectedEntry.previousStatus && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Status Change</Text>
                  <Text style={styles.modalValue}>
                    {selectedEntry.previousStatus} → {selectedEntry.newStatus}
                  </Text>
                </View>
              )}

              {selectedEntry.notes && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Notes</Text>
                  <Text style={styles.modalValue}>{selectedEntry.notes}</Text>
                </View>
              )}

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Timestamp</Text>
                <Text style={styles.modalValue}>
                  {new Date(selectedEntry.timestamp).toLocaleString()}
                </Text>
              </View>

              {Object.keys(selectedEntry.metadata).length > 0 && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Metadata</Text>
                  <Text style={styles.modalValue}>
                    {JSON.stringify(selectedEntry.metadata, null, 2)}
                  </Text>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedEntry(null)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center' as const,
  },
  auditCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  auditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  auditDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    width: 80,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600' as const,
  },
  notesContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  modalOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: Colors.background,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  modalContent: {
    maxHeight: 400,
  },
  modalSection: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase' as const,
  },
  modalValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  closeButton: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.background,
  },
});

// Wrap with error boundary for admin KYC audit protection
export default withErrorBoundary(AdminKYCAuditScreen, {
  fallbackMessage: "KYC audit screen encountered an error. Please try again.",
});

