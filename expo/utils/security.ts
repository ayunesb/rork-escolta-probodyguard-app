interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export const rateLimit = {
  check: (key: string, maxRequests: number, windowMs: number): boolean => {
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return true;
    }

    if (entry.count >= maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  },

  reset: (key: string): void => {
    rateLimitStore.delete(key);
  },

  cleanup: (): void => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  },
};

export const validateBookingCode = (code: string): boolean => {
  return /^\d{6}$/.test(code);
};

export const generateBookingCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const maskSensitiveData = (data: string, visibleChars: number = 4): string => {
  if (data.length <= visibleChars) return data;
  const masked = '*'.repeat(data.length - visibleChars);
  return masked + data.slice(-visibleChars);
};

export const logSecurityEvent = (event: string, details: Record<string, any>): void => {
  console.log('[SECURITY]', event, {
    timestamp: new Date().toISOString(),
    ...details,
  });
};

export const createHash = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};
