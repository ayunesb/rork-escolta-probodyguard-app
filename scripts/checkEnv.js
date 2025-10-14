#!/usr/bin/env node
const required = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_API_URL',
  'BRAINTREE_MERCHANT_ID',
  'BRAINTREE_PUBLIC_KEY',
  'BRAINTREE_PRIVATE_KEY',
];

const missing = required.filter((k) => !process.env[k] && !process.env[`EXPO_PUBLIC_${k}`]);

if (missing.length) {
  console.warn('[checkEnv] Missing environment variables:');
  missing.forEach((m) => console.warn(' -', m));
  process.exitCode = 2;
} else {
  console.log('[checkEnv] All required environment variables appear present.');
}
