import { Platform } from 'react-native';

export interface LocationUpdate {
  guardId: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp: string;
}

export interface BookingUpdate {
  bookingId: string;
  status: string;
  message?: string;
  timestamp: string;
}

type LocationCallback = (update: LocationUpdate) => void;
type BookingCallback = (update: BookingUpdate) => void;

class RealtimeService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private locationCallbacks = new Map<string, LocationCallback[]>();
  private bookingCallbacks = new Map<string, BookingCallback[]>();
  private isConnecting = false;

  connect(userId: string): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      console.log('[Realtime] Already connected or connecting');
      return;
    }

    if (Platform.OS === 'web') {
      console.log('[Realtime] WebSocket not fully supported on web, using polling fallback');
      return;
    }

    this.isConnecting = true;

    try {
      const wsUrl = `wss://escolta-realtime.example.com/ws?userId=${userId}`;
      console.log('[Realtime] Connecting to:', wsUrl);
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[Realtime] Connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('[Realtime] Error parsing message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[Realtime] WebSocket error:', error);
        this.isConnecting = false;
      };

      this.ws.onclose = () => {
        console.log('[Realtime] Disconnected');
        this.isConnecting = false;
        this.attemptReconnect(userId);
      };
    } catch (error) {
      console.error('[Realtime] Connection error:', error);
      this.isConnecting = false;
    }
  }

  private attemptReconnect(userId: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[Realtime] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`[Realtime] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect(userId);
    }, delay);
  }

  private handleMessage(data: any): void {
    switch (data.type) {
      case 'location_update':
        this.handleLocationUpdate(data.payload);
        break;
      case 'booking_update':
        this.handleBookingUpdate(data.payload);
        break;
      default:
        console.log('[Realtime] Unknown message type:', data.type);
    }
  }

  private handleLocationUpdate(update: LocationUpdate): void {
    const callbacks = this.locationCallbacks.get(update.guardId) || [];
    callbacks.forEach(callback => callback(update));
  }

  private handleBookingUpdate(update: BookingUpdate): void {
    const callbacks = this.bookingCallbacks.get(update.bookingId) || [];
    callbacks.forEach(callback => callback(update));
  }

  subscribeToGuardLocation(guardId: string, callback: LocationCallback): () => void {
    const callbacks = this.locationCallbacks.get(guardId) || [];
    callbacks.push(callback);
    this.locationCallbacks.set(guardId, callbacks);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe_location',
        guardId,
      }));
    }

    console.log('[Realtime] Subscribed to guard location:', guardId);

    return () => {
      const cbs = this.locationCallbacks.get(guardId) || [];
      const index = cbs.indexOf(callback);
      if (index > -1) {
        cbs.splice(index, 1);
        this.locationCallbacks.set(guardId, cbs);
      }

      if (cbs.length === 0 && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'unsubscribe_location',
          guardId,
        }));
      }

      console.log('[Realtime] Unsubscribed from guard location:', guardId);
    };
  }

  subscribeToBooking(bookingId: string, callback: BookingCallback): () => void {
    const callbacks = this.bookingCallbacks.get(bookingId) || [];
    callbacks.push(callback);
    this.bookingCallbacks.set(bookingId, callbacks);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe_booking',
        bookingId,
      }));
    }

    console.log('[Realtime] Subscribed to booking:', bookingId);

    return () => {
      const cbs = this.bookingCallbacks.get(bookingId) || [];
      const index = cbs.indexOf(callback);
      if (index > -1) {
        cbs.splice(index, 1);
        this.bookingCallbacks.set(bookingId, cbs);
      }

      if (cbs.length === 0 && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'unsubscribe_booking',
          bookingId,
        }));
      }

      console.log('[Realtime] Unsubscribed from booking:', bookingId);
    };
  }

  updateLocation(guardId: string, location: Omit<LocationUpdate, 'guardId' | 'timestamp'>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'location_update',
        payload: {
          guardId,
          ...location,
          timestamp: new Date().toISOString(),
        },
      }));
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.locationCallbacks.clear();
    this.bookingCallbacks.clear();
    this.reconnectAttempts = 0;
    console.log('[Realtime] Disconnected and cleaned up');
  }
}

export const realtimeService = new RealtimeService();
