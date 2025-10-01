import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { TrendingUp, Users, DollarSign, Star, MessageSquare, Clock, AlertTriangle } from 'lucide-react-native';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import colors from '@/constants/colors';

export default function AdminAnalyticsScreen() {
  const { summary, isLoading, loadSummary } = useAnalytics();

  const appColors = {
    ...colors,
    primary: colors.gold,
    text: colors.textPrimary,
    textSecondary: colors.textSecondary,
    background: colors.background,
    backgroundSecondary: colors.surfaceLight,
    border: colors.border,
  };

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  if (isLoading || !summary) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Analytics Dashboard' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={appColors.primary} />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Analytics Dashboard' }} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <TrendingUp size={24} color={colors.gold} />
              </View>
              <Text style={styles.statValue}>{summary.totalBookings}</Text>
              <Text style={styles.statLabel}>Total Bookings</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <DollarSign size={24} color={colors.success} />
              </View>
              <Text style={styles.statValue}>${summary.totalRevenue.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Total Revenue</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Star size={24} color={colors.warning} />
              </View>
              <Text style={styles.statValue}>{summary.averageRating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Users size={24} color={colors.info} />
              </View>
              <Text style={styles.statValue}>{summary.totalGuards}</Text>
              <Text style={styles.statLabel}>Total Guards</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Statistics</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Completed Bookings</Text>
              <Text style={styles.cardValue}>{summary.completedBookings}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Cancelled Bookings</Text>
              <Text style={styles.cardValue}>{summary.cancelledBookings}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Cancellation Rate</Text>
              <Text style={[styles.cardValue, summary.cancellationRate > 20 && styles.warningText]}>
                {summary.cancellationRate.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Avg Booking Duration</Text>
              <Text style={styles.cardValue}>{summary.averageBookingDuration.toFixed(1)}h</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Statistics</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Total Clients</Text>
              <Text style={styles.cardValue}>{summary.totalClients}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Active Clients</Text>
              <Text style={styles.cardValue}>{summary.activeClients}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Active Guards</Text>
              <Text style={styles.cardValue}>{summary.activeGuards}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feature Usage</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.cardRowLeft}>
                <MessageSquare size={20} color={colors.textSecondary} />
                <Text style={styles.cardLabel}>Translation Usage</Text>
              </View>
              <Text style={styles.cardValue}>{summary.translationUsageCount}</Text>
            </View>
            <View style={styles.cardRow}>
              <View style={styles.cardRowLeft}>
                <Clock size={20} color={colors.textSecondary} />
                <Text style={styles.cardLabel}>Booking Extensions</Text>
              </View>
              <Text style={styles.cardValue}>{summary.bookingExtensionCount}</Text>
            </View>
            <View style={styles.cardRow}>
              <View style={styles.cardRowLeft}>
                <AlertTriangle size={20} color={colors.textSecondary} />
                <Text style={styles.cardLabel}>Guard Reassignments</Text>
              </View>
              <Text style={styles.cardValue}>{summary.guardReassignmentCount}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Rated Guards</Text>
          <View style={styles.card}>
            {summary.topRatedGuards.length === 0 ? (
              <Text style={styles.emptyText}>No ratings yet</Text>
            ) : (
              summary.topRatedGuards.slice(0, 5).map((guard, index) => (
                <View key={guard.guardId} style={styles.guardRow}>
                  <View style={styles.guardRank}>
                    <Text style={styles.guardRankText}>#{index + 1}</Text>
                  </View>
                  <View style={styles.guardInfo}>
                    <Text style={styles.guardId}>{guard.guardId}</Text>
                    <Text style={styles.guardJobs}>{guard.completedJobs} jobs</Text>
                  </View>
                  <View style={styles.guardRating}>
                    <Star size={16} color={colors.warning} fill={colors.warning} />
                    <Text style={styles.guardRatingText}>{guard.rating.toFixed(1)}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue by Month</Text>
          <View style={styles.card}>
            {summary.revenueByMonth.length === 0 ? (
              <Text style={styles.emptyText}>No revenue data yet</Text>
            ) : (
              summary.revenueByMonth.slice(-6).map((item) => (
                <View key={item.month} style={styles.revenueRow}>
                  <Text style={styles.revenueMonth}>{item.month}</Text>
                  <Text style={styles.revenueAmount}>${item.revenue.toFixed(2)}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={loadSummary}>
          <Text style={styles.refreshButtonText}>Refresh Analytics</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cardRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardLabel: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  warningText: {
    color: colors.error,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 16,
  },
  guardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  guardRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  guardRankText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.gold,
  },
  guardInfo: {
    flex: 1,
  },
  guardId: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  guardJobs: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  guardRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  guardRatingText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  revenueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  revenueMonth: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  revenueAmount: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.success,
  },
  refreshButton: {
    backgroundColor: colors.gold,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.white,
  },
});
