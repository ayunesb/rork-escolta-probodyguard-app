import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack } from 'expo-router';
import { MapPin, Clock, AlertCircle } from 'lucide-react-native';
import { useLocationTracking } from '../../contexts/LocationTrackingContext';
import { shouldShowGuardLocation, getTrackingMessage } from '../../utils/trackingRules';
import { Booking } from '../../types/booking';
import MapView from '../../components/MapView';

export default function TrackingScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { isTracking, guardLocation, startTracking, error } = useLocationTracking();
  const insets = useSafeAreaInsets();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [trackingVisibility, setTrackingVisibility] = useState<ReturnType<typeof shouldShowGuardLocation> | null>(null);

  const loadBooking = useCallback(async () => {
    try {
      setLoading(true);
      
      const mockBooking: Booking = {
        id: bookingId,
        clientId: 'client-123',
        guardId: 'guard-456',
        status: 'en_route' as const,
        type: 'scheduled' as const,
        startTime: new Date(Date.now() + 8 * 60 * 1000).toISOString(),
        duration: 4,
        crossCity: false,
        startCodeVerified: false,
        startCode: '123456',
        location: {
          address: 'Polanco, CDMX',
          latitude: 19.4326,
          longitude: -99.1332,
        },
        services: {
          vehicle: true,
          armed: true,
          armored: false,
          dressCode: 'formal' as const,
        },
        pricing: {
          baseRate: 500,
          vehicleRate: 200,
          armedRate: 150,
          total: 850,
          currency: 'MXN' as const,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setBooking(mockBooking);
    } catch (err) {
      console.error('Failed to load booking:', err);
      Alert.alert('Error', 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  useEffect(() => {
    if (booking) {
      const visibility = shouldShowGuardLocation(booking);
      setTrackingVisibility(visibility);

      if (visibility.shouldShowLiveLocation && !isTracking) {
        startTracking(bookingId, booking);
      }
    }
  }, [booking, bookingId, isTracking, startTracking]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (booking) {
        const visibility = shouldShowGuardLocation(booking);
        setTrackingVisibility(visibility);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [booking]);



  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Tracking' }} />
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Tracking' }} />
        <Text style={styles.errorText}>Booking not found</Text>
      </View>
    );
  }

  const message = trackingVisibility ? getTrackingMessage(trackingVisibility, 'en') : '';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ title: 'Live Tracking' }} />

      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <MapPin size={24} color="#007AFF" />
          <Text style={styles.statusTitle}>Guard Status</Text>
        </View>
        
        <Text style={styles.statusMessage}>{message}</Text>

        {trackingVisibility?.minutesUntilVisible && (
          <View style={styles.countdownContainer}>
            <Clock size={20} color="#666" />
            <Text style={styles.countdownText}>
              Location visible in {trackingVisibility.minutesUntilVisible} minutes
            </Text>
          </View>
        )}

        {trackingVisibility?.estimatedArrival && (
          <Text style={styles.etaText}>
            ETA: {new Date(trackingVisibility.estimatedArrival).toLocaleTimeString()}
          </Text>
        )}
      </View>

      {error && (
        <View style={styles.errorCard}>
          <AlertCircle size={20} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.mapContainer}>
        {trackingVisibility?.shouldShowLiveLocation && guardLocation ? (
          <MapView
            initialRegion={{
              latitude: guardLocation.latitude,
              longitude: guardLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            markers={[
              {
                id: 'guard',
                coordinate: {
                  latitude: guardLocation.latitude,
                  longitude: guardLocation.longitude,
                },
                title: 'Guard Location',
                description: 'Your guard is here',
              },
              {
                id: 'destination',
                coordinate: {
                  latitude: booking.location.latitude,
                  longitude: booking.location.longitude,
                },
                title: 'Destination',
                description: booking.location.address,
              },
            ]}
          />
        ) : (
          <View style={styles.mapPlaceholder}>
            <MapPin size={48} color="#CCC" />
            <Text style={styles.placeholderText}>
              {trackingVisibility?.reason === 'not_started'
                ? 'Map will be available within 10 minutes of start time'
                : 'Waiting for guard to start service'}
            </Text>
          </View>
        )}
      </View>

      {booking.status === 'en_route' && !booking.startCodeVerified && (
        <View style={styles.startCodeCard}>
          <Text style={styles.startCodeTitle}>Waiting for Start Code</Text>
          <Text style={styles.startCodeText}>
            Guard will enter the 6-digit start code to begin service
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  statusCard: {
    backgroundColor: '#FFF',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginLeft: 8,
    color: '#000',
  },
  statusMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  countdownText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  etaText: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 8,
    fontWeight: '500' as const,
  },
  errorCard: {
    backgroundColor: '#FFF',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginLeft: 8,
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
  startCodeCard: {
    backgroundColor: '#FFF9E6',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB800',
  },
  startCodeTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#000',
    marginBottom: 8,
  },
  startCodeText: {
    fontSize: 14,
    color: '#666',
  },
});
