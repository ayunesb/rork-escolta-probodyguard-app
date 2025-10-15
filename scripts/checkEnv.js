#!/usr/bin/env node

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

const required = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID', 
  'EXPO_PUBLIC_API_URL',
  'BRAINTREE_MERCHANT_ID',
  'BRAINTREE_PUBLIC_KEY',
  'BRAINTREE_PRIVATE_KEY',
];

console.log('[checkEnv] Checking environment variables...');

const missing = required.filter((k) => !process.env[k]);
const present = required.filter((k) => process.env[k]);

if (present.length > 0) {
  console.log('[checkEnv] Present variables:');
  present.forEach((p) => console.log(' ✓', p));
}

if (missing.length) {
  console.warn('[checkEnv] Missing environment variables:');
  missing.forEach((m) => console.warn(' ✗', m));
  process.exitCode = 2;
} else {
  console.log('[checkEnv] ✓ All required environment variables are present.');
}
