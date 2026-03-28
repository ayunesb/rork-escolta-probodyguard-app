import { Platform } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { calculateDistance, type RoutePoint } from './routeService';

export interface Geofence {
  id: string;
  center: RoutePoint;
  radius: number;
  notifyOnEntry?: boolean;
  notifyOnExit?: boolean;
}

export interface GeofenceEvent {
  geofenceId: string;
  type: 'enter' | 'exit';
  timestamp: number;
  location: RoutePoint;
}

export type GeofenceCallback = (event: GeofenceEvent) => void;

class GeofencingService {
  private geofences: Map<string, Geofence> = new Map();
  private callbacks: Map<string, GeofenceCallback> = new Map();
  private insideGeofences: Set<string> = new Set();
  private watchId: Location.LocationSubscription | null = null;
  private isMonitoring: boolean = false;

  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log('Geofencing already monitoring');
      return;
    }

    if (Platform.OS === 'web') {
      console.warn('Geofencing not fully supported on web');
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }

    const notificationStatus = await Notifications.requestPermissionsAsync();
    if (!notificationStatus.granted) {
      console.warn('Notification permission not granted');
    }

    this.watchId = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      (location) => {
        this.checkGeofences({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    );

    this.isMonitoring = true;
    console.log('Geofencing monitoring started');
  }

  stopMonitoring(): void {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }
    this.isMonitoring = false;
    this.insideGeofences.clear();
    console.log('Geofencing monitoring stopped');
  }

  addGeofence(geofence: Geofence, callback?: GeofenceCallback): void {
    this.geofences.set(geofence.id, geofence);
    if (callback) {
      this.callbacks.set(geofence.id, callback);
    }
    console.log(`Geofence added: ${geofence.id}`);
  }

  removeGeofence(geofenceId: string): void {
    this.geofences.delete(geofenceId);
    this.callbacks.delete(geofenceId);
    this.insideGeofences.delete(geofenceId);
    console.log(`Geofence removed: ${geofenceId}`);
  }

  clearAllGeofences(): void {
    this.geofences.clear();
    this.callbacks.clear();
    this.insideGeofences.clear();
    console.log('All geofences cleared');
  }

  private checkGeofences(currentLocation: RoutePoint): void {
    this.geofences.forEach((geofence, geofenceId) => {
      const distance = calculateDistance(currentLocation, geofence.center);
      const distanceInMeters = distance * 1000;
      const isInside = distanceInMeters <= geofence.radius;
      const wasInside = this.insideGeofences.has(geofenceId);

      if (isInside && !wasInside) {
        this.insideGeofences.add(geofenceId);
        this.triggerGeofenceEvent({
          geofenceId,
          type: 'enter',
          timestamp: Date.now(),
          location: currentLocation,
        });

        if (geofence.notifyOnEntry) {
          this.sendNotification(
            'Geofence Alert',
            `Entered geofence: ${geofenceId}`
          );
        }
      } else if (!isInside && wasInside) {
        this.insideGeofences.delete(geofenceId);
        this.triggerGeofenceEvent({
          geofenceId,
          type: 'exit',
          timestamp: Date.now(),
          location: currentLocation,
        });

        if (geofence.notifyOnExit) {
          this.sendNotification(
            'Geofence Alert',
            `Exited geofence: ${geofenceId}`
          );
        }
      }
    });
  }

  private triggerGeofenceEvent(event: GeofenceEvent): void {
    const callback = this.callbacks.get(event.geofenceId);
    if (callback) {
      callback(event);
    }
    console.log(`Geofence event: ${event.type} - ${event.geofenceId}`);
  }

  private async sendNotification(title: string, body: string): Promise<void> {
    if (Platform.OS === 'web') {
      console.log(`Notification: ${title} - ${body}`);
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  isInsideGeofence(geofenceId: string): boolean {
    return this.insideGeofences.has(geofenceId);
  }

  getDistanceToGeofence(
    currentLocation: RoutePoint,
    geofenceId: string
  ): number | null {
    const geofence = this.geofences.get(geofenceId);
    if (!geofence) return null;

    const distance = calculateDistance(currentLocation, geofence.center);
    return distance * 1000;
  }
}

export const geofencingService = new GeofencingService();

export interface ProximityAlert {
  id: string;
  location: RoutePoint;
  thresholds: number[];
  triggeredThresholds: Set<number>;
}

export type ProximityCallback = (
  alertId: string,
  distance: number,
  threshold: number
) => void;

class ProximityAlertService {
  private alerts: Map<string, ProximityAlert> = new Map();
  private callbacks: Map<string, ProximityCallback> = new Map();

  addProximityAlert(
    id: string,
    location: RoutePoint,
    thresholds: number[],
    callback: ProximityCallback
  ): void {
    this.alerts.set(id, {
      id,
      location,
      thresholds: thresholds.sort((a, b) => b - a),
      triggeredThresholds: new Set(),
    });
    this.callbacks.set(id, callback);
    console.log(`Proximity alert added: ${id}`);
  }

  removeProximityAlert(id: string): void {
    this.alerts.delete(id);
    this.callbacks.delete(id);
    console.log(`Proximity alert removed: ${id}`);
  }

  checkProximity(currentLocation: RoutePoint): void {
    this.alerts.forEach((alert, alertId) => {
      const distance = calculateDistance(currentLocation, alert.location);
      const distanceInMeters = distance * 1000;

      alert.thresholds.forEach((threshold) => {
        if (
          distanceInMeters <= threshold &&
          !alert.triggeredThresholds.has(threshold)
        ) {
          alert.triggeredThresholds.add(threshold);
          const callback = this.callbacks.get(alertId);
          if (callback) {
            callback(alertId, distanceInMeters, threshold);
          }
          console.log(
            `Proximity alert triggered: ${alertId} at ${threshold}m (current: ${distanceInMeters.toFixed(0)}m)`
          );
        }
      });
    });
  }

  resetAlert(id: string): void {
    const alert = this.alerts.get(id);
    if (alert) {
      alert.triggeredThresholds.clear();
      console.log(`Proximity alert reset: ${id}`);
    }
  }

  clearAllAlerts(): void {
    this.alerts.clear();
    this.callbacks.clear();
    console.log('All proximity alerts cleared');
  }
}

export const proximityAlertService = new ProximityAlertService();

export function createPickupGeofence(
  bookingId: string,
  pickupLocation: RoutePoint,
  radius: number = 100
): Geofence {
  return {
    id: `pickup-${bookingId}`,
    center: pickupLocation,
    radius,
    notifyOnEntry: true,
    notifyOnExit: false,
  };
}

export function createDestinationGeofence(
  bookingId: string,
  destinationLocation: RoutePoint,
  radius: number = 100
): Geofence {
  return {
    id: `destination-${bookingId}`,
    center: destinationLocation,
    radius,
    notifyOnEntry: true,
    notifyOnExit: false,
  };
}

export function setupBookingGeofences(
  bookingId: string,
  pickupLocation: RoutePoint,
  destinationLocation: RoutePoint,
  onPickupArrival: () => void,
  onDestinationArrival: () => void
): void {
  const pickupGeofence = createPickupGeofence(bookingId, pickupLocation);
  const destinationGeofence = createDestinationGeofence(
    bookingId,
    destinationLocation
  );

  geofencingService.addGeofence(pickupGeofence, (event) => {
    if (event.type === 'enter') {
      console.log('Guard arrived at pickup location');
      onPickupArrival();
    }
  });

  geofencingService.addGeofence(destinationGeofence, (event) => {
    if (event.type === 'enter') {
      console.log('Guard arrived at destination');
      onDestinationArrival();
    }
  });

  proximityAlertService.addProximityAlert(
    `pickup-proximity-${bookingId}`,
    pickupLocation,
    [500, 200, 100],
    (alertId, distance, threshold) => {
      console.log(
        `Guard is ${Math.round(distance)}m from pickup (threshold: ${threshold}m)`
      );
      if (Platform.OS !== 'web') {
        Notifications.scheduleNotificationAsync({
          content: {
            title: 'Guard Approaching',
            body: `Your guard is ${Math.round(distance)}m away from pickup location`,
            sound: true,
          },
          trigger: null,
        });
      }
    }
  );

  console.log(`Geofences and proximity alerts set up for booking ${bookingId}`);
}

export function cleanupBookingGeofences(bookingId: string): void {
  geofencingService.removeGeofence(`pickup-${bookingId}`);
  geofencingService.removeGeofence(`destination-${bookingId}`);
  proximityAlertService.removeProximityAlert(`pickup-proximity-${bookingId}`);
  console.log(`Cleaned up geofences for booking ${bookingId}`);
}
