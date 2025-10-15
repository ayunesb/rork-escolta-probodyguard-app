#!/usr/bin/env node

/**
 * GitHub Secrets Validation Script
 * This script helps validate that all required secrets are properly configured
 */

console.log('🔐 GitHub Secrets Configuration Validator\n');

const requiredSecrets = [
  {
    name: 'EXPO_PUBLIC_FIREBASE_API_KEY',
    type: 'Firebase',
    description: 'Firebase Web API key',
    example: 'AIzaSy...'
  },
  {
    name: 'EXPO_PUBLIC_FIREBASE_PROJECT_ID', 
    type: 'Firebase',
    description: 'Firebase project ID',
    example: 'escolta-pro-fe90e'
  },
  {
    name: 'EXPO_PUBLIC_API_URL',
    type: 'Firebase',
    description: 'Cloud Functions URL',
    example: 'https://...cloudfunctions.net/...'
  },
  {
    name: 'FIREBASE_TOKEN',
    type: 'Firebase',
    description: 'CI/CD deployment token',
    example: '1//...' 
  },
  {
    name: 'BRAINTREE_MERCHANT_ID',
    type: 'Braintree',
    description: 'Merchant identifier',
    example: 'your_merchant_id'
  },
  {
    name: 'BRAINTREE_PUBLIC_KEY',
    type: 'Braintree', 
    description: 'Public key for client operations',
    example: 'sandbox_...'
  },
  {
    name: 'BRAINTREE_PRIVATE_KEY',
    type: 'Braintree',
    description: 'Private key for server operations', 
    example: 'your_private_key'
  },
  {
    name: 'EXPO_TOKEN',
    type: 'Expo',
    description: 'EAS build and deployment token',
    example: 'expo_...'
  }
];

console.log('📋 Required GitHub Repository Secrets:\n');

requiredSecrets.forEach((secret, index) => {
  console.log(`${index + 1}. ${secret.name}`);
  console.log(`   Type: ${secret.type}`);
  console.log(`   Description: ${secret.description}`);
  console.log(`   Example: ${secret.example}`);
  console.log('');
});

console.log('📍 Setup Instructions:');
console.log('1. Go to your GitHub repository');
console.log('2. Navigate to Settings > Secrets and variables > Actions');
console.log('3. Click "New repository secret" for each secret above');
console.log('4. Copy the exact name and add the corresponding value');
console.log('');

console.log('🧪 To Test Configuration:');
console.log('1. Add all secrets to GitHub repository');
console.log('2. Create a test commit: git commit --allow-empty -m "Test secrets"');
console.log('3. Push to main: git push origin main');
console.log('4. Check GitHub Actions tab for "Environment Check" job');
console.log('');

console.log('🔧 Generate Required Tokens:');
console.log('');
console.log('Firebase Token:');
console.log('  npm install -g firebase-tools');
console.log('  firebase login:ci');
console.log('');
console.log('Expo Token:');
console.log('  Visit: https://expo.dev/accounts/settings/access-tokens');
console.log('  Create new token with build permissions');
console.log('');

console.log('🚨 Security Reminders:');
console.log('- Never commit secrets to version control');
console.log('- Use production Braintree keys only when ready for production');
console.log('- Rotate tokens every 90 days');
console.log('- Monitor secret access in GitHub audit logs');
console.log('');

// Check if we're in a GitHub Actions environment
if (process.env.GITHUB_ACTIONS) {
  console.log('🤖 GitHub Actions Environment Detected');
  console.log('Checking if secrets are available...\n');
  
  let allPresent = true;
  requiredSecrets.forEach(secret => {
    const isPresent = process.env[secret.name] ? '✅' : '❌';
    console.log(`${isPresent} ${secret.name}`);
    if (!process.env[secret.name]) {
      allPresent = false;
    }
  });
  
  if (allPresent) {
    console.log('\n✅ All required secrets are configured!');
    process.exit(0);
  } else {
    console.log('\n❌ Some secrets are missing. Please configure them in GitHub repository settings.');
    process.exit(1);
  }
} else {
  console.log('💡 Run this script in GitHub Actions to validate secret configuration.');
}

console.log('\n✨ Setup Complete! Your secrets should now be ready for CI/CD.');