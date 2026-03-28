#!/usr/bin/env node

console.log('\n⚠️  EMAIL VERIFICATION ISSUE DETECTED\n');
console.log('The demo account guard1@demo.com is not email verified.');
console.log('This is causing the "Missing or insufficient permissions" error.\n');

console.log('📋 QUICK FIX OPTIONS:\n');

console.log('Option 1: Use Firebase Console (Recommended)');
console.log('  1. Visit: https://console.firebase.google.com/project/escolta-pro-fe90e/authentication/users');
console.log('  2. Find guard1@demo.com in the users list');
console.log('  3. Click the three dots (...) → Edit user');
console.log('  4. Check "Email verified"');
console.log('  5. Save\n');

console.log('Option 2: Temporarily Allow Unverified Login');
console.log('  1. Edit .env file');
console.log('  2. Set: EXPO_PUBLIC_ALLOW_UNVERIFIED_LOGIN=1');
console.log('  3. Restart Metro (press r in terminal)');
console.log('  4. Login should work (but less secure)\n');

console.log('Option 3: Use Different Account');
console.log('  Try logging in with: client@demo.com / DemoClient123!');
console.log('  (This account is already verified)\n');

console.log('✅ RECOMMENDED: Option 1 (Firebase Console) for production-ready setup\n');
