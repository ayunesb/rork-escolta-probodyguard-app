import { useMemo, useCallback } from 'react';
import { Guard } from '@/types';
import { searchService, SearchFilters } from '@/services/searchService';

export function useOptimizedGuards(
  guards: Guard[],
  filters: SearchFilters,
  userLocation?: { latitude: number; longitude: number }
) {
  const searchResults = useMemo(() => {
    return searchService.searchGuards(guards, filters, userLocation);
  }, [guards, filters, userLocation]);

  const filteredGuards = useMemo(() => {
    return searchResults.map(r => r.guard);
  }, [searchResults]);

  const getGuardById = useCallback((id: string) => {
    return guards.find(g => g.id === id);
  }, [guards]);

  const availableGuards = useMemo(() => {
    return guards.filter(g => g.availability);
  }, [guards]);

  const topRatedGuards = useMemo(() => {
    return [...guards]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10);
  }, [guards]);

  const nearbyGuards = useMemo(() => {
    if (!userLocation) return [];
    
    return searchResults
      .filter(r => r.distance && r.distance <= 10)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .map(r => r.guard);
  }, [searchResults, userLocation]);

  return {
    searchResults,
    filteredGuards,
    availableGuards,
    topRatedGuards,
    nearbyGuards,
    getGuardById,
  };
}
