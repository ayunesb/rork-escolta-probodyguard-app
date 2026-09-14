# 🍎 Xcode Build & Test Guide

## ✅ Xcode is Now Opening!

**Workspace:** `ios/EscoltaProBodyguardApp.xcworkspace`

---

## 📱 Build Steps in Xcode:

### 1. **Select Simulator**
- Top toolbar: Click device dropdown (next to EscoltaProBodyguardApp)
- Choose: **iPhone 15** (or any iOS 17+ simulator)

### 2. **Build & Run**
- **Shortcut:** `⌘ + R` (Command + R)
- **OR:** Click the ▶️ Play button in top-left

### 3. **Wait for Build**
- First build may take 2-3 minutes (compiling dependencies)
- Watch progress in Xcode status bar

---

## 🔧 If Build Fails:

### Common Fix - Clean Build Folder:
```
⌘ + Shift + K (Clean Build Folder)
```
Then rebuild with `⌘ + R`

### If Still Failing - Check:
1. **Product → Scheme → Edit Scheme**
   - Build Configuration: **Debug**
   - Run: Enable "Debug executable"

2. **Signing & Capabilities tab**
   - Team: Select your Apple ID
   - Bundle Identifier: `com.escolta.pro`
   - Automatically manage signing: ✅ Checked

---

## 🧪 Testing the Payment Crash Fix:

### **Firebase Backend Already Running** ✅
The Firebase emulators are running in background (PID 46865)

### **Once App Launches in Simulator:**

#### **Step 1: Create Test Accounts**
1. Sign Up: `client@demo.com` / `<contrasena en tu .env local, no en el repositorio>` (CLIENT role)
2. Sign Up: `guard1@demo.com` / `<contrasena en tu .env local, no en el repositorio>` (GUARD role)

#### **Step 2: Test Payment Navigation** 🎯
1. Sign in as **client@demo.com**
2. Navigate: **Guards** → Select guard → **Book**
3. **Payment**: `4111 1111 1111 1111` / `12/25` / `123`
4. Tap **"Confirm Payment"**
5. **CRITICAL MOMENT:** Success alert → Tap **"View Booking"**
6. **Expected:** 300ms pause → smooth navigation (NO CRASH!)

---

## 🐛 The Fix You're Testing:

**File:** `app/booking-payment.tsx` (Lines 84-89)

**What Changed:**
```typescript
// BEFORE (crashed with SIGABRT):
onPress: () => { router.replace({...}); }

// AFTER (fixed):
onPress: () => {
  setTimeout(() => {
    router.replace({pathname: '/booking-active', params: {...}});
  }, 300); // ← This 300ms delay prevents UIViewController crash
}
```

**Why It Works:**  
The `setTimeout` delay allows the UIAlertController to fully dismiss (takes ~200ms) before starting the navigation transition. This prevents iOS from trying to present two view controllers simultaneously, which caused the SIGABRT crash.

---

## 📊 Build Info:

- **Bundle ID:** `com.escolta.pro`
- **Scheme:** EscoltaProBodyguardApp
- **Min iOS:** 13.4+
- **Pods:** ✅ Installed (Firebase, Expo modules)
- **Backend:** Firebase Emulators on localhost
- **Payment:** Braintree Sandbox

---

## 🚀 Quick Reference:

| Action | Shortcut |
|--------|----------|
| Build & Run | `⌘ + R` |
| Clean Build | `⌘ + Shift + K` |
| Stop | `⌘ + .` |
| Rebuild | `⌘ + B` |
| Show Logs | `⌘ + Shift + Y` |

---

**Need Help?** Let me know if you see any build errors in Xcode!
