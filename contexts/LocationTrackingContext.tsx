import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { ref, onValue, set, off } from 'firebase/database';
import { realtimeDb } from '@/config/firebase';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface GuardLocation extends LocationCoords {
  guardId: string;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export const [LocationTrackingProvider, useLocationTracking] = createContextHook(() => {
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [currentLocation, setCurrentLocation] = useState<LocationCoords | null>(null);
  const [guardLocations, setGuardLocations] = useState<Map<string, GuardLocation>>(new Map());
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocationPermission = useCallback(async () => {
    if (Platform.OS === 'web') {
      try {
        if (!('geolocation' in navigator)) {
          console.log('[Location] Geolocation not supported on web');
          setError('Geolocation not supported');
          setHasPermission(false);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            setHasPermission(true);
            setError(null);
            setCurrentLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            let errorMessage = 'Location error';
            if (error.code === 1) {
              errorMessage = 'Location permission denied';
            } else if (error.code === 2) {
              errorMessage = 'Location unavailable';
            } else if (error.code === 3) {
              errorMessage = 'Location request timeout';
            }
            
            if (error.message?.includes('permissions policy')) {
              console.log('[Location] Web geolocation blocked by permissions policy - this is expected in preview mode');
              errorMessage = 'Location not available in preview mode';
            } else {
              console.error('[Location] Web geolocation error:', errorMessage, error.message);
            }
            
            setError(errorMessage);
            setHasPermission(false);
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 60000,
          }
        );
      } catch (err) {
        console.log('[Location] Web permission error (expected in preview):', err);
        setError('Location not available');
        setHasPermission(false);
      }
      return;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } else {
        setError('Location permission denied');
      }
    } catch (err) {
      console.error('[Location] Permission error:', err);
      setError('Failed to get location permission');
      setHasPermission(false);
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      requestLocationPermission();
    }
  }, [requestLocationPermission]);

  const startTracking = useCallback(async () => {
    if (!hasPermission) {
      await requestLocationPermission();
      return;
    }

    setIsTracking(true);
    setError(null);

    if (Platform.OS === 'web') {
      try {
        if (!('geolocation' in navigator)) {
          console.log('[Location] Geolocation not supported on web');
          setError('Geolocation not supported');
          setIsTracking(false);
          return;
        }

        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            setCurrentLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            setError(null);
          },
          (error) => {
            let errorMessage = 'Failed to track location';
            if (error.code === 1) {
              errorMessage = 'Location permission denied';
            } else if (error.code === 2) {
              errorMessage = 'Location unavailable';
            } else if (error.code === 3) {
              errorMessage = 'Location request timeout';
            }
            
            if (error.message?.includes('permissions policy')) {
              console.log('[Location] Web tracking blocked by permissions policy - this is expected in preview mode');
              errorMessage = 'Location not available in preview mode';
            } else {
              console.error('[Location] Web tracking error:', errorMessage, error.message);
            }
            
            setError(errorMessage);
            setIsTracking(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );

        return () => {
          navigator.geolocation.clearWatch(watchId);
        };
      } catch (err) {
        console.log('[Location] Web start tracking error (expected in preview):', err);
        setError('Location not available');
        setIsTracking(false);
      }
      return;
    }

    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          setCurrentLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );

      return () => {
        subscription.remove();
      };
    } catch (err) {
      console.error('[Location] Start tracking error:', err);
      setError('Failed to start location tracking');
      setIsTracking(false);
    }
  }, [hasPermission, requestLocationPermission]);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
  }, []);

  const updateGuardLocation = useCallback(async (guardId: string, location: LocationCoords, heading?: number, speed?: number) => {
    try {
      const guardLocationData: GuardLocation = {
        guardId,
        ...location,
        heading,
        speed,
        timestamp: Date.now(),
      };

      const locationRef = ref(realtimeDb, `guardLocations/${guardId}`);
      await set(locationRef, guardLocationData);

      setGuardLocations((prev) => {
        const newMap = new Map(prev);
        newMap.set(guardId, guardLocationData);
        return newMap;
      });

      console.log('[Location] Updated guard location:', guardId);
    } catch (err) {
      console.error('[Location] Error updating guard location:', err);
    }
  }, []);

  const subscribeToGuardLocation = useCallback((guardId: string) => {
    const locationRef = ref(realtimeDb, `guardLocations/${guardId}`);
    
    onValue(locationRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGuardLocations((prev) => {
          const newMap = new Map(prev);
          newMap.set(guardId, data as GuardLocation);
          return newMap;
        });
        console.log('[Location] Received guard location update:', guardId);
      }
    });

    return () => {
      off(locationRef);
    };
  }, []);

  const getGuardLocation = useCallback((guardId: string): GuardLocation | null => {
    return guardLocations.get(guardId) || null;
  }, [guardLocations]);

  const calculateDistance = useCallback((from: LocationCoords, to: LocationCoords): number => {
    const R = 6371;
    const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
    const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((from.latitude * Math.PI) / 180) *
        Math.cos((to.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  const calculateETA = useCallback((from: LocationCoords, to: LocationCoords, speedKmh: number = 40): number => {
    const distance = calculateDistance(from, to);
    return (distance / speedKmh) * 60;
  }, [calculateDistance]);

  return useMemo(() => ({
    isTracking,
    currentLocation,
    guardLocations,
    hasPermission,
    error,
    startTracking,
    stopTracking,
    updateGuardLocation,
    subscribeToGuardLocation,
    getGuardLocation,
    calculateDistance,
    calculateETA,
    requestLocationPermission,
  }), [
    isTracking,
    currentLocation,
    guardLocations,
    hasPermission,
    error,
    startTracking,
    stopTracking,
    updateGuardLocation,
    subscribeToGuardLocation,
    getGuardLocation,
    calculateDistance,
    calculateETA,
    requestLocationPermission,
  ]);
});
