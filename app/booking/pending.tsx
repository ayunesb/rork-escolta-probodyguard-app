import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, X, Clock, MapPin, Shield, Calendar } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { bookingService } from '@/services/bookingService';
import { Booking } from '@/types';
import Colors from '@/constants/colors';

export default function PendingBookingsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);

  const loadPendingBookings = useCallback(async () => {
    if (!user || user.role !== 'guard') return;

    try {
      setLoading(true);
      const bookings = await bookingService.getPendingBookingsForGuard(user.id);
      setPendingBookings(bookings);
      console.log('[PendingBookings] Loaded:', bookings.length);
    } catch (error) {
      console.error('[PendingBookings] Error loading:', error);
      Alert.alert('Error', 'Failed to load pending bookings');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPendingBookings();
  }, [loadPendingBookings]);

  const handleAccept = async (booking: Booking) => {
    if (!user) return;

    Alert.alert(
      'Accept Booking',
      `Accept this booking for ${booking.scheduledDate} at ${booking.scheduledTime}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              await bookingService.acceptBooking(booking.id, user.id);
              Alert.alert('Success', 'Booking accepted successfully');
              loadPendingBookings();
            } catch (error) {
              console.error('[PendingBookings] Error accepting:', error);
              Alert.alert('Error', 'Failed to accept booking');
            }
          },
        },
      ]
    );
  };

  const handleReject = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowRejectModal(true);
  };

  const submitRejection = async () => {
    if (!selectedBooking || !rejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection');
      return;
    }

    try {
      await bookingService.rejectBooking(selectedBooking.id, rejectionReason);
      Alert.alert('Success', 'Booking rejected');
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedBooking(null);
      loadPendingBookings();
    } catch (error) {
      console.error('[PendingBookings] Error rejecting:', error);
      Alert.alert('Error', 'Failed to reject booking');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Pending Bookings' }} />
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Pending Bookings' }} />

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 16 }]}
      >
        {pendingBookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Shield size={64} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No pending bookings</Text>
            <Text style={styles.emptySubtext}>
              New booking requests will appear here
            </Text>
          </View>
        ) : (
          pendingBookings.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <View style={styles.statusBadge}>
                  <Clock size={14} color={Colors.gold} />
                  <Text style={styles.statusText}>Pending</Text>
                </View>
                <Text style={styles.amountText}>${booking.guardPayout.toFixed(2)}</Text>
              </View>

              <View style={styles.bookingDetails}>
                <View style={styles.detailRow}>
                  <Calendar size={16} color={Colors.textSecondary} />
                  <Text style={styles.detailText}>
                    {formatDate(booking.scheduledDate)} at {booking.scheduledTime}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Clock size={16} color={Colors.textSecondary} />
                  <Text style={styles.detailText}>{booking.duration} hours</Text>
                </View>

                <View style={styles.detailRow}>
                  <MapPin size={16} color={Colors.textSecondary} />
                  <Text style={styles.detailText} numberOfLines={1}>
                    {booking.pickupAddress}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Shield size={16} color={Colors.textSecondary} />
                  <Text style={styles.detailText}>
                    {booking.protectionType} • {booking.dressCode}
                  </Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleReject(booking)}
                >
                  <X size={20} color={Colors.error} />
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={() => handleAccept(booking)}
                >
                  <Check size={20} color={Colors.white} />
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showRejectModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRejectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reject Booking</Text>
            <Text style={styles.modalSubtitle}>
              Please provide a reason for rejecting this booking
            </Text>

            <TextInput
              style={styles.textInput}
              placeholder="Reason for rejection..."
              placeholderTextColor={Colors.textTertiary}
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setSelectedBooking(null);
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalSubmitButton]}
                onPress={submitRejection}
              >
                <Text style={styles.modalSubmitText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
    textAlign: 'center',
  },
  bookingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.gold + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.gold,
  },
  amountText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  bookingDetails: {
    gap: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  rejectButton: {
    backgroundColor: Colors.error + '20',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.error,
  },
  acceptButton: {
    backgroundColor: Colors.gold,
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    minHeight: 100,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  modalSubmitButton: {
    backgroundColor: Colors.error,
  },
  modalSubmitText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
