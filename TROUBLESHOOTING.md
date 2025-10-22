# 🔧 TROUBLESHOOTING GUIDE - Build ec6e0d3a

**Build**: ec6e0d3a-37ec-4c3f-b609-1272a4d5181c  
**Date**: October 22, 2025  
**Status**: Build succeeded, testing in progress

---

## 🚨 COMMON ISSUES & FIXES

### Issue 1: App Crashes on Launch

**Symptoms**: White screen, then crash immediately

**Possible Causes**:
1. Firebase initialization error
2. Missing environment variables
3. Network connectivity issue
4. Permissions not granted

**Fixes to Try**:

**A. Clear App Data and Reinstall**
```bash
# On Android device:
Settings → Apps → Escolta Pro → Storage → Clear Data
Settings → Apps → Escolta Pro → Uninstall
# Then reinstall from new QR code
```

**B. Check Internet Connection**
- Ensure device has active internet
- Try switching between WiFi and mobile data
- Firebase requires internet for first initialization

**C. Grant All Permissions**
- Location: "Always Allow"
- Notifications: "Allow"
- Storage: "Allow"

---

### Issue 2: "FirebaseApp Not Initialized" Error

**Symptoms**: Error mentioning Firebase or App Check

**Status**: Should be FIXED in build ec6e0d3a

**If Still Occurring**:
1. Verify you installed the LATEST build (ec6e0d3a)
2. Old build ID was: 33aa849f (don't use this one)
3. Check the build ID in app: Look at bottom of splash screen

**Quick Fix**:
```bash
# Uninstall old version completely
adb uninstall com.escolta.pro

# Install new version
# Scan QR code from LATEST build
```

---

### Issue 3: Login Fails

**Symptoms**: Can't login with demo accounts

**Check**:
1. **Internet connection** - Firebase Auth requires internet
2. **Correct credentials**:
   - Guard: guard1@demo.com / DemoGuard123!
   - Client: client1@demo.com / DemoClient123!
3. **Email verification** - Accounts must be verified

**Fix**:
```bash
# If email verification is blocking, check Firebase Console:
# https://console.firebase.google.com/project/escolta-pro-fe90e/authentication/users

# Demo accounts should already be verified
# If not, run: node reset-demo-passwords.cjs
```

---

### Issue 4: Black Screen After Splash

**Symptoms**: App loads, shows splash, then black screen

**Possible Causes**:
1. JavaScript bundle error
2. Navigation initialization failed
3. Context provider error

**Fixes**:

**A. Check Device Logs**
```bash
# Connect device via USB, enable USB debugging
adb logcat | grep -i "ReactNativeJS"
```

**B. Disable Dev Tools**
- Shake device
- Select "Disable Fast Refresh"
- Force close app
- Reopen

---

### Issue 5: Network Request Failed

**Symptoms**: Errors about network, fetch, or axios

**Possible Causes**:
1. Firestore/Realtime DB connection issue
2. Cloud Functions not responding
3. Device firewall blocking requests

**Fixes**:

**A. Check Firebase Console**
- Firestore: https://console.firebase.google.com/project/escolta-pro-fe90e/firestore
- Database: https://console.firebase.google.com/project/escolta-pro-fe90e/database
- Verify services are active

**B. Verify Network**
```bash
# Test internet connectivity
ping 8.8.8.8

# Test Firebase connectivity
curl https://escolta-pro-fe90e.firebaseapp.com
```

---

### Issue 6: Push Notifications Not Working

**Symptoms**: No notification permission prompt, or notifications don't arrive

**Status**: EXPECTED in Expo Go, should work in dev build

**Verify**:
1. You're using development build (NOT Expo Go)
2. Build ID is ec6e0d3a
3. Notification permission granted

**Fix**:
```bash
# Grant notification permission manually
Settings → Apps → Escolta Pro → Notifications → Allow All
```

---

### Issue 7: Location Tracking Not Starting

**Symptoms**: Location permission granted but tracking doesn't start

**Possible Causes**:
1. Permission not "Always Allow"
2. Battery optimization blocking
3. Background task not registered

**Fixes**:

**A. Check Permissions**
```bash
Settings → Apps → Escolta Pro → Permissions → Location
# Must be "Always Allow" (not "While Using")
```

**B. Disable Battery Optimization**
```bash
Settings → Battery → Battery Optimization
# Find Escolta Pro → Don't Optimize
```

**C. Verify Background Task**
- Should see notification: "Tracking location for active booking"
- If not, background task may not be registered

---

## 🔍 DEBUGGING STEPS

### Get Detailed Logs

**Method 1: USB Debugging (Recommended)**
```bash
# Enable USB debugging on device
# Connect via USB
adb devices
adb logcat | grep -E "(ReactNativeJS|Expo|Firebase)"
```

**Method 2: Expo Dev Client Logs**
```bash
# If dev client is running
npx expo start --dev-client
# Look for errors in terminal
```

**Method 3: Firebase Console**
- Check Firestore errors: https://console.firebase.google.com/project/escolta-pro-fe90e/firestore
- Check Function logs: https://console.firebase.google.com/project/escolta-pro-fe90e/functions

---

## 📱 DEVICE COMPATIBILITY

### Minimum Requirements
- Android 6.0 (API 23) or higher
- 2GB RAM minimum
- Internet connection required
- Google Play Services (for Firebase)

### Known Issues by Android Version
- **Android 6-7**: May have background location issues
- **Android 8+**: Battery optimization aggressive
- **Android 12+**: Requires exact alarm permission
- **Android 13+**: Notification permission must be granted

---

## 🆘 STILL HAVING ISSUES?

### Provide These Details

When reporting an error, please include:

1. **Build ID**: Check you're using ec6e0d3a
2. **Error Message**: Full text or screenshot
3. **When it occurs**: Launch, login, specific action?
4. **Device Info**:
   - Model: [e.g. Samsung Galaxy S21]
   - Android Version: [e.g. Android 13]
   - RAM: [e.g. 8GB]
5. **Steps to reproduce**:
   - Step 1: Open app
   - Step 2: Try to login
   - Step 3: See error

6. **Logs** (if possible):
```bash
adb logcat -d > logs.txt
# Share logs.txt
```

---

## 🔄 EMERGENCY RESET

If nothing works, try complete reset:

```bash
# 1. Uninstall app completely
adb uninstall com.escolta.pro

# 2. Clear all data
adb shell pm clear com.escolta.pro

# 3. Reinstall from latest build
# Scan QR code: ec6e0d3a

# 4. Grant all permissions before opening
Settings → Apps → Escolta Pro → Permissions → Allow All

# 5. Disable battery optimization
Settings → Battery → Battery Optimization → Escolta Pro → Don't Optimize

# 6. Launch app
```

---

## ✅ VERIFICATION CHECKLIST

Before reporting an issue, verify:

- [ ] Using latest build (ec6e0d3a, NOT 33aa849f)
- [ ] Internet connection active
- [ ] All permissions granted
- [ ] Battery optimization disabled
- [ ] Google Play Services installed
- [ ] Device meets minimum requirements
- [ ] Tried uninstall/reinstall

---

## 📞 QUICK SUPPORT

**Latest Build**: https://expo.dev/accounts/ayunesb/projects/escolta-pro/builds/ec6e0d3a

**QR Code**: See below

**Test Accounts**:
- Guard: guard1@demo.com / DemoGuard123!
- Client: client1@demo.com / DemoClient123!

---

**Share error details and I'll provide specific fix!** 🚀
