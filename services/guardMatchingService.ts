import { Guard, Booking, Language } from '@/types';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db as getDbInstance } from '@/lib/firebase';

export interface MatchingCriteria {
  location: {
    latitude: number;
    longitude: number;
  };
  languages: Language[];
  vehicleType: 'standard' | 'armored';
  protectionType: 'armed' | 'unarmed';
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  numberOfProtectors: number;
  maxDistance?: number;
  minRating?: number;
  preferredGuardIds?: string[];
}

export interface GuardScore {
  guard: Guard;
  score: number;
  breakdown: {
    distance: number;
    availability: number;
    rating: number;
    experience: number;
    language: number;
    price: number;
  };
  estimatedDistance: number;
  estimatedTravelTime: number;
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
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
}

function estimateTravelTime(distanceKm: number): number {
  const avgSpeedKmh = 40;
  return Math.ceil((distanceKm / avgSpeedKmh) * 60);
}

export const guardMatchingService = {
  async findBestMatches(
    criteria: MatchingCriteria,
    limit: number = 10
  ): Promise<GuardScore[]> {
    try {
      console.log('[Matching] Finding guards with criteria:', criteria);

      const guardsQuery = query(
        collection(getDbInstance(), 'users'),
        where('role', '==', 'guard'),
        where('availability', '==', true),
        where('kycStatus', '==', 'approved')
      );

      const snapshot = await getDocs(guardsQuery);
      const guards: Guard[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        guards.push({
          id: doc.id,
          ...data,
        } as Guard);
      });

      console.log('[Matching] Found', guards.length, 'available guards');

      const scoredGuards = guards
        .map((guard) => this.scoreGuard(guard, criteria))
        .filter((scored) => scored.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      console.log('[Matching] Top matches:', scoredGuards.length);
      return scoredGuards;
    } catch (error) {
      console.error('[Matching] Error finding matches:', error);
      return [];
    }
  },

  scoreGuard(guard: Guard, criteria: MatchingCriteria): GuardScore {
    const breakdown = {
      distance: 0,
      availability: 0,
      rating: 0,
      experience: 0,
      language: 0,
      price: 0,
    };

    if (!guard.latitude || !guard.longitude) {
      return {
        guard,
        score: 0,
        breakdown,
        estimatedDistance: 0,
        estimatedTravelTime: 0,
      };
    }

    const distance = calculateDistance(
      criteria.location.latitude,
      criteria.location.longitude,
      guard.latitude,
      guard.longitude
    );

    const maxDistance = criteria.maxDistance || 50;
    if (distance > maxDistance) {
      return {
        guard,
        score: 0,
        breakdown,
        estimatedDistance: distance,
        estimatedTravelTime: estimateTravelTime(distance),
      };
    }

    breakdown.distance = Math.max(0, 30 - (distance / maxDistance) * 30);

    breakdown.availability = guard.availability ? 20 : 0;

    const minRating = criteria.minRating || 3.5;
    if (guard.rating >= minRating) {
      breakdown.rating = (guard.rating / 5) * 20;
    }

    breakdown.experience = Math.min(
      (guard.completedJobs / 100) * 15,
      15
    );

    const hasMatchingLanguage = criteria.languages.some((lang) =>
      guard.languages.includes(lang)
    );
    breakdown.language = hasMatchingLanguage ? 10 : 0;

    const avgHourlyRate = 500;
    const priceDiff = Math.abs(guard.hourlyRate - avgHourlyRate);
    breakdown.price = Math.max(0, 5 - (priceDiff / avgHourlyRate) * 5);

    if (criteria.preferredGuardIds?.includes(guard.id)) {
      breakdown.rating += 10;
    }

    const totalScore = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

    return {
      guard,
      score: totalScore,
      breakdown,
      estimatedDistance: distance,
      estimatedTravelTime: estimateTravelTime(distance),
    };
  },

  async checkGuardAvailability(
    guardId: string,
    scheduledDate: string,
    scheduledTime: string,
    duration: number
  ): Promise<boolean> {
    try {
      const bookingsQuery = query(
        collection(getDbInstance(), 'bookings'),
        where('guardId', '==', guardId),
        where('status', 'in', ['confirmed', 'accepted', 'en_route', 'active'])
      );

      const snapshot = await getDocs(bookingsQuery);
      const requestedStart = new Date(`${scheduledDate}T${scheduledTime}`);
      const requestedEnd = new Date(
        requestedStart.getTime() + duration * 60 * 60 * 1000
      );

      for (const doc of snapshot.docs) {
        const booking = doc.data() as Booking;
        const bookingStart = new Date(
          `${booking.scheduledDate}T${booking.scheduledTime}`
        );
        const bookingEnd = new Date(
          bookingStart.getTime() + booking.duration * 60 * 60 * 1000
        );

        if (
          (requestedStart >= bookingStart && requestedStart < bookingEnd) ||
          (requestedEnd > bookingStart && requestedEnd <= bookingEnd) ||
          (requestedStart <= bookingStart && requestedEnd >= bookingEnd)
        ) {
          console.log('[Matching] Guard has conflicting booking');
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('[Matching] Error checking availability:', error);
      return false;
    }
  },

  async findAlternativeGuards(
    originalGuardId: string,
    booking: Booking,
    limit: number = 5
  ): Promise<GuardScore[]> {
    const criteria: MatchingCriteria = {
      location: {
        latitude: booking.pickupLatitude,
        longitude: booking.pickupLongitude,
      },
      languages: ['en', 'es'],
      vehicleType: booking.vehicleType,
      protectionType: booking.protectionType,
      scheduledDate: booking.scheduledDate,
      scheduledTime: booking.scheduledTime,
      duration: booking.duration,
      numberOfProtectors: booking.numberOfProtectors,
    };

    const matches = await this.findBestMatches(criteria, limit + 1);
    
    return matches.filter((match) => match.guard.id !== originalGuardId).slice(0, limit);
  },

  async getGuardRecommendations(
    clientId: string,
    criteria: MatchingCriteria
  ): Promise<GuardScore[]> {
    try {
      const bookingsQuery = query(
        collection(getDbInstance(), 'bookings'),
        where('clientId', '==', clientId),
        where('status', '==', 'completed')
      );

      const snapshot = await getDocs(bookingsQuery);
      const previousGuardIds: string[] = [];
      const guardRatings: Record<string, number[]> = {};

      snapshot.forEach((doc) => {
        const booking = doc.data() as Booking;
        if (booking.guardId) {
          previousGuardIds.push(booking.guardId);
          if (booking.rating) {
            if (!guardRatings[booking.guardId]) {
              guardRatings[booking.guardId] = [];
            }
            guardRatings[booking.guardId].push(booking.rating);
          }
        }
      });

      const preferredGuardIds = Object.entries(guardRatings)
        .filter(([_, ratings]) => {
          const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
          return avg >= 4.0;
        })
        .map(([guardId]) => guardId);

      const enhancedCriteria = {
        ...criteria,
        preferredGuardIds,
      };

      return await this.findBestMatches(enhancedCriteria, 10);
    } catch (error) {
      console.error('[Matching] Error getting recommendations:', error);
      return await this.findBestMatches(criteria, 10);
    }
  },

  async assignGuardToBooking(
    bookingId: string,
    guardId: string
  ): Promise<boolean> {
    try {
      const bookingRef = doc(getDbInstance(), 'bookings', bookingId);
      await updateDoc(bookingRef, {
        guardId,
        status: 'confirmed',
        confirmedAt: new Date().toISOString(),
      });

      console.log('[Matching] Guard assigned to booking');
      return true;
    } catch (error) {
      console.error('[Matching] Error assigning guard:', error);
      return false;
    }
  },

  getMatchQuality(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  },

  formatMatchDetails(scored: GuardScore): string {
    const quality = this.getMatchQuality(scored.score);
    const distance = scored.estimatedDistance.toFixed(1);
    const time = scored.estimatedTravelTime;

    return `${quality.toUpperCase()} match (${scored.score.toFixed(0)}/100) - ${distance}km away, ${time} min ETA`;
  },
};
