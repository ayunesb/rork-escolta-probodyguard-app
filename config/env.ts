import Constants from 'expo-constants';

export const ENV = {
  BRAINTREE_ENV: Constants.expoConfig?.extra?.braintreeEnv ?? process.env.EXPO_PUBLIC_BRAINTREE_ENV ?? 'sandbox',
  BRAINTREE_MERCHANT_ID: Constants.expoConfig?.extra?.braintreeMerchantId ?? process.env.EXPO_PUBLIC_BRAINTREE_MERCHANT_ID ?? '',
  BRAINTREE_PUBLIC_KEY: Constants.expoConfig?.extra?.braintreePublicKey ?? process.env.EXPO_PUBLIC_BRAINTREE_PUBLIC_KEY ?? '',
  BRAINTREE_PRIVATE_KEY: Constants.expoConfig?.extra?.braintreePrivateKey ?? process.env.EXPO_PUBLIC_BRAINTREE_PRIVATE_KEY ?? '',
  PAYMENTS_CURRENCY: 'MXN' as const,
  API_URL: process.env.EXPO_PUBLIC_API_URL ?? Constants.expoConfig?.extra?.apiUrl ?? '',
};

if (!ENV.BRAINTREE_MERCHANT_ID || !ENV.BRAINTREE_PUBLIC_KEY || !ENV.BRAINTREE_PRIVATE_KEY) {
  console.warn('[ENV] Missing Braintree credentials in app.json -> expo.extra');
}

if (!ENV.API_URL) {
  console.warn('[ENV] Missing API_URL in app.json -> expo.extra.apiUrl');
}

export const PAYMENT_CONFIG = {
  PROCESSING_FEE_PERCENT: 0.029,
  PROCESSING_FEE_FIXED: 3.0,
  PLATFORM_CUT_PERCENT: 0.15,
  MAX_BOOKING_DURATION: 8,
  MIN_BOOKING_DURATION: 1,
} as const;

export const LOCATION_CONFIG = {
  TRACKING_START_MINUTES: 10,
  UPDATE_INTERVAL_MS: 5000,
  DISTANCE_FILTER_METERS: 10,
} as const;
