# Monitoring Services Configuration Guide

## Overview
This guide covers the comprehensive monitoring setup for the Escolta Pro app, including Sentry error tracking, Firebase Analytics, Firebase Performance monitoring, and custom monitoring services.

## Current Monitoring Stack

### ✅ 1. Sentry Error Tracking
**Status:** Fully Configured
**Location:** `services/sentryService.ts`
**Features:**
- Error boundary protection
- Breadcrumb tracking
- User context tracking
- Performance measurement
- Custom error reporting

#### Configuration Required
```bash
# Add to .env
EXPO_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
EXPO_PUBLIC_SENTRY_ENVIRONMENT=production
```

#### Key Features Implemented
- ✅ **Error Boundary:** Catches React component errors
- ✅ **Breadcrumb Tracking:** Records user actions
- ✅ **Performance Monitoring:** Manual span measurement
- ✅ **User Context:** Associates errors with users
- ✅ **Custom Error Reporting:** Structured error capture

### ✅ 2. Firebase Analytics
**Status:** Fully Configured
**Location:** `services/analyticsService.ts`
**Features:**
- User event tracking
- Conversion funnel analysis
- Custom event parameters
- User property tracking

#### Key Events Tracked
```typescript
enum AnalyticsEvent {
  APP_OPENED = 'app_opened',
  USER_SIGNUP = 'user_signup', 
  BOOKING_CREATED = 'booking_created',
  BOOKING_COMPLETED = 'booking_completed',
  PAYMENT_COMPLETED = 'payment_completed',
  ERROR_OCCURRED = 'error_occurred'
}
```

#### Automatic Initialization
```typescript
// In app/_layout.tsx
await analyticsService.initialize();
```

### ✅ 3. Firebase Performance Monitoring
**Status:** Fully Configured
**Location:** `services/performanceService.ts`
**Features:**
- Custom trace monitoring
- Network request tracking
- App startup time measurement
- Custom metrics collection

#### Performance Traces Available
- **App Startup:** Initial app load time
- **API Requests:** Network performance
- **Payment Processing:** Transaction timing
- **Navigation:** Screen transition times

### ✅ 4. Custom Monitoring Service
**Status:** Fully Configured
**Location:** `services/monitoringService.ts`
**Features:**
- Business metric tracking
- Custom dashboard data
- Real-time monitoring
- Alert generation

## Production Monitoring Setup

### 1. Sentry Production Configuration

#### Create Sentry Project
1. Go to [Sentry.io](https://sentry.io)
2. Create new project for React Native
3. Copy the DSN URL
4. Add to production environment variables

#### Production Sentry Settings
```javascript
// Production configuration
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: 'production',
  enableAutoSessionTracking: true,
  sessionTrackingIntervalMillis: 10000,
  beforeSend: (event) => {
    // Filter out non-critical errors in production
    if (event.level === 'warning') return null;
    return event;
  }
});
```

### 2. Firebase Analytics Configuration

#### Google Analytics 4 Setup
Firebase Analytics is automatically configured with your Firebase project.

**Key Metrics to Monitor:**
- **Daily Active Users (DAU)**
- **Monthly Active Users (MAU)**
- **User Retention Rates**
- **Conversion Funnels**
- **Revenue Tracking**

#### Custom Conversion Events
```typescript
// Track business-critical events
await analyticsService.trackUserSignup({
  signupMethod: 'email',
  userType: 'client'
});

await analyticsService.trackBookingCompleted({
  bookingId: 'booking_123',
  guardType: 'personal',
  duration: 3600,
  amount: 500
});

await analyticsService.trackPaymentCompleted({
  transactionId: 'txn_456',
  amount: 500,
  currency: 'MXN',
  paymentMethod: 'credit_card'
});
```

### 3. Firebase Performance Monitoring

#### Automatic Metrics
Firebase Performance automatically tracks:
- **App startup time**
- **HTTP/HTTPS network requests**
- **Screen rendering performance**

#### Custom Performance Traces
```typescript
import { performanceService } from '@/services/performanceService';

// Track critical business operations
const trace = await performanceService.startTrace('payment_process');
await performanceService.addAttribute('payment_process', 'method', 'braintree');
// ... perform payment
await performanceService.addMetric('payment_process', 'amount', 500);
await performanceService.stopTrace('payment_process');
```

## Monitoring Dashboard Setup

### 1. Firebase Console Monitoring

#### Analytics Dashboard
- **URL:** https://console.firebase.google.com/project/escolta-pro-fe90e/analytics
- **Key Reports:**
  - User engagement
  - Revenue analytics
  - Conversion funnels
  - Real-time data

#### Performance Dashboard
- **URL:** https://console.firebase.google.com/project/escolta-pro-fe90e/performance
- **Key Metrics:**
  - App startup time
  - Network requests performance
  - Screen rendering time
  - Custom trace data

### 2. Sentry Dashboard

#### Error Monitoring
- **URL:** https://sentry.io/organizations/[org]/projects/escolta-pro/
- **Key Features:**
  - Real-time error tracking
  - Performance monitoring
  - Release tracking
  - User feedback

#### Alert Configuration
```javascript
// Set up alerts for critical issues
{
  "error_rate": {
    "threshold": "5%",
    "time_window": "5 minutes",
    "notification": "slack, email"
  },
  "performance": {
    "threshold": "3 seconds",
    "metric": "transaction_duration",
    "notification": "slack"
  }
}
```

### 3. Custom Monitoring Dashboard

#### Business Metrics Tracking
```typescript
// Track key business metrics
await monitoringService.trackRevenue(500, {
  bookingId: 'booking_123',
  currency: 'MXN',
  paymentMethod: 'braintree'
});

await monitoringService.trackUserEngagement('booking_search', {
  searchFilters: ['location', 'price'],
  resultsCount: 15
});

await monitoringService.trackPerformance('api_response_time', 1.2, {
  endpoint: '/api/bookings',
  method: 'GET'
});
```

## Production Monitoring Checklist

### Pre-Launch Setup
- [ ] **Sentry DSN configured** for production environment
- [ ] **Firebase Analytics enabled** and tested
- [ ] **Firebase Performance monitoring** active
- [ ] **Custom monitoring service** tracking business metrics
- [ ] **Alert rules configured** for critical issues
- [ ] **Dashboard access** granted to team members

### Post-Launch Monitoring

#### Week 1: Critical Monitoring
- [ ] **Error rate < 1%** across all features
- [ ] **App startup time < 3 seconds** on average
- [ ] **API response time < 2 seconds** for 95th percentile
- [ ] **Payment success rate > 98%**
- [ ] **Zero critical crashes** reported

#### Ongoing Monitoring
- [ ] **Weekly performance reports** generated
- [ ] **Monthly user engagement analysis**
- [ ] **Quarterly monitoring stack review**
- [ ] **Annual compliance audit** of data collection

## Key Performance Indicators (KPIs)

### Technical KPIs
- **App Crash Rate:** < 0.1%
- **App Startup Time:** < 3 seconds
- **API Response Time:** < 2 seconds (95th percentile)
- **Network Success Rate:** > 99%
- **Memory Usage:** < 150MB average

### Business KPIs
- **Daily Active Users (DAU)**
- **Monthly Active Users (MAU)**
- **User Retention Rate:** 7-day, 30-day
- **Conversion Rate:** Registration to first booking
- **Revenue Per User (ARPU)**
- **Customer Satisfaction Score**

### Security KPIs
- **Failed Authentication Attempts**
- **Suspicious Activity Detection**
- **Data Breach Incidents:** 0
- **Compliance Violations:** 0

## Alerting and Escalation

### Critical Alerts (Immediate Response)
- **App crash rate > 1%**
- **Payment processing failure > 5%**
- **API downtime > 2 minutes**
- **Security breach detected**

#### Alert Channels
- **Slack:** Real-time team notifications
- **Email:** Stakeholder updates
- **SMS:** Critical issues for on-call engineer
- **PagerDuty:** Automated escalation

### Warning Alerts (1-hour Response)
- **Performance degradation**
- **Error rate increase**
- **User engagement drops**
- **Revenue tracking anomalies**

## Monitoring Best Practices

### Data Privacy and Compliance
- ✅ **GDPR compliance:** User consent for analytics
- ✅ **Data minimization:** Only essential data collected
- ✅ **Data retention:** Automatic cleanup after 90 days
- ✅ **User anonymization:** PII removed from tracking

### Performance Optimization
- **Batch analytics events** to reduce network calls
- **Sample performance traces** for high-traffic areas
- **Cache monitoring data** to reduce Firebase costs
- **Optimize payload sizes** for mobile networks

### Cost Management
- **Firebase Analytics:** Free tier (unlimited events)
- **Firebase Performance:** Free tier (10M traces/month)
- **Sentry:** Monitor usage for plan optimization
- **Custom monitoring:** Efficient Firestore queries

## Troubleshooting Guide

### Common Issues

#### Sentry Not Receiving Events
```bash
# Check configuration
node -e "console.log(process.env.EXPO_PUBLIC_SENTRY_DSN)"

# Test Sentry connection
Sentry.captureMessage('Test message');
```

#### Firebase Analytics Not Working
```typescript
// Enable debug mode for testing
await analytics().setAnalyticsCollectionEnabled(true);
await analytics().setDefaultEventParameters({
  debug_mode: __DEV__
});
```

#### Performance Traces Missing
```typescript
// Check if performance monitoring is enabled
const isEnabled = await perf().isPerformanceCollectionEnabled();
console.log('Performance monitoring enabled:', isEnabled);
```

### Debug Commands

#### Test All Monitoring Services
```bash
# Run monitoring validation script
node scripts/checkMonitoring.js

# Check service initialization
node scripts/validateServices.js
```

## Integration Testing

### Monitoring Integration Tests
```typescript
// Test analytics tracking
describe('Analytics Integration', () => {
  it('should track user signup events', async () => {
    await analyticsService.trackUserSignup({
      signupMethod: 'email',
      userType: 'client'
    });
    // Verify event was tracked
  });
});

// Test performance monitoring
describe('Performance Integration', () => {
  it('should measure payment processing time', async () => {
    const trace = await performanceService.startTrace('test_payment');
    // Simulate payment process
    await performanceService.stopTrace('test_payment');
    // Verify trace was recorded
  });
});
```

## Success Metrics

### Launch Success Indicators
- **All monitoring services active** within 1 hour of launch
- **Error tracking functional** with test errors captured
- **Analytics events flowing** to Firebase dashboard
- **Performance data visible** in console
- **Custom metrics recording** business operations

### Long-term Success Metrics
- **Proactive issue detection** before user impact
- **Data-driven product decisions** from analytics
- **Performance optimization** based on monitoring data
- **User experience improvements** from feedback loops

## Next Steps

1. **Configure Sentry DSN** for production environment
2. **Set up alert rules** for critical metrics
3. **Create monitoring dashboards** for stakeholders
4. **Test all monitoring services** before production launch
5. **Train team members** on monitoring tools and processes

## Resources

- [Sentry React Native Documentation](https://docs.sentry.io/platforms/react-native/)
- [Firebase Analytics Documentation](https://firebase.google.com/docs/analytics)
- [Firebase Performance Monitoring](https://firebase.google.com/docs/perf-mon)
- [React Native Firebase Documentation](https://rnfirebase.io/)