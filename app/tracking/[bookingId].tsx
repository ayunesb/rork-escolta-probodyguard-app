import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft,
  Navigation,
  Clock,
  Phone,
  MessageCircle,
  Shield,
} from 'lucide-react-native';
import { useLocationTracking } from '@/contexts/LocationTrackingContext';
import { useAuth } from '@/contexts/AuthContext';
import { mockGuards } from '@/mocks/guards';
import { bookingService } from '@/services/bookingService';
import Colors from '@/constants/colors';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from '@/components/MapView';
import PanicButton from '@/components/PanicButton';

const { width, height } = Dimensions.get('window');

export default function TrackingScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const {
    currentLocation,
    subscribeToGuardLocation,
    getGuardLocation,
    calculateDistance,
    calculateETA,
    hasPermission,
    requestLocationPermission,
  } = useLocationTracking();

  const [guardId] = useState<string>('guard-1');
  const guard = mockGuards.find((g) => g.id === guardId);
  const guardLocation = getGuardLocation(guardId);

  useEffect(() => {
    if (!hasPermission) {
      requestLocationPermission();
    }
  }, [hasPermission, requestLocationPermission]);

  useEffect(() => {
    if (!guardId) return;

    console.log('[Tracking] Subscribing to guard location:', guardId);
    const unsubscribe = subscribeToGuardLocation(guardId);

    return () => {
      console.log('[Tracking] Unsubscribing from guard location:', guardId);
      unsubscribe();
    };
  }, [guardId, subscribeToGuardLocation]);

  if (!guard) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Shield size={64} color={Colors.textTertiary} />
          <Text style={styles.errorText}>Booking not found</Text>
        </View>
      </View>
    );
  }

  const distance = currentLocation && guardLocation
    ? calculateDistance(currentLocation, guardLocation)
    : null;

  const eta = currentLocation && guardLocation
    ? calculateETA(currentLocation, guardLocation)
    : null;

  const handleCall = () => {
    Alert.alert('Call Guard', `Call ${guard.firstName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => console.log('Calling guard...') },
    ]);
  };

  const handleMessage = () => {
    Alert.alert('Message Guard', 'Open chat with guard?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Chat', onPress: () => console.log('Opening chat...') },
    ]);
  };

  const handleStartService = async () => {
    Alert.prompt(
      'Enter Start Code',
      'Enter the 6-digit code provided by your guard',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Verify',
          onPress: async (code) => {
            if (!code || !user) return;
            try {
              const isValid = await bookingService.verifyStartCode(bookingId, code, user.id);
              if (isValid) {
                await bookingService.updateBookingStatus(bookingId, 'active');
                Alert.alert('Success', 'Service started successfully');
              } else {
                Alert.alert('Invalid Code', 'The code you entered is incorrect');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to verify code');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <MapView
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={{
            latitude: currentLocation?.latitude || guard.latitude || 40.7580,
            longitude: currentLocation?.longitude || guard.longitude || -73.9855,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          showsUserLocation={true}
          showsMyLocationButton={false}
        >
          {guardLocation && (
            <Marker
              coordinate={{
                latitude: guardLocation.latitude,
                longitude: guardLocation.longitude,
              }}
              title={`${guard.firstName} ${guard.lastName.charAt(0)}.`}
              description="Your guard"
            >
              <View style={styles.guardMarker}>
                <Shield size={24} color={Colors.gold} />
              </View>
            </Marker>
          )}

          {currentLocation && guardLocation && (
            <Polyline
              coordinates={[
                { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
                { latitude: guardLocation.latitude, longitude: guardLocation.longitude },
              ]}
              strokeColor={Colors.gold}
              strokeWidth={3}
              lineDashPattern={[10, 5]}
            />
          )}
        </MapView>



      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 10 }]}
        onPress={() => router.back()}
      >
        <ChevronLeft size={24} color={Colors.white} />
      </TouchableOpacity>

      {user && (
        <View style={[styles.panicButtonContainer, { top: insets.top + 10 }]}>
          <PanicButton
            userId={user.id}
            bookingId={bookingId}
            size="medium"
            onAlertTriggered={(alertId) => {
              console.log('[Tracking] Emergency alert triggered:', alertId);
            }}
          />
        </View>
      )}

      <View style={[styles.infoCard, { bottom: insets.bottom + 20 }]}>
        <View style={styles.guardHeader}>
          <View style={styles.guardInfo}>
            <Text style={styles.guardName}>
              {guard.firstName} {guard.lastName.charAt(0)}.
            </Text>
            <Text style={styles.guardStatus}>En Route</Text>
          </View>
          <View style={styles.verifiedBadge}>
            <Shield size={16} color={Colors.gold} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Navigation size={20} color={Colors.gold} />
            <Text style={styles.statValue}>
              {distance ? `${distance.toFixed(1)} km` : '---'}
            </Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Clock size={20} color={Colors.gold} />
            <Text style={styles.statValue}>
              {eta ? `${Math.round(eta)} min` : '---'}
            </Text>
            <Text style={styles.statLabel}>ETA</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
            <Phone size={20} color={Colors.gold} />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleMessage}>
            <MessageCircle size={20} color={Colors.gold} />
            <Text style={styles.actionButtonText}>Message</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  map: {
    width: width,
    height: height,
  },
  backButton: {
    position: 'absolute' as const,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guardMarker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    borderWidth: 3,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    position: 'absolute' as const,
    left: 16,
    right: 16,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  guardInfo: {
    flex: 1,
  },
  guardName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  guardStatus: {
    fontSize: 14,
    color: Colors.gold,
    fontWeight: '600' as const,
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
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: Colors.border,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.background,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.gold,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginTop: 16,
  },
  panicButtonContainer: {
    position: 'absolute' as const,
    right: 16,
  },
});
