import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Shield, Star, MapPin, Languages, Award, ChevronRight, Map as MapIcon, List, Calendar, Clock, DollarSign } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { mockGuards } from '@/mocks/guards';
import { bookingService } from '@/services/bookingService';
import { Booking } from '@/types';
import Colors from '@/constants/colors';
import MapView, { Marker, PROVIDER_DEFAULT } from '@/components/MapView';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'armed' | 'unarmed'>('all');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  const availableGuards = mockGuards.filter(g => g.availability);

  useEffect(() => {
    if (!user || user.role !== 'guard') return;

    console.log('[Home] Setting up Firebase listener for guard:', user.id);
    setIsLoadingJobs(true);

    const unsubscribe = bookingService.subscribeToGuardBookings(user.id, (bookings) => {
      const pending = bookings.filter(b => b.status === 'pending');
      console.log('[Home] Firebase update - pending jobs:', pending.length);
      setPendingBookings(pending);
      setIsLoadingJobs(false);
    });

    return () => {
      console.log('[Home] Cleaning up Firebase listener');
      unsubscribe();
    };
  }, [user]);
  
  const centerLocation = {
    latitude: 40.7580,
    longitude: -73.9855,
  };

  if (user?.role === 'guard') {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        
        <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
          <Text style={styles.title}>Available Jobs</Text>
          <Text style={styles.subtitle}>
            {isLoadingJobs ? 'Loading...' : `${pendingBookings.length} job${pendingBookings.length !== 1 ? 's' : ''} available`}
          </Text>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {isLoadingJobs ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.gold} />
              <Text style={styles.loadingText}>Loading available jobs...</Text>
            </View>
          ) : pendingBookings.length === 0 ? (
            <View style={styles.emptyState}>
              <Shield size={64} color={Colors.textTertiary} />
              <Text style={styles.emptyText}>No jobs available</Text>
              <Text style={styles.emptySubtext}>
                Check back soon for new protection assignments
              </Text>
            </View>
          ) : (
            pendingBookings.map((booking) => (
              <TouchableOpacity
                key={booking.id}
                style={styles.jobCard}
                onPress={() => router.push(`/booking/${booking.id}` as any)}
                accessible={true}
                accessibilityLabel={`New job ${booking.id.slice(0, 8)}, ${booking.duration} hours, payout ${booking.guardPayout}`}
                accessibilityHint="Double tap to view job details and accept or reject"
                accessibilityRole="button"
              >
                <View style={styles.jobHeader}>
                  <View style={styles.jobBadge}>
                    <Text style={styles.jobBadgeText}>NEW JOB</Text>
                  </View>
                  <Text style={styles.jobId}>#{booking.id.slice(0, 8)}</Text>
                </View>

                <View style={styles.jobDetail}>
                  <Calendar size={16} color={Colors.textSecondary} />
                  <Text style={styles.jobDetailText}>
                    {booking.scheduledDate} at {booking.scheduledTime}
                  </Text>
                </View>

                <View style={styles.jobDetail}>
                  <MapPin size={16} color={Colors.textSecondary} />
                  <Text style={styles.jobDetailText} numberOfLines={1}>
                    {booking.pickupAddress}
                  </Text>
                </View>

                <View style={styles.jobDetail}>
                  <Clock size={16} color={Colors.textSecondary} />
                  <Text style={styles.jobDetailText}>
                    {booking.duration} hours • {booking.protectionType} • {booking.vehicleType}
                  </Text>
                </View>

                <View style={styles.jobFooter}>
                  <View style={styles.jobDetail}>
                    <DollarSign size={16} color={Colors.gold} />
                    <Text style={styles.jobPayout}>${booking.guardPayout}</Text>
                  </View>
                  <View style={styles.jobActions}>
                    <TouchableOpacity
                      style={styles.viewButton}
                      onPress={() => router.push(`/booking/${booking.id}` as any)}
                    >
                      <Text style={styles.viewButtonText}>View Details</Text>
                      <ChevronRight size={16} color={Colors.gold} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Book Protection</Text>
            <Text style={styles.subtitle}>Elite security professionals at your service</Text>
          </View>
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.viewToggleButton, viewMode === 'map' && styles.viewToggleButtonActive]}
              onPress={() => setViewMode('map')}
              accessible={true}
              accessibilityLabel="Map view"
              accessibilityHint="Switch to map view to see guard locations"
              accessibilityRole="button"
              accessibilityState={{ selected: viewMode === 'map' }}
            >
              <MapIcon size={18} color={viewMode === 'map' ? Colors.background : Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewToggleButton, viewMode === 'list' && styles.viewToggleButtonActive]}
              onPress={() => setViewMode('list')}
              accessible={true}
              accessibilityLabel="List view"
              accessibilityHint="Switch to list view to see guard details"
              accessibilityRole="button"
              accessibilityState={{ selected: viewMode === 'list' }}
            >
              <List size={18} color={viewMode === 'list' ? Colors.background : Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>
              All Protectors
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'armed' && styles.filterButtonActive]}
            onPress={() => setSelectedFilter('armed')}
          >
            <Shield size={16} color={selectedFilter === 'armed' ? Colors.background : Colors.textSecondary} />
            <Text style={[styles.filterText, selectedFilter === 'armed' && styles.filterTextActive]}>
              Armed
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'unarmed' && styles.filterButtonActive]}
            onPress={() => setSelectedFilter('unarmed')}
          >
            <Text style={[styles.filterText, selectedFilter === 'unarmed' && styles.filterTextActive]}>
              Unarmed
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {viewMode === 'map' ? (
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_DEFAULT}
            style={styles.map}
            initialRegion={{
              latitude: centerLocation.latitude,
              longitude: centerLocation.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            showsUserLocation={true}
          >
            {availableGuards.map((guard) => (
              <Marker
                key={guard.id}
                coordinate={{
                  latitude: guard.latitude || centerLocation.latitude,
                  longitude: guard.longitude || centerLocation.longitude,
                }}
                onPress={() => router.push(`/guard/${guard.id}`)}
              >
                <View style={styles.guardMarker}>
                  <Shield size={20} color={Colors.gold} />
                </View>
              </Marker>
            ))}
          </MapView>
          
          <View style={styles.mapOverlay}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.guardCardsHorizontal}
            >
              {availableGuards.map((guard) => (
                <TouchableOpacity
                  key={guard.id}
                  style={styles.guardCardCompact}
                  onPress={() => router.push(`/guard/${guard.id}`)}
                >
                  <Image source={{ uri: guard.photos[0] }} style={styles.guardImageCompact} />
                  <View style={styles.guardInfoCompact}>
                    <Text style={styles.guardNameCompact}>
                      {guard.firstName} {guard.lastName.charAt(0)}.
                    </Text>
                    <View style={styles.ratingRowCompact}>
                      <Star size={12} color={Colors.gold} fill={Colors.gold} />
                      <Text style={styles.ratingTextCompact}>{guard.rating.toFixed(1)}</Text>
                    </View>
                    <Text style={styles.rateValueCompact}>${guard.hourlyRate}/hr</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{availableGuards.length}</Text>
            <Text style={styles.statLabel}>Available Now</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>4.9</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>726</Text>
            <Text style={styles.statLabel}>Jobs Completed</Text>
          </View>
        </View>

        {availableGuards.map((guard) => (
          <TouchableOpacity 
            key={guard.id} 
            style={styles.guardCard}
            onPress={() => router.push(`/guard/${guard.id}`)}
            accessible={true}
            accessibilityLabel={`${guard.firstName} ${guard.lastName.charAt(0)}, rated ${guard.rating.toFixed(1)} stars, ${guard.hourlyRate} per hour`}
            accessibilityHint="Double tap to view guard profile and book protection"
            accessibilityRole="button"
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
                  <MapPin size={14} color={Colors.textSecondary} />
                  <Text style={styles.detailText}>2.3 mi away</Text>
                </View>
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
                  <Text style={styles.rateLabel}>Starting at</Text>
                  <Text style={styles.rateValue}>${guard.hourlyRate}/hr</Text>
                </View>
                <TouchableOpacity 
                  style={styles.bookButton}
                  onPress={() => router.push(`/guard/${guard.id}`)}
                  accessible={true}
                  accessibilityLabel="Book now"
                  accessibilityHint="Double tap to start booking this guard"
                  accessibilityRole="button"
                >
                  <Text style={styles.bookButtonText}>Book Now</Text>
                  <ChevronRight size={16} color={Colors.background} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  viewToggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewToggleButtonActive: {
    backgroundColor: Colors.gold,
  },
  filterContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filters: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.gold,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 12,
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
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.gold,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 20,
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
  },
  jobCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobBadge: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  jobBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  jobId: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '600' as const,
  },
  jobDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  jobDetailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  jobPayout: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  jobActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  mapContainer: {
    flex: 1,
    position: 'relative' as const,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  guardMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 3,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  mapOverlay: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  guardCardsHorizontal: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  guardCardCompact: {
    width: width * 0.7,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  guardImageCompact: {
    width: 100,
    height: 120,
    backgroundColor: Colors.surfaceLight,
  },
  guardInfoCompact: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  guardNameCompact: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  ratingRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  ratingTextCompact: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  rateValueCompact: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
});
