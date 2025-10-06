import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { getDatabase, ref, onValue, set, off } from 'firebase/database';
import { getApp } from 'firebase/app';
import { Booking, LocationUpdate } from '../types/booking';
import { shouldShowGuardLocation } from '../utils/trackingRules';

interface LocationTrackingContextType {
  isTracking: boolean;
  currentLocation: LocationUpdate | null;
  guardLocation: LocationUpdate | null;
  startTracking: (bookingId: string, booking: Booking) => Promise<void>;
  stopTracking: () => void;
  error: string | null;
}

const LocationTrackingContext = createContext<LocationTrackingContextType | undefined>(undefined);

export function LocationTrackingProvider({ children }: { children: React.ReactNode }) {
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [currentLocation, setCurrentLocation] = useState<LocationUpdate | null>(null);
  const [guardLocation, setGuardLocation] = useState<LocationUpdate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const stopTracking = useCallback(() => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    if (bookingId) {
      const database = getDatabase(getApp());
      const trackingRef = ref(database, `tracking/${bookingId}`);
      off(trackingRef);
      setBookingId(null);
    }
    setIsTracking(false);
    setCurrentLocation(null);
    setGuardLocation(null);
    setError(null);
  }, [locationSubscription, bookingId]);

  const startTracking = useCallback(async (newBookingId: string, booking: Booking) => {
    try {
      setError(null);

      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        setError('Location permission denied');
        return;
      }

      if (Platform.OS !== 'web') {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
          console.log('Background location permission denied');
        }
      }

      setBookingId(newBookingId);
      setIsTracking(true);

      const database = getDatabase(getApp());
      const trackingRef = ref(database, `tracking/${newBookingId}`);
      
      onValue(trackingRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const locationUpdate: LocationUpdate = {
            latitude: data.latitude,
            longitude: data.longitude,
            timestamp: data.timestamp,
            accuracy: data.accuracy,
            heading: data.heading,
            speed: data.speed,
          };
          
          const visibility = shouldShowGuardLocation(booking);
          if (visibility.shouldShowLiveLocation) {
            setGuardLocation(locationUpdate);
          } else {
            setGuardLocation(null);
          }
        }
      });

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          const update: LocationUpdate = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: location.timestamp,
            accuracy: location.coords.accuracy || undefined,
            heading: location.coords.heading || undefined,
            speed: location.coords.speed || undefined,
          };

          setCurrentLocation(update);

          set(trackingRef, {
            latitude: update.latitude,
            longitude: update.longitude,
            timestamp: update.timestamp,
            accuracy: update.accuracy,
            heading: update.heading,
            speed: update.speed,
          }).catch((err) => {
            console.error('Failed to update location:', err);
          });
        }
      );

      setLocationSubscription(subscription);
    } catch (err) {
      console.error('Failed to start tracking:', err);
      setError(err instanceof Error ? err.message : 'Failed to start tracking');
      setIsTracking(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  const value = React.useMemo(
    () => ({
      isTracking,
      currentLocation,
      guardLocation,
      startTracking,
      stopTracking,
      error,
    }),
    [isTracking, currentLocation, guardLocation, startTracking, stopTracking, error]
  );

  return (
    <LocationTrackingContext.Provider value={value}>
      {children}
    </LocationTrackingContext.Provider>
  );
}

export function useLocationTracking() {
  const context = useContext(LocationTrackingContext);
  if (!context) {
    throw new Error('useLocationTracking must be used within LocationTrackingProvider');
  }
  return context;
}
