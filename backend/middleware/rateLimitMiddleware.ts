import { doc, getDoc, setDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db as getDb } from '@/lib/firebase';

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000,
    blockDurationMs: 30 * 60 * 1000,
  },
  startCode: {
    maxAttempts: 3,
    windowMs: 5 * 60 * 1000,
    blockDurationMs: 15 * 60 * 1000,
  },
  chat: {
    maxAttempts: 30,
    windowMs: 60 * 1000,
    blockDurationMs: 5 * 60 * 1000,
  },
  booking: {
    maxAttempts: 10,
    windowMs: 60 * 60 * 1000,
    blockDurationMs: 60 * 60 * 1000,
  },
};

interface RateLimitRecord {
  attempts: number;
  firstAttempt: Timestamp;
  lastAttempt: Timestamp;
  blockedUntil?: Timestamp;
}

export async function checkRateLimit(
  action: keyof typeof RATE_LIMIT_CONFIGS,
  identifier: string
): Promise<{ allowed: boolean; remainingAttempts?: number; blockedUntil?: Date; error?: string }> {
  try {
    const config = RATE_LIMIT_CONFIGS[action];
    const db = getDb();
    const rateLimitRef = doc(db, 'rateLimits', `${action}_${identifier}`);
    
    const rateLimitDoc = await getDoc(rateLimitRef);
    const now = new Date();
    const nowTimestamp = Timestamp.fromDate(now);

    if (!rateLimitDoc.exists()) {
      await setDoc(rateLimitRef, {
        attempts: 1,
        firstAttempt: nowTimestamp,
        lastAttempt: nowTimestamp,
      });
      
      console.log(`[RateLimit] First attempt for ${action}:${identifier}`);
      return { allowed: true, remainingAttempts: config.maxAttempts - 1 };
    }

    const record = rateLimitDoc.data() as RateLimitRecord;

    if (record.blockedUntil) {
      const blockedUntilDate = record.blockedUntil.toDate();
      if (blockedUntilDate > now) {
        const minutes = Math.ceil((blockedUntilDate.getTime() - now.getTime()) / 60000);
        console.log(`[RateLimit] ${action} blocked for ${identifier} until ${blockedUntilDate.toISOString()}`);
        return {
          allowed: false,
          blockedUntil: blockedUntilDate,
          error: getRateLimitError(action, minutes),
        };
      } else {
        await setDoc(rateLimitRef, {
          attempts: 1,
          firstAttempt: nowTimestamp,
          lastAttempt: nowTimestamp,
        });
        return { allowed: true, remainingAttempts: config.maxAttempts - 1 };
      }
    }

    const firstAttemptDate = record.firstAttempt.toDate();
    const windowExpired = now.getTime() - firstAttemptDate.getTime() > config.windowMs;

    if (windowExpired) {
      await setDoc(rateLimitRef, {
        attempts: 1,
        firstAttempt: nowTimestamp,
        lastAttempt: nowTimestamp,
      });
      console.log(`[RateLimit] Window expired, reset for ${action}:${identifier}`);
      return { allowed: true, remainingAttempts: config.maxAttempts - 1 };
    }

    if (record.attempts >= config.maxAttempts) {
      const blockedUntilDate = new Date(now.getTime() + config.blockDurationMs);
      await updateDoc(rateLimitRef, {
        blockedUntil: Timestamp.fromDate(blockedUntilDate),
        lastAttempt: nowTimestamp,
      });

      await logRateLimitViolation(action, identifier, record.attempts);

      const minutes = Math.ceil(config.blockDurationMs / 60000);
      console.log(`[RateLimit] Limit exceeded for ${action}:${identifier}, blocked for ${minutes} minutes`);
      return {
        allowed: false,
        blockedUntil: blockedUntilDate,
        error: getRateLimitError(action, minutes),
      };
    }

    await updateDoc(rateLimitRef, {
      attempts: record.attempts + 1,
      lastAttempt: nowTimestamp,
    });

    const remaining = config.maxAttempts - record.attempts - 1;
    console.log(`[RateLimit] Attempt ${record.attempts + 1}/${config.maxAttempts} for ${action}:${identifier}`);
    return { allowed: true, remainingAttempts: remaining };
  } catch (error) {
    console.error('[RateLimit] Error checking rate limit:', error);
    return { allowed: true };
  }
}

export async function resetRateLimit(
  action: keyof typeof RATE_LIMIT_CONFIGS,
  identifier: string
): Promise<void> {
  try {
    const db = getDb();
    const rateLimitRef = doc(db, 'rateLimits', `${action}_${identifier}`);
    await setDoc(rateLimitRef, {
      attempts: 0,
      firstAttempt: serverTimestamp(),
      lastAttempt: serverTimestamp(),
    });
    console.log(`[RateLimit] Reset ${action} for ${identifier}`);
  } catch (error) {
    console.error('[RateLimit] Error resetting rate limit:', error);
  }
}

async function logRateLimitViolation(
  action: string,
  identifier: string,
  attempts: number
): Promise<void> {
  try {
    const db = getDb();
    const violationRef = doc(db, 'rateLimitViolations', `${action}_${identifier}_${Date.now()}`);
    await setDoc(violationRef, {
      action,
      identifier,
      attempts,
      timestamp: serverTimestamp(),
    });
    console.log(`[RateLimit] Logged violation: ${action} for ${identifier}`);
  } catch (error) {
    console.error('[RateLimit] Error logging violation:', error);
  }
}

function getRateLimitError(action: string, minutes: number): string {
  switch (action) {
    case 'login':
      return `Too many login attempts. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`;
    case 'startCode':
      return `Too many incorrect start codes. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`;
    case 'chat':
      return `You are sending messages too quickly. Please wait ${minutes} minute${minutes > 1 ? 's' : ''}.`;
    case 'booking':
      return `Too many booking requests. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`;
    default:
      return `Rate limit exceeded. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`;
  }
}
