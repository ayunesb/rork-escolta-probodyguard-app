# UX Improvements & Testing Guide

## Overview
This guide covers User Experience improvements, testing setup, and accessibility features for the Escolta Pro application.

## 1. Deep Link Testing Setup

### Android Deep Links
```javascript
// app.config.js additions for Android
android: {
  intentFilters: [
    {
      action: 'VIEW',
      autoVerify: true,
      data: [
        {
          scheme: 'https',
          host: 'escolta-pro.com',
        },
        {
          scheme: 'escoltapro',
        }
      ],
      category: ['BROWSABLE', 'DEFAULT'],
    },
  ],
},
```

### iOS Deep Links
```javascript
// app.config.js additions for iOS
ios: {
  associatedDomains: ['applinks:escolta-pro.com'],
  bundleIdentifier: 'com.escolta.pro',
},
```

### Deep Link Handler Component
```typescript
// components/DeepLinkHandler.tsx
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';

export function DeepLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    const handleDeepLink = (url: string) => {
      const { pathname, queryParams } = Linking.parse(url);
      
      switch (pathname) {
        case '/booking':
          router.push(`/booking?${new URLSearchParams(queryParams).toString()}`);
          break;
        case '/payment':
          router.push(`/payment?${new URLSearchParams(queryParams).toString()}`);
          break;
        case '/profile':
          router.push('/profile');
          break;
        default:
          router.push('/');
      }
    };

    // Handle initial URL
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    // Handle subsequent URLs
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription?.remove();
  }, [router]);

  return null;
}
```

## 2. Push Notification Testing

### Setup Notification Service
```typescript
// services/notificationService.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export class NotificationService {
  async setupNotifications() {
    const { status } = await Notifications.requestPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Notification permissions not granted');
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return await Notifications.getExpoPushTokenAsync();
  }

  async sendTestNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Booking Confirmed! 📱",
        body: 'Your bodyguard will arrive in 15 minutes',
        data: { bookingId: 'test-123' },
      },
      trigger: { seconds: 2 },
    });
  }
}
```

### Test Scenarios
1. **Booking Notifications**
   - Booking confirmed
   - Guard en route
   - Service started/completed
   - Emergency alerts

2. **Payment Notifications**
   - Payment successful
   - Payment failed
   - Refund processed

## 3. Accessibility Audit & Improvements

### Accessibility Testing Component
```typescript
// components/AccessibilityTester.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { analyticsService } from '@/services/analyticsService';

export function AccessibilityTester() {
  const runAccessibilityAudit = async () => {
    const issues: string[] = [];
    
    // Check for missing accessibility labels
    const buttons = document.querySelectorAll('button, [role="button"]');
    buttons.forEach((btn, index) => {
      if (!btn.getAttribute('aria-label') && !btn.textContent?.trim()) {
        issues.push(`Button ${index + 1} missing accessibility label`);
      }
    });

    // Check for proper heading structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) {
      issues.push('No heading elements found');
    }

    // Check for alt text on images
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
      if (!img.getAttribute('alt')) {
        issues.push(`Image ${index + 1} missing alt text`);
      }
    });

    // Log results
    await analyticsService.logEvent('ACCESSIBILITY_AUDIT', {
      issues_found: issues.length,
      timestamp: Date.now(),
    });

    Alert.alert(
      'Accessibility Audit',
      issues.length === 0 
        ? 'No accessibility issues found!' 
        : `Found ${issues.length} issues:\n${issues.join('\n')}`
    );
  };

  return (
    <TouchableOpacity
      onPress={runAccessibilityAudit}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel="Run accessibility audit"
      style={{ padding: 16, backgroundColor: '#007AFF', borderRadius: 8 }}
    >
      <Text style={{ color: 'white', textAlign: 'center' }}>
        Run Accessibility Audit
      </Text>
    </TouchableOpacity>
  );
}
```

### Accessibility Improvements Checklist
- [ ] All buttons have `accessibilityLabel`
- [ ] Images have `accessibilityLabel` or are marked as decorative
- [ ] Form inputs have proper labels
- [ ] Color contrast ratio meets WCAG standards
- [ ] Touch targets are at least 44x44 points
- [ ] Screen reader navigation is logical
- [ ] Focus indicators are visible
- [ ] Content is readable when zoomed to 200%

## 4. Performance Optimization Guidelines

### Performance Monitoring Setup
```typescript
// utils/performanceOptimization.ts
import { performanceService } from '@/services/performanceService';

export class PerformanceOptimizer {
  static async measureScreenLoad(screenName: string) {
    const trace = await performanceService.startTrace(`screen_load_${screenName}`);
    
    return {
      stop: () => trace.stop(),
      addMetric: (name: string, value: number) => trace.putMetric(name, value),
    };
  }

  static optimizeImages() {
    // Implement image optimization
    return {
      recommendations: [
        'Use WebP format for better compression',
        'Implement lazy loading for images',
        'Use appropriate image sizes for different screen densities',
        'Cache frequently used images',
      ],
    };
  }

  static checkBundleSize() {
    // Bundle size analysis
    return {
      recommendations: [
        'Remove unused dependencies',
        'Use dynamic imports for large features',
        'Optimize third-party libraries',
        'Enable Hermes for Android',
      ],
    };
  }
}
```

### Performance Testing Guidelines
1. **App Startup Time**: < 3 seconds
2. **Screen Transition**: < 500ms
3. **Payment Processing**: < 5 seconds
4. **Memory Usage**: Monitor for leaks
5. **Battery Impact**: Optimize location tracking

## 5. Testing Automation Setup

### E2E Testing with Detox (React Native)
```javascript
// e2e/bookingFlow.test.js
describe('Booking Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should complete a booking successfully', async () => {
    // Login
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    // Navigate to booking
    await element(by.id('book-guard-button')).tap();

    // Fill booking details
    await element(by.id('service-type-selector')).tap();
    await element(by.text('Personal Protection')).tap();
    
    await element(by.id('duration-input')).typeText('4');
    await element(by.id('location-input')).typeText('Downtown Mexico City');

    // Confirm booking
    await element(by.id('confirm-booking-button')).tap();

    // Verify success
    await expect(element(by.text('Booking Confirmed'))).toBeVisible();
  });

  it('should handle payment flow', async () => {
    // Navigate to payment
    await element(by.id('payment-method-button')).tap();

    // Add payment method
    await element(by.id('add-card-button')).tap();
    await element(by.id('card-number-input')).typeText('4111111111111111');
    await element(by.id('expiry-input')).typeText('12/25');
    await element(by.id('cvv-input')).typeText('123');

    // Save payment method
    await element(by.id('save-card-button')).tap();

    // Verify success
    await expect(element(by.text('Payment method added'))).toBeVisible();
  });
});
```

### Unit Testing Examples
```typescript
// __tests__/services/analyticsService.test.ts
import { analyticsService } from '@/services/analyticsService';

describe('AnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should track booking events correctly', async () => {
    const mockLogEvent = jest.spyOn(analyticsService, 'logEvent');
    
    await analyticsService.trackBookingStarted(
      'Personal Protection',
      4,
      'Downtown Mexico City'
    );

    expect(mockLogEvent).toHaveBeenCalledWith(
      'BOOKING_STARTED',
      expect.objectContaining({
        service_type: 'Personal Protection',
        duration_hours: 4,
        pickup_location: 'Downtown Mexico City',
      })
    );
  });

  it('should handle payment tracking', async () => {
    const mockLogEvent = jest.spyOn(analyticsService, 'logEvent');
    
    await analyticsService.trackPaymentCompleted(
      'txn_123',
      1000,
      'MXN',
      'credit_card'
    );

    expect(mockLogEvent).toHaveBeenCalledWith(
      'PAYMENT_COMPLETED',
      expect.objectContaining({
        transaction_id: 'txn_123',
        amount: 1000,
        currency: 'MXN',
        payment_method: 'credit_card',
      })
    );
  });
});
```

## 6. Security Testing

### Security Test Checklist
- [ ] SSL/TLS certificate validation
- [ ] API endpoint security testing
- [ ] Input validation testing
- [ ] Authentication flow testing
- [ ] Authorization checks
- [ ] Data encryption verification
- [ ] Payment security compliance

### Security Testing Scripts
```typescript
// scripts/securityTest.ts
export class SecurityTester {
  static async testAPIEndpoints() {
    const endpoints = [
      '/api/bookings',
      '/api/payments',
      '/api/users',
      '/api/guards',
    ];

    for (const endpoint of endpoints) {
      // Test without authentication
      try {
        const response = await fetch(endpoint);
        if (response.status !== 401) {
          console.warn(`Endpoint ${endpoint} may be unsecured`);
        }
      } catch (error) {
        console.error(`Error testing ${endpoint}:`, error);
      }
    }
  }

  static testInputValidation() {
    const maliciousInputs = [
      '<script>alert("xss")</script>',
      '../../etc/passwd',
      'DROP TABLE users;',
      '{{7*7}}',
    ];

    // Test each input against form fields
    // Implementation depends on your form structure
  }
}
```

## 7. Production Readiness Checklist

### Final QA Checklist
- [ ] All monitoring services configured
- [ ] Error tracking operational
- [ ] Performance monitoring active
- [ ] Security headers implemented
- [ ] App Check configured
- [ ] Push notifications working
- [ ] Deep links tested
- [ ] Accessibility audit passed
- [ ] Payment flow tested
- [ ] Emergency features tested
- [ ] Location services tested
- [ ] Offline functionality tested
- [ ] Data synchronization tested

### Deployment Steps
1. Update environment variables
2. Test all monitoring integrations
3. Verify security configurations
4. Run full test suite
5. Performance baseline testing
6. Security audit
7. Deploy to staging
8. User acceptance testing
9. Deploy to production
10. Monitor for issues

## 8. Monitoring Dashboard

Create a simple monitoring dashboard to track:
- Active users
- Booking success rate
- Payment success rate
- Error rates
- Performance metrics
- Security incidents

This comprehensive UX and testing setup ensures your application is production-ready with proper monitoring, security, and user experience optimizations.