# Production Environment Setup Guide

## Overview
This guide covers configuring the Escolta Pro app for production deployment with live Braintree payment processing.

## Environment Configuration

### 1. Production Environment Variables

Create a production environment file `.env.production`:

```bash
# === BRAINTREE PRODUCTION ===
BRAINTREE_ENV=production
BRAINTREE_MERCHANT_ID=your_production_merchant_id
BRAINTREE_PUBLIC_KEY=your_production_public_key  
BRAINTREE_PRIVATE_KEY=your_production_private_key
EXPO_PUBLIC_BRAINTREE_TOKENIZATION_KEY=your_production_tokenization_key
EXPO_PUBLIC_BRAINTREE_CSE_KEY=-----BEGIN PUBLIC KEY-----
your_production_cse_key
-----END PUBLIC KEY-----

# === FIREBASE PRODUCTION CONFIG ===
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyAjjsRChFfCQi3piUdtiUCqyysFrh2Cdes
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=escolta-pro-fe90e.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=escolta-pro-fe90e
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=escolta-pro-fe90e.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=919834684647
EXPO_PUBLIC_FIREBASE_APP_ID=1:919834684647:web:60dad6457ad0f92b068642

# === PRODUCTION API CONFIG ===
EXPO_PUBLIC_API_URL=https://handlepaymentwebhook-fqzvp2js5q-uc.a.run.app
EXPO_PUBLIC_ALLOW_UNVERIFIED_LOGIN=0

# === MONITORING CONFIG ===
EXPO_PUBLIC_SENTRY_DSN=your_production_sentry_dsn
EXPO_PUBLIC_SENTRY_ENVIRONMENT=production
EXPO_PUBLIC_APP_CHECK_DEBUG_TOKEN=
EXPO_PUBLIC_RECAPTCHA_SITE_KEY=your_production_recaptcha_key

# === FEATURE FLAGS ===
EXPO_PUBLIC_ENABLE_ANALYTICS=true
EXPO_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
```

### 2. Braintree Production Setup

#### Step 1: Braintree Account Verification
Before going live, ensure your Braintree account is approved for production:

1. **Complete KYC (Know Your Customer) requirements**
2. **Submit required business documentation**
3. **Pass Braintree's compliance review**
4. **Receive production credentials**

#### Step 2: Get Production Credentials
1. Login to [Braintree Control Panel](https://sandbox.braintreegateway.com/)
2. Switch to **Production Environment**
3. Navigate to **Settings > API Keys**
4. Copy your production credentials:
   - Merchant ID
   - Public Key
   - Private Key
   - Tokenization Key

#### Step 3: Production Webhook Setup
Configure webhooks for production transactions:
```
Production Webhook URL: https://handlepaymentwebhook-fqzvp2js5q-uc.a.run.app/webhook
Events to Subscribe:
- subscription_charged_successfully
- subscription_charged_unsuccessfully  
- transaction_disbursed
- transaction_settled
- transaction_settlement_declined
```

### 3. Firebase Production Configuration

#### Firebase Environment Setup
Your Firebase project `escolta-pro-fe90e` serves both development and production.

**Production Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Enhanced production rules with strict validation
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null
        && (request.auth.uid == resource.data.clientId 
            || request.auth.uid == resource.data.guardId)
        && validateBookingData(request.resource.data);
    }
    
    function validateBookingData(data) {
      return data.keys().hasAll(['clientId', 'guardId', 'status', 'createdAt'])
        && data.clientId is string
        && data.guardId is string  
        && data.status in ['pending', 'confirmed', 'active', 'completed', 'cancelled']
        && data.createdAt is timestamp;
    }
  }
}
```

#### Cloud Functions Production Environment
Update `functions/.env` with production values:
```bash
# Production Braintree Configuration
BRAINTREE_ENV=production
BRAINTREE_MERCHANT_ID=your_production_merchant_id
BRAINTREE_PUBLIC_KEY=your_production_public_key
BRAINTREE_PRIVATE_KEY=your_production_private_key
```

## Deployment Process

### 1. Environment Validation
```bash
# Create production environment check
node scripts/checkProdEnv.js
```

### 2. Production Build Process
```bash
# 1. Switch to production environment
cp .env.production .env

# 2. Validate environment
node scripts/checkEnv.js

# 3. Build and test functions
cd functions
npm run build
npm test

# 4. Deploy to Firebase
firebase deploy --only functions,firestore:rules,firestore:indexes

# 5. Create production EAS build
eas build --platform all --profile production
```

### 3. Gradual Rollout Strategy

#### Phase 1: Internal Testing (Week 1)
- Deploy to Firebase staging functions
- Test with production Braintree sandbox
- Validate all payment flows
- Test on development builds

#### Phase 2: Beta Testing (Week 2)  
- Deploy preview builds to select users
- Monitor transaction processing
- Collect user feedback
- Fix any critical issues

#### Phase 3: Production Launch (Week 3)
- Switch to live Braintree credentials
- Deploy production builds
- Monitor system health
- Gradual user onboarding

## Security Checklist

### Pre-Production Security Audit

- [ ] **Environment Variables**
  - [ ] All production secrets configured
  - [ ] No development/debug flags in production
  - [ ] Sensitive data not logged

- [ ] **Firebase Security**
  - [ ] Firestore rules restrict data access
  - [ ] Authentication required for all operations
  - [ ] Security Rules deployed and tested

- [ ] **Payment Security**
  - [ ] Production Braintree credentials secured
  - [ ] PCI compliance requirements met
  - [ ] Webhook endpoints secured

- [ ] **App Security**
  - [ ] Code obfuscation enabled
  - [ ] Certificate pinning configured
  - [ ] App signing keys secured

### Compliance Requirements

#### PCI DSS Compliance
- ✅ **SAQ A compliance** (Braintree handles card data)
- ✅ **HTTPS only** for all communications
- ✅ **No card data storage** in app/database
- ✅ **Secure payment flows** via Braintree SDK

#### Data Protection
- **GDPR compliance** for European users
- **User consent** for data collection
- **Data retention policies** implemented
- **Right to deletion** functionality

## Monitoring and Alerting

### Production Monitoring Setup

#### 1. Sentry Configuration
```javascript
// Production Sentry setup
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: 'production',
  enableAutoSessionTracking: true,
  sessionTrackingIntervalMillis: 10000,
});
```

#### 2. Firebase Monitoring
- **Performance Monitoring:** Track app startup, network requests
- **Crashlytics:** Monitor app crashes and errors  
- **Analytics:** Track user engagement and conversion

#### 3. Payment Monitoring
- **Transaction alerts** for failed payments
- **Revenue tracking** via Braintree dashboard
- **Fraud detection** monitoring

### Alert Configuration

#### Critical Alerts
- Firebase Functions errors > 5%
- Payment processing failures > 2%
- App crash rate > 1%
- API response time > 5 seconds

#### Business Alerts  
- Daily transaction summaries
- Weekly user engagement reports
- Monthly revenue reports

## Backup and Recovery

### Data Backup Strategy
- **Firestore exports** daily to Cloud Storage
- **User data backups** with encryption
- **Configuration backups** in secure storage

### Disaster Recovery Plan
1. **Service outage detection** (< 5 minutes)
2. **Automatic failover** to backup systems
3. **Data restoration** from latest backups
4. **Service restoration** confirmation

## Performance Optimization

### Production Performance Targets
- **App startup time:** < 3 seconds
- **API response time:** < 2 seconds  
- **Payment processing:** < 5 seconds
- **Crash rate:** < 0.1%

### Optimization Strategies
- **Bundle size optimization** via tree shaking
- **Image optimization** and lazy loading
- **API caching** for frequently accessed data
- **Database indexing** for optimal queries

## Go-Live Checklist

### Technical Readiness
- [ ] Production environment configured
- [ ] All services deployed and tested
- [ ] Monitoring and alerting active
- [ ] Security audit completed
- [ ] Performance benchmarks met

### Business Readiness
- [ ] Customer support trained
- [ ] Payment processing tested
- [ ] Legal compliance verified
- [ ] Marketing campaigns ready
- [ ] Rollback plan prepared

### Post-Launch Tasks
- [ ] Monitor system health (24 hours)
- [ ] Validate payment processing
- [ ] Check error rates and performance
- [ ] Collect user feedback
- [ ] Address any critical issues

## Support and Maintenance

### 24/7 Monitoring
- **System health dashboards**
- **Automated alert notifications**
- **On-call engineer rotation**
- **Incident response procedures**

### Regular Maintenance
- **Weekly security updates**
- **Monthly dependency updates**
- **Quarterly security audits**
- **Annual compliance reviews**