import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { FileText, CheckCircle, XCircle, Eye, Shield } from 'lucide-react-native';
import { mockGuards } from '@/mocks/guards';
import Colors from '@/constants/colors';

export default function AdminKYCScreen() {
  const insets = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const pendingGuards = mockGuards.filter(g => g.kycStatus === 'pending');
  const approvedGuards = mockGuards.filter(g => g.kycStatus === 'approved');
  const rejectedGuards = mockGuards.filter(g => g.kycStatus === 'rejected');

  const handleApprove = (guardId: string, guardName: string) => {
    Alert.alert(
      'Approve KYC',
      `Are you sure you want to approve KYC for ${guardName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => {
            Alert.alert('Success', `KYC approved for ${guardName}. They can now accept bookings.`);
          },
        },
      ]
    );
  };

  const handleReject = (guardId: string, guardName: string) => {
    Alert.alert(
      'Reject KYC',
      `Are you sure you want to reject KYC for ${guardName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Rejected', `KYC rejected for ${guardName}. They will be notified.`);
          },
        },
      ]
    );
  };

  const handleViewDocuments = (guardName: string) => {
    Alert.alert(
      'KYC Documents',
      `Viewing documents for ${guardName}:\n\n• Government ID\n• Security License\n• Background Check\n• Certifications`,
      [{ text: 'Close' }]
    );
  };

  const renderGuardCard = (guard: any) => (
    <View key={guard.id} style={styles.guardCard}>
      <View style={styles.guardHeader}>
        <Image source={{ uri: guard.photos[0] }} style={styles.guardPhoto} />
        <View style={styles.guardInfo}>
          <Text style={styles.guardName}>
            {guard.firstName} {guard.lastName}
          </Text>
          <Text style={styles.guardEmail}>{guard.email}</Text>
          <View style={styles.guardMeta}>
            <Text style={styles.guardMetaText}>
              {guard.completedJobs} jobs • {guard.rating.toFixed(1)} rating
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.certifications}>
        {guard.certifications.slice(0, 3).map((cert: string, idx: number) => (
          <View key={idx} style={styles.certBadge}>
            <Shield size={12} color={Colors.gold} />
            <Text style={styles.certText}>{cert}</Text>
          </View>
        ))}
      </View>

      <View style={styles.guardActions}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => handleViewDocuments(`${guard.firstName} ${guard.lastName}`)}
        >
          <Eye size={16} color={Colors.textPrimary} />
          <Text style={styles.viewButtonText}>View Documents</Text>
        </TouchableOpacity>

        {guard.kycStatus === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => handleReject(guard.id, `${guard.firstName} ${guard.lastName}`)}
            >
              <XCircle size={16} color={Colors.error} />
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.approveButton}
              onPress={() => handleApprove(guard.id, `${guard.firstName} ${guard.lastName}`)}
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
        {guardsList.length === 0 ? (
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
