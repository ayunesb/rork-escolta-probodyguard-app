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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Shield,
  Star,
  ChevronLeft,
  Plus,
} from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function BookingActiveScreen() {
  const params = useLocalSearchParams<{
    bookingId: string;
    guardId: string;
    guardName: string;
    guardPhoto: string;
    startCode: string;
    date: string;
    time: string;
    duration: string;
    pickupAddress: string;
  }>();
  
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [status, setStatus] = useState<'assigned' | 'en_route' | 'active' | 'completed'>('assigned');
  const [enteredCode, setEnteredCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(parseInt(params.duration) * 60);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [extensionHours, setExtensionHours] = useState('1');

  useEffect(() => {
    if (status === 'active') {
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 60000);
      
      return () => clearInterval(interval);
    }
  }, [status]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleStartService = () => {
    if (enteredCode === params.startCode) {
      setStatus('active');
      setShowCodeInput(false);
      Alert.alert('Service Started', 'Your protection service is now active');
    } else {
      Alert.alert('Invalid Code', 'Please check the code and try again');
    }
  };

  const handleCompleteService = () => {
    Alert.alert(
      'Complete Service',
      'Are you sure you want to end this protection service?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => {
            router.replace({
              pathname: '/booking-rating',
              params: {
                bookingId: params.bookingId,
                guardId: params.guardId,
                guardName: params.guardName,
                guardPhoto: params.guardPhoto,
              },
            } as any);
          },
        },
      ]
    );
  };

  const getStatusColor = () => {
    switch (status) {
      case 'assigned': return Colors.warning;
      case 'en_route': return Colors.info;
      case 'active': return Colors.success;
      case 'completed': return Colors.textSecondary;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'assigned': return 'Guard Assigned';
      case 'en_route': return 'Guard En Route';
      case 'active': return 'Service Active';
      case 'completed': return 'Service Completed';
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Active Booking</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.statusBanner, { backgroundColor: getStatusColor() + '20' }]}>
          <Shield size={24} color={getStatusColor()} />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>

        <View style={styles.guardCard}>
          <Image source={{ uri: params.guardPhoto }} style={styles.guardImage} />
          <View style={styles.guardInfo}>
            <Text style={styles.guardName}>{params.guardName}</Text>
            <Text style={styles.guardRole}>Executive Protection Specialist</Text>
            <View style={styles.ratingRow}>
              <Star size={14} color={Colors.gold} fill={Colors.gold} />
              <Text style={styles.ratingText}>4.9</Text>
            </View>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.iconButton}>
              <Phone size={20} color={Colors.gold} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                router.push({
                  pathname: '/booking-chat',
                  params: {
                    bookingId: params.bookingId,
                    guardName: params.guardName,
                  },
                } as any);
              }}
            >
              <MessageCircle size={20} color={Colors.gold} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Clock size={18} color={Colors.textSecondary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Scheduled Time</Text>
              <Text style={styles.detailValue}>{params.date} at {params.time}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <MapPin size={18} color={Colors.textSecondary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Pickup Location</Text>
              <Text style={styles.detailValue}>{params.pickupAddress}</Text>
            </View>
          </View>

          {status === 'active' && (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Clock size={18} color={Colors.gold} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Time Remaining</Text>
                  <Text style={[styles.detailValue, { color: Colors.gold }]}>
                    {formatTime(timeRemaining)}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {status === 'assigned' && !showCodeInput && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setShowCodeInput(true)}
          >
            <Text style={styles.primaryButtonText}>Start Service</Text>
          </TouchableOpacity>
        )}

        {showCodeInput && (
          <View style={styles.codeCard}>
            <Text style={styles.codeTitle}>Enter Start Code</Text>
            <Text style={styles.codeDescription}>
              Ask your guard for the 6-digit start code
            </Text>
            <TextInput
              style={styles.codeInput}
              value={enteredCode}
              onChangeText={setEnteredCode}
              placeholder="000000"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="numeric"
              maxLength={6}
            />
            <TouchableOpacity style={styles.primaryButton} onPress={handleStartService}>
              <Text style={styles.primaryButtonText}>Verify & Start</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'active' && (
          <>
            {!showExtensionModal && (
              <TouchableOpacity
                style={styles.extendButton}
                onPress={() => setShowExtensionModal(true)}
              >
                <Clock size={20} color={Colors.gold} />
                <Text style={styles.extendButtonText}>Extend Service</Text>
              </TouchableOpacity>
            )}

            {showExtensionModal && (
              <View style={styles.extensionCard}>
                <Text style={styles.extensionTitle}>Extend Service</Text>
                <Text style={styles.extensionDescription}>
                  Add additional hours to your protection service
                </Text>
                <View style={styles.extensionInputRow}>
                  <TextInput
                    style={styles.extensionInput}
                    value={extensionHours}
                    onChangeText={setExtensionHours}
                    placeholder="Hours"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="numeric"
                  />
                  <Text style={styles.extensionCost}>
                    +${parseInt(extensionHours || '0') * 150}
                  </Text>
                </View>
                <View style={styles.extensionButtons}>
                  <TouchableOpacity
                    style={styles.extensionCancelButton}
                    onPress={() => setShowExtensionModal(false)}
                  >
                    <Text style={styles.extensionCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.extensionConfirmButton}
                    onPress={() => {
                      const hours = parseInt(extensionHours || '0');
                      if (hours > 0) {
                        setTimeRemaining(prev => prev + hours * 60);
                        setShowExtensionModal(false);
                        Alert.alert('Service Extended', `Added ${hours} hour(s) to your service`);
                      }
                    }}
                  >
                    <Plus size={16} color={Colors.background} />
                    <Text style={styles.extensionConfirmText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.completeButton} onPress={handleCompleteService}>
              <Text style={styles.completeButtonText}>Complete Service</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Booking ID</Text>
          <Text style={styles.infoValue}>#{params.bookingId.slice(0, 12)}</Text>
        </View>
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
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  guardCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guardImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: Colors.surfaceLight,
  },
  guardInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  guardName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  guardRole: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  actionButtons: {
    justifyContent: 'center',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '600' as const,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  codeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  codeTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  codeDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center' as const,
  },
  codeInput: {
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.gold,
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    textAlign: 'center' as const,
    letterSpacing: 8,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  extendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.gold,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  extendButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  completeButton: {
    backgroundColor: Colors.success,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  extensionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  extensionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  extensionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  extensionInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  extensionInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  extensionCost: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  extensionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  extensionCancelButton: {
    flex: 1,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  extensionCancelText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  extensionConfirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.gold,
    borderRadius: 12,
    padding: 14,
  },
  extensionConfirmText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.background,
  },
});
