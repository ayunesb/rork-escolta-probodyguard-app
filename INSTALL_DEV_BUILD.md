# 🔧 Development Build Installation Guide

## ⚠️ Error: No Development Build Installed

**Error Message:**
```
No development build (com.escolta.pro) for this project is installed.
```

**What This Means:**
The iOS simulator doesn't have the EscoltaPro app installed. We need to build it first.

---

## ✅ Solution: Build & Install the App

### Option 1: Use Expo Go (Fastest - Recommended)

Instead of pressing `i`, press `s` to switch to Expo Go:

```bash
# In the Expo terminal where it says "Press i | open iOS simulator"
# Press: s
```

This switches to Expo Go mode, which doesn't require a development build.

**Then press `i` again** to open in Expo Go.

---

### Option 2: Build Development Build (Takes ~10 minutes)

If you need the full development build:

#### Step 1: Install the App
```bash
# Make sure Expo is running (bun run start)
# Then in the same terminal or new one:
npx expo run:ios
```

This will:
- Build the iOS app
- Install it on the simulator
- Launch the simulator
- Open the app

**Wait time:** 5-10 minutes for first build

#### Step 2: After Build Completes
The app will be installed and running. Then you can test normally.

---

### Option 3: Use EAS Build (Production-like)

For a production-like build:

```bash
# Build development version
eas build --profile development --platform ios

# Then install the .app file on simulator
```

---

## 🎯 Recommended Quick Fix

**Right now in your Expo terminal:**

1. Look for the menu that says:
   ```
   › Press s │ switch to Expo Go
   ```

2. **Press `s`** (lowercase)

3. Wait for confirmation: "Switched to Expo Go"

4. **Press `i`** again

5. Expo Go will download from App Store (if not installed)

6. Your app will open in Expo Go ✅

---

## 📱 What's the Difference?

### Expo Go (Fast):
- ✅ No build required
- ✅ Works immediately
- ✅ Good for development
- ✅ **Use this for testing the crash fix!**
- ❌ Some native modules may not work

### Development Build (Slower):
- ✅ Full native features
- ✅ Custom native code
- ✅ Production-like
- ❌ Requires building (~10 min)
- ❌ Needs rebuild on native changes

---

## 🚀 Quick Steps to Test Right Now

1. **In Expo terminal, press:** `s` (switch to Expo Go)
2. **Then press:** `i` (open iOS simulator)
3. **Wait for:** Expo Go to download/install
4. **App will open** in Expo Go
5. **Test the payment flow** to verify the crash fix!

---

## 🔍 Alternative: Check if App is Already Built

Maybe the app was built before. Check:

```bash
# List installed apps on simulator
xcrun simctl listapps booted | grep -i escolta
```

If you see the app, try:

```bash
# Launch the app directly
xcrun simctl launch booted com.escolta.pro
```

---

## 📊 Current Status

- ✅ Firebase emulators: Ready to start
- ✅ Expo dev server: Ready to start
- ✅ iOS crash fix: Applied
- ❌ iOS app: Not installed on simulator
- ⏳ **Need to:** Use Expo Go OR Build app

---

## 💡 Recommendation

**For testing the crash fix, use Expo Go:**

```bash
# Start Firebase (Terminal 1)
firebase emulators:start

# Start Expo (Terminal 2)
bun run start

# When you see the menu:
# Press: s (switch to Expo Go)
# Press: i (open iOS)
# Test the payment flow!
```

This is the fastest way to verify your crash fix works! 🎉

---

## 🐛 If Expo Go Doesn't Work

Build the development version:

```bash
# This will take 5-10 minutes
npx expo run:ios

# It will:
# - Build the app
# - Install on simulator
# - Launch automatically
# - Open the app
```

Then test normally!

---

**Next Action:** Press `s` then `i` in the Expo terminal to use Expo Go! ⚡
