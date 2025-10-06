import Constants from 'expo-constants';

export const ENV = {
  BRAINTREE_ENV: Constants.expoConfig?.extra?.braintreeEnv || 'sandbox',
  BRAINTREE_MERCHANT_ID: Constants.expoConfig?.extra?.braintreeMerchantId || '8jbcpm9yj7df7w4h',
  BRAINTREE_PUBLIC_KEY: Constants.expoConfig?.extra?.braintreePublicKey || 'fnig6rkd6vbkmxt',
  BRAINTREE_PRIVATE_KEY: Constants.expoConfig?.extra?.braintreePrivateKey || 'c96f93d2d472395ed66339',
  PAYMENTS_CURRENCY: 'MXN' as const,
  API_URL: Constants.expoConfig?.extra?.apiUrl || 'https://us-central1-escolta-pro.cloudfunctions.net/api',
};

export const PAYMENT_CONFIG = {
  PROCESSING_FEE_PERCENT: 0.029,
  PROCESSING_FEE_FIXED: 3.0,
  PLATFORM_CUT_PERCENT: 0.15,
  MAX_BOOKING_DURATION: 8,
  MIN_BOOKING_DURATION: 1,
};

export const LOCATION_CONFIG = {
  TRACKING_START_MINUTES: 10,
  UPDATE_INTERVAL_MS: 5000,
  DISTANCE_FILTER_METERS: 10,
};
