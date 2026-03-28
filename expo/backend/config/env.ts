function getEnvVar(key: string): string | undefined {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  
  if (typeof globalThis !== 'undefined' && (globalThis as any).process?.env) {
    return (globalThis as any).process.env[key];
  }
  
  return undefined;
}

export const BRAINTREE_ENV = getEnvVar('BRAINTREE_ENV') || 'sandbox';
export const BRAINTREE_MERCHANT_ID = getEnvVar('BRAINTREE_MERCHANT_ID');
export const BRAINTREE_PUBLIC_KEY = getEnvVar('BRAINTREE_PUBLIC_KEY');
export const BRAINTREE_PRIVATE_KEY = getEnvVar('BRAINTREE_PRIVATE_KEY');
export const PAYMENTS_CURRENCY = getEnvVar('PAYMENTS_CURRENCY') || 'MXN';

export const FIREBASE_API_KEY = getEnvVar('EXPO_PUBLIC_FIREBASE_API_KEY');
export const FIREBASE_AUTH_DOMAIN = getEnvVar('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN');
export const FIREBASE_PROJECT_ID = getEnvVar('EXPO_PUBLIC_FIREBASE_PROJECT_ID');
export const FIREBASE_STORAGE_BUCKET = getEnvVar('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET');
export const FIREBASE_MESSAGING_SENDER_ID = getEnvVar('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
export const FIREBASE_APP_ID = getEnvVar('EXPO_PUBLIC_FIREBASE_APP_ID');
export const DEMO_MODE = getEnvVar('EXPO_PUBLIC_DEMO_MODE') === 'true';

console.log('[Env Config] BRAINTREE_ENV:', BRAINTREE_ENV);
console.log('[Env Config] BRAINTREE_MERCHANT_ID available:', !!BRAINTREE_MERCHANT_ID);
console.log('[Env Config] PAYMENTS_CURRENCY:', PAYMENTS_CURRENCY);
console.log('[Env Config] FIREBASE_PROJECT_ID:', FIREBASE_PROJECT_ID);
console.log('[Env Config] DEMO_MODE:', DEMO_MODE);
