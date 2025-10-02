import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Shield, Star, MapPin, Languages, Award, ChevronRight, UserPlus, TrendingUp, DollarSign, Users, AlertCircle, Map, List, Calendar, Bug } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { mockGuards } from '@/mocks/guards';
import Colors from '@/constants/colors';
import GuardMap from '@/components/GuardMap';
import { GuardCardSkeleton } from '@/components/SkeletonLoader';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'armed' | 'unarmed'>('all');
  const [viewMode, setViewMode] = useState<'map' | 'list'>(Platform.OS === 'web' ? 'list' : 'map');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const availableGuards = mockGuards.filter(g => g.availability);

  const clientLocation = {
    latitude: 40.7580,
    longitude: -73.9855,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  if (user?.role === 'company') {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        
        <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
          <Text style={styles.title}>Guard Roster</Text>
          <Text style={styles.subtitle}>Manage your security team</Text>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Active Guards</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>8</Text>
              <Text style={styles.statLabel}>On Duty</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>24</Text>
              <Text style={styles.statLabel}>Jobs This Month</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.actionCard}>
            <UserPlus size={24} color={Colors.gold} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Add New Guard</Text>
              <Text style={styles.actionSubtitle}>Upload CSV or add manually</Text>
            </View>
            <ChevronRight size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Guards</Text>
          </View>

          {mockGuards.filter(g => !g.isFreelancer).map((guard) => (
            <View key={guard.id} style={styles.rosterCard}>
              <View style={styles.rosterHeader}>
                <Text style={styles.rosterName}>{guard.firstName} {guard.lastName}</Text>
                <View style={[styles.statusDot, { backgroundColor: guard.availability ? Colors.success : Colors.textTertiary }]} />
              </View>
              <View style={styles.rosterDetails}>
                <Text style={styles.rosterText}>Rate: ${guard.hourlyRate}/hr</Text>
                <Text style={styles.rosterText}>Jobs: {guard.completedJobs}</Text>
                <Text style={styles.rosterText}>Rating: {guard.rating.toFixed(1)} ⭐</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (user?.role === 'admin') {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        
        <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Platform oversight & analytics</Text>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>156</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>$24.5k</Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>8</Text>
              <Text style={styles.statLabel}>Pending KYC</Text>
            </View>
          </View>

          <View style={styles.adminGrid}>
            <TouchableOpacity style={styles.adminCard}>
              <Shield size={32} color={Colors.gold} />
              <Text style={styles.adminCardTitle}>KYC Review</Text>
              <Text style={styles.adminCardValue}>8 pending</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.adminCard}>
              <Users size={32} color={Colors.info} />
              <Text style={styles.adminCardTitle}>Users</Text>
              <Text style={styles.adminCardValue}>156 total</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.adminCard}>
              <DollarSign size={32} color={Colors.success} />
              <Text style={styles.adminCardTitle}>Payments</Text>
              <Text style={styles.adminCardValue}>$24.5k</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.adminCard}>
              <TrendingUp size={32} color={Colors.warning} />
              <Text style={styles.adminCardTitle}>Analytics</Text>
              <Text style={styles.adminCardValue}>View all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.alertCard}>
            <AlertCircle size={20} color={Colors.warning} />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Pending Actions</Text>
              <Text style={styles.alertText}>8 KYC documents awaiting review</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (user?.role === 'guard') {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        
        <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
          <Text style={styles.title}>Available Jobs</Text>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <View style={styles.emptyState}>
            <Shield size={64} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No jobs available</Text>
            <Text style={styles.emptySubtext}>
              Check back soon for new protection assignments
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
        <View>
          <Text style={styles.title}>Book Protection</Text>
          <Text style={styles.subtitle}>Elite security professionals at your service</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.debugButton}
            onPress={() => router.push('/api-test' as any)}
          >
            <Bug size={20} color={Colors.warning} />
          </TouchableOpacity>
          {Platform.OS !== 'web' && (
            <TouchableOpacity
              style={styles.viewToggle}
              onPress={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
            >
              {viewMode === 'map' ? (
                <List size={20} color={Colors.gold} />
              ) : (
                <Map size={20} color={Colors.gold} />
              )}
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.scheduleButton}
            onPress={() => router.push('/booking-create' as any)}
          >
            <Calendar size={20} color={Colors.gold} />
          </TouchableOpacity>
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

      {viewMode === 'map' && Platform.OS !== 'web' ? (
        <View style={styles.mapContainer}>
          <GuardMap guards={availableGuards} clientLocation={clientLocation} />

          <View style={styles.mapOverlay}>
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

          {isLoading ? (
            <>
              <GuardCardSkeleton />
              <GuardCardSkeleton />
              <GuardCardSkeleton />
            </>
          ) : (
            availableGuards.map((guard) => (
            <TouchableOpacity key={guard.id} style={styles.guardCard}>
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
                    onPress={() => router.push({ pathname: '/guard-detail', params: { id: guard.id } } as any)}
                  >
                    <Text style={styles.bookButtonText}>Book Now</Text>
                    <ChevronRight size={16} color={Colors.background} />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
            ))
          )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  viewToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  debugButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.warning + '20',
    borderWidth: 1,
    borderColor: Colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
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
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  rosterCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rosterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rosterName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  rosterDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  rosterText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  adminGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  adminCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  adminCardTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginTop: 12,
    marginBottom: 4,
  },
  adminCardValue: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.warning + '20',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  alertText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  mapContainer: {
    flex: 1,
    position: 'relative' as const,
  },
  mapOverlay: {
    position: 'absolute' as const,
    top: 16,
    left: 16,
    right: 16,
  },
});
