import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Shield,
  Star,
  MapPin,
  DollarSign,
  Languages,
  Award,
  Briefcase,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { bookingService } from '@/services/bookingService';
import { searchService } from '@/services/searchService';
import { mockGuards } from '@/mocks/guards';
import type { Booking, Guard } from '@/types';

export default function SelectGuardScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [availableGuards, setAvailableGuards] = useState<Guard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selecting, setSelecting] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      if (!bookingId) return;

      try {
        setLoading(true);
        const bookingData = await bookingService.getBookingById(bookingId);
        setBooking(bookingData);

        if (bookingData) {
          const results = searchService.searchGuards(
            mockGuards,
            {
              availability: true,
              sortBy: 'rating',
            },
            {
              latitude: bookingData.pickupLatitude,
              longitude: bookingData.pickupLongitude,
            }
          );

          setAvailableGuards(results.map(r => r.guard));
        }
      } catch (error) {
        console.error('[SelectGuard] Error loading:', error);
        Alert.alert('Error', 'Failed to load available guards');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [bookingId]);

  const handleSelectGuard = async (guard: Guard) => {
    if (!booking || selecting) return;

    Alert.alert(
      'Select Guard',
      `Send booking request to ${guard.firstName} ${guard.lastName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Request',
          onPress: async () => {
            try {
              setSelecting(true);
              await bookingService.reassignGuard(booking.id, guard.id);
              Alert.alert(
                'Request Sent',
                `Your booking request has been sent to ${guard.firstName}. You'll be notified when they respond.`,
                [
                  {
                    text: 'OK',
                    onPress: () => router.replace('/bookings' as any),
                  },
                ]
              );
            } catch (error) {
              console.error('[SelectGuard] Error selecting guard:', error);
              Alert.alert('Error', 'Failed to send request. Please try again.');
            } finally {
              setSelecting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.gold} />
          <Text style={styles.loadingText}>Finding available guards...</Text>
        </View>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centerContainer}>
          <Shield size={64} color={Colors.textTertiary} />
          <Text style={styles.errorText}>Booking not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Guard</Text>
        <View style={styles.headerSpacer} />
      </View>

      {booking.status === 'rejected' && booking.rejectionReason && (
        <View style={styles.rejectionBanner}>
          <Text style={styles.rejectionTitle}>Previous guard declined</Text>
          <Text style={styles.rejectionReason}>{booking.rejectionReason}</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 16 }]}
      >
        {availableGuards.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Shield size={64} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No guards available</Text>
            <Text style={styles.emptySubtext}>
              Please try again later or adjust your booking details
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              {availableGuards.length} Available Guard{availableGuards.length !== 1 ? 's' : ''}
            </Text>

            {availableGuards.map((guard) => (
              <TouchableOpacity
                key={guard.id}
                style={styles.guardCard}
                onPress={() => handleSelectGuard(guard)}
                disabled={selecting}
              >
                <Image source={{ uri: guard.photos[0] }} style={styles.guardPhoto} />

                <View style={styles.guardInfo}>
                  <View style={styles.guardHeader}>
                    <Text style={styles.guardName}>
                      {guard.firstName} {guard.lastName.charAt(0)}.
                    </Text>
                    <View style={styles.ratingBadge}>
                      <Star size={14} color={Colors.gold} fill={Colors.gold} />
                      <Text style={styles.ratingText}>{guard.rating.toFixed(1)}</Text>
                    </View>
                  </View>

                  <View style={styles.guardStats}>
                    <View style={styles.statItem}>
                      <Briefcase size={14} color={Colors.textSecondary} />
                      <Text style={styles.statText}>{guard.completedJobs} jobs</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Languages size={14} color={Colors.textSecondary} />
                      <Text style={styles.statText}>
                        {guard.languages.map(l => l.toUpperCase()).join(', ')}
                      </Text>
                    </View>
                  </View>

                  {guard.certifications.length > 0 && (
                    <View style={styles.certifications}>
                      <Award size={14} color={Colors.gold} />
                      <Text style={styles.certificationsText} numberOfLines={1}>
                        {guard.certifications.slice(0, 2).join(' • ')}
                      </Text>
                    </View>
                  )}

                  <View style={styles.guardFooter}>
                    <View style={styles.priceContainer}>
                      <DollarSign size={16} color={Colors.gold} />
                      <Text style={styles.priceText}>${guard.hourlyRate}/hr</Text>
                    </View>
                    <View style={styles.selectButton}>
                      <Text style={styles.selectButtonText}>Select</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
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
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginTop: 16,
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
  rejectionBanner: {
    backgroundColor: Colors.error + '20',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.error + '40',
  },
  rejectionTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.error,
    marginBottom: 4,
  },
  rejectionReason: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 16,
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
    textAlign: 'center' as const,
  },
  guardCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guardPhoto: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: Colors.surfaceLight,
  },
  guardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  guardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  guardName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.gold + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  guardStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  certifications: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  certificationsText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  guardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  selectButton: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.background,
  },
});
