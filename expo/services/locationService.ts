import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
}

export interface LocationUpdate {
  coords: LocationCoords;
  timestamp: number;
}

class LocationService {
  private watchSubscription: Location.LocationSubscription | null = null;
  private listeners: Set<(location: LocationUpdate) => void> = new Set();

  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        if (!navigator.geolocation) {
          console.error('Geolocation not supported');
          return false;
        }
        return true;
      }

      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        console.error('Foreground location permission denied');
        return false;
      }

      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      
      if (backgroundStatus !== 'granted') {
        console.warn('Background location permission denied');
      }

      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<LocationUpdate | null> {
    try {
      if (Platform.OS === 'web') {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                coords: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  accuracy: position.coords.accuracy,
                  altitude: position.coords.altitude,
                  heading: position.coords.heading,
                  speed: position.coords.speed,
                },
                timestamp: position.timestamp,
              });
            },
            (error) => {
              console.error('Web geolocation error:', error);
              reject(null);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
          );
        });
      }

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        coords: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
          altitude: location.coords.altitude,
          heading: location.coords.heading,
          speed: location.coords.speed,
        },
        timestamp: location.timestamp,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  async startWatching(callback: (location: LocationUpdate) => void): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        if (!navigator.geolocation) return false;

        navigator.geolocation.watchPosition(
          (position) => {
            const update: LocationUpdate = {
              coords: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                altitude: position.coords.altitude,
                heading: position.coords.heading,
                speed: position.coords.speed,
              },
              timestamp: position.timestamp,
            };
            callback(update);
            this.listeners.forEach(listener => listener(update));
          },
          (error) => console.error('Web watch error:', error),
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );

        this.listeners.add(callback);
        return true;
      }

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return false;

      this.watchSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          const update: LocationUpdate = {
            coords: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              accuracy: location.coords.accuracy,
              altitude: location.coords.altitude,
              heading: location.coords.heading,
              speed: location.coords.speed,
            },
            timestamp: location.timestamp,
          };
          callback(update);
          this.listeners.forEach(listener => listener(update));
        }
      );

      this.listeners.add(callback);
      return true;
    } catch (error) {
      console.error('Error starting location watch:', error);
      return false;
    }
  }

  stopWatching(callback?: (location: LocationUpdate) => void): void {
    if (callback) {
      this.listeners.delete(callback);
    }

    if (this.listeners.size === 0) {
      if (Platform.OS !== 'web' && this.watchSubscription) {
        this.watchSubscription.remove();
        this.watchSubscription = null;
      }
    }
  }

  async calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): Promise<number> {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export const locationService = new LocationService();
