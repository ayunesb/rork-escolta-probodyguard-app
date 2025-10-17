# iOS Testing - Crash Fix

## Status
- ✅ iOS crash fix applied (`app/booking-payment.tsx` line 84-89)
- ✅ Firebase running (background)
- ✅ Expo running (port 8081)

## Quick Test (iOS Simulator)

### 1. Switch to Expo Go
In the Expo terminal, press: **`s`** (switch to Expo Go)

### 2. Launch Simulator
Then press: **`i`** (open iOS simulator)

### 3. Create Test Accounts
Since Firebase emulator is fresh, you need to create accounts via app sign-up:

**Client:** client@demo.com / demo123 (role: CLIENT)  
**Guard:** guard1@demo.com / demo123 (role: GUARD)

### 4. Test Payment Flow
1. Sign in as client
2. Guards → Book → Pay (4111 1111 1111 1111 / 12/25 / 123)
3. **Critical:** Tap "View Booking" in alert
4. **Expected:** Smooth navigation (no crash)

## The Fix
300ms delay before navigation after alert prevents UIKit crash.

**Press `s` then `i` in the Expo terminal to start!**
