import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useFocusEffect } from 'expo-router';
import { FileText, CheckCircle, XCircle, Eye, Shield } from 'lucide-react-native';
import { userService } from '@/services/userService';
import { kycAuditService } from '@/services/kycAuditService';
import { useAuth } from '@/contexts/AuthContext';
import type { Guard } from '@/types';
import Colors from '@/constants/colors';

function guardDocuments(guard: Guard): { label: string; url: string }[] {
  const docs: { label: string; url: string }[] = [];
  if (guard.governmentIdUrls?.length) {
    guard.governmentIdUrls.forEach((url, i) => docs.push({ label: `Government ID ${i + 1}`, url }));
  }
  if (guard.licenseUrls?.length) {
    guard.licenseUrls.forEach((url, i) => docs.push({ label: `Security License ${i + 1}`, url }));
  }
  if (guard.insuranceUrls?.length) {
    guard.insuranceUrls.forEach((url, i) => docs.push({ label: `Insurance ${i + 1}`, url }));
  }
  if (guard.vehicleDocUrls?.length) {
    guard.vehicleDocUrls.forEach((url, i) => docs.push({ label: `Vehicle Document ${i + 1}`, url }));
  }
  if (guard.outfitPhotos?.length) {
    guard.outfitPhotos.forEach((url, i) => docs.push({ label: `Outfit Photo ${i + 1}`, url }));
  }
  return docs;
}

export default function AdminKYCScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [guards, setGuards] = useState<Guard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadGuards = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await userService.listByRole('guard');
      setGuards(result as Guard[]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGuards();
    }, [loadGuards])
  );

  const pendingGuards = guards.filter(g => g.kycStatus === 'pending');
  const approvedGuards = guards.filter(g => g.kycStatus === 'approved');
  const rejectedGuards = guards.filter(g => g.kycStatus === 'rejected');

  const reviewKYC = async (guard: Guard, decision: 'approved' | 'rejected') => {
    try {
      await userService.setKYCStatus(guard.id, decision);
      if (user) {
        await kycAuditService.logDocumentReview(
          guard.id,
          `${guard.id}-kyc`,
          user.id,
          user.role,
          decision === 'approved' ? 'approve' : 'reject',
          guard.kycStatus,
          decision
        );
      }
      await loadGuards();
      Alert.alert(
        decision === 'approved' ? 'Success' : 'Rejected',
        decision === 'approved'
          ? `KYC approved for ${guard.firstName} ${guard.lastName}. They can now accept bookings.`
          : `KYC rejected for ${guard.firstName} ${guard.lastName}. They will be notified.`
      );
    } catch (error) {
      console.error('[AdminKYC] Failed to review KYC:', error);
      Alert.alert('Error', 'Failed to update KYC status. Please try again.');
    }
  };

  const handleApprove = (guard: Guard) => {
    Alert.alert(
      'Approve KYC',
      `Are you sure you want to approve KYC for ${guard.firstName} ${guard.lastName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Approve', onPress: () => reviewKYC(guard, 'approved') },
      ]
    );
  };

  const handleReject = (guard: Guard) => {
    Alert.alert(
      'Reject KYC',
      `Are you sure you want to reject KYC for ${guard.firstName} ${guard.lastName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reject', style: 'destructive', onPress: () => reviewKYC(guard, 'rejected') },
      ]
    );
  };

  const handleViewDocuments = (guard: Guard) => {
    const docs = guardDocuments(guard);
    if (docs.length === 0) {
      Alert.alert(
        'No Documents',
        `${guard.firstName} ${guard.lastName} has not uploaded any KYC documents yet.`
      );
      return;
    }
    Alert.alert(
      'KYC Documents',
      docs.map(d => d.label).join('\n'),
      [
        ...docs.slice(0, 3).map(d => ({ text: `Open ${d.label}`, onPress: () => Linking.openURL(d.url) })),
        { text: 'Close', style: 'cancel' as const },
      ]
    );
  };

  const renderGuardCard = (guard: Guard) => (
    <View key={guard.id} style={styles.guardCard}>
      <View style={styles.guardHeader}>
        {guard.photos?.[0] ? (
          <Image source={{ uri: guard.photos[0] }} style={styles.guardPhoto} />
        ) : (
          <View style={[styles.guardPhoto, styles.guardPhotoPlaceholder]}>
            <Shield size={24} color={Colors.textTertiary} />
          </View>
        )}
        <View style={styles.guardInfo}>
          <Text style={styles.guardName}>
            {guard.firstName} {guard.lastName}
          </Text>
          <Text style={styles.guardEmail}>{guard.email}</Text>
          <View style={styles.guardMeta}>
            <Text style={styles.guardMetaText}>
              {guard.completedJobs ?? 0} jobs • {(guard.rating ?? 0).toFixed(1)} rating
            </Text>
          </View>
        </View>
      </View>

      {(guard.certifications?.length ?? 0) > 0 && (
        <View style={styles.certifications}>
          {guard.certifications.slice(0, 3).map((cert: string, idx: number) => (
            <View key={idx} style={styles.certBadge}>
              <Shield size={12} color={Colors.gold} />
              <Text style={styles.certText}>{cert}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.guardActions}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => handleViewDocuments(guard)}
        >
          <Eye size={16} color={Colors.textPrimary} />
          <Text style={styles.viewButtonText}>View Documents</Text>
        </TouchableOpacity>

        {guard.kycStatus === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => handleReject(guard)}
            >
              <XCircle size={16} color={Colors.error} />
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.approveButton}
              onPress={() => handleApprove(guard)}
            >
              <CheckCircle size={16} color={Colors.background} />
              <Text style={styles.approveButtonText}>Approve</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const getGuardsList = () => {
    switch (selectedTab) {
      case 'pending':
        return pendingGuards;
      case 'approved':
        return approvedGuards;
      case 'rejected':
        return rejectedGuards;
      default:
        return [];
    }
  };

  const guardsList = getGuardsList();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
        <View>
          <Text style={styles.title}>KYC Management</Text>
          <Text style={styles.subtitle}>
            Review and approve guard applications
          </Text>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'pending' && styles.tabActive]}
          onPress={() => setSelectedTab('pending')}
        >
          <Text style={[styles.tabText, selectedTab === 'pending' && styles.tabTextActive]}>
            Pending ({pendingGuards.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'approved' && styles.tabActive]}
          onPress={() => setSelectedTab('approved')}
        >
          <Text style={[styles.tabText, selectedTab === 'approved' && styles.tabTextActive]}>
            Approved ({approvedGuards.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'rejected' && styles.tabActive]}
          onPress={() => setSelectedTab('rejected')}
        >
          <Text style={[styles.tabText, selectedTab === 'rejected' && styles.tabTextActive]}>
            Rejected ({rejectedGuards.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={Colors.gold} />
          </View>
        ) : guardsList.length === 0 ? (
          <View style={styles.emptyState}>
            <FileText size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No {selectedTab} applications</Text>
            <Text style={styles.emptySubtext}>
              {selectedTab === 'pending'
                ? 'New KYC applications will appear here'
                : `No ${selectedTab} applications to show`}
            </Text>
          </View>
        ) : (
          guardsList.map(renderGuardCard)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.gold,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.gold,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  guardCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  guardPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surfaceLight,
    marginRight: 12,
  },
  guardPhotoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  guardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  guardName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  guardEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  guardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guardMetaText: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  certifications: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  certBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  certText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  guardActions: {
    gap: 12,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.background,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.error + '20',
    paddingVertical: 12,
    borderRadius: 12,
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.error,
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.success,
    paddingVertical: 12,
    borderRadius: 12,
  },
  approveButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.background,
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
});
