import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { paymentService } from '@/services/paymentService';
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/contexts/AuthContext';
import { BraintreePaymentForm } from '@/components/BraintreePaymentForm';
import { withErrorBoundary } from '@/components/CriticalScreenErrorBoundary';

function BookingPaymentScreen() {
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
  const { user } = useAuth();
  

  const [costBreakdown, setCostBreakdown] = useState<{
    subtotal: number;
    vehicleFee: number;
    protectionFee: number;
    platformFee: number;
    total: number;
  } | null>(null);

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

  const handlePaymentSuccess = async (result: { id: string; status: string }) => {
    try {
      const bookingId = 'booking-' + Date.now();
      const startCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      if (costBreakdown) {
        await notificationService.notifyPaymentSuccess(bookingId, costBreakdown.total);
      }
      

      
      Alert.alert(
        'Booking Confirmed!',
        `Your protection service has been booked.\n\nStart Code: ${startCode}\n\nShare this code with your guard to begin service.`,
        [
          {
            text: 'View Booking',
            onPress: () => {
              // Add delay to ensure alert is fully dismissed before navigation
              // This prevents UIKit view controller presentation conflicts
              setTimeout(() => {
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
                    transactionId: result.id,
                  },
                } as any);
              }, 300);
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('[Payment] Post-payment error:', error);
      Alert.alert('Error', 'Payment succeeded but booking failed. Please contact support.');
    }
  };

  const handlePaymentError = (error: Error) => {
    Alert.alert('Payment Failed', error.message);
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

        {costBreakdown && (
          <View style={styles.priceBreakdown}>
            <Text style={styles.breakdownTitle}>Price Breakdown</Text>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Service ({params.duration}h)</Text>
              <Text style={styles.breakdownValue}>${costBreakdown.subtotal.toFixed(2)} MXN</Text>
            </View>
            
            {costBreakdown.vehicleFee > 0 && (
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Armored Vehicle Fee</Text>
                <Text style={styles.breakdownValue}>${costBreakdown.vehicleFee.toFixed(2)} MXN</Text>
              </View>
            )}
            
            {costBreakdown.protectionFee > 0 && (
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Armed Protection Fee</Text>
                <Text style={styles.breakdownValue}>${costBreakdown.protectionFee.toFixed(2)} MXN</Text>
              </View>
            )}
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Platform Fee (10%)</Text>
              <Text style={styles.breakdownValue}>${costBreakdown.platformFee.toFixed(2)} MXN</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.breakdownRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${costBreakdown.total.toFixed(2)} MXN</Text>
            </View>
          </View>
        )}

        {costBreakdown && (
          <BraintreePaymentForm
            amount={costBreakdown.total}
            currency="MXN"
            customerId={user?.id}
            bookingId={`booking-${Date.now()}`}
            description={`Bodyguard service: ${params.guardName}`}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        )}

        <Text style={styles.securityNote}>
          🔒 Your payment is secured with Braintree encryption
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
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
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
    flexDirection: 'row' as const,
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
    justifyContent: 'center' as const,
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
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
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
  securityNote: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    marginTop: 16,
  },
});

// Wrap with error boundary for payment flow protection
export default withErrorBoundary(BookingPaymentScreen, {
  fallbackMessage: "Payment processing encountered an error. Please try again or contact support.",
});
