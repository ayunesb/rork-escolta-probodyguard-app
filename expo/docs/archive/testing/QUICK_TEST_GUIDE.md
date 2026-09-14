# 🧪 Quick Test Guide - Escolta Pro

**Status**: ✅ App is running and ready for testing!  
**Date**: October 20, 2025

---

## 🚀 Current Status

### Running Services:
- ✅ **Metro Bundler**: Running on port 8081
- ✅ **Expo Dev Server**: Active
- ✅ **iOS ATS**: Configured for local development (HTTP allowed)

### Fixed Issues:
- ✅ iOS App Transport Security exception added for `.exp.direct` domains
- ✅ Local development domains allowed (localhost, 127.0.0.1)
- ✅ Functions credentials loaded from `.env`

---

## 📱 How to Access the App

### Option 1: iOS Simulator (Recommended)
```bash
# Press 'i' in the Expo terminal
# Or manually open iOS Simulator and scan QR code
```

### Option 2: Physical iOS Device
```bash
# Install "Expo Go" from App Store
# Scan QR code from terminal
# Allow HTTP connections when prompted
```

### Option 3: Android
```bash
# Press 'a' in the Expo terminal
# Or use Android Studio emulator
```

### Option 4: Web Browser
```bash
# Press 'w' in the Expo terminal
# Or visit: http://localhost:8081
```

---

## 🧪 Test Scenarios

### 1️⃣ Authentication (5 minutes)

#### Test Sign Up:
```
1. Open app → Tap "Sign Up"
2. Enter email: test@example.com
3. Create password: TestPass123!
4. Fill in name, phone
5. Select role: Client
6. Submit → Check for email verification prompt
```

#### Test Login:
```
1. Use demo account:
   Email: client@demo.com
   Password: <contrasena en tu .env local, no en el repositorio>
2. Should login successfully
3. Verify user role displayed correctly
```

#### Test Password Reset:
```
1. Tap "Forgot Password"
2. Enter: client@demo.com
3. Check console for reset email
```

---

### 2️⃣ Guard Booking (10 minutes)

#### Browse Guards:
```
1. Login as client@demo.com
2. Navigate to "Find Guards" tab
3. View list of available guards
4. Tap on a guard to see profile
5. Check rating, reviews, hourly rate
```

#### Create Booking:
```
1. From guard profile → Tap "Book Now"
2. Select date/time
3. Enter service duration (hours)
4. Review total price
5. Proceed to payment
```

#### Payment Flow (Sandbox):
```
1. Payment screen should load Braintree form
2. Use test card: 4111 1111 1111 1111
3. CVV: 123
4. Expiry: 12/26
5. Submit payment
6. Should see success confirmation
```

**⚠️ Note**: Payment requires Firebase Functions running. If payment fails:
```bash
# In new terminal:
cd functions
npm run serve

# Check Functions are running on port 5001
```

---

### 3️⃣ Real-Time Chat (5 minutes)

```
1. Login as client@demo.com
2. Navigate to "My Bookings"
3. Select an active booking
4. Tap "Chat" icon
5. Send message: "Hello, is this working?"
6. Message should appear instantly

# Test from guard side:
7. Login as guard1@demo.com (new browser/device)
8. Open same booking chat
9. Reply to message
10. Verify real-time sync
```

---

### 4️⃣ Location Tracking (5 minutes)

```
1. Login as guard1@demo.com
2. Navigate to active booking
3. Tap "Start Service"
4. Allow location permissions
5. Move around (or simulate location change)
6. Location should update every 10 seconds

# Test T-10 tracking:
7. Login as client@demo.com
8. Open same booking
9. Tap "Track Guard"
10. Should see guard's live location on map
```

---

### 5️⃣ Admin Dashboard (3 minutes)

```
1. Login as admin@demo.com / admin123
2. View all users, bookings, transactions
3. Tap on a user to edit
4. Change user role (e.g., client → guard)
5. Verify change in Firestore
```

---

## 🔍 What to Check

### ✅ Success Indicators:
- [ ] No red error screens
- [ ] Authentication redirects work
- [ ] Data loads from Firebase
- [ ] Real-time updates appear instantly
- [ ] Payment form renders correctly
- [ ] Location permissions requested
- [ ] Map displays correctly
- [ ] Chat messages send/receive

### ⚠️ Expected Warnings (Ignore These):
- "Running in development mode" → Normal
- "Expo Go development warnings" → Normal
- Console logs with `[Firebase]`, `[Braintree]` → Normal debugging

### ❌ Red Flags (Report These):
- "Firebase not initialized" → Restart app
- "Network request failed" → Check internet
- "Payment method nonce is required" → Functions not running
- "Permission denied" → Check Firestore rules deployed

---

## 📊 Test Data

### Demo Accounts:
| Email | Password | Role | Use For |
|-------|----------|------|---------|
| client@demo.com | <contrasena en tu .env local, no en el repositorio> | Client | Booking guards |
| guard1@demo.com | <contrasena en tu .env local, no en el repositorio> | Guard | Accepting jobs |
| guard2@demo.com | <contrasena en tu .env local, no en el repositorio> | Guard | Testing availability |
| admin@demo.com | admin123 | Admin | User management |
| company@demo.com | company123 | Company | Managing guards |

### Test Cards (Braintree Sandbox):
| Card Number | Type | Result |
|-------------|------|--------|
| 4111 1111 1111 1111 | Visa | Success |
| 5555 5555 5555 4444 | Mastercard | Success |
| 3782 822463 10005 | Amex | Success |
| 4000 0000 0000 0002 | Visa | Declined |

---

## 🐛 Troubleshooting

### App Won't Load:
```bash
# Clear Metro cache
npm start -- --clear

# Rebuild Functions
cd functions
npm run build
cd ..

# Check .env file exists
cat .env | grep FIREBASE_API_KEY
```

### Payment Fails:
```bash
# Start Functions emulator
cd functions
npm run serve

# Test client token endpoint
curl http://localhost:5001/escolta-pro-fe90e/us-central1/api/payments/client-token

# Should return: {"clientToken":"eyJ..."}
```

### "Permission Denied" Errors:
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Or use admin account: admin@demo.com
```

### Location Not Updating:
```bash
# iOS Simulator: Features → Location → Custom Location
# Set to: 37.7749, -122.4194 (San Francisco)

# Android Emulator: Extended Controls → Location
```

---

## 📱 Device-Specific Notes

### iOS:
- ✅ HTTP connections allowed for `*.exp.direct`
- ✅ Location services enabled by default
- ⚠️ Camera permissions needed for document upload

### Android:
- ✅ Network security config auto-handled
- ⚠️ Google Maps API key needed for maps (check app.json)
- ⚠️ Physical device recommended for accurate GPS

### Web:
- ✅ Best for quick UI testing
- ⚠️ Location API requires HTTPS (use localhost)
- ⚠️ Push notifications limited

---

## 🎯 Quick Verification Checklist

**5-Minute Smoke Test**:
```
[ ] App opens without crash
[ ] Can login with demo account
[ ] Can view guards list
[ ] Can create booking (skip payment for now)
[ ] Can send chat message
[ ] Can view map with guard locations
```

**15-Minute Full Test**:
```
[ ] Complete sign up flow
[ ] Email verification works
[ ] Payment completes successfully
[ ] Chat updates in real-time
[ ] Location tracking active
[ ] Can update user profile
[ ] Can upload profile photo
[ ] Can view booking history
```

---

## 🚀 Next Steps After Testing

1. **Report Bugs**: Create GitHub issues for any problems found
2. **Performance**: Note any slow screens or laggy animations
3. **UX Issues**: Document confusing flows or unclear labels
4. **Security**: Check that unauthorized access is blocked

---

## 📞 Need Help?

### Common Issues & Solutions:
- **Metro bundler stuck**: Kill port 8081 and restart
- **Functions not responding**: Check `functions/.env` exists
- **Firestore permission denied**: Deploy rules or use admin account
- **Payment hanging**: Verify Functions running on port 5001

### Check Logs:
```bash
# Metro bundler logs
# Already visible in terminal

# Firebase Functions logs
cd functions
npm run serve
# Check terminal for errors

# Firebase Console
https://console.firebase.google.com/project/escolta-pro-fe90e
```

---

**Happy Testing! 🎉**

Remember: This is **SANDBOX MODE** - all payments are fake, no real money involved!
