import { useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft,
  Calendar,
  Clock,
  Car,
  Shield,
  Briefcase,
  MapPin,
  CreditCard,
} from 'lucide-react-native';
import { mockGuards } from '@/mocks/guards';
import Colors from '@/constants/colors';
import type { VehicleType, ProtectionType, DressCode } from '@/types';
import MapView, { Marker, PROVIDER_DEFAULT } from '@/components/MapView';
import PaymentSheet from '@/components/PaymentSheet';
import { paymentService } from '@/services/paymentService';
import { bookingService } from '@/services/bookingService';
import { useAuth } from '@/contexts/AuthContext';

export default function CreateBookingScreen() {
  const { guardId } = useLocalSearchParams<{ guardId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [vehicleType, setVehicleType] = useState<VehicleType>('standard');
  const [protectionType, setProtectionType] = useState<ProtectionType>('unarmed');
  const [dressCode, setDressCode] = useState<DressCode>('business_casual');
  const [numberOfProtectors, setNumberOfProtectors] = useState<number>(1);
  const [numberOfProtectees, setNumberOfProtectees] = useState<number>(1);
  const [duration, setDuration] = useState<number>(4);
  const [scheduledDate, setScheduledDate] = useState<Date>(new Date());
  const [scheduledTime, setScheduledTime] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [pickupCoords, setPickupCoords] = useState<{ latitude: number; longitude: number }>({ 
    latitude: 40.7580, 
    longitude: -73.9855 
  });
  const [showMap, setShowMap] = useState<boolean>(false);
  const [pickupAddress, setPickupAddress] = useState<string>('');
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [showPayment, setShowPayment] = useState<boolean>(false);
  const { user } = useAuth();

  const handleDateChange = useCallback((event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setScheduledDate(selectedDate);
    }
  }, []);

  const handleTimeChange = useCallback((event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setScheduledTime(selectedTime);
    }
  }, []);

  const guard = mockGuards.find((g) => g.id === guardId);

  if (!guard) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Shield size={64} color={Colors.textTertiary} />
          <Text style={styles.errorText}>Guard not found</Text>
        </View>
      </View>
    );
  }

  const baseRate = guard.hourlyRate;
  const vehicleMultiplier = vehicleType === 'armored' ? 1.5 : 1;
  const protectionMultiplier = protectionType === 'armed' ? 1.3 : 1;
  const protectorMultiplier = numberOfProtectors;

  const breakdown = paymentService.calculateBreakdown(baseRate * vehicleMultiplier * protectionMultiplier * protectorMultiplier, duration);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleBooking = () => {
    if (!pickupAddress) {
      Alert.alert('Missing Information', 'Please enter a pickup address');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    try {
      console.log('[Booking] Payment successful:', transactionId);

      const booking = await bookingService.createBooking({
        clientId: user?.id || '',
        guardId: guard.id,
        vehicleType,
        protectionType,
        dressCode,
        numberOfProtectees,
        numberOfProtectors,
        scheduledDate: scheduledDate.toISOString().split('T')[0],
        scheduledTime: scheduledTime.toTimeString().split(' ')[0],
        duration,
        pickupAddress,
        pickupLatitude: pickupCoords.latitude,
        pickupLongitude: pickupCoords.longitude,
        destinationAddress: destinationAddress || undefined,
        totalAmount: breakdown.total,
        processingFee: breakdown.processingFee,
        platformCut: breakdown.platformCut,
        guardPayout: breakdown.guardPayout,
      });

      setShowPayment(false);

      Alert.alert(
        'Booking Confirmed!',
        `Your protection service has been booked.\n\nStart Code: ${booking.startCode}\n\nSave this code to start your service.`,
        [
          {
            text: 'View Booking',
            onPress: () => router.push('/bookings'),
          },
        ]
      );
    } catch (error) {
      console.error('[Booking] Error creating booking:', error);
      Alert.alert('Error', 'Failed to create booking. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Protection</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.guardInfo}>
            <Text style={styles.guardName}>
              {guard.firstName} {guard.lastName.charAt(0)}.
            </Text>
            <Text style={styles.guardRate}>${guard.hourlyRate}/hr base rate</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Protection Type</Text>
            <View style={styles.optionRow}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  protectionType === 'unarmed' && styles.optionButtonActive,
                ]}
                onPress={() => setProtectionType('unarmed')}
              >
                <Shield size={20} color={protectionType === 'unarmed' ? Colors.background : Colors.textSecondary} />
                <Text style={[styles.optionText, protectionType === 'unarmed' && styles.optionTextActive]}>
                  Unarmed
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  protectionType === 'armed' && styles.optionButtonActive,
                ]}
                onPress={() => setProtectionType('armed')}
              >
                <Shield size={20} color={protectionType === 'armed' ? Colors.background : Colors.textSecondary} />
                <Text style={[styles.optionText, protectionType === 'armed' && styles.optionTextActive]}>
                  Armed (+30%)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehicle Type</Text>
            <View style={styles.optionRow}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  vehicleType === 'standard' && styles.optionButtonActive,
                ]}
                onPress={() => setVehicleType('standard')}
              >
                <Car size={20} color={vehicleType === 'standard' ? Colors.background : Colors.textSecondary} />
                <Text style={[styles.optionText, vehicleType === 'standard' && styles.optionTextActive]}>
                  Standard
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  vehicleType === 'armored' && styles.optionButtonActive,
                ]}
                onPress={() => setVehicleType('armored')}
              >
                <Car size={20} color={vehicleType === 'armored' ? Colors.background : Colors.textSecondary} />
                <Text style={[styles.optionText, vehicleType === 'armored' && styles.optionTextActive]}>
                  Armored (+50%)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dress Code</Text>
            <View style={styles.optionGrid}>
              {(['suit', 'business_casual', 'tactical', 'casual'] as DressCode[]).map((code) => (
                <TouchableOpacity
                  key={code}
                  style={[
                    styles.optionButtonSmall,
                    dressCode === code && styles.optionButtonActive,
                  ]}
                  onPress={() => setDressCode(code)}
                >
                  <Briefcase size={16} color={dressCode === code ? Colors.background : Colors.textSecondary} />
                  <Text style={[styles.optionTextSmall, dressCode === code && styles.optionTextActive]}>
                    {code.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Number of Protectors</Text>
            <View style={styles.counterRow}>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => setNumberOfProtectors(Math.max(1, numberOfProtectors - 1))}
              >
                <Text style={styles.counterButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{numberOfProtectors}</Text>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => setNumberOfProtectors(Math.min(5, numberOfProtectors + 1))}
              >
                <Text style={styles.counterButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Number of Protectees</Text>
            <View style={styles.counterRow}>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => setNumberOfProtectees(Math.max(1, numberOfProtectees - 1))}
              >
                <Text style={styles.counterButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{numberOfProtectees}</Text>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => setNumberOfProtectees(Math.min(10, numberOfProtectees + 1))}
              >
                <Text style={styles.counterButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Duration (hours)</Text>
            <View style={styles.counterRow}>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => setDuration(Math.max(1, duration - 1))}
              >
                <Text style={styles.counterButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{duration}</Text>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => setDuration(Math.min(24, duration + 1))}
              >
                <Text style={styles.counterButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Schedule</Text>
            <View style={styles.inputRow}>
              <TouchableOpacity 
                style={styles.inputContainer}
                onPress={() => setShowDatePicker(true)}
              >
                <Calendar size={16} color={Colors.textSecondary} />
                <Text style={styles.inputText}>{formatDate(scheduledDate)}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.inputContainer}
                onPress={() => setShowTimePicker(true)}
              >
                <Clock size={16} color={Colors.textSecondary} />
                <Text style={styles.inputText}>{formatTime(scheduledTime)}</Text>
              </TouchableOpacity>
            </View>
            {showDatePicker && (
              <DateTimePicker
                value={scheduledDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
            {showTimePicker && (
              <DateTimePicker
                value={scheduledTime}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
              />
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pickup Location</Text>
            <View style={styles.inputContainer}>
              <MapPin size={16} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Enter pickup address"
                placeholderTextColor={Colors.textTertiary}
                value={pickupAddress}
                onChangeText={setPickupAddress}
              />
            </View>
            <TouchableOpacity 
              style={styles.mapToggleButton}
              onPress={() => setShowMap(!showMap)}
            >
              <MapPin size={16} color={Colors.gold} />
              <Text style={styles.mapToggleText}>
                {showMap ? 'Hide Map' : 'Show Map'}
              </Text>
            </TouchableOpacity>
            {showMap && (
              <View style={styles.mapContainer}>
                <MapView
                  provider={PROVIDER_DEFAULT}
                  style={styles.map}
                  initialRegion={{
                    latitude: pickupCoords.latitude,
                    longitude: pickupCoords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  onPress={(e: any) => {
                    if (e?.nativeEvent?.coordinate) {
                      setPickupCoords(e.nativeEvent.coordinate);
                    }
                  }}
                >
                  <Marker coordinate={pickupCoords} title="Pickup Location" />
                </MapView>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Destination (Optional)</Text>
            <View style={styles.inputContainer}>
              <MapPin size={16} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Enter destination address"
                placeholderTextColor={Colors.textTertiary}
                value={destinationAddress}
                onChangeText={setDestinationAddress}
              />
            </View>
          </View>

          <View style={styles.priceBreakdown}>
            <Text style={styles.breakdownTitle}>Price Breakdown</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>
                Base rate ({duration}h × {numberOfProtectors} protector{numberOfProtectors > 1 ? 's' : ''})
              </Text>
              <Text style={styles.breakdownValue}>${(baseRate * duration * numberOfProtectors).toFixed(2)}</Text>
            </View>
            {vehicleType === 'armored' && (
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Armored vehicle (+50%)</Text>
                <Text style={styles.breakdownValue}>
                  +${((baseRate * duration * numberOfProtectors * 0.5)).toFixed(2)}
                </Text>
              </View>
            )}
            {protectionType === 'armed' && (
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Armed protection (+30%)</Text>
                <Text style={styles.breakdownValue}>
                  +${((baseRate * duration * numberOfProtectors * vehicleMultiplier * 0.3)).toFixed(2)}
                </Text>
              </View>
            )}
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Processing fee</Text>
              <Text style={styles.breakdownValue}>{paymentService.formatMXN(breakdown.processingFee)}</Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownTotal}>Total</Text>
              <Text style={styles.breakdownTotalValue}>{paymentService.formatMXN(breakdown.total)}</Text>
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={styles.footerLabel}>Total</Text>
          <Text style={styles.footerValue}>{paymentService.formatMXN(breakdown.total)}</Text>
        </View>
        <TouchableOpacity style={styles.confirmButton} onPress={handleBooking}>
          <CreditCard size={20} color={Colors.background} />
          <Text style={styles.confirmButtonText}>Proceed to Payment</Text>
        </TouchableOpacity>
      </View>

      <PaymentSheet
        visible={showPayment}
        amount={breakdown.total}
        breakdown={breakdown}
        customerId={user?.braintreeCustomerId}
        onSuccess={handlePaymentSuccess}
        onCancel={() => setShowPayment(false)}
      />
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
  guardInfo: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guardName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  guardRate: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionButtonActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  optionTextActive: {
    color: Colors.background,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionTextSmall: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textTransform: 'capitalize' as const,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  counterButton: {
    width: 48,
    height: 48,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  counterButtonText: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  counterValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    minWidth: 40,
    textAlign: 'center' as const,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  inputText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  mapToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 12,
  },
  mapToggleText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.gold,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  map: {
    width: '100%',
    height: '100%',
  },

  priceBreakdown: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
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
    alignItems: 'center',
    marginBottom: 12,
  },
  breakdownLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  breakdownTotal: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  breakdownTotalValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  bottomPadding: {
    height: 100,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerLeft: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  footerValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.gold,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.background,
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

});
