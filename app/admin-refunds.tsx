import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { DollarSign, AlertCircle, CheckCircle, XCircle, Search } from 'lucide-react-native';
import Colors from '@/constants/colors';
import type { Refund } from '@/types';
import { withErrorBoundary } from '@/components/CriticalScreenErrorBoundary';

function AdminRefundsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  
  const mockRefunds: Refund[] = [
    {
      id: 'refund-1',
      bookingId: 'booking-123',
      paymentId: 'payment-456',
      amount: 600,
      reason: 'Service cancelled by client',
      status: 'pending',
      requestedBy: 'client-1',
      createdAt: '2025-10-01T10:00:00Z',
    },
    {
      id: 'refund-2',
      bookingId: 'booking-789',
      paymentId: 'payment-012',
      amount: 450,
      reason: 'Guard no-show',
      status: 'completed',
      requestedBy: 'client-2',
      processedBy: 'admin-1',
      createdAt: '2025-09-28T14:00:00Z',
      completedAt: '2025-09-28T15:30:00Z',
    },
  ];

  const handleProcessRefund = (refund: Refund, approve: boolean) => {
    Alert.alert(
      approve ? 'Approve Refund' : 'Reject Refund',
      `Are you sure you want to ${approve ? 'approve' : 'reject'} this refund of $${refund.amount}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: approve ? 'Approve' : 'Reject',
          style: approve ? 'default' : 'destructive',
          onPress: () => {
            Alert.alert(
              'Success',
              `Refund ${approve ? 'approved' : 'rejected'} successfully`
            );
            setSelectedRefund(null);
          },
        },
      ]
    );
  };

  const getStatusColor = (status: Refund['status']) => {
    switch (status) {
      case 'pending': return Colors.warning;
      case 'completed': return Colors.success;
      case 'failed': return Colors.error;
    }
  };

  const getStatusIcon = (status: Refund['status']) => {
    switch (status) {
      case 'pending': return AlertCircle;
      case 'completed': return CheckCircle;
      case 'failed': return XCircle;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Refund Management',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.textPrimary,
          headerShadowVisible: false,
        }}
      />

      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by booking ID..."
            placeholderTextColor={Colors.textTertiary}
          />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {mockRefunds.filter(r => r.status === 'pending').length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.success }]}>
              {mockRefunds.filter(r => r.status === 'completed').length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.error }]}>
              {mockRefunds.filter(r => r.status === 'failed').length}
            </Text>
            <Text style={styles.statLabel}>Failed</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {mockRefunds.map((refund) => {
          const StatusIcon = getStatusIcon(refund.status);
          const statusColor = getStatusColor(refund.status);

          return (
            <TouchableOpacity
              key={refund.id}
              style={styles.refundCard}
              onPress={() => setSelectedRefund(refund)}
            >
              <View style={styles.refundHeader}>
                <View style={styles.refundInfo}>
                  <Text style={styles.refundId}>#{(refund.bookingId || '').slice(0, 12)}</Text>
                  <Text style={styles.refundDate}>
                    {new Date(refund.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                  <StatusIcon size={14} color={statusColor} />
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {refund.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.refundReason} numberOfLines={2}>
                {refund.reason}
              </Text>

              <View style={styles.refundFooter}>
                <View style={styles.amountContainer}>
                  <DollarSign size={18} color={Colors.gold} />
                  <Text style={styles.refundAmount}>${refund.amount}</Text>
                </View>
                {refund.status === 'pending' && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.rejectButton}
                      onPress={() => handleProcessRefund(refund, false)}
                    >
                      <XCircle size={16} color={Colors.error} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.approveButton}
                      onPress={() => handleProcessRefund(refund, true)}
                    >
                      <CheckCircle size={16} color={Colors.success} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {selectedRefund && (
        <View style={styles.detailsOverlay}>
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Refund Details</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Booking ID</Text>
              <Text style={styles.detailValue}>#{selectedRefund.bookingId || ''}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment ID</Text>
              <Text style={styles.detailValue}>#{selectedRefund.paymentId}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount</Text>
              <Text style={[styles.detailValue, { color: Colors.gold }]}>
                ${selectedRefund.amount}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Reason</Text>
              <Text style={styles.detailValue}>{selectedRefund.reason}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={[styles.detailValue, { color: getStatusColor(selectedRefund.status) }]}>
                {selectedRefund.status}
              </Text>
            </View>

            <View style={styles.detailButtons}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedRefund(null)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.warning,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  refundCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  refundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  refundInfo: {
    flex: 1,
  },
  refundId: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  refundDate: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700' as const,
    textTransform: 'capitalize' as const,
  },
  refundReason: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  refundFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  refundAmount: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.error + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  detailsCard: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailsTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'right' as const,
  },
  detailButtons: {
    marginTop: 8,
  },
  closeButton: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.background,
  },
});

// Wrap with error boundary for admin refunds protection
export default withErrorBoundary(AdminRefundsScreen, {
  fallbackMessage: "Admin refunds screen encountered an error. Please try again or contact support.",
});

