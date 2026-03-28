import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { CreditCard, X, Check } from 'lucide-react-native';
import { paymentService, PaymentBreakdown } from '@/services/paymentService';
import { SavedPaymentMethod } from '@/types';
import Colors from '@/constants/colors';
import BraintreeHostedFields, { BraintreeHostedFieldsHandle, CardDetails } from './BraintreeHostedFields';

const TEXT_COLOR = Colors.textPrimary;

interface PaymentSheetProps {
  visible: boolean;
  amount: number;
  breakdown: PaymentBreakdown;
  userId: string;
  bookingId: string;
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
}

export default function PaymentSheet({
  visible,
  amount,
  breakdown,
  userId,
  bookingId,
  onSuccess,
  onCancel,
}: PaymentSheetProps) {
  const hostedFieldsRef = useRef<BraintreeHostedFieldsHandle>(null);
  const [loading, setLoading] = useState(false);
  const [loadingToken, setLoadingToken] = useState(false);
  const [savedCards, setSavedCards] = useState<SavedPaymentMethod[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showNewCard, setShowNewCard] = useState(false);
  const [clientToken, setClientToken] = useState<string | null>(null);
  const [cardholderName, setCardholderName] = useState('');

  useEffect(() => {
    console.log('[PaymentSheet] Visibility changed:', visible);
    if (visible) {
      console.log('[PaymentSheet] Loading payment sheet for user:', userId, 'booking:', bookingId);
      loadSavedCards();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, userId, bookingId]);

  const loadSavedCards = async () => {
    try {
      const cards = await paymentService.getSavedPaymentMethods(userId);
      setSavedCards(cards);
      if (cards.length > 0) {
        setSelectedCard(cards[0].token);
      } else {
        setShowNewCard(true);
        await loadClientToken();
      }
    } catch (error) {
      console.error('[PaymentSheet] Error loading saved cards:', error);
      setShowNewCard(true);
      await loadClientToken();
    }
  };

  const loadClientToken = async () => {
    setLoadingToken(true);
    try {
      const token = await paymentService.getClientToken(userId);
      setClientToken(token);
    } catch (error) {
      console.error('[PaymentSheet] Error loading client token:', error);
      Alert.alert('Error', 'Failed to initialize payment. Please try again.');
    } finally {
      setLoadingToken(false);
    }
  };

  const handlePayButtonPress = () => {
    if (!cardholderName.trim()) {
      Alert.alert('Cardholder Name Required', 'Please enter the name on the card');
      return;
    }
    
    setLoading(true);
    console.log('[PaymentSheet] Submitting payment via Hosted Fields');
    hostedFieldsRef.current?.submitPayment();
  };

  const handleHostedFieldsSuccess = async (nonce: string, cardDetails: CardDetails) => {
    console.log('[PaymentSheet] Hosted Fields success - processing payment');
    console.log('[PaymentSheet] Card type:', cardDetails.cardType);
    console.log('[PaymentSheet] Last 4:', cardDetails.lastFour);
    
    try {
      const result = await paymentService.processPayment(
        nonce,
        breakdown.total,
        bookingId,
        userId,
        false // Don't save card for now
      );
      
      if (result.success && result.transactionId) {
        console.log('[PaymentSheet] Payment successful! Transaction ID:', result.transactionId);
        onSuccess(result.transactionId);
      } else {
        console.error('[PaymentSheet] Payment failed:', result.error);
        Alert.alert('Payment Failed', result.error || 'Please try again');
        setLoading(false);
      }
    } catch (error) {
      console.error('[PaymentSheet] Payment processing error:', error);
      Alert.alert('Error', 'Failed to process payment');
      setLoading(false);
    }
  };

  const handleHostedFieldsError = (error: string) => {
    console.error('[PaymentSheet] Hosted Fields error:', error);
    Alert.alert('Payment Error', error);
    setLoading(false);
  };

  const handleHostedFieldsReady = () => {
    console.log('[PaymentSheet] Hosted Fields ready');
    setLoadingToken(false);
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      if (selectedCard && !showNewCard) {
        const result = await paymentService.processPayment(
          selectedCard,
          breakdown.total,
          bookingId,
          userId,
          false
        );

        if (result.success && result.transactionId) {
          onSuccess(result.transactionId);
        } else if (result.requiresAction && result.actionUrl) {
          Alert.alert(
            '3D Secure Required',
            'Additional authentication is required. Please complete the verification.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Continue',
                onPress: () => {
                  setShowNewCard(true);
                },
              },
            ]
          );
        } else {
          Alert.alert('Payment Failed', result.error || 'Please try again');
        }
      }
    } catch (error) {
      console.error('[PaymentSheet] Payment error:', error);
      Alert.alert('Error', 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Payment</Text>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <X size={24} color={TEXT_COLOR} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.breakdownCard}>
              <Text style={styles.breakdownTitle}>Payment Breakdown</Text>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Service</Text>
                <Text style={styles.breakdownValue}>
                  {paymentService.formatMXN(breakdown.subtotal)}
                </Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Processing Fee</Text>
                <Text style={styles.breakdownValue}>
                  {paymentService.formatMXN(breakdown.processingFee)}
                </Text>
              </View>
              <View style={[styles.breakdownRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  {paymentService.formatMXN(breakdown.total)}
                </Text>
              </View>
            </View>

            {savedCards.length > 0 && !showNewCard && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Saved Cards</Text>
                {savedCards.map((card) => (
                  <TouchableOpacity
                    key={card.token}
                    style={[
                      styles.savedCard,
                      selectedCard === card.token && styles.savedCardSelected,
                    ]}
                    onPress={() => setSelectedCard(card.token)}
                  >
                    <CreditCard size={24} color={Colors.gold} />
                    <View style={styles.savedCardInfo}>
                      <Text style={styles.savedCardType}>{card.cardType}</Text>
                      <Text style={styles.savedCardNumber}>•••• {card.last4}</Text>
                    </View>
                    {selectedCard === card.token && (
                      <Check size={20} color={Colors.gold} />
                    )}
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.addCardButton}
                  onPress={async () => {
                    setShowNewCard(true);
                    await loadClientToken();
                  }}
                >
                  <Text style={styles.addCardText}>+ Add New Card</Text>
                </TouchableOpacity>
              </View>
            )}

            {showNewCard && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Card Details</Text>
                
                {loadingToken ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.gold} />
                    <Text style={styles.loadingText}>Loading payment form...</Text>
                  </View>
                ) : clientToken ? (
                  <View>
                    {/* Cardholder Name Input (Native) */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Cardholder Name</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="John Doe"
                        placeholderTextColor={Colors.textTertiary}
                        value={cardholderName}
                        onChangeText={setCardholderName}
                        autoCapitalize="words"
                        editable={!loading}
                      />
                    </View>
                    
                    {/* Braintree Hosted Fields (Secure iframes) */}
                    <BraintreeHostedFields
                      ref={hostedFieldsRef}
                      clientToken={clientToken}
                      onSuccess={handleHostedFieldsSuccess}
                      onError={handleHostedFieldsError}
                      onReady={handleHostedFieldsReady}
                    />
                    
                    {/* Pay Button */}
                    <TouchableOpacity
                      style={[styles.payButton, loading && styles.payButtonDisabled]}
                      onPress={handlePayButtonPress}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color={Colors.background} />
                      ) : (
                        <>
                          <Text style={styles.payButtonText}>
                            Pay {paymentService.formatMXN(breakdown.total)}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Failed to load payment form</Text>
                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={loadClientToken}
                    >
                      <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {savedCards.length > 0 && (
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setShowNewCard(false)}
                  >
                    <Text style={styles.backButtonText}>Use Saved Card</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>

          {!showNewCard && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.payButton, loading && styles.payButtonDisabled]}
                onPress={handlePayment}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.background} />
                ) : (
                  <Text style={styles.payButtonText}>
                    Pay {paymentService.formatMXN(breakdown.total)}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: TEXT_COLOR,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  breakdownCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: TEXT_COLOR,
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: TEXT_COLOR,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: TEXT_COLOR,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: TEXT_COLOR,
    marginBottom: 12,
  },
  savedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  savedCardSelected: {
    borderColor: Colors.gold,
  },
  savedCardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  savedCardType: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: TEXT_COLOR,
    textTransform: 'capitalize',
  },
  savedCardNumber: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addCardButton: {
    padding: 16,
    alignItems: 'center',
  },
  addCardText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.gold,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: TEXT_COLOR,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  checkboxLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  backButton: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.gold,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  payButton: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  openPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gold,
    borderRadius: 12,
    padding: 20,
    gap: 12,
  },
  openPaymentButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  securityNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.gold,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.background,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500' as const,
  },
});
