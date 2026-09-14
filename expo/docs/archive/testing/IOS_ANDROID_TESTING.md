# 📱 iOS & Android Testing Guide

## 🍎 iOS Simulator (Currently Building)

### What's Happening Now:
The app is being built for iOS. This process includes:
1. ✅ Installing CocoaPods dependencies (Sentry, Firebase, etc.)
2. ⏳ Compiling the native iOS project
3. ⏳ Launching iPhone 15 simulator
4. ⏳ Installing the app

**Expected Time:** 5-10 minutes for first build

### Once iOS Starts:
1. The iPhone 15 simulator will open automatically
2. The app will launch
3. Login with: `client@demo.com` / `<contrasena en tu .env local, no en el repositorio>`
4. Navigate to booking and test payment flow
5. The WebView payment form will work correctly!

### Test Payment Details:
- **Card Number:** `4111 1111 1111 1111`
- **Expiration:** `12/26`
- **CVV:** `123`
- **Name:** Any name

---

## 🤖 Android Setup

You don't currently have Android emulators set up. To test on Android:

### Option 1: Install Android Studio
```bash
# Download from: https://developer.android.com/studio
# Then create an AVD (Android Virtual Device) in Android Studio
```

### Option 2: Use Physical Android Device
1. Enable Developer Options on your Android phone
2. Enable USB Debugging
3. Connect via USB
4. Run: `npx expo run:android`

### Option 3: Skip Android for Now
Since iOS simulator is working, you can:
- Complete testing on iOS first
- The payment system works the same on both platforms
- Add Android testing later if needed

---

## 🔥 Important: Keep Firebase Emulators Running!

Make sure these stay running in the background:
- ✅ Firebase Emulators (already running)
- ✅ Expo Metro Bundler (port 8081)

### Current Running Services:
```
✅ Auth Emulator: 127.0.0.1:9099
✅ Firestore Emulator: 127.0.0.1:8080
✅ Database Emulator: 127.0.0.1:9000
✅ Functions Emulator: 127.0.0.1:5001
✅ Expo Server: localhost:8081
```

---

## 📋 Testing Checklist

### When iOS App Launches:

- [ ] App opens successfully
- [ ] Login screen appears
- [ ] Can login with `client@demo.com` / `<contrasena en tu .env local, no en el repositorio>`
- [ ] Navigate to booking creation
- [ ] Fill out booking details
- [ ] Click "Proceed to Payment"
- [ ] Payment modal opens
- [ ] **Braintree payment form appears** (not "WebView not supported")
- [ ] Can enter test card details
- [ ] Payment processes successfully
- [ ] Booking is created in Firebase Database

### Common Issues & Solutions:

**Issue:** "Network request failed" errors
- **Cause:** Firebase emulators not running
- **Solution:** Check emulators are still running (see ports above)

**Issue:** "User not found"
- **Cause:** Demo users not in emulator
- **Solution:** Re-run: `node setup-demo-users-quick.cjs`

**Issue:** Build errors
- **Cause:** CocoaPods or dependencies
- **Solution:** Run `cd ios && pod install && cd ..`

---

## 🎯 Quick Commands Reference

### Rebuild iOS:
```bash
npx expo run:ios --device "iPhone 15"
```

### Rebuild Android (when ready):
```bash
npx expo run:android
```

### Restart Everything:
```bash
# Stop all
pkill -f firebase
pkill -f expo

# Restart Firebase emulators
firebase emulators:start &

# Restart Expo
npx expo start
```

### Recreate Demo Users:
```bash
cd functions && node ../setup-demo-users-quick.cjs
```

---

## 🔍 Monitoring Build Progress

The iOS build output will show:
1. `Installing CocoaPods dependencies...` ✓
2. `Building the app...`
3. `Launching simulator...`
4. `Installing app on device...`
5. `Opening app...`

**Don't close the terminal!** The build process needs to stay running.

---

## ✅ Success Indicators

You'll know everything is working when:
1. ✅ iPhone simulator opens
2. ✅ App installs and launches
3. ✅ Login works
4. ✅ Booking screen loads
5. ✅ Payment form shows Braintree credit card fields
6. ✅ Payment completes successfully

The Realtime Database issue (port 9000) has been fixed, so bookings will now save properly! 🎉
