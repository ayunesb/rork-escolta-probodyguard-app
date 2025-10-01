import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@escolta_cache_';
const CACHE_EXPIRY_KEY = '@escolta_cache_expiry_';

export interface CacheOptions {
  ttl?: number;
}

class CacheService {
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    try {
      const cacheKey = CACHE_PREFIX + key;
      const expiryKey = CACHE_EXPIRY_KEY + key;
      
      await AsyncStorage.setItem(cacheKey, JSON.stringify(value));
      
      if (options?.ttl) {
        const expiryTime = Date.now() + options.ttl;
        await AsyncStorage.setItem(expiryKey, expiryTime.toString());
      }
      
      console.log(`Cache set: ${key}`);
    } catch (error) {
      console.error(`Error setting cache for ${key}:`, error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const cacheKey = CACHE_PREFIX + key;
      const expiryKey = CACHE_EXPIRY_KEY + key;
      
      const expiryTime = await AsyncStorage.getItem(expiryKey);
      if (expiryTime && Date.now() > parseInt(expiryTime)) {
        console.log(`Cache expired: ${key}`);
        await this.remove(key);
        return null;
      }
      
      const cached = await AsyncStorage.getItem(cacheKey);
      if (!cached) return null;
      
      console.log(`Cache hit: ${key}`);
      return JSON.parse(cached) as T;
    } catch (error) {
      console.error(`Error getting cache for ${key}:`, error);
      return null;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const cacheKey = CACHE_PREFIX + key;
      const expiryKey = CACHE_EXPIRY_KEY + key;
      
      await AsyncStorage.multiRemove([cacheKey, expiryKey]);
      console.log(`Cache removed: ${key}`);
    } catch (error) {
      console.error(`Error removing cache for ${key}:`, error);
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(
        key => key.startsWith(CACHE_PREFIX) || key.startsWith(CACHE_EXPIRY_KEY)
      );
      
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
        console.log(`Cleared ${cacheKeys.length / 2} cache entries`);
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    const cached = await this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }
    
    console.log(`Cache miss: ${key}, fetching...`);
    const fresh = await fetchFn();
    await this.set(key, fresh, options);
    
    return fresh;
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const matchingKeys = keys.filter(key => 
        key.startsWith(CACHE_PREFIX) && key.includes(pattern)
      );
      
      for (const key of matchingKeys) {
        const originalKey = key.replace(CACHE_PREFIX, '');
        await this.remove(originalKey);
      }
      
      console.log(`Invalidated ${matchingKeys.length} cache entries matching: ${pattern}`);
    } catch (error) {
      console.error(`Error invalidating cache pattern ${pattern}:`, error);
    }
  }
}

export const cacheService = new CacheService();
