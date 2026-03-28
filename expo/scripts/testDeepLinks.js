#!/usr/bin/env node

/**
 * Test script for deep linking and push notifications
 * This script verifies the app's deep link configuration and notification setup
 */

import fs from 'fs';

console.log('🧪 Testing Deep Links & Push Notifications\n');

// Test 1: Check deep link configuration
console.log('📱 1. Checking Deep Link Configuration');
try {
  const appConfigPath = 'app.config.js';
  const appConfig = fs.readFileSync(appConfigPath, 'utf8');
  
  if (appConfig.includes("scheme: 'nobodyguard'")) {
    console.log('✅ Deep link scheme configured: nobodyguard://');
  } else {
    console.log('❌ Deep link scheme not found');
  }
  
  // Check if iOS bundle ID and Android package are set
  if (appConfig.includes('bundleIdentifier: "com.escolta.pro"') && 
      appConfig.includes('package: \'com.escolta.pro\'')) {
    console.log('✅ Platform identifiers configured');
  } else {
    console.log('❌ Missing platform identifiers');
  }
} catch (error) {
  console.log('❌ Error reading app.config.js:', error.message);
}

// Test 2: Check notification services
console.log('\n🔔 2. Checking Notification Services');
try {
  const notificationServiceExists = fs.existsSync('services/notificationService.ts');
  const pushNotificationServiceExists = fs.existsSync('services/pushNotificationService.ts');
  
  if (notificationServiceExists && pushNotificationServiceExists) {
    console.log('✅ Notification services found');
    
    // Check for Expo project ID
    const notificationService = fs.readFileSync('services/notificationService.ts', 'utf8');
    if (notificationService.includes('7cee6c31-9a1c-436d-9baf-57fc8a43b651')) {
      console.log('✅ EAS project ID configured for push tokens');
    } else {
      console.log('⚠️  EAS project ID not found');
    }
  } else {
    console.log('❌ Notification services not found');
  }
} catch (error) {
  console.log('❌ Error checking notification services:', error.message);
}

// Test 3: Check EAS configuration
console.log('\n🏗️ 3. Checking EAS Configuration');
try {
  const easJsonExists = fs.existsSync('eas.json');
  if (easJsonExists) {
    const easConfig = fs.readFileSync('eas.json', 'utf8');
    const config = JSON.parse(easConfig);
    
    if (config.build) {
      console.log('✅ EAS build configuration found');
      
      // Check for development profile
      if (config.build.development) {
        console.log('✅ Development build profile configured');
      } else {
        console.log('⚠️  Development build profile not found');
      }
      
      // Check for preview/production profiles
      if (config.build.preview && config.build.production) {
        console.log('✅ Preview and production profiles configured');
      } else {
        console.log('⚠️  Missing preview or production profiles');
      }
    }
  } else {
    console.log('❌ eas.json not found');
  }
} catch (error) {
  console.log('❌ Error reading eas.json:', error.message);
}

// Test 4: Check package dependencies
console.log('\n📦 4. Checking Dependencies');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = [
    'expo-notifications',
    'expo-linking',
    'expo-constants'
  ];
  
  const missingDeps = requiredDeps.filter(dep => !deps[dep]);
  
  if (missingDeps.length === 0) {
    console.log('✅ All required dependencies installed');
  } else {
    console.log('❌ Missing dependencies:', missingDeps.join(', '));
  }
} catch (error) {
  console.log('❌ Error checking dependencies:', error.message);
}

// Test 5: Suggest testing steps
console.log('\n🔍 5. Testing Instructions');
console.log('To test deep linking and push notifications:');
console.log('');
console.log('📱 Deep Link Testing:');
console.log('   1. Build a development app: npx eas build --profile development --platform ios');
console.log('   2. Install on device and open terminal');
console.log('   3. Test deep link: adb shell am start -W -a android.intent.action.VIEW -d "nobodyguard://booking/123" com.escolta.pro');
console.log('   4. Or on iOS simulator: xcrun simctl openurl booted "nobodyguard://booking/123"');
console.log('');
console.log('🔔 Push Notification Testing:');
console.log('   1. Install development build on physical device');
console.log('   2. Allow notification permissions when prompted');
console.log('   3. Check Expo console for push token');
console.log('   4. Use Expo Push Tool: https://expo.dev/notifications');
console.log('');
console.log('⚠️  Important: Push notifications require a development build, not Expo Go!');

console.log('\n✨ Test Summary Complete');