import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Calendar, MapPin, Shield, Users, Clock, Car, Shirt, ChevronRight, Star, Award, Languages, ChevronDown } from 'lucide-react-native';
import * as Location from 'expo-location';
import Colors from '@/constants/colors';
import { mockGuards } from '@/mocks/guards';
import { VehicleType, ProtectionType, DressCode } from '@/types';

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

export default function BookingCreateScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'details' | 'guards'>(Platform.OS === 'web' ? 'details' : 'details');
  
  const [vehicleType, setVehicleType] = useState<VehicleType>('standard');
  const [protectionType, setProtectionType] = useState<ProtectionType>('unarmed');
  const [dressCode, setDressCode] = useState<DressCode>('suit');
  const [numberOfProtectors, setNumberOfProtectors] = useState(1);
  const [numberOfProtectees, setNumberOfProtectees] = useState(1);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [duration, setDuration] = useState('4');
  const [pickupAddress, setPickupAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [city, setCity] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const availableGuards = mockGuards.filter(g => g.availability);

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
        if (address.city && address.region) {
          setCity(`${address.city}, ${address.region}`);
        }
      }
    } catch (error) {
      console.error('Error loading location:', error);
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleContinue = () => {
    if (!scheduledDate || !scheduledTime || !pickupAddress || !city) {
      alert('Please fill in all required fields');
      return;
    }
    setStep('guards');
  };

  const handleSelectGuard = (guardId: string) => {
    router.push({ pathname: '/guard-detail', params: { id: guardId, booking: 'true' } } as any);
  };

  if (step === 'guards') {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Available Guards',
            headerStyle: { backgroundColor: Colors.background },
            headerTintColor: Colors.textPrimary,
            headerShadowVisible: false,
          }}
        />

        <View style={styles.summaryBar}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Date</Text>
            <Text style={styles.summaryValue}>{scheduledDate}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Time</Text>
            <Text style={styles.summaryValue}>{scheduledTime}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <Text style={styles.summaryValue}>{duration}h</Text>
          </View>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <View style={styles.infoCard}>
            <MapPin size={20} color={Colors.gold} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>{city}</Text>
              <Text style={styles.infoText}>{pickupAddress}</Text>
              {destinationAddress && (
                <Text style={styles.infoText}>→ {destinationAddress}</Text>
              )}
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Guards</Text>
            <Text style={styles.sectionSubtitle}>
              {availableGuards.length} protectors match your criteria
            </Text>
          </View>

          {availableGuards.map((guard) => (
            <TouchableOpacity
              key={guard.id}
              style={styles.guardCard}
              onPress={() => handleSelectGuard(guard.id)}
            >
              <Image source={{ uri: guard.photos[0] }} style={styles.guardImage} />
              
              <View style={styles.guardInfo}>
                <View style={styles.guardHeader}>
                  <View>
                    <Text style={styles.guardName}>{guard.firstName} {guard.lastName.charAt(0)}.</Text>
                    <View style={styles.ratingRow}>
                      <Star size={14} color={Colors.gold} fill={Colors.gold} />
                      <Text style={styles.ratingText}>{guard.rating.toFixed(1)}</Text>
                      <Text style={styles.jobsText}>({guard.completedJobs} jobs)</Text>
                    </View>
                  </View>
                  <View style={styles.verifiedBadge}>
                    <Shield size={16} color={Colors.gold} />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                </View>

                <Text style={styles.guardBio} numberOfLines={2}>{guard.bio}</Text>

                <View style={styles.guardDetails}>
                  <View style={styles.detailItem}>
                    <Languages size={14} color={Colors.textSecondary} />
                    <Text style={styles.detailText}>
                      {guard.languages.map(l => l.toUpperCase()).join(', ')}
                    </Text>
                  </View>
                </View>

                <View style={styles.certifications}>
                  {guard.certifications.slice(0, 2).map((cert, idx) => (
                    <View key={idx} style={styles.certBadge}>
                      <Award size={12} color={Colors.gold} />
                      <Text style={styles.certText}>{cert}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.guardFooter}>
                  <View>
                    <Text style={styles.rateLabel}>Total Cost</Text>
                    <Text style={styles.rateValue}>${guard.hourlyRate * parseInt(duration)} MXN</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => handleSelectGuard(guard.id)}
                  >
                    <Text style={styles.selectButtonText}>Select</Text>
                    <ChevronRight size={16} color={Colors.background} />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Schedule Protection',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.textPrimary,
          headerShadowVisible: false,
        }}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={Colors.gold} />
            <Text style={styles.sectionTitle}>When & Where</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date *</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.inputRow}>
                <Text style={[styles.inputText, !scheduledDate && styles.placeholderText]}>
                  {scheduledDate || 'Select date'}
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
                <Text style={[styles.inputText, !scheduledTime && styles.placeholderText]}>
                  {scheduledTime || 'Select time'}
                </Text>
                <ChevronDown size={20} color={Colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Duration (hours) *</Text>
            <TextInput
              style={styles.input}
              placeholder="4"
              placeholderTextColor={Colors.textTertiary}
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={styles.input}
              placeholder="New York, NY"
              placeholderTextColor={Colors.textTertiary}
              value={city}
              onChangeText={setCity}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pickup Address *</Text>
            <View style={styles.locationInputContainer}>
              <TextInput
                style={[styles.input, styles.locationInput]}
                placeholder="123 Main St, New York, NY 10001"
                placeholderTextColor={Colors.textTertiary}
                value={pickupAddress}
                onChangeText={setPickupAddress}
                multiline
              />
              {loadingLocation && (
                <View style={styles.locationLoader}>
                  <ActivityIndicator size="small" color={Colors.gold} />
                </View>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Destination Address (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="456 Park Ave, New York, NY 10022"
              placeholderTextColor={Colors.textTertiary}
              value={destinationAddress}
              onChangeText={setDestinationAddress}
              multiline
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Car size={20} color={Colors.gold} />
            <Text style={styles.sectionTitle}>Vehicle Type</Text>
          </View>

          <View style={styles.optionRow}>
            <TouchableOpacity
              style={[styles.optionCard, vehicleType === 'standard' && styles.optionCardActive]}
              onPress={() => setVehicleType('standard')}
            >
              <Text style={[styles.optionTitle, vehicleType === 'standard' && styles.optionTitleActive]}>
                Standard
              </Text>
              <Text style={styles.optionSubtitle}>Regular vehicle</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionCard, vehicleType === 'armored' && styles.optionCardActive]}
              onPress={() => setVehicleType('armored')}
            >
              <Text style={[styles.optionTitle, vehicleType === 'armored' && styles.optionTitleActive]}>
                Armored
              </Text>
              <Text style={styles.optionSubtitle}>Enhanced security</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={20} color={Colors.gold} />
            <Text style={styles.sectionTitle}>Protection Type</Text>
          </View>

          <View style={styles.optionRow}>
            <TouchableOpacity
              style={[styles.optionCard, protectionType === 'unarmed' && styles.optionCardActive]}
              onPress={() => setProtectionType('unarmed')}
            >
              <Text style={[styles.optionTitle, protectionType === 'unarmed' && styles.optionTitleActive]}>
                Unarmed
              </Text>
              <Text style={styles.optionSubtitle}>Standard protection</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionCard, protectionType === 'armed' && styles.optionCardActive]}
              onPress={() => setProtectionType('armed')}
            >
              <Text style={[styles.optionTitle, protectionType === 'armed' && styles.optionTitleActive]}>
                Armed
              </Text>
              <Text style={styles.optionSubtitle}>Enhanced security</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shirt size={20} color={Colors.gold} />
            <Text style={styles.sectionTitle}>Dress Code</Text>
          </View>

          <View style={styles.optionGrid}>
            {(['suit', 'business_casual', 'tactical', 'casual'] as DressCode[]).map((code) => (
              <TouchableOpacity
                key={code}
                style={[styles.optionCard, dressCode === code && styles.optionCardActive]}
                onPress={() => setDressCode(code)}
              >
                <Text style={[styles.optionTitle, dressCode === code && styles.optionTitleActive]}>
                  {code.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={20} color={Colors.gold} />
            <Text style={styles.sectionTitle}>Team Size</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Number of Protectors</Text>
            <View style={styles.counterRow}>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => setNumberOfProtectors(Math.max(1, numberOfProtectors - 1))}
              >
                <Text style={styles.counterButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{numberOfProtectors}</Text>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => setNumberOfProtectors(numberOfProtectors + 1)}
              >
                <Text style={styles.counterButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Number of Protectees</Text>
            <View style={styles.counterRow}>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => setNumberOfProtectees(Math.max(1, numberOfProtectees - 1))}
              >
                <Text style={styles.counterButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{numberOfProtectees}</Text>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => setNumberOfProtectees(numberOfProtectees + 1)}
              >
                <Text style={styles.counterButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue to Guards</Text>
          <ChevronRight size={20} color={Colors.background} />
        </TouchableOpacity>
      </View>

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
                    scheduledDate === date && styles.timeOptionSelected,
                  ]}
                  onPress={() => {
                    setScheduledDate(date);
                    setShowDatePicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.timeOptionText,
                      scheduledDate === date && styles.timeOptionTextSelected,
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
                    scheduledTime === time && styles.timeOptionSelected,
                  ]}
                  onPress={() => {
                    setScheduledTime(time);
                    setShowTimePicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.timeOptionText,
                      scheduledTime === time && styles.timeOptionTextSelected,
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
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
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
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
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  optionCardActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  optionTitleActive: {
    color: Colors.background,
  },
  optionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  counterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonText: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: Colors.gold,
  },
  counterValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    minWidth: 40,
    textAlign: 'center' as const,
  },
  footer: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.gold,
    padding: 18,
    borderRadius: 12,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  guardCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guardImage: {
    width: '100%',
    height: 240,
    backgroundColor: Colors.surfaceLight,
  },
  guardInfo: {
    padding: 16,
  },
  guardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  guardName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  jobsText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.gold + '20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  guardBio: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  guardDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: Colors.textSecondary,
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
  guardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  rateLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  rateValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.gold,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: {
    fontSize: 16,
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
