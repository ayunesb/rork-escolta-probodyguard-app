import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { notificationService } from './notificationService';

export interface GeofenceRegion {
  id: string;
  latitude: number;
  longitude: number;
  radius: number;
  notifyOnEntry?: boolean;
  notifyOnExit?: boolean;
}

export interface GeofenceEvent {
  region: GeofenceRegion;
  state: 'enter' | 'exit';
  timestamp: string;
}

class GeofencingService {
  private activeRegions: Map<string, GeofenceRegion> = new Map();
  private locationSubscription: Location.LocationSubscription | null = null;
  private lastKnownStates: Map<string, boolean> = new Map();

  async startMonitoring(
    regions: GeofenceRegion[],
    onEvent?: (event: GeofenceEvent) => void
  ): Promise<boolean> {
    if (Platform.OS === 'web') {
      console.log('[Geofencing] Not supported on web');
      return false;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.error('[Geofencing] Location permission denied');
        return false;
      }

      regions.forEach(region => {
        this.activeRegions.set(region.id, region);
        this.lastKnownStates.set(region.id, false);
      });

      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          this.checkGeofences(location, onEvent);
        }
      );

      console.log('[Geofencing] Started monitoring', regions.length, 'regions');
      return true;
    } catch (error) {
      console.error('[Geofencing] Error starting monitoring:', error);
      return false;
    }
  }

  stopMonitoring(): void {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
    
    this.activeRegions.clear();
    this.lastKnownStates.clear();
    
    console.log('[Geofencing] Stopped monitoring');
  }

  addRegion(region: GeofenceRegion): void {
    this.activeRegions.set(region.id, region);
    this.lastKnownStates.set(region.id, false);
    console.log('[Geofencing] Added region:', region.id);
  }

  removeRegion(regionId: string): void {
    this.activeRegions.delete(regionId);
    this.lastKnownStates.delete(regionId);
    console.log('[Geofencing] Removed region:', regionId);
  }

  private checkGeofences(
    location: Location.LocationObject,
    onEvent?: (event: GeofenceEvent) => void
  ): void {
    const currentPosition = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    this.activeRegions.forEach((region, regionId) => {
      const distance = this.calculateDistance(
        currentPosition.latitude,
        currentPosition.longitude,
        region.latitude,
        region.longitude
      );

      const isInside = distance <= region.radius;
      const wasInside = this.lastKnownStates.get(regionId) || false;

      if (isInside !== wasInside) {
        const state: 'enter' | 'exit' = isInside ? 'enter' : 'exit';
        
        console.log('[Geofencing] State change:', regionId, state, 'distance:', distance);

        const event: GeofenceEvent = {
          region,
          state,
          timestamp: new Date().toISOString(),
        };

        if (
          (state === 'enter' && region.notifyOnEntry) ||
          (state === 'exit' && region.notifyOnExit)
        ) {
          this.sendNotification(event);
        }

        onEvent?.(event);
        this.lastKnownStates.set(regionId, isInside);
      }
    });
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private sendNotification(event: GeofenceEvent): void {
    const title =
      event.state === 'enter'
        ? 'Entered Geofence Area'
        : 'Exited Geofence Area';
    
    const body =
      event.state === 'enter'
        ? `You have entered the designated area (${event.region.id})`
        : `You have left the designated area (${event.region.id})`;

    notificationService.sendLocalNotification(title, body, {
      type: 'geofence',
      regionId: event.region.id,
      state: event.state,
    });
  }

  isInsideRegion(
    latitude: number,
    longitude: number,
    region: GeofenceRegion
  ): boolean {
    const distance = this.calculateDistance(
      latitude,
      longitude,
      region.latitude,
      region.longitude
    );
    return distance <= region.radius;
  }

  getDistanceToRegion(
    latitude: number,
    longitude: number,
    region: GeofenceRegion
  ): number {
    return this.calculateDistance(
      latitude,
      longitude,
      region.latitude,
      region.longitude
    );
  }
}

export const geofencingService = new GeofencingService();
