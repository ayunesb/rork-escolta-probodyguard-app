import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref, set } from 'firebase/database';
import { realtimeDb } from '@/lib/firebase';

export const BACKGROUND_LOCATION_TASK = 'background-location-task';

// ⚠️ IMPORTANT: This MUST be defined OUTSIDE any component or function
// TaskManager requires tasks to be defined at module scope
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('[BackgroundLocation] Task error:', error);
    return;
  }

  if (data) {
    const { locations } = data as any;
    const location = locations[0];
    
    if (!location) return;
    
    try {
      // Get user ID from AsyncStorage
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.warn('[BackgroundLocation] No user ID found');
        return;
      }

      // Update Firebase Realtime Database
      const locationRef = ref(realtimeDb(), `guardLocations/${userId}`);
      await set(locationRef, {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        heading: location.coords.heading,
        speed: location.coords.speed,
        accuracy: location.coords.accuracy,
        timestamp: Date.now(),
      });

      console.log('[BackgroundLocation] Location updated successfully');
    } catch (err) {
      console.error('[BackgroundLocation] Update failed:', err);
    }
  }
});

// Helper function to start background location updates
export async function startBackgroundLocationUpdates(): Promise<boolean> {
  try {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.error('[BackgroundLocation] Background permission denied');
      return false;
    }

    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.High,
      timeInterval: 10000, // 10 seconds
      distanceInterval: 10, // 10 meters
      foregroundService: {
        notificationTitle: 'Escolta Pro - Active Booking',
        notificationBody: 'Tracking your location for active booking',
        notificationColor: '#DAA520',
      },
    });

    console.log('[BackgroundLocation] Started successfully');
    return true;
  } catch (error) {
    console.error('[BackgroundLocation] Failed to start:', error);
    return false;
  }
}

// Helper function to stop background location updates
export async function stopBackgroundLocationUpdates(): Promise<void> {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
    
    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      console.log('[BackgroundLocation] Stopped successfully');
    }
  } catch (error) {
    console.error('[BackgroundLocation] Failed to stop:', error);
  }
}
