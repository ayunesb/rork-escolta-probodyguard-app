import AsyncStorage from '@react-native-async-storage/async-storage';

const RATE_LIMIT_KEY = '@escolta_rate_limits';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  booking_create: { maxRequests: 5, windowMs: 60000 },
  message_send: { maxRequests: 30, windowMs: 60000 },
  payment_attempt: { maxRequests: 3, windowMs: 300000 },
  guard_search: { maxRequests: 20, windowMs: 60000 },
};

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      const stored = await AsyncStorage.getItem(RATE_LIMIT_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.limits = new Map(Object.entries(data));
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize rate limiter:', error);
    }
  }

  async checkLimit(userId: string, action: string): Promise<{ allowed: boolean; retryAfter?: number }> {
    await this.initialize();

    const config = DEFAULT_CONFIGS[action];
    if (!config) {
      console.warn(`No rate limit config for action: ${action}`);
      return { allowed: true };
    }

    const key = `${userId}:${action}`;
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now >= entry.resetAt) {
      this.limits.set(key, {
        count: 1,
        resetAt: now + config.windowMs,
      });
      await this.save();
      return { allowed: true };
    }

    if (entry.count >= config.maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      console.log(`Rate limit exceeded for ${userId}:${action}. Retry after ${retryAfter}s`);
      return { allowed: false, retryAfter };
    }

    entry.count += 1;
    this.limits.set(key, entry);
    await this.save();
    return { allowed: true };
  }

  async resetLimit(userId: string, action: string) {
    await this.initialize();
    const key = `${userId}:${action}`;
    this.limits.delete(key);
    await this.save();
  }

  async resetAllLimits(userId: string) {
    await this.initialize();
    const keysToDelete: string[] = [];
    
    this.limits.forEach((_, key) => {
      if (key.startsWith(`${userId}:`)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.limits.delete(key));
    await this.save();
  }

  private async save() {
    try {
      const data = Object.fromEntries(this.limits.entries());
      await AsyncStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save rate limits:', error);
    }
  }

  async cleanup() {
    await this.initialize();
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.limits.forEach((entry, key) => {
      if (now >= entry.resetAt) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.limits.delete(key));
    
    if (keysToDelete.length > 0) {
      await this.save();
      console.log(`Cleaned up ${keysToDelete.length} expired rate limit entries`);
    }
  }
}

export const rateLimiter = new RateLimiter();

setInterval(() => {
  rateLimiter.cleanup();
}, 300000);
