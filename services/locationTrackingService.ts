import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

let locationSubscription: Location.LocationSubscription | null = null;

export const requestLocationPermissions = async (): Promise<boolean> => {
  try {
    console.log('[Location] Requesting permissions');

    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    
    if (foregroundStatus !== 'granted') {
      console.log('[Location] Foreground permission denied');
      return false;
    }

    if (Platform.OS !== 'web') {
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      
      if (backgroundStatus !== 'granted') {
        console.log('[Location] Background permission denied');
        return false;
      }
    }

    console.log('[Location] Permissions granted');
    return true;
  } catch (error) {
    console.error('[Location] Permission error:', error);
    return false;
  }
};

export const getCurrentLocation = async (): Promise<LocationData | null> => {
  try {
    console.log('[Location] Getting current location');

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy || 0,
      timestamp: new Date(location.timestamp).toISOString(),
    };
  } catch (error) {
    console.error('[Location] Get current location error:', error);
    return null;
  }
};

export const startLocationTracking = async (
  userId: string,
  onLocationUpdate?: (location: LocationData) => void
): Promise<boolean> => {
  try {
    console.log('[Location] Starting location tracking for user:', userId);

    if (locationSubscription) {
      console.log('[Location] Already tracking');
      return true;
    }

    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) {
      return false;
    }

    locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
        distanceInterval: 10,
      },
      async (location) => {
        const locationData: LocationData = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy || 0,
          timestamp: new Date(location.timestamp).toISOString(),
        };

        console.log('[Location] Location update:', locationData);

        try {
          const dbInstance = db();
          await updateDoc(doc(dbInstance, 'users', userId), {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            lastLocationUpdate: Timestamp.now(),
          });
        } catch (error) {
          console.error('[Location] Failed to update Firestore:', error);
        }

        if (onLocationUpdate) {
          onLocationUpdate(locationData);
        }
      }
    );

    console.log('[Location] Tracking started');
    return true;
  } catch (error) {
    console.error('[Location] Start tracking error:', error);
    return false;
  }
};

export const stopLocationTracking = async (): Promise<void> => {
  try {
    console.log('[Location] Stopping location tracking');

    if (locationSubscription) {
      locationSubscription.remove();
      locationSubscription = null;
      console.log('[Location] Tracking stopped');
    }
  } catch (error) {
    console.error('[Location] Stop tracking error:', error);
  }
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
