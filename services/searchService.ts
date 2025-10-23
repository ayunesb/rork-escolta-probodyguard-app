import { Guard } from '@/types';
import { logger } from '@/utils/logger';

export interface SearchFilters {
  query?: string;
  protectionType?: 'armed' | 'unarmed' | 'all';
  minRating?: number;
  maxHourlyRate?: number;
  minHourlyRate?: number;
  languages?: string[];
  certifications?: string[];
  vehicleType?: 'standard' | 'armored' | 'all';
  maxDistance?: number;
  availability?: boolean;
  sortBy?: 'rating' | 'price_low' | 'price_high' | 'distance' | 'experience';
}

export interface SearchResult {
  guard: Guard;
  distance?: number;
  matchScore: number;
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateMatchScore(guard: Guard, filters: SearchFilters): number {
  let score = 0;

  if (filters.query) {
    const query = filters.query.toLowerCase();
    const fullName = `${guard.firstName} ${guard.lastName}`.toLowerCase();
    const bio = guard.bio.toLowerCase();
    
    if (fullName.includes(query)) score += 50;
    if (bio.includes(query)) score += 20;
    if (guard.certifications.some(c => c.toLowerCase().includes(query))) score += 30;
  }

  if (guard.rating >= 4.5) score += 30;
  else if (guard.rating >= 4.0) score += 20;
  else if (guard.rating >= 3.5) score += 10;

  if (guard.completedJobs > 100) score += 20;
  else if (guard.completedJobs > 50) score += 15;
  else if (guard.completedJobs > 20) score += 10;

  if (filters.languages && filters.languages.length > 0) {
    const matchingLanguages = guard.languages.filter(l => 
      filters.languages!.includes(l)
    );
    score += matchingLanguages.length * 15;
  }

  if (filters.certifications && filters.certifications.length > 0) {
    const matchingCerts = guard.certifications.filter(c =>
      filters.certifications!.some(fc => c.toLowerCase().includes(fc.toLowerCase()))
    );
    score += matchingCerts.length * 10;
  }

  return score;
}

export const searchService = {
  searchGuards(
    guards: Guard[],
    filters: SearchFilters,
    userLocation?: { latitude: number; longitude: number }
  ): SearchResult[] {
    logger.log('[Search] Searching guards with filters:', filters);

    let results: SearchResult[] = guards.map(guard => {
      let distance: number | undefined;
      
      if (userLocation && guard.latitude && guard.longitude) {
        distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          guard.latitude,
          guard.longitude
        );
      }

      return {
        guard,
        distance,
        matchScore: calculateMatchScore(guard, filters),
      };
    });

    if (filters.availability !== undefined) {
      results = results.filter(r => r.guard.availability === filters.availability);
    }

    if (filters.minRating) {
      results = results.filter(r => r.guard.rating >= filters.minRating!);
    }

    if (filters.maxHourlyRate) {
      results = results.filter(r => r.guard.hourlyRate <= filters.maxHourlyRate!);
    }

    if (filters.minHourlyRate) {
      results = results.filter(r => r.guard.hourlyRate >= filters.minHourlyRate!);
    }

    if (filters.maxDistance && userLocation) {
      results = results.filter(r => {
        if (!r.distance) return false;
        return r.distance <= filters.maxDistance!;
      });
    }

    if (filters.languages && filters.languages.length > 0) {
      results = results.filter(r =>
        filters.languages!.some(lang => r.guard.languages.includes(lang as any))
      );
    }

    if (filters.certifications && filters.certifications.length > 0) {
      results = results.filter(r =>
        filters.certifications!.some(cert =>
          r.guard.certifications.some(gc => 
            gc.toLowerCase().includes(cert.toLowerCase())
          )
        )
      );
    }

    switch (filters.sortBy) {
      case 'rating':
        results.sort((a, b) => b.guard.rating - a.guard.rating);
        break;
      case 'price_low':
        results.sort((a, b) => a.guard.hourlyRate - b.guard.hourlyRate);
        break;
      case 'price_high':
        results.sort((a, b) => b.guard.hourlyRate - a.guard.hourlyRate);
        break;
      case 'distance':
        if (userLocation) {
          results.sort((a, b) => {
            if (!a.distance) return 1;
            if (!b.distance) return -1;
            return a.distance - b.distance;
          });
        }
        break;
      case 'experience':
        results.sort((a, b) => b.guard.completedJobs - a.guard.completedJobs);
        break;
      default:
        results.sort((a, b) => b.matchScore - a.matchScore);
    }

    logger.log('[Search] Found guards:', { count: results.length });
    return results;
  },

  getPopularCertifications(guards: Guard[]): string[] {
    const certCounts = new Map<string, number>();
    
    guards.forEach(guard => {
      guard.certifications.forEach(cert => {
        certCounts.set(cert, (certCounts.get(cert) || 0) + 1);
      });
    });

    return Array.from(certCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([cert]) => cert);
  },

  getAvailableLanguages(guards: Guard[]): string[] {
    const languages = new Set<string>();
    guards.forEach(guard => {
      guard.languages.forEach(lang => languages.add(lang));
    });
    return Array.from(languages).sort();
  },

  getPriceRange(guards: Guard[]): { min: number; max: number } {
    if (guards.length === 0) return { min: 0, max: 0 };
    
    const rates = guards.map(g => g.hourlyRate);
    return {
      min: Math.min(...rates),
      max: Math.max(...rates),
    };
  },
};
