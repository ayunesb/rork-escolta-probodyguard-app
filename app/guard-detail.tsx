import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  Star,
  Languages,
  Award,
  Shield,
  Car,
  ChevronLeft,
  ChevronDown,
} from 'lucide-react-native';
import { mockGuards } from '@/mocks/guards';
import Colors from '@/constants/colors';
import type { VehicleType, ProtectionType, DressCode } from '@/types';
import * as Location from 'expo-location';

const TIME_OPTIONS = [
  '12:00 AM', '12:30 AM', '01:00 AM', '01:30 AM', '02:00 AM', '02:30 AM',
  '03:00 AM', '03:30 AM', '04:00 AM', '04:30 AM', '05:00 AM', '05:30 AM',
  '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM',
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM',
  '09:00 PM', '09:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM',
];

const generateDateOptions = () => {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const year = date.getFullYear();
    
    let label = '';
    if (i === 0) {
      label = `Today, ${monthDay} ${year}`;
    } else if (i === 1) {
      label = `Tomorrow, ${monthDay} ${year}`;
    } else {
      label = `${dayName}, ${monthDay} ${year}`;
    }
    
    dates.push(label);
  }
  
  return dates;
};

const DATE_OPTIONS = generateDateOptions();

export default function GuardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const guard = mockGuards.find(g => g.id === id);
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState('4');
  const [vehicleType, setVehicleType] = useState<VehicleType>('standard');
  const [protectionType, setProtectionType] = useState<ProtectionType>('unarmed');
  const [dressCode, setDressCode] = useState<DressCode>('suit');
  const [numberOfProtectees, setNumberOfProtectees] = useState('1');
  const [pickupAddress, setPickupAddress] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    loadCurrentLocation();
  }, []);

  const loadCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address) {
        const fullAddress = [
          address.streetNumber,
          address.street,
          address.city,
          address.region,
          address.postalCode,
        ].filter(Boolean).join(', ');
        
        setPickupAddress(fullAddress);
      }
    } catch (error) {
      console.error('Error loading location:', error);
    } finally {
      setLoadingLocation(false);
    }
  };

  if (!guard) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Guard not found</Text>
      </View>
    );
  }

  const calculateQuote = () => {
    const hours = parseInt(duration) || 0;
    const baseRate = guard.hourlyRate * hours;
    const vehicleSurcharge = vehicleType === 'armored' ? baseRate * 0.3 : 0;
    const armedSurcharge = protectionType === 'armed' ? baseRate * 0.2 : 0;
    return Math.round(baseRate + vehicleSurcharge + armedSurcharge);
  };

  const handleBookNow = () => {
    if (!selectedDate || !selectedTime || !pickupAddress) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    const quote = calculateQuote();
    router.push({
      pathname: '/booking-payment',
      params: {
        guardId: guard.id,
        guardName: `${guard.firstName} ${guard.lastName}`,
        guardPhoto: guard.photos[0],
        date: selectedDate,
        time: selectedTime,
        duration,
        vehicleType,
        protectionType,
        dressCode,
        numberOfProtectees,
        pickupAddress,
        totalAmount: quote.toString(),
      },
    } as any);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.imageContainer, { paddingTop: insets.top }]}>
        <Image source={{ uri: guard.photos[0] }} style={styles.heroImage} />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.name}>{guard.firstName} {guard.lastName.charAt(0)}.</Text>
            <View style={styles.ratingRowHeader}>
              <Star size={16} color={Colors.gold} fill={Colors.gold} />
              <Text style={styles.ratingText}>{guard.rating.toFixed(1)}</Text>
              <Text style={styles.jobsText}>({guard.completedJobs} jobs)</Text>
            </View>
          </View>
          <View style={styles.verifiedBadge}>
            <Shield size={18} color={Colors.gold} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        </View>

        <Text style={styles.bio}>{guard.bio}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{guard.height} cm</Text>
            <Text style={styles.statLabel}>Height</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{guard.weight} kg</Text>
            <Text style={styles.statLabel}>Weight</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>${guard.hourlyRate} MXN</Text>
            <Text style={styles.statLabel}>Per Hour</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Languages</Text>
          <View style={styles.languageRow}>
            <Languages size={16} color={Colors.textSecondary} />
            <Text style={styles.languageText}>
              {guard.languages.map(l => l.toUpperCase()).join(', ')}
            </Text>
          </View>
        </View>

        {guard.ratingBreakdown && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rating Breakdown</Text>
            <View style={styles.ratingBreakdownCard}>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Professionalism</Text>
                <View style={styles.ratingStars}>
                  <Star size={14} color={Colors.gold} fill={Colors.gold} />
                  <Text style={styles.ratingValue}>{guard.ratingBreakdown.professionalism.toFixed(1)}</Text>
                </View>
              </View>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Punctuality</Text>
                <View style={styles.ratingStars}>
                  <Star size={14} color={Colors.gold} fill={Colors.gold} />
                  <Text style={styles.ratingValue}>{guard.ratingBreakdown.punctuality.toFixed(1)}</Text>
                </View>
              </View>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Communication</Text>
                <View style={styles.ratingStars}>
                  <Star size={14} color={Colors.gold} fill={Colors.gold} />
                  <Text style={styles.ratingValue}>{guard.ratingBreakdown.communication.toFixed(1)}</Text>
                </View>
              </View>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Language Clarity</Text>
                <View style={styles.ratingStars}>
                  <Star size={14} color={Colors.gold} fill={Colors.gold} />
                  <Text style={styles.ratingValue}>{guard.ratingBreakdown.languageClarity.toFixed(1)}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          <View style={styles.certGrid}>
            {guard.certifications.map((cert, idx) => (
              <View key={idx} style={styles.certBadge}>
                <Award size={14} color={Colors.gold} />
                <Text style={styles.certText}>{cert}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.bookingTitle}>Book Protection Service</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date *</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <View style={styles.inputRow}>
              <Text style={[styles.inputText, !selectedDate && styles.placeholderText]}>
                {selectedDate || 'Select date'}
              </Text>
              <ChevronDown size={20} color={Colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Time *</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowTimePicker(true)}
          >
            <View style={styles.inputRow}>
              <Text style={[styles.inputText, !selectedTime && styles.placeholderText]}>
                {selectedTime || 'Select time'}
              </Text>
              <ChevronDown size={20} color={Colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Duration (hours)</Text>
          <TextInput
            style={styles.input}
            value={duration}
            onChangeText={setDuration}
            placeholder="4"
            keyboardType="numeric"
            placeholderTextColor={Colors.textTertiary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Vehicle Type</Text>
          <View style={styles.optionRow}>
            <TouchableOpacity
              style={[styles.optionButton, vehicleType === 'standard' && styles.optionButtonActive]}
              onPress={() => setVehicleType('standard')}
            >
              <Car size={16} color={vehicleType === 'standard' ? Colors.background : Colors.textSecondary} />
              <Text style={[styles.optionText, vehicleType === 'standard' && styles.optionTextActive]}>
                Standard
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, vehicleType === 'armored' && styles.optionButtonActive]}
              onPress={() => setVehicleType('armored')}
            >
              <Shield size={16} color={vehicleType === 'armored' ? Colors.background : Colors.textSecondary} />
              <Text style={[styles.optionText, vehicleType === 'armored' && styles.optionTextActive]}>
                Armored (+30%)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Protection Type</Text>
          <View style={styles.optionRow}>
            <TouchableOpacity
              style={[styles.optionButton, protectionType === 'unarmed' && styles.optionButtonActive]}
              onPress={() => setProtectionType('unarmed')}
            >
              <Text style={[styles.optionText, protectionType === 'unarmed' && styles.optionTextActive]}>
                Unarmed
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, protectionType === 'armed' && styles.optionButtonActive]}
              onPress={() => setProtectionType('armed')}
            >
              <Shield size={16} color={protectionType === 'armed' ? Colors.background : Colors.textSecondary} />
              <Text style={[styles.optionText, protectionType === 'armed' && styles.optionTextActive]}>
                Armed (+20%)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dress Code</Text>
          <View style={styles.optionRow}>
            {(['suit', 'business_casual', 'tactical', 'casual'] as DressCode[]).map((code) => (
              <TouchableOpacity
                key={code}
                style={[styles.smallOptionButton, dressCode === code && styles.optionButtonActive]}
                onPress={() => setDressCode(code)}
              >
                <Text style={[styles.smallOptionText, dressCode === code && styles.optionTextActive]}>
                  {code.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Number of Protectees</Text>
          <TextInput
            style={styles.input}
            value={numberOfProtectees}
            onChangeText={setNumberOfProtectees}
            placeholder="1"
            keyboardType="numeric"
            placeholderTextColor={Colors.textTertiary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Pickup Address *</Text>
          <View style={styles.locationInputContainer}>
            <TextInput
              style={[styles.input, styles.locationInput]}
              value={pickupAddress}
              onChangeText={setPickupAddress}
              placeholder="Enter pickup location"
              placeholderTextColor={Colors.textTertiary}
              multiline
            />
            {loadingLocation && (
              <View style={styles.locationLoader}>
                <ActivityIndicator size="small" color={Colors.gold} />
              </View>
            )}
          </View>
        </View>

        <View style={styles.quoteCard}>
          <Text style={styles.quoteLabel}>Estimated Total</Text>
          <Text style={styles.quoteValue}>${calculateQuote()} MXN</Text>
          <Text style={styles.quoteNote}>Final price confirmed after booking</Text>
        </View>

        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
          <Text style={styles.bookButtonText}>Continue to Payment</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDatePicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.modalClose}>Done</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.timeList}>
              {DATE_OPTIONS.map((date) => (
                <TouchableOpacity
                  key={date}
                  style={[
                    styles.timeOption,
                    selectedDate === date && styles.timeOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedDate(date);
                    setShowDatePicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.timeOptionText,
                      selectedDate === date && styles.timeOptionTextSelected,
                    ]}
                  >
                    {date}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showTimePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTimePicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Text style={styles.modalClose}>Done</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.timeList}>
              {TIME_OPTIONS.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeOption,
                    selectedTime === time && styles.timeOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedTime(time);
                    setShowTimePicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.timeOptionText,
                      selectedTime === time && styles.timeOptionTextSelected,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  imageContainer: {
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: 300,
    backgroundColor: Colors.surfaceLight,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  name: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  ratingRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  jobsText: {
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
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  bio: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.gold,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  languageText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  certGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  certBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  certText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 24,
  },
  bookingTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  input: {
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
  optionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
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
  smallOptionButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  smallOptionText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textTransform: 'capitalize' as const,
  },
  quoteCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  quoteLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  quoteValue: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: Colors.gold,
    marginBottom: 4,
  },
  quoteNote: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  bookButton: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center' as const,
    marginTop: 40,
  },
  ratingBreakdownCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  ratingLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingValue: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  placeholderText: {
    color: Colors.textTertiary,
  },
  locationInputContainer: {
    position: 'relative' as const,
  },
  locationInput: {
    paddingRight: 48,
  },
  locationLoader: {
    position: 'absolute' as const,
    right: 16,
    top: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  modalClose: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.gold,
  },
  timeList: {
    maxHeight: 400,
  },
  timeOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  timeOptionSelected: {
    backgroundColor: Colors.gold + '20',
  },
  timeOptionText: {
    fontSize: 16,
    color: Colors.textPrimary,
    textAlign: 'center' as const,
  },
  timeOptionTextSelected: {
    fontWeight: '700' as const,
    color: Colors.gold,
  },
});
