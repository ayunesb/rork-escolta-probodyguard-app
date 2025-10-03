import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Calendar, MapPin, Clock, DollarSign, Navigation } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { mockBookings } from '@/mocks/bookings';
import Colors from '@/constants/colors';

export default function BookingsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const userBookings = mockBookings.filter(b => {
    if (!user) return false;
    return user.role === 'client' ? b.clientId === user.id : b.guardId === user.id;
  });

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
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.title}>
          {user?.role === 'client' ? 'My Bookings' : 'Job History'}
        </Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {userBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={64} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No bookings yet</Text>
            <Text style={styles.emptySubtext}>
              {user?.role === 'client' 
                ? 'Book your first protector to get started' 
                : 'Accept jobs to see them here'}
            </Text>
          </View>
        ) : (
          userBookings.map((booking) => (
            <TouchableOpacity 
              key={booking.id} 
              style={styles.bookingCard}
              onPress={() => router.push(`/booking/${booking.id}` as any)}
            >
              <View style={styles.bookingHeader}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                    {booking.status.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.bookingId}>#{booking.id.slice(0, 8)}</Text>
              </View>

              <View style={styles.bookingDetail}>
                <Calendar size={16} color={Colors.textSecondary} />
                <Text style={styles.detailText}>
                  {booking.scheduledDate} at {booking.scheduledTime}
                </Text>
              </View>

              <View style={styles.bookingDetail}>
                <MapPin size={16} color={Colors.textSecondary} />
                <Text style={styles.detailText} numberOfLines={1}>
                  {booking.pickupAddress}
                </Text>
              </View>

              <View style={styles.bookingDetail}>
                <Clock size={16} color={Colors.textSecondary} />
                <Text style={styles.detailText}>
                  {booking.duration} hours • {booking.protectionType} • {booking.vehicleType}
                </Text>
              </View>

              <View style={styles.bookingFooter}>
                <View style={styles.bookingDetail}>
                  <DollarSign size={16} color={Colors.gold} />
                  <Text style={styles.priceText}>
                    ${user?.role === 'client' ? booking.totalAmount : booking.guardPayout}
                  </Text>
                </View>
                {booking.rating && (
                  <Text style={styles.ratingText}>⭐ {booking.rating.toFixed(1)}</Text>
                )}
              </View>

              {(booking.status === 'accepted' || booking.status === 'en_route' || booking.status === 'active') && (
                <TouchableOpacity 
                  style={styles.trackButton}
                  onPress={() => router.push(`/tracking/${booking.id}`)}
                >
                  <Navigation size={16} color={Colors.background} />
                  <Text style={styles.trackButtonText}>Track Guard</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))
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
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
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
  bookingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bookingHeader: {
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
  bookingId: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '600' as const,
  },
  bookingDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.gold,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  trackButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.background,
  },
});
