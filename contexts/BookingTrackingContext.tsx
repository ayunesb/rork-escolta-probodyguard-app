import createContextHook from '../shims/create-context-hook.cjs';
import { useState, useMemo, useCallback } from 'react';
import type { Booking } from '@/types';

interface TrackingState {
  isGuardVisible: boolean;
  estimatedArrival: string | null;
  minutesUntilVisible: number | null;
  shouldShowMap: boolean;
}

export const [BookingTrackingProvider, useBookingTracking] = createContextHook(() => {
  const [trackingStates, setTrackingStates] = useState<Record<string, TrackingState>>({});

  const calculateTrackingState = (booking: Booking): TrackingState => {
    const now = new Date();
    const scheduledDateTime = new Date(`${booking.scheduledDate}T${booking.scheduledTime}`);
    const minutesUntilStart = Math.floor((scheduledDateTime.getTime() - now.getTime()) / 60000);

    if (booking.status === 'active') {
      return {
        isGuardVisible: true,
        estimatedArrival: null,
        minutesUntilVisible: null,
        shouldShowMap: true,
      };
    }

    if (booking.isScheduled && booking.isCrossCity) {
      if (minutesUntilStart <= 10) {
        return {
          isGuardVisible: true,
          estimatedArrival: booking.estimatedArrivalTime || null,
          minutesUntilVisible: null,
          shouldShowMap: true,
        };
      } else {
        return {
          isGuardVisible: false,
          estimatedArrival: booking.estimatedArrivalTime || null,
          minutesUntilVisible: minutesUntilStart - 10,
          shouldShowMap: false,
        };
      }
    }

    if (booking.isScheduled) {
      if (minutesUntilStart <= 10) {
        return {
          isGuardVisible: true,
          estimatedArrival: null,
          minutesUntilVisible: null,
          shouldShowMap: true,
        };
      } else {
        return {
          isGuardVisible: false,
          estimatedArrival: null,
          minutesUntilVisible: minutesUntilStart - 10,
          shouldShowMap: false,
        };
      }
    }

    return {
      isGuardVisible: false,
      estimatedArrival: null,
      minutesUntilVisible: null,
      shouldShowMap: false,
    };
  };

  const updateTracking = useCallback((booking: Booking) => {
    const state = calculateTrackingState(booking);
    setTrackingStates(prev => ({
      ...prev,
      [booking.id]: state,
    }));
  }, []);

  const getTrackingState = useCallback((bookingId: string): TrackingState => {
    return trackingStates[bookingId] || {
      isGuardVisible: false,
      estimatedArrival: null,
      minutesUntilVisible: null,
      shouldShowMap: false,
    };
  }, [trackingStates]);

  return useMemo(() => ({
    updateTracking,
    getTrackingState,
  }), [updateTracking, getTrackingState]);
});
