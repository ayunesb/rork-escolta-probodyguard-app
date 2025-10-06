import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useFocusEffect } from 'expo-router';
import { Shield, Users, Calendar, DollarSign, TrendingUp, Award } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { bookingService } from '@/services/bookingService';
import { mockGuards } from '@/mocks/guards';
import Colors from '@/constants/colors';
import type { Booking } from '@/types';

export default function CompanyHomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const allBookings = await bookingService.getAllBookings();
      const companyGuards = mockGuards.filter(g => g.companyId === user.id);
      const guardIds = companyGuards.map(g => g.id);
      const companyBookings = allBookings.filter(b => 
        b.guardId && guardIds.includes(b.guardId)
      );
      setBookings(companyBookings);
    } catch (error) {
      console.error('[CompanyHome] Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const companyGuards = mockGuards.filter(g => g.companyId === user?.id);
  const activeBookings = bookings.filter(b => b.status === 'active' || b.status === 'accepted');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalRevenue = completedBookings.reduce((sum, b) => sum + b.guardPayout, 0);
  const avgRating = completedBookings.length > 0
    ? completedBookings.reduce((sum, b) => sum + (b.rating || 0), 0) / completedBookings.filter(b => b.rating).length
    : 0;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
        <View>
          <Text style={styles.title}>Company Dashboard</Text>
          <Text style={styles.subtitle}>Manage your security team</Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.gold} />
            <Text style={styles.loadingText}>Loading dashboard...</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Users size={24} color={Colors.gold} />
                </View>
                <Text style={styles.statValue}>{companyGuards.length}</Text>
                <Text style={styles.statLabel}>Active Guards</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Calendar size={24} color={Colors.info} />
                </View>
                <Text style={styles.statValue}>{activeBookings.length}</Text>
                <Text style={styles.statLabel}>Active Jobs</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <DollarSign size={24} color={Colors.success} />
                </View>
                <Text style={styles.statValue}>${totalRevenue.toFixed(0)}</Text>
                <Text style={styles.statLabel}>Total Revenue</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Award size={24} color={Colors.warning} />
                </View>
                <Text style={styles.statValue}>{avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}</Text>
                <Text style={styles.statLabel}>Avg Rating</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Guards</Text>
              {companyGuards.length === 0 ? (
                <View style={styles.emptyState}>
                  <Shield size={48} color={Colors.textTertiary} />
                  <Text style={styles.emptyText}>No guards assigned</Text>
                  <Text style={styles.emptySubtext}>
                    Add guards to your company to start managing bookings
                  </Text>
                </View>
              ) : (
                companyGuards.map((guard) => {
                  const guardBookings = bookings.filter(b => b.guardId === guard.id);
                  const guardActive = guardBookings.filter(b => b.status === 'active' || b.status === 'accepted').length;
                  const guardCompleted = guardBookings.filter(b => b.status === 'completed').length;

                  return (
                    <View key={guard.id} style={styles.guardCard}>
                      <View style={styles.guardHeader}>
                        <View>
                          <Text style={styles.guardName}>
                            {guard.firstName} {guard.lastName}
                          </Text>
                          <Text style={styles.guardRole}>Security Professional</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: guard.availability ? Colors.success + '20' : Colors.textTertiary + '20' }]}>
                          <Text style={[styles.statusText, { color: guard.availability ? Colors.success : Colors.textTertiary }]}>
                            {guard.availability ? 'Available' : 'Offline'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.guardStats}>
                        <View style={styles.guardStat}>
                          <Text style={styles.guardStatValue}>{guardActive}</Text>
                          <Text style={styles.guardStatLabel}>Active</Text>
                        </View>
                        <View style={styles.guardStatDivider} />
                        <View style={styles.guardStat}>
                          <Text style={styles.guardStatValue}>{guardCompleted}</Text>
                          <Text style={styles.guardStatLabel}>Completed</Text>
                        </View>
                        <View style={styles.guardStatDivider} />
                        <View style={styles.guardStat}>
                          <Text style={styles.guardStatValue}>{guard.rating.toFixed(1)}</Text>
                          <Text style={styles.guardStatLabel}>Rating</Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Bookings</Text>
              {bookings.length === 0 ? (
                <View style={styles.emptyState}>
                  <Calendar size={48} color={Colors.textTertiary} />
                  <Text style={styles.emptyText}>No bookings yet</Text>
                  <Text style={styles.emptySubtext}>
                    Bookings will appear here once your guards accept jobs
                  </Text>
                </View>
              ) : (
                bookings.slice(0, 5).map((booking) => {
                  const guard = mockGuards.find(g => g.id === booking.guardId);
                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case 'completed': return Colors.success;
                      case 'active': return Colors.info;
                      case 'accepted': return Colors.warning;
                      case 'cancelled': return Colors.error;
                      default: return Colors.textSecondary;
                    }
                  };

                  return (
                    <View key={booking.id} style={styles.bookingCard}>
                      <View style={styles.bookingHeader}>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
                          <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                            {booking.status.toUpperCase()}
                          </Text>
                        </View>
                        <Text style={styles.bookingId}>#{booking.id.slice(0, 8)}</Text>
                      </View>

                      {guard && (
                        <Text style={styles.bookingGuard}>
                          Guard: {guard.firstName} {guard.lastName}
                        </Text>
                      )}

                      <Text style={styles.bookingDate}>
                        {booking.scheduledDate} at {booking.scheduledTime}
                      </Text>

                      <View style={styles.bookingFooter}>
                        <Text style={styles.bookingAmount}>${booking.guardPayout}</Text>
                        <Text style={styles.bookingDuration}>{booking.duration}h</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
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
  header: {
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  guardCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  guardName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  guardRole: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  guardStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guardStat: {
    flex: 1,
    alignItems: 'center',
  },
  guardStatValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.gold,
    marginBottom: 4,
  },
  guardStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  guardStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  bookingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingId: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '600' as const,
  },
  bookingGuard: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  bookingDate: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  bookingAmount: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  bookingDuration: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center' as const,
    paddingHorizontal: 32,
  },
});
