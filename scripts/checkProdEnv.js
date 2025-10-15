#!/usr/bin/env node

/**
 * Production Environment Validation Script
 * Validates that all production configurations are properly set
 */

import dotenv from 'dotenv';

// Load production environment if it exists
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config();
}

console.log('🏭 Production Environment Validation\n');

const productionRequirements = [
  {
    category: 'Braintree Production',
    checks: [
      {
        name: 'BRAINTREE_ENV',
        expected: 'production',
        current: process.env.BRAINTREE_ENV,
        critical: true
      },
      {
        name: 'BRAINTREE_MERCHANT_ID',
        validation: (val) => val && !val.includes('sandbox'),
        current: process.env.BRAINTREE_MERCHANT_ID,
        critical: true
      },
      {
        name: 'BRAINTREE_PUBLIC_KEY', 
        validation: (val) => val && !val.includes('sandbox'),
        current: process.env.BRAINTREE_PUBLIC_KEY,
        critical: true
      },
      {
        name: 'BRAINTREE_PRIVATE_KEY',
        validation: (val) => val && val.length > 20,
        current: process.env.BRAINTREE_PRIVATE_KEY,
        critical: true
      }
    ]
  },
  {
    category: 'Security Configuration',
    checks: [
      {
        name: 'EXPO_PUBLIC_ALLOW_UNVERIFIED_LOGIN',
        expected: '0',
        current: process.env.EXPO_PUBLIC_ALLOW_UNVERIFIED_LOGIN,
        critical: true
      },
      {
        name: 'EXPO_PUBLIC_SENTRY_DSN',
        validation: (val) => val && val.startsWith('https://'),
        current: process.env.EXPO_PUBLIC_SENTRY_DSN,
        critical: false
      },
      {
        name: 'EXPO_PUBLIC_SENTRY_ENVIRONMENT',
        expected: 'production',
        current: process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT,
        critical: false
      }
    ]
  },
  {
    category: 'Firebase Configuration',
    checks: [
      {
        name: 'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
        expected: 'escolta-pro-fe90e',
        current: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
        critical: true
      },
      {
        name: 'EXPO_PUBLIC_API_URL',
        validation: (val) => val && val.startsWith('https://'),
        current: process.env.EXPO_PUBLIC_API_URL,
        critical: true
      }
    ]
  },
  {
    category: 'Feature Flags',
    checks: [
      {
        name: 'EXPO_PUBLIC_ENABLE_ANALYTICS',
        expected: 'true',
        current: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS,
        critical: false
      },
      {
        name: 'EXPO_PUBLIC_ENABLE_PERFORMANCE_MONITORING',
        expected: 'true',
        current: process.env.EXPO_PUBLIC_ENABLE_PERFORMANCE_MONITORING,
        critical: false
      }
    ]
  }
];

let criticalIssues = 0;
let warnings = 0;

console.log('📋 Production Readiness Checklist:\n');

productionRequirements.forEach((category) => {
  console.log(`🔍 ${category.category}:`);
  
  category.checks.forEach((check) => {
    let status = '❌';
    let message = '';
    
    if (check.expected) {
      if (check.current === check.expected) {
        status = '✅';
        message = `${check.current}`;
      } else {
        status = check.critical ? '❌' : '⚠️';
        message = `Expected: ${check.expected}, Got: ${check.current || 'undefined'}`;
        if (check.critical) criticalIssues++;
        else warnings++;
      }
    } else if (check.validation) {
      if (check.validation(check.current)) {
        status = '✅';
        message = 'Valid';
      } else {
        status = check.critical ? '❌' : '⚠️';
        message = `Invalid or missing value`;
        if (check.critical) criticalIssues++;
        else warnings++;
      }
    } else {
      if (check.current) {
        status = '✅';
        message = 'Present';
      } else {
        status = check.critical ? '❌' : '⚠️';
        message = 'Missing';
        if (check.critical) criticalIssues++;
        else warnings++;
      }
    }
    
    console.log(`   ${status} ${check.name}: ${message}`);
  });
  
  console.log('');
});

console.log('📊 Summary:');
console.log(`   Critical Issues: ${criticalIssues}`);
console.log(`   Warnings: ${warnings}`);

if (criticalIssues === 0 && warnings === 0) {
  console.log('\n🎉 Production environment is ready!');
  console.log('✅ All checks passed - safe to deploy to production');
  process.exit(0);
} else if (criticalIssues === 0) {
  console.log('\n⚠️  Production environment has warnings but is deployable');
  console.log('💡 Consider addressing warnings before production launch');
  process.exit(0);
} else {
  console.log('\n🚨 Production environment has critical issues!');
  console.log('❌ Fix critical issues before deploying to production');
  
  console.log('\n🔧 Next Steps:');
  if (process.env.BRAINTREE_ENV !== 'production') {
    console.log('1. Switch to production Braintree credentials');
    console.log('2. Set BRAINTREE_ENV=production');
  }
  if (process.env.EXPO_PUBLIC_ALLOW_UNVERIFIED_LOGIN !== '0') {
    console.log('3. Disable unverified login: EXPO_PUBLIC_ALLOW_UNVERIFIED_LOGIN=0');
  }
  if (!process.env.EXPO_PUBLIC_SENTRY_DSN) {
    console.log('4. Configure Sentry for production monitoring');
  }
  
  process.exit(1);
}

console.log('\n💡 Production Deployment Commands:');
console.log('   1. Deploy functions: firebase deploy --only functions');
console.log('   2. Deploy security rules: firebase deploy --only firestore:rules');
console.log('   3. Create production build: eas build --profile production');
console.log('   4. Submit to stores: eas submit --profile production');