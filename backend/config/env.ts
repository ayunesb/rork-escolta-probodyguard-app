function getEnvVar(key: string): string | undefined {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  
  if (typeof globalThis !== 'undefined' && (globalThis as any).process?.env) {
    return (globalThis as any).process.env[key];
  }
  
  return undefined;
}

export const STRIPE_SECRET_KEY = getEnvVar('STRIPE_SECRET_KEY') || getEnvVar('EXPO_PUBLIC_STRIPE_SECRET_KEY');
export const FIREBASE_API_KEY = getEnvVar('EXPO_PUBLIC_FIREBASE_API_KEY');
export const FIREBASE_AUTH_DOMAIN = getEnvVar('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN');
export const FIREBASE_PROJECT_ID = getEnvVar('EXPO_PUBLIC_FIREBASE_PROJECT_ID');
export const FIREBASE_STORAGE_BUCKET = getEnvVar('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET');
export const FIREBASE_MESSAGING_SENDER_ID = getEnvVar('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
export const FIREBASE_APP_ID = getEnvVar('EXPO_PUBLIC_FIREBASE_APP_ID');

console.log('[Env Config] STRIPE_SECRET_KEY available:', !!STRIPE_SECRET_KEY);
console.log('[Env Config] FIREBASE_PROJECT_ID:', FIREBASE_PROJECT_ID);
