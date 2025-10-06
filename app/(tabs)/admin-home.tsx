import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useFocusEffect } from 'expo-router';
import { Shield, Users, Calendar, DollarSign, AlertCircle, CheckCircle } from 'lucide-react-native';
import { bookingService } from '@/services/bookingService';
import { mockGuards } from '@/mocks/guards';
import Colors from '@/constants/colors';
import type { Booking } from '@/types';

export default function AdminHomeScreen() {
  const insets = useSafeAreaInsets();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const allBookings = await bookingService.getAllBookings();
      setBookings(allBookings);
    } catch (error) {
      console.error('[AdminHome] Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const totalGuards = mockGuards.length;
  const activeGuards = mockGuards.filter(g => g.availability).length;
  const totalBookings = bookings.length;
  const activeBookings = bookings.filter(b => b.status === 'active' || b.status === 'accepted').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const totalRevenue = bookings.filter(b => b.status === 'completed').reduce((sum: number, b: Booking) => sum + b.totalAmount, 0);
  const platformRevenue = bookings.filter(b => b.status === 'completed').reduce((sum: number, b: Booking) => sum + b.platformCut, 0);

  const pendingKYC = mockGuards.filter(g => g.kycStatus === 'pending').length;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
        <View>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>System overview and management</Text>
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
            {pendingKYC > 0 && (
              <View style={styles.alertCard}>
                <AlertCircle size={24} color={Colors.warning} />
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>Pending KYC Reviews</Text>
                  <Text style={styles.alertText}>
                    {pendingKYC} guard{pendingKYC !== 1 ? 's' : ''} waiting for KYC approval
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Users size={24} color={Colors.gold} />
                </View>
                <Text style={styles.statValue}>{totalGuards}</Text>
                <Text style={styles.statLabel}>Total Guards</Text>
                <Text style={styles.statSubtext}>{activeGuards} active</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Calendar size={24} color={Colors.info} />
                </View>
                <Text style={styles.statValue}>{totalBookings}</Text>
                <Text style={styles.statLabel}>Total Bookings</Text>
                <Text style={styles.statSubtext}>{activeBookings} active</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <DollarSign size={24} color={Colors.success} />
                </View>
                <Text style={styles.statValue}>${totalRevenue.toFixed(0)}</Text>
                <Text style={styles.statLabel}>Total Revenue</Text>
                <Text style={styles.statSubtext}>${platformRevenue.toFixed(0)} platform</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <CheckCircle size={24} color={Colors.success} />
                </View>
                <Text style={styles.statValue}>{completedBookings}</Text>
                <Text style={styles.statLabel}>Completed</Text>
                <Text style={styles.statSubtext}>
                  {totalBookings > 0 ? ((completedBookings / totalBookings) * 100).toFixed(0) : 0}% rate
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>System Overview</Text>
              
              <View style={styles.overviewCard}>
                <View style={styles.overviewRow}>
                  <Text style={styles.overviewLabel}>Guards Pending KYC</Text>
                  <Text style={[styles.overviewValue, { color: pendingKYC > 0 ? Colors.warning : Colors.success }]}>
                    {pendingKYC}
                  </Text>
                </View>
                <View style={styles.overviewRow}>
                  <Text style={styles.overviewLabel}>Approved Guards</Text>
                  <Text style={styles.overviewValue}>
                    {mockGuards.filter(g => g.kycStatus === 'approved').length}
                  </Text>
                </View>
                <View style={styles.overviewRow}>
                  <Text style={styles.overviewLabel}>Pending Bookings</Text>
                  <Text style={styles.overviewValue}>
                    {bookings.filter(b => b.status === 'pending').length}
                  </Text>
                </View>
                <View style={styles.overviewRow}>
                  <Text style={styles.overviewLabel}>Cancelled Bookings</Text>
                  <Text style={styles.overviewValue}>
                    {bookings.filter(b => b.status === 'cancelled').length}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              {bookings.length === 0 ? (
                <View style={styles.emptyState}>
                  <Calendar size={48} color={Colors.textTertiary} />
                  <Text style={styles.emptyText}>No activity yet</Text>
                  <Text style={styles.emptySubtext}>
                    System activity will appear here
                  </Text>
                </View>
              ) : (
                bookings.slice(0, 10).map((booking) => {
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
                    <View key={booking.id} style={styles.activityCard}>
                      <View style={styles.activityHeader}>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
                          <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                            {booking.status.toUpperCase()}
                          </Text>
                        </View>
                        <Text style={styles.activityId}>#{booking.id.slice(0, 8)}</Text>
                      </View>

                      <View style={styles.activityDetails}>
                        <Text style={styles.activityText}>
                          Client ID: {booking.clientId.slice(0, 8)}
                        </Text>
                        {guard && (
                          <Text style={styles.activityText}>
                            Guard: {guard.firstName} {guard.lastName}
                          </Text>
                        )}
                        <Text style={styles.activityText}>
                          {booking.scheduledDate} • {booking.duration}h
                        </Text>
                      </View>

                      <View style={styles.activityFooter}>
                        <Text style={styles.activityAmount}>${booking.totalAmount}</Text>
                        <Text style={styles.activityPlatform}>
                          Platform: ${booking.platformCut}
                        </Text>
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
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: Colors.warning + '20',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.warning,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  alertText: {
    fontSize: 14,
    color: Colors.textSecondary,
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
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 11,
    color: Colors.textTertiary,
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
  overviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  overviewLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  overviewValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  activityCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  activityId: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '600' as const,
  },
  activityDetails: {
    marginBottom: 12,
  },
  activityText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  activityAmount: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  activityPlatform: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.success,
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
  },
});
