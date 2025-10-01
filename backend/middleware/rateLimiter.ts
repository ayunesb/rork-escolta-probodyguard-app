import { Context, Next } from 'hono';

interface RateLimitStore {
  requests: number[];
  blocked: boolean;
  blockUntil?: number;
}

const store = new Map<string, RateLimitStore>();

const CLEANUP_INTERVAL = 60000;

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (value.blocked && value.blockUntil && value.blockUntil < now) {
      store.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

export interface RateLimiterOptions {
  windowMs: number;
  maxRequests: number;
  blockDuration?: number;
  message?: string;
}

export const rateLimiter = (options: RateLimiterOptions) => {
  const {
    windowMs,
    maxRequests,
    blockDuration = 60000,
    message = 'Too many requests, please try again later',
  } = options;

  return async (c: Context, next: Next) => {
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    let record = store.get(ip);

    if (!record) {
      record = { requests: [], blocked: false };
      store.set(ip, record);
    }

    if (record.blocked && record.blockUntil && record.blockUntil > now) {
      console.log(`[RateLimit] IP ${ip} is blocked until ${new Date(record.blockUntil).toISOString()}`);
      return c.json({ error: message }, 429);
    }

    if (record.blocked && record.blockUntil && record.blockUntil <= now) {
      record.blocked = false;
      record.blockUntil = undefined;
      record.requests = [];
    }

    record.requests = record.requests.filter((time) => time > windowStart);

    if (record.requests.length >= maxRequests) {
      console.log(`[RateLimit] IP ${ip} exceeded limit (${record.requests.length}/${maxRequests})`);
      record.blocked = true;
      record.blockUntil = now + blockDuration;
      return c.json({ error: message }, 429);
    }

    record.requests.push(now);

    await next();
  };
};

export const loginRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  blockDuration: 30 * 60 * 1000,
  message: 'Too many login attempts, please try again in 30 minutes',
});

export const apiRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
  blockDuration: 60 * 1000,
  message: 'Too many requests, please try again in 1 minute',
});
