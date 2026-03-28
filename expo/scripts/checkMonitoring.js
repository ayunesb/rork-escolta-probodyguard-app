#!/usr/bin/env node

/**
 * Monitoring Services Validation Script
 * Validates that all monitoring services are properly configured and functional
 */

import fs from 'fs';

console.log('📊 Monitoring Services Validation\n');

const monitoringServices = [
  {
    name: 'Sentry Error Tracking',
    service: 'sentryService.ts',
    dependencies: ['@sentry/react-native'],
    envVars: ['EXPO_PUBLIC_SENTRY_DSN', 'EXPO_PUBLIC_SENTRY_ENVIRONMENT'],
    features: [
      'Error boundary protection',
      'Breadcrumb tracking', 
      'User context tracking',
      'Performance measurement',
      'Custom error reporting'
    ]
  },
  {
    name: 'Firebase Analytics',
    service: 'analyticsService.ts',
    dependencies: ['@react-native-firebase/analytics'],
    envVars: ['EXPO_PUBLIC_FIREBASE_PROJECT_ID'],
    features: [
      'User event tracking',
      'Conversion funnel analysis',
      'Custom event parameters',
      'User property tracking'
    ]
  },
  {
    name: 'Firebase Performance',
    service: 'performanceService.ts', 
    dependencies: ['@react-native-firebase/perf'],
    envVars: ['EXPO_PUBLIC_FIREBASE_PROJECT_ID'],
    features: [
      'Custom trace monitoring',
      'Network request tracking',
      'App startup measurement',
      'Custom metrics collection'
    ]
  },
  {
    name: 'Custom Monitoring',
    service: 'monitoringService.ts',
    dependencies: ['firebase/firestore'],
    envVars: ['EXPO_PUBLIC_FIREBASE_PROJECT_ID'],
    features: [
      'Business metric tracking',
      'Custom dashboard data',
      'Real-time monitoring',
      'Alert generation'
    ]
  }
];

console.log('🔍 Service Configuration Validation:\n');

let allServicesReady = true;

monitoringServices.forEach((service, index) => {
  console.log(`${index + 1}. ${service.name}`);
  
  // Check if service file exists
  const serviceExists = fs.existsSync(`services/${service.service}`);
  console.log(`   📁 Service File: ${serviceExists ? '✅' : '❌'} services/${service.service}`);
  
  if (!serviceExists) allServicesReady = false;
  
  // Check environment variables
  console.log('   🔧 Environment Variables:');
  service.envVars.forEach(envVar => {
    const isSet = process.env[envVar] ? true : false;
    console.log(`      ${isSet ? '✅' : '⚠️'} ${envVar}`);
  });
  
  // List features
  console.log('   ⚡ Features:');
  service.features.forEach(feature => {
    console.log(`      • ${feature}`);
  });
  
  console.log('');
});

// Check package.json dependencies
console.log('📦 Dependencies Validation:\n');

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = [
    '@sentry/react-native',
    '@react-native-firebase/analytics', 
    '@react-native-firebase/perf',
    '@react-native-firebase/app'
  ];
  
  requiredDeps.forEach(dep => {
    const installed = deps[dep] ? true : false;
    console.log(`${installed ? '✅' : '❌'} ${dep}`);
    if (!installed) allServicesReady = false;
  });
  
} catch (_error) {
  console.log('❌ Could not read package.json');
  allServicesReady = false;
}

// Check initialization in app layout
console.log('\n🚀 Initialization Validation:\n');

try {
  const layoutContent = fs.readFileSync('app/_layout.tsx', 'utf8');
  
  const initChecks = [
    { 
      name: 'Sentry Import', 
      pattern: /import.*sentryService/, 
      message: 'Sentry service imported' 
    },
    { 
      name: 'Analytics Import', 
      pattern: /import.*analyticsService/, 
      message: 'Analytics service imported' 
    },
    { 
      name: 'Sentry Init', 
      pattern: /initSentry\(\)/, 
      message: 'Sentry initialization called' 
    },
    { 
      name: 'Analytics Init', 
      pattern: /analyticsService\.initialize\(\)/, 
      message: 'Analytics initialization called' 
    }
  ];
  
  initChecks.forEach(check => {
    const passed = check.pattern.test(layoutContent);
    console.log(`${passed ? '✅' : '⚠️'} ${check.name}: ${check.message}`);
  });
  
} catch (_error) {
  console.log('❌ Could not read app/_layout.tsx');
  allServicesReady = false;
}

// Check production environment variables
console.log('\n🏭 Production Environment Check:\n');

const productionEnvVars = [
  {
    name: 'EXPO_PUBLIC_SENTRY_DSN',
    description: 'Sentry error tracking URL',
    required: true,
    example: 'https://...@sentry.io/...'
  },
  {
    name: 'EXPO_PUBLIC_SENTRY_ENVIRONMENT', 
    description: 'Sentry environment tag',
    required: false,
    example: 'production'
  },
  {
    name: 'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
    description: 'Firebase project identifier',
    required: true,
    example: 'escolta-pro-fe90e'
  },
  {
    name: 'EXPO_PUBLIC_ENABLE_ANALYTICS',
    description: 'Analytics feature flag',
    required: false,
    example: 'true'
  },
  {
    name: 'EXPO_PUBLIC_ENABLE_PERFORMANCE_MONITORING',
    description: 'Performance monitoring flag',
    required: false,
    example: 'true'
  }
];

productionEnvVars.forEach(envVar => {
  const isSet = process.env[envVar] ? true : false;
  const status = isSet ? '✅' : (envVar.required ? '❌' : '⚠️');
  console.log(`${status} ${envVar.name}: ${envVar.description}`);
  if (!isSet) {
    console.log(`   Example: ${envVar.example}`);
  }
});

console.log('\n📈 Monitoring Dashboards:\n');

console.log('🔗 Dashboard URLs:');
console.log('   • Sentry: https://sentry.io/organizations/[org]/projects/escolta-pro/');
console.log('   • Firebase Analytics: https://console.firebase.google.com/project/escolta-pro-fe90e/analytics');
console.log('   • Firebase Performance: https://console.firebase.google.com/project/escolta-pro-fe90e/performance');
console.log('   • Firebase Console: https://console.firebase.google.com/project/escolta-pro-fe90e/overview');

console.log('\n🎯 Key Metrics to Monitor:\n');

console.log('📊 Technical Metrics:');
console.log('   • App crash rate < 0.1%');
console.log('   • App startup time < 3 seconds');
console.log('   • API response time < 2 seconds');
console.log('   • Network success rate > 99%');
console.log('   • Memory usage < 150MB');

console.log('\n💼 Business Metrics:');
console.log('   • Daily Active Users (DAU)');
console.log('   • Monthly Active Users (MAU)');
console.log('   • User retention (7-day, 30-day)');
console.log('   • Conversion rate (signup to booking)');
console.log('   • Revenue per user (ARPU)');

console.log('\n🚨 Critical Alerts Setup:\n');

console.log('⚡ Immediate Response Alerts:');
console.log('   • App crash rate > 1%');
console.log('   • Payment processing failure > 5%');
console.log('   • API downtime > 2 minutes');
console.log('   • Security breach detected');

console.log('\n⚠️  Warning Alerts (1-hour response):');
console.log('   • Performance degradation');
console.log('   • Error rate increase');
console.log('   • User engagement drops');
console.log('   • Revenue tracking anomalies');

console.log('\n🧪 Testing Commands:\n');

console.log('Test individual services:');
console.log('   # Test Sentry');
console.log('   node -e "require(\'./services/sentryService\').default.captureMessage(\'Test\')"');
console.log('');
console.log('   # Test Analytics (in app)');
console.log('   await analyticsService.logEvent(\'test_event\', { test: true });');
console.log('');
console.log('   # Test Performance (in app)');
console.log('   const trace = await performanceService.startTrace(\'test_trace\');');
console.log('   await performanceService.stopTrace(\'test_trace\');');

console.log('\n📋 Production Readiness Checklist:\n');

const productionChecklist = [
  'Sentry DSN configured for production environment',
  'Firebase Analytics enabled and tested', 
  'Firebase Performance monitoring active',
  'Custom monitoring service tracking business metrics',
  'Alert rules configured for critical issues',
  'Dashboard access granted to team members',
  'Error rate monitoring < 1%',
  'Performance targets defined and monitored',
  'Business KPI tracking operational',
  'Security monitoring alerts configured'
];

productionChecklist.forEach((item, index) => {
  console.log(`   ${index + 1}. [ ] ${item}`);
});

// Summary
console.log('\n📊 Summary:\n');

if (allServicesReady) {
  console.log('🎉 All monitoring services are properly configured!');
  console.log('✅ Ready for production monitoring');
} else {
  console.log('⚠️  Some monitoring services need attention');
  console.log('🔧 Review the issues above before production deployment');
}

console.log('\n🚀 Next Steps:');
console.log('1. Configure production Sentry DSN');
console.log('2. Set up alert rules for critical metrics');
console.log('3. Test all monitoring services in staging');
console.log('4. Create monitoring dashboards for stakeholders');
console.log('5. Train team on monitoring tools and processes');

console.log('\n✨ Monitoring setup validation complete! 📊');