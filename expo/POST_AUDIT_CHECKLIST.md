# 🚀 QUICK START - POST-AUDIT CHECKLIST

## ✅ CRITICAL FIXES (Do This FIRST!)

Run the automated fix script:
```bash
chmod +x apply-critical-fixes.sh
./apply-critical-fixes.sh
```

### Manual Verifications Required:

- [ ] **1. Email Verification**
  - Check `.env` has `EXPO_PUBLIC_ALLOW_UNVERIFIED_LOGIN=0`
  - Test: New users should be required to verify email

- [ ] **2. Braintree Secrets**
  ```bash
  cd functions
  firebase functions:config:set \
    braintree.merchant_id="YOUR_ID" \
    braintree.public_key="YOUR_KEY" \
    braintree.private_key="YOUR_PRIVATE_KEY" \
    braintree.env="sandbox"
  firebase deploy --only functions
  ```

- [ ] **3. App Check in Firebase Console**
  - Go to: Firebase Console → Build → App Check
  - Enable for iOS (DeviceCheck/App Attest)
  - Enable for Android (Play Integrity API)
  - Enable for Web (reCAPTCHA v3)
  - Enable enforcement for: Functions, Firestore, Realtime DB

- [ ] **4. Background Location Task**
  - Import `services/backgroundLocationTask.ts` in `LocationTrackingContext.tsx`
  - Test on physical device (required for background location)

---

## 🔧 PRIORITY 1 FIXES (This Week)

- [ ] **5. Replace Analytics Stubs**
  ```bash
  expo install @react-native-firebase/analytics @react-native-firebase/app
  ```
  - Update `services/analyticsService.ts`
  - Verify events in Firebase Console

- [ ] **6. Add Firestore Indexes**
  - Update `firestore.indexes.json` with bookings and payments indexes
  - Deploy: `firebase deploy --only firestore:indexes`

- [ ] **7. Create Development Build**
  ```bash
  # For testing push notifications
  eas build --profile development --platform android
  eas build --profile development --platform ios
  ```

- [ ] **8. Test Complete Flow**
  - [ ] User signup with email verification
  - [ ] Login and session management
  - [ ] Create booking
  - [ ] Process payment (sandbox)
  - [ ] Live location tracking
  - [ ] Push notifications (on dev build)
  - [ ] Chat messaging

---

## 📱 TESTING CHECKLIST

### Firebase Emulators (Local Testing)
```bash
firebase emulators:start --only firestore,database,functions,auth
```

### Expo Development Server
```bash
# With tunnel for physical device testing
npx expo start --clear --tunnel

# Or local network
npx expo start --clear
```

### Test Scenarios:

- [ ] **Authentication**
  - [ ] Sign up → verify email → login
  - [ ] Password strength validation
  - [ ] Session timeout works
  - [ ] Biometric auth (if available)

- [ ] **Bookings**
  - [ ] Create booking as client
  - [ ] Accept booking as guard
  - [ ] Track location during active booking
  - [ ] Complete booking and rate

- [ ] **Payments**
  - [ ] Get client token
  - [ ] Test card: 4111 1111 1111 1111
  - [ ] Process payment
  - [ ] Verify transaction in Firestore
  - [ ] Check webhook received

- [ ] **Location**
  - [ ] Foreground tracking works
  - [ ] Background tracking works (dev build only)
  - [ ] Guard location visible to client
  - [ ] T-10 rule enforced (guard visible 10 min before booking)

- [ ] **Notifications**
  - [ ] Push permission granted
  - [ ] Token saved to Firestore
  - [ ] Booking update notifications
  - [ ] Chat message notifications

---

## 🔒 SECURITY VERIFICATION

Run security checks:
```bash
# Check if .env is in git
git ls-files --error-unmatch .env 2>/dev/null && echo "⚠️  .env is tracked!" || echo "✅ .env not tracked"

# Check for exposed secrets in code
grep -r "BRAINTREE.*KEY" --include="*.ts" --include="*.tsx" app/ contexts/ services/ components/

# Verify Firestore rules
firebase deploy --only firestore:rules --dry-run

# Verify Realtime DB rules
firebase deploy --only database --dry-run
```

---

## 🚢 PRODUCTION DEPLOYMENT CHECKLIST

### Pre-Production

- [ ] **Update .env for production**
  ```bash
  EXPO_PUBLIC_ALLOW_UNVERIFIED_LOGIN=0
  EXPO_PUBLIC_BRAINTREE_ENV=production
  EXPO_PUBLIC_FIREBASE_PROJECT_ID=escolta-pro-production
  EXPO_PUBLIC_ENABLE_APP_CHECK=true
  ```

- [ ] **Create production Firebase project**
  - Copy Firestore rules
  - Copy Realtime DB rules
  - Copy Firestore indexes
  - Deploy Cloud Functions

- [ ] **Configure production Braintree**
  - Create production merchant account
  - Update Firebase secrets with production keys
  - Test production webhook endpoint

- [ ] **Upload push certificates**
  ```bash
  eas credentials
  # Upload APNs key (iOS)
  # Upload FCM server key (Android)
  ```

### Build & Submit

- [ ] **Create production builds**
  ```bash
  eas build --profile production --platform all
  ```

- [ ] **Test builds internally**
  - Install on test devices
  - Full end-to-end testing
  - Payment testing in production sandbox

- [ ] **Submit to stores**
  ```bash
  # Android
  eas submit --platform android
  
  # iOS
  eas submit --platform ios
  ```

### Post-Launch Monitoring

- [ ] Set up Firebase Performance Monitoring dashboard
- [ ] Configure Sentry alerts
- [ ] Set up Firebase Analytics custom events
- [ ] Monitor Braintree transaction success rate
- [ ] Check App Check metrics

---

## 📊 SUCCESS METRICS

After completing all fixes, you should achieve:

- **Security Score**: A- (90/100)
- **Zero critical vulnerabilities**
- **All endpoints protected by App Check**
- **Background location working on physical devices**
- **Push notifications working on dev/prod builds**
- **All payments processing successfully**
- **Analytics events appearing in Firebase**

---

## 🆘 TROUBLESHOOTING

### Common Issues:

**Issue**: Build fails with "No matching provisioning profile"
```bash
# Solution: Clear credentials and re-configure
eas credentials
# Select "Remove all credentials"
# Then rebuild
```

**Issue**: Push notifications not working
```bash
# Solution: Must use development or production build
# Expo Go doesn't support push on Android SDK 53+
eas build --profile development --platform android
```

**Issue**: Background location not updating
```bash
# Solution: Must test on physical device
# Simulator doesn't support background location
# Grant "Always Allow" location permission
```

**Issue**: App Check token invalid
```bash
# Solution: Verify App Check is enabled in Console
# For debug, use debug token:
EXPO_PUBLIC_APP_CHECK_DEBUG_TOKEN=your_debug_token
```

---

## 📞 QUICK REFERENCE

### Key Files
- **Environment**: `.env`
- **Firebase Config**: `lib/firebase.ts`
- **Auth**: `contexts/AuthContext.tsx`
- **Payments**: `functions/src/index.ts`
- **Location**: `contexts/LocationTrackingContext.tsx`
- **Notifications**: `contexts/NotificationContext.tsx`

### Key Commands
```bash
# Start development
npx expo start --clear

# Test functions locally
cd functions && npm run serve

# Deploy functions
firebase deploy --only functions

# Deploy rules
firebase deploy --only firestore:rules,database

# Create build
eas build --profile development --platform all
```

---

**Last Updated**: October 22, 2025  
**Audit Report**: See `NASA_GRADE_AUDIT_REPORT.md` for complete details
