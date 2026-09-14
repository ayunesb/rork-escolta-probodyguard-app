# Phase 5: Pre-Testing Checklist

**Before starting Phase 5 testing, verify all prerequisites are met.**

---

## ✅ Environment Setup

### Firebase Configuration
- [ ] Firebase project is active
- [ ] Firestore database is enabled
- [ ] Realtime Database is enabled
- [ ] Authentication is enabled
- [ ] Storage is enabled
- [ ] Security rules are deployed
- [ ] Indexes are created

**Verify Command:**
```bash
firebase projects:list
firebase use escolta-pro-fe90e
```

### Braintree Configuration
- [ ] Braintree sandbox account active
- [ ] Merchant ID configured
- [ ] Public key configured
- [ ] Private key configured
- [ ] Environment variables set

**Verify File:** `.env`
```
EXPO_PUBLIC_BRAINTREE_MERCHANT_ID=your_merchant_id
EXPO_PUBLIC_BRAINTREE_PUBLIC_KEY=your_public_key
BRAINTREE_PRIVATE_KEY=your_private_key
EXPO_PUBLIC_BRAINTREE_ENVIRONMENT=sandbox
```

### App Configuration
- [ ] `app.json` configured correctly
- [ ] Bundle identifier set
- [ ] App name set
- [ ] Version numbers set
- [ ] Permissions configured

**Verify File:** `app.json`

---

## ✅ Demo Accounts Setup

### Create Demo Accounts
Run this script to create all demo accounts:

```typescript
// scripts/create-demo-accounts.ts
import { auth, db } from '@/config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const demoAccounts = [
  {
    email: 'client@demo.com',
    password: '<contrasena en tu .env local, no en el repositorio>',
    role: 'client',
    firstName: 'Demo',
    lastName: 'Client',
    phone: '+52 55 1234 5678',
  },
  {
    email: 'guard1@demo.com',
    password: '<contrasena en tu .env local, no en el repositorio>',
    role: 'guard',
    firstName: 'Carlos',
    lastName: 'Rodriguez',
    phone: '+52 55 8765 4321',
  },
  {
    email: 'guard2@demo.com',
    password: '<contrasena en tu .env local, no en el repositorio>',
    role: 'guard',
    firstName: 'Miguel',
    lastName: 'Santos',
    phone: '+52 55 9876 5432',
  },
  {
    email: 'company@demo.com',
    password: '<contrasena en tu .env local, no en el repositorio>',
    role: 'company',
    firstName: 'Elite',
    lastName: 'Security',
    phone: '+52 55 9999 8888',
  },
  {
    email: 'admin@demo.com',
    password: '<contrasena en tu .env local, no en el repositorio>',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    phone: '+52 55 0000 0000',
  },
];

async function createDemoAccounts() {
  for (const account of demoAccounts) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        account.email,
        account.password
      );
      
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: account.email,
        role: account.role,
        firstName: account.firstName,
        lastName: account.lastName,
        phone: account.phone,
        kycStatus: 'approved',
        emailVerified: true,
        createdAt: new Date().toISOString(),
      });
      
      console.log(`✅ Created: ${account.email}`);
    } catch (error) {
      console.error(`❌ Failed to create ${account.email}:`, error);
    }
  }
}

createDemoAccounts();
```

### Verify Demo Accounts
- [ ] All 5 demo accounts created
- [ ] All accounts email verified
- [ ] All accounts KYC approved
- [ ] All accounts can sign in

**Manual Verification:**
1. Try signing in with each account
2. Verify role-specific UI appears
3. Verify no errors in console

---

## ✅ Test Data Setup

### Mock Guards
- [ ] Mock guards data exists in `mocks/guards.ts`
- [ ] Guards have all required fields
- [ ] Guards have photos (URLs valid)
- [ ] Guards have certifications
- [ ] Guards have availability

**Verify File:** `mocks/guards.ts`

### Mock Bookings
- [ ] Mock bookings data exists in `mocks/bookings.ts`
- [ ] Bookings have all required fields
- [ ] Bookings have various statuses
- [ ] Bookings have realistic data

**Verify File:** `mocks/bookings.ts`

---

## ✅ Dependencies Installed

### Check Package Installation
```bash
# Verify all packages installed
npm list --depth=0

# Key packages to verify:
# - expo
# - firebase
# - react-native-maps
# - @react-native-community/datetimepicker
# - react-native-webview
# - @react-native-async-storage/async-storage
```

### Install Missing Packages
```bash
# If any packages missing:
npm install

# Or with bun:
bun install
```

---

## ✅ Build & Run Verification

### Start Development Server
```bash
# Start Expo server
npx expo start

# Or with bun:
bun expo start
```

### Verify App Launches
- [ ] App launches without errors
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Sign-in screen appears
- [ ] Can navigate between screens

### Platform-Specific Checks

#### iOS (if testing on iOS)
```bash
# Install iOS dependencies
cd ios && pod install && cd ..

# Run on iOS simulator
npx expo run:ios
```
- [ ] App launches on iOS
- [ ] No native module errors
- [ ] Maps render correctly
- [ ] Camera permissions work

#### Android (if testing on Android)
```bash
# Run on Android emulator
npx expo run:android
```
- [ ] App launches on Android
- [ ] No native module errors
- [ ] Maps render correctly
- [ ] Camera permissions work

#### Web (if testing on Web)
```bash
# Run on web
npx expo start --web
```
- [ ] App launches in browser
- [ ] No web-specific errors
- [ ] Maps render correctly (web fallback)
- [ ] Payment form works

---

## ✅ Service Verification

### Firebase Services
```bash
# Test Firebase connection
node -e "
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const config = require('./config/firebase').default;

const app = initializeApp(config);
const db = getFirestore(app);

getDocs(collection(db, 'users'))
  .then(() => console.log('✅ Firebase connected'))
  .catch(err => console.error('❌ Firebase error:', err));
"
```

### Braintree Services
```bash
# Test Braintree connection
node -e "
const braintree = require('braintree');
const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.EXPO_PUBLIC_BRAINTREE_MERCHANT_ID,
  publicKey: process.env.EXPO_PUBLIC_BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

gateway.clientToken.generate({})
  .then(() => console.log('✅ Braintree connected'))
  .catch(err => console.error('❌ Braintree error:', err));
"
```

---

## ✅ Feature Flags & Settings

### Enable All Features
- [ ] Location tracking enabled
- [ ] Push notifications enabled
- [ ] Chat enabled
- [ ] Payments enabled
- [ ] Analytics enabled
- [ ] Error reporting enabled

**Verify in:** `config/env.ts` or feature flag service

---

## ✅ Testing Tools Ready

### Screen Recording
- [ ] Screen recording software installed
- [ ] Storage space available (>5GB)
- [ ] Recording settings configured

**Recommended Tools:**
- iOS: QuickTime Player
- Android: ADB screenrecord
- Web: Browser DevTools

### Network Tools
- [ ] Network throttling available
- [ ] Proxy tools ready (if needed)
- [ ] VPN configured (if testing geo-restrictions)

**Recommended Tools:**
- Chrome DevTools (Network tab)
- Charles Proxy
- Postman (for API testing)

### Debugging Tools
- [ ] React DevTools installed
- [ ] Firebase Console access
- [ ] Braintree Dashboard access
- [ ] Error tracking dashboard access

---

## ✅ Documentation Ready

### Test Documentation
- [ ] `PHASE_5_TESTING_PLAN.md` reviewed
- [ ] `PHASE_5_QUICK_REFERENCE.md` available
- [ ] `PHASE_5_PROGRESS.md` ready to fill
- [ ] Bug report template ready

### Reference Materials
- [ ] API documentation accessible
- [ ] Firebase documentation bookmarked
- [ ] Braintree documentation bookmarked
- [ ] Design mockups available (if any)

---

## ✅ Team Coordination

### Stakeholders Notified
- [ ] Product owner aware of testing start
- [ ] Developers on standby for bug fixes
- [ ] QA team briefed (if applicable)
- [ ] Business team informed of timeline

### Communication Channels
- [ ] Slack/Discord channel active
- [ ] Email thread started
- [ ] Bug tracking system ready (Jira/GitHub Issues)
- [ ] Daily standup scheduled (if needed)

---

## ✅ Backup & Safety

### Data Backup
- [ ] Current codebase committed to Git
- [ ] Firebase data exported (backup)
- [ ] Environment variables backed up
- [ ] Test data documented

### Rollback Plan
- [ ] Previous stable version tagged
- [ ] Rollback procedure documented
- [ ] Database migration rollback ready
- [ ] Emergency contacts listed

---

## 🚀 Ready to Start?

### Final Checklist
- [ ] All environment setup complete
- [ ] All demo accounts created
- [ ] All dependencies installed
- [ ] App launches successfully
- [ ] All services verified
- [ ] All tools ready
- [ ] All documentation reviewed
- [ ] Team coordinated

### Start Testing Command
```bash
# 1. Start the app
npx expo start

# 2. Open testing plan
open PHASE_5_TESTING_PLAN.md

# 3. Open progress tracker
open PHASE_5_PROGRESS.md

# 4. Open quick reference
open PHASE_5_QUICK_REFERENCE.md

# 5. Begin Task 5.1.1
# Sign in as client@demo.com and start testing!
```

---

## 🆘 Troubleshooting

### Common Issues

#### App Won't Launch
```bash
# Clear cache and restart
npx expo start -c

# Reinstall dependencies
rm -rf node_modules
npm install
```

#### Firebase Connection Error
```bash
# Verify Firebase config
cat config/firebase.ts

# Check Firebase project
firebase projects:list
firebase use escolta-pro-fe90e
```

#### Braintree Error
```bash
# Verify environment variables
cat .env | grep BRAINTREE

# Test Braintree credentials
# (Use test script above)
```

#### Build Errors
```bash
# Check TypeScript errors
npx tsc --noEmit

# Check for missing types
npm install --save-dev @types/react @types/react-native
```

---

## 📞 Support Contacts

### Technical Support
- **Developer**: [Your Name]
- **Email**: dev@escoltapro.com
- **Slack**: #escolta-dev

### Business Support
- **Product Owner**: [Name]
- **Email**: product@escoltapro.com

### Emergency
- **On-Call**: [Phone Number]
- **Escalation**: [Manager Name]

---

**Last Updated**: 2025-01-06
**Version**: 1.0
**Status**: ✅ READY FOR PHASE 5 TESTING

---

## Next Steps

Once all items are checked:
1. ✅ Mark this checklist as complete
2. 📋 Open `PHASE_5_TESTING_PLAN.md`
3. 🚀 Begin Task 5.1.1: Client Flow Testing
4. 📝 Document progress in `PHASE_5_PROGRESS.md`
5. 🐛 Report bugs using bug template
6. 🎯 Complete all testing tasks
7. ✨ Celebrate Phase 5 completion!
