import createContextHook from '../shims/create-context-hook.cjs';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Guard } from '@/types';

const FAVORITES_KEY = '@escolta_favorites';

export const [FavoritesProvider, useFavorites] = createContextHook(() => {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavoriteIds(JSON.parse(stored));
      }
    } catch (error) {
      console.error('[Favorites] Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFavorites = async (ids: string[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
    } catch (error) {
      console.error('[Favorites] Error saving favorites:', error);
    }
  };

  const addFavorite = useCallback(async (guardId: string) => {
    setFavoriteIds(prev => {
      if (prev.includes(guardId)) return prev;
      const updated = [...prev, guardId];
      saveFavorites(updated);
      console.log('[Favorites] Added guard:', guardId);
      return updated;
    });
  }, []);

  const removeFavorite = useCallback(async (guardId: string) => {
    setFavoriteIds(prev => {
      const updated = prev.filter(id => id !== guardId);
      saveFavorites(updated);
      console.log('[Favorites] Removed guard:', guardId);
      return updated;
    });
  }, []);

  const toggleFavorite = useCallback(async (guardId: string) => {
    if (favoriteIds.includes(guardId)) {
      await removeFavorite(guardId);
    } else {
      await addFavorite(guardId);
    }
  }, [favoriteIds, addFavorite, removeFavorite]);

  const isFavorite = useCallback((guardId: string) => {
    return favoriteIds.includes(guardId);
  }, [favoriteIds]);

  const getFavoriteGuards = useCallback((allGuards: Guard[]) => {
    return allGuards.filter(guard => favoriteIds.includes(guard.id));
  }, [favoriteIds]);

  return useMemo(() => ({
    favoriteIds,
    isLoading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    getFavoriteGuards,
  }), [favoriteIds, isLoading, addFavorite, removeFavorite, toggleFavorite, isFavorite, getFavoriteGuards]);
});
