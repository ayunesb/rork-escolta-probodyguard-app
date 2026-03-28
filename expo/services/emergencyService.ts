import { db as getDbInstance } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { notificationService } from './notificationService';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { logger } from '@/utils/logger';

export interface EmergencyAlert {
  id: string;
  userId: string;
  bookingId?: string;
  type: 'panic' | 'sos' | 'medical' | 'security';
  status: 'active' | 'resolved' | 'false_alarm';
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
  };
  timestamp: string;
  resolvedAt?: string;
  notes?: string;
  responderId?: string;
}

class EmergencyService {
  async triggerPanicButton(
    userId: string,
    bookingId?: string,
    type: 'panic' | 'sos' | 'medical' | 'security' = 'panic'
  ): Promise<{ success: boolean; alertId?: string; error?: string }> {
    try {
      logger.log('[Emergency] Triggering panic button:', { userId, type });

      const location = await this.getCurrentLocation();
      
      if (!location) {
        return { success: false, error: 'Unable to get location' };
      }

      const alert: Omit<EmergencyAlert, 'id'> = {
        userId,
        bookingId,
        type,
        status: 'active',
        location,
        timestamp: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(getDbInstance(), 'emergencyAlerts'), alert);
      logger.log('[Emergency] Alert created:', docRef.id);

      await this.notifyEmergencyContacts(docRef.id, alert);

      if (bookingId) {
        await this.notifyBookingParties(bookingId, docRef.id, alert);
      }

      return { success: true, alertId: docRef.id };
    } catch (error) {
      logger.error('[Emergency] Error triggering panic button:', error);
      return { success: false, error: 'Failed to trigger emergency alert' };
    }
  }

  async resolveAlert(
    alertId: string,
    status: 'resolved' | 'false_alarm',
    notes?: string
  ): Promise<boolean> {
    try {
      logger.log('[Emergency] Resolving alert:', { alertId, status });

      await updateDoc(doc(getDbInstance(), 'emergencyAlerts', alertId), {
        status,
        resolvedAt: new Date().toISOString(),
        notes,
      });

      return true;
    } catch (error) {
      logger.error('[Emergency] Error resolving alert:', error);
      return false;
    }
  }

  async getActiveAlerts(userId: string): Promise<EmergencyAlert[]> {
    try {
      const q = query(
        collection(getDbInstance(), 'emergencyAlerts'),
        where('userId', '==', userId),
        where('status', '==', 'active')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as EmergencyAlert[];
    } catch (error) {
      logger.error('[Emergency] Error getting active alerts:', error);
      return [];
    }
  }

  private async getCurrentLocation(): Promise<{
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
  } | null> {
    if (Platform.OS === 'web') {
      try {
        if ('geolocation' in navigator) {
          return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                resolve({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  accuracy: position.coords.accuracy,
                  address: undefined,
                });
              },
              (error) => {
                logger.error('[Emergency] Web geolocation error:', error);
                resolve(null);
              },
              { enableHighAccuracy: true }
            );
          });
        }
        return null;
      } catch (error) {
        logger.error('[Emergency] Web location error:', error);
        return null;
      }
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        logger.error('[Emergency] Location permission denied');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      let address: string | undefined;
      try {
        const [geocode] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        
        if (geocode) {
          address = `${geocode.street || ''} ${geocode.city || ''} ${geocode.region || ''}`.trim();
        }
      } catch (error) {
        logger.error('[Emergency] Error getting address:', error);
      }

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        address,
      };
    } catch (error) {
      logger.error('[Emergency] Error getting location:', error);
      return null;
    }
  }

  private async notifyEmergencyContacts(
    alertId: string,
    alert: Omit<EmergencyAlert, 'id'>
  ): Promise<void> {
    try {
      const userDoc = await getDoc(doc(getDbInstance(), 'users', alert.userId));
      const userData = userDoc.data();

      if (!userData) return;

      const message = `🚨 EMERGENCY ALERT: ${userData.firstName} ${userData.lastName} has triggered a ${alert.type} alert at ${alert.location.address || 'unknown location'}`;

      const adminsQuery = query(
        collection(getDbInstance(), 'users'),
        where('role', '==', 'admin')
      );
      const adminsSnapshot = await getDocs(adminsQuery);

      for (const adminDoc of adminsSnapshot.docs) {
        await notificationService.sendLocalNotification(
          'Emergency Alert',
          message,
          { alertId, type: 'emergency', userId: adminDoc.id }
        );
      }

      logger.log('[Emergency] Notified emergency contacts');
    } catch (error) {
      logger.error('[Emergency] Error notifying emergency contacts:', error);
    }
  }

  private async notifyBookingParties(
    bookingId: string,
    alertId: string,
    alert: Omit<EmergencyAlert, 'id'>
  ): Promise<void> {
    try {
      const bookingDoc = await getDoc(doc(getDbInstance(), 'bookings', bookingId));
      const booking = bookingDoc.data();

      if (!booking) return;

      const message = `🚨 Emergency alert triggered for booking #${bookingId}`;

      const userIds = [booking.clientId, booking.guardId].filter(
        id => id && id !== alert.userId
      );

      for (const userId of userIds) {
        await notificationService.sendLocalNotification(
          'Emergency Alert',
          message,
          { alertId, bookingId, type: 'emergency', userId }
        );
      }

      logger.log('[Emergency] Notified booking parties');
    } catch (error) {
      logger.error('[Emergency] Error notifying booking parties:', error);
    }
  }
}

export const emergencyService = new EmergencyService();
