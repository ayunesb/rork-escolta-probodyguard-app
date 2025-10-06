import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft,
  MapPin,
  Clock,
  Shield,
  MessageCircle,
  Send,
  Navigation,
  Key,
  Copy,
  Check,
  X,
  User,
  AlertCircle,
  Plus,
  Eye,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import Colors from '@/constants/colors';
import { bookingService } from '@/services/bookingService';
import { chatService } from '@/services/chatService';
import { mockGuards } from '@/mocks/guards';
import type { Booking, ChatMessage } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [showOriginal, setShowOriginal] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const bookingData = await bookingService.getBookingById(id);
      setBooking(bookingData);
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!id || !user) return;

    console.log('[BookingDetail] Subscribing to messages:', id);
    const unsubscribe = chatService.subscribeToMessages(
      id,
      user.language,
      (updatedMessages) => {
        setMessages(updatedMessages);
      }
    );

    return () => {
      console.log('[BookingDetail] Unsubscribing from messages:', id);
      unsubscribe();
    };
  }, [id, user]);



  const guard = booking ? mockGuards.find((g) => g.id === booking.guardId) : null;

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || !booking || !user || isSending) return;

    setIsSending(true);
    try {
      await chatService.sendMessage(
        booking.id,
        user.id,
        user.role === 'client' ? 'client' : 'guard',
        message.trim(),
        user.language
      );
      setMessage('');
    } catch (error) {
      console.error('[BookingDetail] Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  }, [message, booking, user, isSending]);

  const handleCopyCode = async () => {
    if (booking?.startCode) {
      await Clipboard.setStringAsync(booking.startCode);
      Alert.alert('Copied!', 'Start code copied to clipboard');
    }
  };

  const handleTrackGuard = () => {
    if (booking) {
      router.push(`/tracking/${booking.id}` as any);
    }
  };

  const handleAcceptBooking = async () => {
    if (!booking || !user) return;
    
    Alert.alert(
      'Accept Booking',
      'Are you sure you want to accept this job?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              await bookingService.acceptBooking(booking.id, user.id);
              Alert.alert('Success', 'Booking accepted! The client will be notified.');
              const updatedBooking = await bookingService.getBookingById(booking.id);
              setBooking(updatedBooking);
              router.back();
            } catch (error) {
              console.error('[BookingDetail] Error accepting booking:', error);
              Alert.alert('Error', 'Failed to accept booking. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleRejectBooking = async () => {
    if (!booking) return;
    
    Alert.prompt(
      'Reject Booking',
      'Please provide a reason for rejection:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async (reason) => {
            if (!reason?.trim()) {
              Alert.alert('Error', 'Please provide a reason for rejection.');
              return;
            }
            try {
              await bookingService.rejectBooking(booking.id, reason);
              Alert.alert('Booking Rejected', 'The client will be notified.');
              router.back();
            } catch (error) {
              console.error('[BookingDetail] Error rejecting booking:', error);
              Alert.alert('Error', 'Failed to reject booking. Please try again.');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleExtendBooking = async (hours: number) => {
    if (!booking || !user) return;

    const newDuration = booking.duration + hours;
    if (newDuration > 8) {
      Alert.alert('Maximum Duration', 'Bookings cannot exceed 8 hours total.');
      return;
    }

    Alert.alert(
      'Extend Booking',
      `Extend by ${hours === 0.5 ? '30 minutes' : `${hours} hour${hours > 1 ? 's' : ''}`}? Additional charge will apply.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await bookingService.extendBooking(booking.id, hours);
              Alert.alert('Success', 'Booking extended successfully');
              const updatedBooking = await bookingService.getBookingById(booking.id);
              setBooking(updatedBooking);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to extend booking');
            }
          },
        },
      ]
    );
  };

  const handleCancelBooking = async () => {
    if (!booking || !user) return;
    
    Alert.prompt(
      'Cancel Booking',
      'Please provide a reason for cancellation:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Cancellation',
          style: 'destructive',
          onPress: async (reason) => {
            if (!reason?.trim()) {
              Alert.alert('Error', 'Please provide a reason for cancellation.');
              return;
            }
            try {
              await bookingService.cancelBooking(
                booking.id,
                user.role === 'client' ? 'client' : 'guard',
                reason
              );
              Alert.alert('Booking Cancelled', 'The booking has been cancelled successfully.');
              router.back();
            } catch (error: any) {
              console.error('[BookingDetail] Error cancelling booking:', error);
              Alert.alert('Error', error.message || 'Failed to cancel booking. Please try again.');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  if (!booking) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Shield size={64} color={Colors.textTertiary} />
          <Text style={styles.errorText}>Booking not found</Text>
        </View>
      </View>
    );
  }

  const isGuardView = user?.role === 'guard';
  const isClientView = user?.role === 'client';
  const isPending = booking.status === 'pending';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return Colors.success;
      case 'active':
        return Colors.info;
      case 'accepted':
      case 'confirmed':
        return Colors.warning;
      case 'cancelled':
        return Colors.error;
      default:
        return Colors.textSecondary;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
              {booking.status.toUpperCase()}
            </Text>
          </View>

          {isGuardView && isPending && (
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptBooking}>
                <Check size={20} color={Colors.background} />
                <Text style={styles.acceptButtonText}>Accept Job</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rejectButton} onPress={handleRejectBooking}>
                <X size={20} color={Colors.error} />
                <Text style={styles.rejectButtonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}

          {isClientView && booking.status === 'rejected' && (
            <View style={styles.rejectedCard}>
              <View style={styles.rejectedHeader}>
                <AlertCircle size={24} color={Colors.error} />
                <Text style={styles.rejectedTitle}>Guard Declined</Text>
              </View>
              {booking.rejectionReason && (
                <Text style={styles.rejectionReason}>{booking.rejectionReason}</Text>
              )}
              <TouchableOpacity
                style={styles.selectNewGuardButton}
                onPress={() => router.push(`/booking/select-guard?bookingId=${booking.id}` as any)}
              >
                <Text style={styles.selectNewGuardText}>Select Another Guard</Text>
              </TouchableOpacity>
            </View>
          )}

          {isClientView && guard && booking.status !== 'rejected' && (
            <View style={styles.guardCard}>
              <View style={styles.guardHeader}>
                <View>
                  <Text style={styles.guardName}>
                    {guard.firstName} {guard.lastName.charAt(0)}.
                  </Text>
                  <Text style={styles.guardRole}>Your Protector</Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <Shield size={16} color={Colors.gold} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              </View>
            </View>
          )}

          {isClientView && (
            <View style={styles.startCodeCard}>
            <View style={styles.startCodeHeader}>
              <Key size={20} color={Colors.gold} />
              <Text style={styles.startCodeTitle}>Start Code</Text>
            </View>
            <View style={styles.startCodeRow}>
              <Text style={styles.startCodeValue}>{booking.startCode}</Text>
              <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
                <Copy size={20} color={Colors.gold} />
              </TouchableOpacity>
            </View>
              <Text style={styles.startCodeHint}>
                Share this code with your guard to start the service
              </Text>
            </View>
          )}

          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Booking Details</Text>

            <View style={styles.detailRow}>
              <Clock size={16} color={Colors.textSecondary} />
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailValue}>
                {booking.scheduledDate} at {booking.scheduledTime}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <MapPin size={16} color={Colors.textSecondary} />
              <Text style={styles.detailLabel}>Pickup</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {booking.pickupAddress}
              </Text>
            </View>

            {booking.destinationAddress && (
              <View style={styles.detailRow}>
                <MapPin size={16} color={Colors.textSecondary} />
                <Text style={styles.detailLabel}>Destination</Text>
                <Text style={styles.detailValue} numberOfLines={1}>
                  {booking.destinationAddress}
                </Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Shield size={16} color={Colors.textSecondary} />
              <Text style={styles.detailLabel}>Protection</Text>
              <Text style={styles.detailValue}>
                {booking.protectionType} • {booking.vehicleType}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Clock size={16} color={Colors.textSecondary} />
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{booking.duration} hours</Text>
            </View>
          </View>

          {isClientView && (booking.status === 'accepted' || booking.status === 'en_route' || booking.status === 'active') && (
            <TouchableOpacity style={styles.trackButton} onPress={handleTrackGuard}>
              <Navigation size={20} color={Colors.background} />
              <Text style={styles.trackButtonText}>Track Guard Location</Text>
            </TouchableOpacity>
          )}

          {booking.status === 'active' && isClientView && (
            <View style={styles.extendCard}>
              <View style={styles.extendHeader}>
                <Clock size={20} color={Colors.gold} />
                <Text style={styles.extendTitle}>Extend Booking</Text>
              </View>
              <Text style={styles.extendSubtext}>
                Current duration: {booking.duration}h (Max 8h total)
              </Text>
              <View style={styles.extendButtons}>
                <TouchableOpacity
                  style={styles.extendButton}
                  onPress={() => handleExtendBooking(0.5)}
                  disabled={booking.duration >= 8}
                >
                  <Plus size={16} color={booking.duration >= 8 ? Colors.textTertiary : Colors.gold} />
                  <Text style={[styles.extendButtonText, booking.duration >= 8 && styles.extendButtonTextDisabled]}>+30 min</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.extendButton}
                  onPress={() => handleExtendBooking(1)}
                  disabled={booking.duration >= 8}
                >
                  <Plus size={16} color={booking.duration >= 8 ? Colors.textTertiary : Colors.gold} />
                  <Text style={[styles.extendButtonText, booking.duration >= 8 && styles.extendButtonTextDisabled]}>+1 hour</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {(booking.status === 'pending' || booking.status === 'accepted') && (
            <TouchableOpacity style={styles.cancelBookingButton} onPress={handleCancelBooking}>
              <X size={20} color={Colors.error} />
              <Text style={styles.cancelBookingText}>Cancel Booking</Text>
            </TouchableOpacity>
          )}

          {isGuardView && (booking.status === 'accepted' || booking.status === 'en_route' || booking.status === 'active') && (
            <View style={styles.clientInfoCard}>
              <View style={styles.clientHeader}>
                <User size={20} color={Colors.gold} />
                <Text style={styles.clientTitle}>Client Information</Text>
              </View>
              <Text style={styles.clientNote}>
                Contact the client through the chat below for any questions or updates.
              </Text>
            </View>
          )}

          {!isPending && (
            <View style={styles.chatSection}>
              <View style={styles.chatHeader}>
                <MessageCircle size={20} color={Colors.gold} />
                <Text style={styles.chatTitle}>
                  {isGuardView ? 'Chat with Client' : 'Chat with Guard'}
                </Text>
              </View>

            <View style={styles.messagesContainer}>
              {messages.length === 0 ? (
                <View style={styles.emptyChat}>
                  <MessageCircle size={48} color={Colors.textTertiary} />
                  <Text style={styles.emptyChatText}>No messages yet</Text>
                  <Text style={styles.emptyChatSubtext}>
                    {isGuardView ? 'Start a conversation with the client' : 'Start a conversation with your guard'}
                  </Text>
                </View>
              ) : (
                messages.map((msg) => {
                  const isOwnMessage = msg.senderId === user?.id;
                  const showingOriginal = showOriginal[msg.id];
                  const displayText = showingOriginal ? msg.text : (msg.translatedText || msg.text);
                  const hasTranslation = !!msg.translatedText;
                  
                  return (
                    <View
                      key={msg.id}
                      style={[
                        styles.messageBubble,
                        isOwnMessage ? styles.messageBubbleClient : styles.messageBubbleGuard,
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          isOwnMessage ? styles.messageTextClient : styles.messageTextGuard,
                        ]}
                      >
                        {displayText}
                      </Text>
                      {hasTranslation && (
                        <TouchableOpacity
                          style={styles.viewOriginalButton}
                          onPress={() => setShowOriginal(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                        >
                          <Eye size={12} color={isOwnMessage ? Colors.background : Colors.gold} />
                          <Text
                            style={[
                              styles.viewOriginalText,
                              isOwnMessage ? styles.messageTimeClient : { color: Colors.gold },
                            ]}
                          >
                            {showingOriginal ? `Translated from ${msg.originalLanguage.toUpperCase()}` : 'View Original'}
                          </Text>
                        </TouchableOpacity>
                      )}
                      <Text
                        style={[
                          styles.messageTime,
                          isOwnMessage ? styles.messageTimeClient : styles.messageTimeGuard,
                        ]}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  );
                })
              )}
            </View>
            </View>
          )}

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>

      {!isPending && (
        <View style={[styles.chatInputContainer, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          style={styles.chatInput}
          placeholder="Type a message..."
          placeholderTextColor={Colors.textTertiary}
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!message.trim() || isSending) && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!message.trim() || isSending}
        >
          <Send size={20} color={Colors.background} />
        </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  guardCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  guardName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  guardRole: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.gold + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  startCodeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  startCodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  startCodeTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  startCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  startCodeValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.gold,
    letterSpacing: 4,
  },
  copyButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startCodeHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  detailsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    width: 80,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.gold,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  trackButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  chatSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  messagesContainer: {
    minHeight: 200,
  },
  emptyChat: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyChatText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginTop: 12,
  },
  emptyChatSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  messageBubbleClient: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.gold,
  },
  messageBubbleGuard: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceLight,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  messageTextClient: {
    color: Colors.background,
  },
  messageTextGuard: {
    color: Colors.textPrimary,
  },
  messageTime: {
    fontSize: 11,
  },
  messageTimeClient: {
    color: Colors.background + 'CC',
  },
  messageTimeGuard: {
    color: Colors.textSecondary,
  },
  viewOriginalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    marginBottom: 2,
  },
  viewOriginalText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  bottomPadding: {
    height: 20,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  chatInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginTop: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.success,
    paddingVertical: 16,
    borderRadius: 16,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.error,
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.error,
  },
  clientInfoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  clientTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  clientNote: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  rejectedCard: {
    backgroundColor: Colors.error + '20',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.error,
  },
  rejectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  rejectedTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.error,
  },
  rejectionReason: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  selectNewGuardButton: {
    backgroundColor: Colors.gold,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectNewGuardText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  cancelBookingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.error,
  },
  cancelBookingText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.error,
  },
  extendCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  extendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  extendTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  extendSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  extendButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  extendButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.gold + '20',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  extendButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  extendButtonTextDisabled: {
    color: Colors.textTertiary,
  },
});
