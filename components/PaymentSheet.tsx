import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { CreditCard, X, Check } from 'lucide-react-native';
import { paymentService, PaymentBreakdown } from '@/services/paymentService';
import { SavedPaymentMethod } from '@/types';
import Colors from '@/constants/colors';

const TEXT_COLOR = Colors.textPrimary;

interface PaymentSheetProps {
  visible: boolean;
  amount: number;
  breakdown: PaymentBreakdown;
  customerId?: string;
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
}

export default function PaymentSheet({
  visible,
  amount,
  breakdown,
  customerId,
  onSuccess,
  onCancel,
}: PaymentSheetProps) {
  const [loading, setLoading] = useState(false);
  const [savedCards, setSavedCards] = useState<SavedPaymentMethod[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showNewCard, setShowNewCard] = useState(false);
  const [saveCard, setSaveCard] = useState(false);

  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  useEffect(() => {
    if (visible) {
      loadSavedCards();
    }
  }, [visible]);

  const loadSavedCards = async () => {
    const cards = await paymentService.getSavedPaymentMethods();
    setSavedCards(cards);
    if (cards.length > 0) {
      setSelectedCard(cards[0].token);
    } else {
      setShowNewCard(true);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      let nonce: string;

      if (selectedCard && !showNewCard) {
        nonce = selectedCard;
      } else {
        if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
          Alert.alert('Error', 'Please fill in all card details');
          setLoading(false);
          return;
        }
        nonce = `fake-nonce-${Date.now()}`;
      }

      const result = await paymentService.processPayment(
        nonce,
        breakdown.total,
        customerId,
        saveCard && showNewCard
      );

      if (result.success && result.transactionId) {
        onSuccess(result.transactionId);
      } else {
        Alert.alert('Payment Failed', result.error || 'Please try again');
      }
    } catch (error) {
      console.error('[PaymentSheet] Payment error:', error);
      Alert.alert('Error', 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ');
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
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
                  onPress={() => setShowNewCard(true)}
                >
                  <Text style={styles.addCardText}>+ Add New Card</Text>
                </TouchableOpacity>
              </View>
            )}

            {showNewCard && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Card Details</Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="Cardholder Name"
                  placeholderTextColor={Colors.textTertiary}
                  value={cardholderName}
                  onChangeText={setCardholderName}
                  autoCapitalize="words"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Card Number"
                  placeholderTextColor={Colors.textTertiary}
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  keyboardType="number-pad"
                  maxLength={19}
                />

                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="MM/YY"
                    placeholderTextColor={Colors.textTertiary}
                    value={expiryDate}
                    onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                    keyboardType="number-pad"
                    maxLength={5}
                  />
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="CVV"
                    placeholderTextColor={Colors.textTertiary}
                    value={cvv}
                    onChangeText={setCvv}
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setSaveCard(!saveCard)}
                >
                  <View style={[styles.checkbox, saveCard && styles.checkboxChecked]}>
                    {saveCard && <Check size={16} color={Colors.background} />}
                  </View>
                  <Text style={styles.checkboxLabel}>Save card for future payments</Text>
                </TouchableOpacity>

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
});
