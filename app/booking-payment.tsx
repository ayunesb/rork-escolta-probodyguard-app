import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { CreditCard, Lock, ChevronLeft, Plus, Trash2, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { paymentService } from '@/services/paymentService';
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/contexts/AuthContext';
import * as stripeService from '@/services/stripeService';
import { SavedPaymentMethod } from '@/types';

export default function BookingPaymentScreen() {
  const params = useLocalSearchParams<{
    guardId: string;
    guardName: string;
    guardPhoto: string;
    date: string;
    time: string;
    duration: string;
    vehicleType: string;
    protectionType: string;
    dressCode: string;
    numberOfProtectees: string;
    pickupAddress: string;
    totalAmount: string;
  }>();
  
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<SavedPaymentMethod | null>(null);
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [costBreakdown, setCostBreakdown] = useState<{
    subtotal: number;
    vehicleFee: number;
    protectionFee: number;
    platformFee: number;
    total: number;
  } | null>(null);

  const savedCards = user?.savedPaymentMethods || [];

  useEffect(() => {
    if (savedCards.length > 0 && !selectedPaymentMethod) {
      const defaultCard = savedCards.find(card => card.isDefault) || savedCards[0];
      setSelectedPaymentMethod(defaultCard);
    }
  }, [savedCards, selectedPaymentMethod]);

  const calculateCost = useCallback(async () => {
    const hourlyRate = parseFloat(params.totalAmount) / parseFloat(params.duration);
    const breakdown = await paymentService.calculateBookingCost(
      hourlyRate,
      parseFloat(params.duration),
      params.vehicleType as 'standard' | 'armored',
      params.protectionType as 'armed' | 'unarmed',
      1
    );
    setCostBreakdown(breakdown);
  }, [params.totalAmount, params.duration, params.vehicleType, params.protectionType]);

  useEffect(() => {
    calculateCost();
  }, [calculateCost]);

  const handleRemoveCard = async (paymentMethodId: string) => {
    Alert.alert(
      'Remove Card',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedCards = savedCards.filter(
                card => card.stripePaymentMethodId !== paymentMethodId
              );
              await updateUser({ savedPaymentMethods: updatedCards });
              
              if (selectedPaymentMethod?.stripePaymentMethodId === paymentMethodId) {
                setSelectedPaymentMethod(updatedCards[0] || null);
              }
            } catch (error) {
              console.error('Remove card error:', error);
              Alert.alert('Error', 'Failed to remove card');
            }
          },
        },
      ]
    );
  };

  const handleSetDefaultCard = async (paymentMethodId: string) => {
    try {
      const updatedCards = savedCards.map(card => ({
        ...card,
        isDefault: card.stripePaymentMethodId === paymentMethodId,
      }));
      await updateUser({ savedPaymentMethods: updatedCards });
      setSelectedPaymentMethod(updatedCards.find(c => c.isDefault) || null);
    } catch (error) {
      console.error('Set default card error:', error);
      Alert.alert('Error', 'Failed to set default card');
    }
  };

  const handlePayment = async () => {
    if (!costBreakdown) {
      Alert.alert('Error', 'Unable to calculate cost. Please try again.');
      return;
    }

    if (!selectedPaymentMethod && !showAddCard) {
      setShowAddCard(true);
      return;
    }

    if (showAddCard && (!cardNumber || !expiryDate || !cvv || !cardholderName)) {
      Alert.alert('Missing Information', 'Please fill in all payment details');
      return;
    }

    setIsProcessing(true);

    try {
      console.log('[Payment] Starting payment process');
      const bookingId = 'booking-' + Date.now();
      
      const paymentMethodId = selectedPaymentMethod?.stripePaymentMethodId;
      console.log('[Payment] Using payment method:', paymentMethodId ? 'saved' : 'new');
      
      const paymentIntent = await stripeService.createPaymentIntent(
        bookingId,
        costBreakdown.total,
        paymentMethodId
      );

      console.log('[Payment] Payment intent created:', paymentIntent.paymentIntentId);

      let paymentResult;
      
      if (paymentMethodId) {
        console.log('[Payment] Using saved payment method - auto-confirming');
        paymentResult = {
          success: true,
          paymentIntentId: paymentIntent.paymentIntentId,
        };
      } else {
        console.log('[Payment] Confirming new payment method');
        paymentResult = await stripeService.confirmPayment(
          paymentIntent.clientSecret
        );
      }

      console.log('[Payment] Payment result:', paymentResult);

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment failed');
      }

      console.log('[Payment] Sending notification');
      await notificationService.notifyPaymentSuccess(bookingId, costBreakdown.total);
      
      const startCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      console.log('[Payment] Payment completed successfully');
      setIsProcessing(false);
      
      Alert.alert(
        'Booking Confirmed!',
        `Your protection service has been booked.\n\nStart Code: ${startCode}\n\nShare this code with your guard to begin service.`,
        [
          {
            text: 'View Booking',
            onPress: () => {
              router.replace({
                pathname: '/booking-active',
                params: {
                  bookingId,
                  guardId: params.guardId,
                  guardName: params.guardName,
                  guardPhoto: params.guardPhoto,
                  startCode,
                  date: params.date,
                  time: params.time,
                  duration: params.duration,
                  pickupAddress: params.pickupAddress,
                  transactionId: paymentResult.paymentIntentId || paymentIntent.paymentIntentId,
                },
              } as any);
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('[Payment] Payment error:', error);
      setIsProcessing(false);
      
      const errorMessage = error?.message || 'Unable to process payment. Please try again.';
      Alert.alert('Payment Failed', errorMessage);
    }
  };

  const getCardBrandIcon = (brand: string) => {
    return '💳';
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.bookingSummary}>
          <Image source={{ uri: params.guardPhoto }} style={styles.guardImage} />
          <View style={styles.summaryDetails}>
            <Text style={styles.guardName}>{params.guardName}</Text>
            <Text style={styles.summaryText}>{params.date} at {params.time}</Text>
            <Text style={styles.summaryText}>{params.duration} hours • {params.protectionType}</Text>
            <Text style={styles.summaryText} numberOfLines={1}>{params.pickupAddress}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lock size={20} color={Colors.gold} />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>

          {savedCards.length > 0 && !showAddCard && (
            <View style={styles.savedCardsContainer}>
              {savedCards.map((card) => (
                <TouchableOpacity
                  key={card.id}
                  style={[
                    styles.savedCard,
                    selectedPaymentMethod?.id === card.id && styles.savedCardSelected,
                  ]}
                  onPress={() => setSelectedPaymentMethod(card)}
                >
                  <View style={styles.savedCardLeft}>
                    <Text style={styles.cardBrandIcon}>{getCardBrandIcon(card.brand)}</Text>
                    <View>
                      <Text style={styles.savedCardBrand}>
                        {card.brand.toUpperCase()} •••• {card.last4}
                      </Text>
                      <Text style={styles.savedCardExpiry}>
                        Expires {card.expiryMonth}/{card.expiryYear}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.savedCardRight}>
                    {selectedPaymentMethod?.id === card.id && (
                      <View style={styles.selectedBadge}>
                        <Check size={16} color={Colors.background} />
                      </View>
                    )}
                    <TouchableOpacity
                      onPress={() => handleRemoveCard(card.stripePaymentMethodId)}
                      style={styles.removeButton}
                    >
                      <Trash2 size={18} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {(showAddCard || savedCards.length === 0) && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Card Number</Text>
                <View style={styles.inputContainer}>
                  <CreditCard size={20} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    placeholder="4242 4242 4242 4242"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="numeric"
                    maxLength={19}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Expiry Date</Text>
                  <TextInput
                    style={styles.inputField}
                    value={expiryDate}
                    onChangeText={setExpiryDate}
                    placeholder="MM/YY"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>CVV</Text>
                  <TextInput
                    style={styles.inputField}
                    value={cvv}
                    onChangeText={setCvv}
                    placeholder="123"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Cardholder Name</Text>
                <TextInput
                  style={styles.inputField}
                  value={cardholderName}
                  onChangeText={setCardholderName}
                  placeholder="John Doe"
                  placeholderTextColor={Colors.textTertiary}
                  autoCapitalize="words"
                />
              </View>
            </>
          )}

          {savedCards.length > 0 && !showAddCard && (
            <TouchableOpacity
              style={styles.addCardButton}
              onPress={() => setShowAddCard(true)}
            >
              <Plus size={20} color={Colors.gold} />
              <Text style={styles.addCardButtonText}>Add New Card</Text>
            </TouchableOpacity>
          )}

          {showAddCard && savedCards.length > 0 && (
            <TouchableOpacity
              style={styles.cancelAddButton}
              onPress={() => {
                setShowAddCard(false);
                setCardNumber('');
                setExpiryDate('');
                setCvv('');
                setCardholderName('');
              }}
            >
              <Text style={styles.cancelAddButtonText}>Use Saved Card</Text>
            </TouchableOpacity>
          )}
        </View>

        {costBreakdown && (
          <View style={styles.priceBreakdown}>
            <Text style={styles.breakdownTitle}>Price Breakdown</Text>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Service ({params.duration}h)</Text>
              <Text style={styles.breakdownValue}>${costBreakdown.subtotal.toFixed(2)}</Text>
            </View>
            
            {costBreakdown.vehicleFee > 0 && (
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Armored Vehicle Fee</Text>
                <Text style={styles.breakdownValue}>${costBreakdown.vehicleFee.toFixed(2)}</Text>
              </View>
            )}
            
            {costBreakdown.protectionFee > 0 && (
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Armed Protection Fee</Text>
                <Text style={styles.breakdownValue}>${costBreakdown.protectionFee.toFixed(2)}</Text>
              </View>
            )}
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Platform Fee (10%)</Text>
              <Text style={styles.breakdownValue}>${costBreakdown.platformFee.toFixed(2)}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.breakdownRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${costBreakdown.total.toFixed(2)}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color={Colors.background} />
          ) : (
            <>
              <Lock size={20} color={Colors.background} />
              <Text style={styles.payButtonText}>
                {selectedPaymentMethod && !showAddCard ? 'Pay Now' : 'Add Card & Pay'} ${costBreakdown?.total.toFixed(2) || params.totalAmount}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.securityNote}>
          🔒 Your payment is secured with 256-bit encryption
        </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  bookingSummary: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guardImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: Colors.surfaceLight,
  },
  summaryDetails: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  guardName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  savedCardsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  savedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
  },
  savedCardSelected: {
    borderColor: Colors.gold,
    backgroundColor: Colors.surfaceLight,
  },
  savedCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  cardBrandIcon: {
    fontSize: 24,
  },
  savedCardBrand: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  savedCardExpiry: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  savedCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    padding: 4,
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.gold,
    borderRadius: 12,
    padding: 16,
    borderStyle: 'dashed' as const,
  },
  addCardButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.gold,
  },
  cancelAddButton: {
    alignItems: 'center',
    padding: 12,
    marginTop: 8,
  },
  cancelAddButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textDecorationLine: 'underline' as const,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  inputField: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  priceBreakdown: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  breakdownLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  breakdownValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600' as const,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.gold,
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  securityNote: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
  },
});
