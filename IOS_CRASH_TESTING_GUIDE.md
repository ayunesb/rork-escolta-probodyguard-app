# 🧪 iOS Crash Fix - Testing Guide

## ✅ Fix Applied

**File:** `app/booking-payment.tsx`  
**Change:** Added 300ms delay before navigation after Alert dismissal  
**Status:** ✅ FIXED

---

## 🔄 Restart & Test Steps

### 1. Clean Restart Simulator

```bash
# Kill all simulators
xcrun simctl shutdown all

# Kill Metro bundler
pkill -f "node.*expo" || true
pkill -f "bun.*rork" || true

# Clear Expo cache
rm -rf .expo
rm -rf node_modules/.cache

# Restart Expo
bun run start
```

### 2. Launch in Simulator

Option A: From terminal (press `i`)  
Option B: Manual launch:
```bash
xcrun simctl boot "iPhone 15 Pro"
open -a Simulator
```

### 3. Test Payment Flow (Critical Path)

**Step-by-step test:**

1. **Navigate to Guards**
   - Tap "Guards" tab
   - Select any guard profile
   
2. **Create Booking**
   - Fill in all fields:
     - Date: Tomorrow
     - Time: 10:00 AM
     - Duration: 2 hours
     - Protection: Armed
     - Vehicle: Standard
     - Pickup: Any address
   - Tap "Get Quote"
   - Tap "Book Now"

3. **Payment Screen** ⚠️ CRITICAL TEST
   - Should navigate to `/booking-payment`
   - Fill payment form:
     - Card: 4111 1111 1111 1111
     - Expiry: 12/25
     - CVV: 123
     - Name: Test User
   
4. **Submit Payment** 🎯 THIS IS WHERE IT CRASHED
   - Tap "Pay" button
   - Wait for success
   - **WATCH FOR:** Alert popup
   - Tap "View Booking" button
   - **EXPECTED:** Smooth navigation to booking-active screen
   - **SHOULD NOT:** Crash with SIGABRT

5. **Verify Success**
   - Should see booking-active screen
   - Start code should be displayed
   - No crashes ✅

---

## 🔍 What to Watch For

### ✅ Good Signs:
- Alert appears cleanly
- 300ms pause after tapping "View Booking"
- Smooth transition to booking-active screen
- Console logs show navigation sequence

### 🚨 Bad Signs:
- App crashes immediately after tapping "View Booking"
- Console shows view controller errors
- Simulator restarts
- SIGABRT exception

---

## 📊 Expected Console Output

```
[Payment] Processing payment...
[BraintreePaymentForm] Client token received
[BraintreePaymentForm] Payment successful
[Payment] Post-payment processing
[Notification] Payment success notification sent
[Navigation] Alert dismissed, navigating...
[Navigation] Executing router.replace
[Navigation] Screen unmounting (booking-payment)
[Navigation] Screen mounted (booking-active)
```

---

## 🐛 If Still Crashes

### Debug Steps:

1. **Check exact crash location:**
   ```bash
   # View crash logs
   open ~/Library/Logs/DiagnosticReports/
   # Look for EscoltaPro_*.crash files
   ```

2. **Add more logging:**
   ```typescript
   // In booking-payment.tsx
   console.log('[DEBUG] About to show alert');
   Alert.alert(...);
   console.log('[DEBUG] Alert triggered');
   ```

3. **Try different delay values:**
   ```typescript
   setTimeout(() => router.replace({...}), 500); // Increase to 500ms
   ```

4. **Test without Alert:**
   ```typescript
   // Temporary test - skip alert and navigate directly
   router.replace({...});
   ```

---

## 🎯 Alternative Solutions (If Fix Doesn't Work)

### Option 1: Use InteractionManager

```typescript
import { InteractionManager } from 'react-native';

Alert.alert('Success', 'Message', [
  {
    text: 'OK',
    onPress: () => {
      InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(() => {
          router.replace({...});
        });
      });
    },
  },
]);
```

### Option 2: Custom Modal Instead of Alert

Replace Alert with custom modal component (already exists: PaymentSheet)

### Option 3: Navigation Without Alert

```typescript
// Skip alert, navigate directly with params
router.replace({
  pathname: '/booking-active',
  params: { ...params, showSuccessMessage: 'true' },
});

// Show message on booking-active screen instead
```

---

## 📱 Physical Device Testing

If simulator still crashes, test on real device:

```bash
# Build for device
eas build --profile development --platform ios

# Or use Expo Go
expo start --tunnel
# Scan QR code with Expo Go app
```

---

## 🔧 Quick Commands Reference

```bash
# Restart everything
pkill -f "node.*expo"; bun run start

# View logs
npx react-native log-ios

# Clear Metro cache
bun run start --clear

# Reset simulator
xcrun simctl erase all
```

---

## ✅ Success Criteria

- [ ] Simulator starts without issues
- [ ] Can navigate to payment screen
- [ ] Payment form loads correctly
- [ ] Payment submission works
- [ ] Alert appears after payment
- [ ] Tapping "View Booking" navigates smoothly
- [ ] **NO CRASHES** 🎉
- [ ] Console shows clean navigation logs
- [ ] Booking-active screen displays correctly

---

## 📞 Next Steps After Testing

### If Successful ✅
1. Test 3-5 more times to confirm stability
2. Test rapid button tapping (stress test)
3. Test with network delay/error
4. Mark as resolved in tracking doc

### If Still Failing ❌
1. Capture new crash report
2. Share crash logs
3. Try Option 1-3 alternative solutions
4. Consider custom modal approach

---

**Current Status:** 🟡 AWAITING TEST  
**Fix Applied:** ✅ YES (300ms delay)  
**Ready to Test:** ✅ YES  
**Estimated Test Time:** 5 minutes
