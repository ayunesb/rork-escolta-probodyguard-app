# 📱 How to Open the Rork/Escolta Pro App

## Current Situation
- ✅ Expo is running with development build
- ✅ App is installed on iPhone 15 Plus simulator
- ✅ Bundle ID: `com.escolta.pro`
- ⚠️ Opening directly goes to Google (not the app)

---

## 🎯 Solution: Use the Simulator Directly

### Option 1: Open from Expo Terminal (Recommended)

In your Expo terminal where it says:
```
› Press a │ open Android
› Press i │ open iOS simulator
```

**Just press `i`** - This will:
1. Open the iOS Simulator (if not already open)
2. Install/launch the app automatically

### Option 2: Open App from Simulator

If the simulator is already open:

1. **Look at the iPhone screen** in the simulator
2. **Find the "Escolta Pro" app icon**
3. **Click on it** to launch

The app should be on the home screen with your app icon.

### Option 3: Rebuild and Install

If the app isn't installed, run in terminal:

```bash
# For iOS Simulator
npx expo run:ios

# Or press 'i' in the Expo terminal
```

---

## 🔍 Verify App is Installed

Check if app is installed on simulator:

```bash
xcrun simctl listapps booted | grep -i escolta
```

Or list all installed apps:
```bash
xcrun simctl listapps booted | grep -i "com.escolta"
```

---

## 🚀 Once App is Open

After you have the app open on the simulator:

### Step 1: Login
- Use your test account credentials
- Should see the main app screen

### Step 2: Navigate to Payment Section
- Look for: Subscription, Payment, Billing, or similar
- May be in: Profile, Settings, or main menu

### Step 3: Make Test Payment
Use test card:
```
Card Number: 4111 1111 1111 1111
Expiry: 12/25
CVV: 123
ZIP: 12345
```

### Step 4: Watch for Webhook
- Monitor terminal logs
- Refresh Firestore webhook_logs collection

---

## 🆘 Troubleshooting

### App not showing in simulator?

**Rebuild the app:**
```bash
# Stop current Expo
# Then run:
npx expo run:ios
```

This will:
1. Build the development client
2. Install it on simulator
3. Launch the app

### Simulator closed?

**Reopen it:**
```bash
# Open simulator
open -a Simulator

# Then press 'i' in Expo terminal
```

### Need fresh start?

```bash
# 1. Close simulator app completely
# 2. In terminal with Expo running, press 'i'
# 3. Wait for simulator to open and app to install
```

---

## 🎯 Alternative: Test on Physical Device

If simulator isn't working, use your actual iPhone:

1. **Install Expo Go** from App Store (if you haven't)
2. **Scan QR code** from Expo terminal with your iPhone camera
3. **Open in Expo Go** app

OR if you have the development build on your physical device:
1. Build must be installed via TestFlight or direct install
2. Open the app directly from home screen

---

## 📱 Current Expo Status

From your terminal output:
```
› Opening on iPhone 15 Plus
› Opening com.escolta.pro on iPhone 15 Plus
```

This means Expo **already tried** to open the app. 

**Check your simulator screen now** - the app might already be open!

---

## ✅ Quick Check

**Is the iPhone 15 Plus simulator window open on your screen?**

- **YES** → Look for the Escolta Pro app icon, click it
- **NO** → Press 'i' in Expo terminal to open it

**Do you see the Escolta Pro app interface?**

- **YES** → Great! Proceed with payment testing
- **NO** → Try: `npx expo run:ios` to rebuild

---

## 🎉 Once App is Running

You should see:
- App login screen OR
- Main dashboard (if already logged in)

Then you can:
1. Navigate to payment section
2. Make test payment
3. Watch webhook arrive in Firestore!

---

**Current Status**: Expo running, waiting for you to open the app in simulator

**Next Step**: Press 'i' in Expo terminal OR click Escolta Pro icon in simulator
