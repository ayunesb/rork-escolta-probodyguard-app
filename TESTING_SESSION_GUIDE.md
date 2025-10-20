# 🧪 Testing Session Guide - Escolta Pro

**Date**: October 20, 2025  
**Environment**: Development (Sandbox Mode)  
**Status**: ✅ Safe to test all features

---

## 🚀 Quick Start

### App is Running!
- **Web**: http://localhost:8081
- **Metro Bundler**: Running in background
- **QR Code**: Scan with Expo Go app for mobile testing

### Firebase Functions
- Starting Cloud Functions for payment processing...
- Will be available at: http://localhost:5001

---

## 👥 Demo Accounts (Pre-configured)

Use these to test different user roles:

```bash
# CLIENT
Email: client@demo.com
Password: demo123
→ Can browse guards, create bookings, make payments

# GUARD 1
Email: guard1@demo.com
Password: demo123
→ Can receive bookings, track location, chat with clients

# GUARD 2
Email: guard2@demo.com
Password: demo123
→ Another guard for testing multiple guards

# ADMIN
Email: admin@demo.com
Password: admin123
→ Full access to all data, can manage users

# COMPANY ADMIN
Email: company@demo.com
Password: company123
→ Can manage company guards and bookings
```

---

## 🧪 Test Scenarios

### 1. Authentication Flow (5 minutes)

**Test Sign Up**:
1. Click "Sign Up" on landing page
2. Enter test email: `test-user-${Date.now()}@example.com`
3. Password: `Test123!`
4. Complete profile information
5. ✅ **Expected**: Receive verification email (check console logs)

**Test Login**:
1. Use `client@demo.com` / `demo123`
2. ✅ **Expected**: Redirect to dashboard
3. ✅ **Expected**: See welcome message with user name

**Test Logout**:
1. Click profile → Logout
2. ✅ **Expected**: Redirect to landing page

---

### 2. Guard Booking Flow (10 minutes)

**Browse Guards**:
1. Login as `client@demo.com`
2. Navigate to "Find Guards" section
3. ✅ **Expected**: See list of available guards with ratings

**Create Booking**:
1. Click on any guard
2. Select date/time (future date)
3. Enter service details:
   - Duration: 4 hours
   - Location: "123 Main St, City"
   - Special requests: "Test booking"
4. Click "Book Now"
5. ✅ **Expected**: Redirect to payment screen

---

### 3. Payment Processing (10 minutes)

**Test Card Numbers** (Braintree Sandbox):
```
SUCCESS: 4111 1111 1111 1111
FAILURE: 4000 1111 1111 1115
CVV: Any 3 digits (e.g., 123)
Expiry: Any future date (e.g., 12/25)
```

**Complete Payment**:
1. On payment screen, enter test card: `4111 1111 1111 1111`
2. CVV: `123`
3. Expiry: `12/25`
4. Cardholder name: "Test User"
5. Postal code: `12345`
6. Click "Pay $XX.XX"
7. ✅ **Expected**: "Payment Successful" message
8. ✅ **Expected**: Redirect to booking confirmation

**Verify Payment**:
1. Check Firebase Console → Firestore → `bookings` collection
2. ✅ **Expected**: New document with `status: "confirmed"`
3. Check Firestore → `payment_attempts` collection
4. ✅ **Expected**: Transaction record with `status: "success"`

---

### 4. Chat Messaging (5 minutes)

**Test Real-time Chat**:
1. Login as `client@demo.com` in one browser
2. Login as `guard1@demo.com` in another browser (or incognito)
3. Navigate to an active booking
4. Click "Chat" button
5. Send message from client: "Hello, I'm ready!"
6. ✅ **Expected**: Message appears instantly on guard's screen
7. Reply from guard: "On my way!"
8. ✅ **Expected**: Message appears on client's screen

---

### 5. Location Tracking (T-10 Rule) (5 minutes)

**Test Guard Location**:
1. Login as `guard1@demo.com`
2. Navigate to active booking
3. Click "Start Tracking"
4. ✅ **Expected**: Location permission request
5. Grant permission
6. ✅ **Expected**: Your location pin appears on map
7. Move around (or simulate in dev tools)
8. ✅ **Expected**: Location updates every 10 seconds

**Test Client View**:
1. Login as `client@demo.com` in another browser
2. Open same booking
3. ✅ **Expected**: See guard's live location on map
4. ✅ **Expected**: Location updates in real-time

---

### 6. Admin Dashboard (5 minutes)

**Test Admin Access**:
1. Login as `admin@demo.com` / `admin123`
2. Navigate to "Admin Panel"
3. ✅ **Expected**: See dashboard with:
   - Total users count
   - Total bookings count
   - Revenue statistics
   - Recent activity feed

**Test User Management**:
1. Click "Users" tab
2. ✅ **Expected**: See all users with roles
3. Click on any user → View details
4. Update user role (e.g., client → guard)
5. ✅ **Expected**: Role updated in Firestore

---

## 🔍 Verification Checklist

### Check Firebase Console

**Firestore** (https://console.firebase.google.com):
- [ ] `users` collection has test accounts
- [ ] `bookings` collection has new booking
- [ ] `messages` collection has chat messages
- [ ] `payment_attempts` collection has transaction records

**Realtime Database**:
- [ ] `guardLocations` has location updates
- [ ] Timestamps are recent (within last minute)

**Authentication**:
- [ ] New users appear in Auth → Users tab
- [ ] Email verification status correct

---

## 🐛 Common Issues & Fixes

### Issue 1: "Firebase not initialized"
```bash
# Solution: Check environment variables
cat .env | grep FIREBASE_API_KEY

# Restart Metro
npm start -- --reset-cache
```

### Issue 2: "Payment fails"
```bash
# Solution: Verify Functions are running
curl http://localhost:5001/escolta-pro-fe90e/us-central1/api/payments/client-token

# Expected: {"clientToken":"eyJ..."}
```

### Issue 3: "Location not updating"
```bash
# Solution: Check location permissions
# Browser: Settings → Site Permissions → Location → Allow

# Mobile: Settings → App → Permissions → Location → Always Allow
```

### Issue 4: "Chat messages not appearing"
```bash
# Solution: Check Realtime Database rules
firebase deploy --only database

# Verify WebSocket connection in browser console
# Should see: "WebSocket connected to Firebase"
```

---

## 📊 Test Results Template

Use this to track your testing:

```markdown
## Test Session Results

**Date**: October 20, 2025
**Tester**: [Your Name]
**Duration**: [Time spent]

### Authentication
- [ ] Sign up works
- [ ] Login works
- [ ] Logout works
- [ ] Email verification sent

### Bookings
- [ ] Can browse guards
- [ ] Can create booking
- [ ] Booking saved to Firestore

### Payments
- [ ] Payment form loads
- [ ] Test card accepted
- [ ] Transaction recorded
- [ ] Confirmation shown

### Chat
- [ ] Messages send successfully
- [ ] Real-time updates work
- [ ] Messages persist in DB

### Location
- [ ] Guard location tracked
- [ ] Client sees live location
- [ ] T-10 rule enforced

### Admin
- [ ] Dashboard loads
- [ ] User management works
- [ ] Statistics accurate

### Bugs Found
1. [Description]
2. [Description]

### Performance
- [ ] App loads < 3 seconds
- [ ] No console errors
- [ ] Smooth navigation
```

---

## 🎯 Next Steps After Testing

### If Everything Works:
1. ✅ Document any bugs found
2. ✅ Test on iOS/Android (scan QR code)
3. ✅ Prepare for production fixes (see `CRITICAL_ACTIONS_REQUIRED.md`)

### If Issues Found:
1. Check console logs (press F12 in browser)
2. Check Firebase Console for data
3. Check Functions logs: `firebase functions:log`
4. Review error in `NASA_GRADE_FINAL_AUDIT_REPORT_OCT_2025.md`

---

## 🚀 Mobile Testing (Optional)

**iOS**:
1. Install Expo Go from App Store
2. Scan QR code shown in terminal
3. App will load on your iPhone

**Android**:
1. Install Expo Go from Play Store
2. Scan QR code shown in terminal
3. App will load on your Android device

---

## 📱 Quick Commands Reference

```bash
# Restart Metro bundler
npm start

# Open web
Press 'w' in terminal

# Open iOS simulator
Press 'i' in terminal

# Open Android emulator
Press 'a' in terminal

# Reload app
Press 'r' in terminal

# Open debugger
Press 'j' in terminal

# Check Functions logs
cd functions && npm run serve

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

---

## ⚠️ Important Reminders

1. **Sandbox Mode**: All payments are fake (Braintree sandbox)
2. **Demo Data**: Use demo accounts, don't create production data
3. **Exposed Secrets**: Don't push .env files to Git
4. **Production**: Complete fixes in `CRITICAL_ACTIONS_REQUIRED.md` before launch

---

**Happy Testing! 🎉**

If you find any bugs or have questions, check the audit reports:
- `NASA_GRADE_FINAL_AUDIT_REPORT_OCT_2025.md` (full details)
- `CRITICAL_ACTIONS_REQUIRED.md` (production blockers)
- `EXECUTIVE_SUMMARY_AUDIT.md` (quick overview)
