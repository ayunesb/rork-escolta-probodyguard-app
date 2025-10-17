# 🔧 iOS Simulator Crash Fix

## 📊 Crash Analysis

**Crash Type:** `EXC_CRASH (SIGABRT)` - View Controller Presentation Issue  
**Process:** EscoltaPro [10522]  
**Date:** October 16, 2025 20:10:39  
**Thread:** 0 (Main Thread)

### Root Cause
The crash occurs during view controller presentation:
```
-[UIViewController _presentViewController:withAnimationController:completion:]
```

**Most Likely Issue:** Attempting to navigate while an Alert is being presented or dismissed.

---

## 🎯 The Problem

In `booking-payment.tsx`, line 76-100, the code shows an Alert and immediately tries to navigate:

```typescript
Alert.alert(
  'Booking Confirmed!',
  `Your protection service has been booked...`,
  [
    {
      text: 'View Booking',
      onPress: () => {
        router.replace({...}); // ❌ NAVIGATION DURING ALERT PRESENTATION
      },
    },
  ]
);
```

**Why This Crashes:**
1. Alert.alert() presents a modal view controller
2. router.replace() tries to present/dismiss view controllers simultaneously
3. UIKit doesn't allow concurrent view controller transitions
4. Result: SIGABRT crash

---

## ✅ Solution

### Fix 1: Delay Navigation After Alert (Recommended)

Replace the alert handling with a delayed navigation:

```typescript
const handlePaymentSuccess = async (result: { id: string; status: string }) => {
  try {
    const bookingId = 'booking-' + Date.now();
    const startCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    if (costBreakdown) {
      await notificationService.notifyPaymentSuccess(bookingId, costBreakdown.total);
    }
    
    // ✅ Show alert THEN navigate after user dismisses it
    Alert.alert(
      'Booking Confirmed!',
      `Your protection service has been booked.\n\nStart Code: ${startCode}\n\nShare this code with your guard to begin service.`,
      [
        {
          text: 'View Booking',
          onPress: () => {
            // ✅ Add delay to ensure alert is fully dismissed
            setTimeout(() => {
              router.replace({
                pathname: '/booking-active',
                params: {
                  bookingId,
                  guardId: params.guardId,
                  guardName: params.guardName,
                  guardPhoto: params.guardPhoto,
                  startCode,
                  date: params.date,
                  time: params.time,
                  duration: params.duration,
                  pickupAddress: params.pickupAddress,
                  transactionId: result.id,
                },
              } as any);
            }, 300); // ✅ 300ms delay for smooth transition
          },
        },
      ]
    );
  } catch (error: any) {
    console.error('[Payment] Post-payment error:', error);
    Alert.alert('Error', 'Payment succeeded but booking failed. Please contact support.');
  }
};
```

### Fix 2: Use State-Based Navigation (Alternative)

Use a state variable to control navigation:

```typescript
const [showSuccessAlert, setShowSuccessAlert] = useState(false);
const [bookingData, setBookingData] = useState<any>(null);

useEffect(() => {
  if (showSuccessAlert && bookingData) {
    Alert.alert(
      'Booking Confirmed!',
      `Start Code: ${bookingData.startCode}`,
      [
        {
          text: 'View Booking',
          onPress: () => {
            setShowSuccessAlert(false);
            // Navigate after state update
            requestAnimationFrame(() => {
              router.replace({...bookingData.navParams});
            });
          },
        },
      ]
    );
  }
}, [showSuccessAlert, bookingData]);

const handlePaymentSuccess = async (result: { id: string; status: string }) => {
  const data = {
    startCode: '...',
    navParams: {...},
  };
  setBookingData(data);
  setShowSuccessAlert(true);
};
```

---

## 🛠️ Additional Safeguards

### 1. Add Error Boundary for Navigation Errors

Already exists in `_layout.tsx` ✅

### 2. Check for Multiple Modal Presentations

Add this check before any navigation:

```typescript
import { InteractionManager } from 'react-native';

// Use this wrapper for navigation after modals/alerts
const safeNavigate = (navigationFn: () => void) => {
  InteractionManager.runAfterInteractions(() => {
    setTimeout(navigationFn, 300);
  });
};

// Usage:
safeNavigate(() => {
  router.replace({...});
});
```

### 3. Test with Different Alert Patterns

```typescript
// Pattern 1: Single button (auto-dismiss)
Alert.alert('Success', 'Booking confirmed!');
setTimeout(() => router.replace({...}), 500);

// Pattern 2: Multiple buttons with delay
Alert.alert('Success', 'Message', [
  { text: 'OK', onPress: () => setTimeout(() => router.replace({...}), 300) }
]);

// Pattern 3: Navigation without alert
router.replace({...}); // Instant navigation
```

---

## 🧪 Testing Steps

1. **Test Payment Flow:**
   ```bash
   # Restart simulator
   xcrun simctl shutdown all
   xcrun simctl boot "iPhone 15 Pro"
   
   # Restart Metro
   pkill -f "node.*expo"
   bun run start
   
   # Open in simulator
   press 'i' in terminal
   ```

2. **Test Navigation:**
   - Guards → Select guard → Create booking
   - Fill payment form (use test card: 4111 1111 1111 1111)
   - Submit payment
   - **CRITICAL:** Wait for alert, tap "View Booking"
   - Should navigate smoothly without crash ✅

3. **Test Edge Cases:**
   - Rapid tapping on payment button
   - Back navigation during payment
   - Payment during network error

---

## 🔍 Debug Logs to Monitor

Add these logs to track navigation state:

```typescript
// In booking-payment.tsx
useEffect(() => {
  console.log('[Navigation] Screen mounted');
  return () => console.log('[Navigation] Screen unmounting');
}, []);

const handlePaymentSuccess = async (result) => {
  console.log('[Navigation] Payment success, will show alert');
  Alert.alert(..., [
    {
      text: 'View Booking',
      onPress: () => {
        console.log('[Navigation] Alert dismissed, navigating...');
        setTimeout(() => {
          console.log('[Navigation] Executing router.replace');
          router.replace({...});
        }, 300);
      },
    },
  ]);
};
```

---

## 📋 Quick Fix Summary

**File:** `/app/booking-payment.tsx`  
**Line:** 76-100  
**Change:** Add `setTimeout(() => {...}, 300)` wrapper around `router.replace()`  
**Reason:** Prevent concurrent view controller presentations  

**Before:**
```typescript
onPress: () => { router.replace({...}); }
```

**After:**
```typescript
onPress: () => { setTimeout(() => router.replace({...}), 300); }
```

---

## 🎬 Next Steps

1. ✅ Apply Fix 1 (setTimeout wrapper)
2. ✅ Test payment flow end-to-end
3. ✅ Monitor console for navigation logs
4. ✅ Test on physical device if available
5. ✅ Add crash reporting (Sentry already configured)

---

## 📚 References

- **Crash Report:** `/Users/abrahamyunes/blindado/rork-escolta-probodyguard-app/crash_report_96E3BD7D.crash`
- **React Navigation Docs:** https://reactnavigation.org/docs/navigating-without-navigation-prop
- **Expo Router Docs:** https://docs.expo.dev/router/introduction/
- **UIKit Alert Guidelines:** https://developer.apple.com/documentation/uikit/uialertcontroller

---

**Status:** 🔴 CRITICAL - Requires immediate fix before production  
**Priority:** P0  
**Estimated Fix Time:** 5 minutes
