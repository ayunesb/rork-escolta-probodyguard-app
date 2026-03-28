# 🧪 TESTING QUICK REFERENCE CARD

**Status**: Development build ready  
**Test Score**: 93% (15/16 passing)  
**Priority**: Background location + Push notifications

---

## 🚀 QUICK START

```bash
# 1. Build for Android (fastest)
eas build --profile development --platform android

# 2. Build for iOS
eas build --profile development --platform ios

# 3. Build both
eas build --profile development --platform all
```

**Build time**: 10-15 minutes per platform

---

## 👥 TEST ACCOUNTS

### Guards (Background Location Testing)
```
Email: guard1@demo.com
Password: DemoGuard123!
Role: guard
Features: Background tracking, bookings, payments
```

```
Email: guard2@demo.com  
Password: DemoGuard123!
Role: guard
Features: Same as guard1
```

### Clients
```
Email: client1@demo.com
Password: DemoClient123!
Role: client
Features: Booking, payment, tracking
```

### Admins
```
Email: admin@demo.com
Password: DemoAdmin123!
Role: admin
Features: Full access, analytics, refunds
```

---

## ✅ CRITICAL TESTS (Must Pass!)

### 1️⃣ Background Location (CRITICAL)
**Test**: Guard app backgrounded during booking
**Expected**: Location updates every 10s
**Check**: Firebase Console → Realtime Database → guardLocations

**Pass Criteria**:
- ✅ Location updates when backgrounded
- ✅ Client sees movement in real-time
- ✅ Battery drain acceptable (< 5%/hour)

### 2️⃣ Push Notifications (CRITICAL)
**Test**: Send booking notification
**Expected**: Notification arrives within 5s
**Check**: Device notification center

**Pass Criteria**:
- ✅ Permission prompt appears
- ✅ Notification arrives when backgrounded
- ✅ Tapping opens correct screen

### 3️⃣ Payment Flow (CRITICAL)
**Test**: Complete booking with payment
**Expected**: Transaction succeeds
**Check**: Braintree sandbox dashboard

**Sandbox Card**:
```
Number: 4111 1111 1111 1111
CVV: 123
Expiry: Any future date
```

**Pass Criteria**:
- ✅ Card accepted
- ✅ Payment confirmed
- ✅ Receipt generated

---

## 🔍 DEBUGGING COMMANDS

### Check Logs
```bash
# Android
adb logcat | grep -i expo

# iOS
xcrun simctl spawn booted log stream --predicate 'processImagePath contains "Expo"'
```

### Check Location Updates
```bash
# Watch Firebase Realtime Database
# Open: https://console.firebase.google.com/project/escolta-pro-fe90e/database
# Navigate to: guardLocations/{userId}
# Watch for timestamp updates
```

### Check Notifications
```bash
# Firebase Console → Cloud Messaging
# Send test notification to token
```

---

## 🐛 COMMON ISSUES

| Issue | Cause | Fix |
|-------|-------|-----|
| "TaskManager not found" | Using Expo Go | Use development build ✅ |
| Location stops in background | Permission not "Always" | Settings → Location → Always |
| No notifications | Expo Go on Android SDK 53+ | Use development build ✅ |
| Payment fails | Wrong environment | Check EXPO_PUBLIC_BRAINTREE_ENV=sandbox |
| Build fails | Cache issue | `--clear-cache` flag |

---

## 📊 TEST RESULTS TEMPLATE

```markdown
## Test Session: [Date]
**Build**: [Android/iOS]
**Device**: [Model]
**OS Version**: [Version]

### Background Location
- [ ] Started successfully
- [ ] Updates in background
- [ ] Updates visible to client
- [ ] Stops on completion
**Notes**:

### Push Notifications
- [ ] Permission granted
- [ ] Received while backgrounded
- [ ] Opens correct screen
**Notes**:

### Payment
- [ ] Card accepted
- [ ] Transaction confirmed
- [ ] Receipt generated
**Notes**:

### Overall Assessment
- [ ] PASS - Ready for production
- [ ] FAIL - Needs fixes
**Blocking Issues**:
```

---

## 🎯 PASS/FAIL CRITERIA

### PASS ✅
- All 3 critical tests pass
- No crashes in 1-hour session
- Background location 95%+ reliable
- Notifications 98%+ delivery rate

### FAIL ❌
- Any critical test fails
- App crashes > 1 time
- Background location < 90% reliable
- Notifications < 90% delivery

---

## 📞 NEXT STEPS

### If PASS ✅
1. Create preview build
2. Test on multiple devices
3. Gather team feedback
4. Prepare production deployment

### If FAIL ❌
1. Document issues
2. Run `./run-tests.sh`
3. Check `NASA_GRADE_AUDIT_REPORT.md`
4. Fix and rebuild

---

**Build Command Reminder**:
```bash
eas build --profile development --platform android
```

**Expected**: APK download link in 10-15 minutes 🚀
