# 📱 Android APK Installation Guide

## 🎯 Overview
This guide shows how to install the Escolta Pro APK on Android devices for internal testing.

**Build Details:**
- Environment: Production Firebase + Sandbox Braintree
- Profile: `internal-testing`
- Build URL: https://expo.dev/accounts/ayunesb/projects/escolta-pro/builds/7872a070-ee70-4c53-8665-69ed2a365b38

---

## 📥 Step 1: Download the APK

Once the build completes (~15-20 minutes):

1. Open the build URL in your browser
2. Click **"Download"** button
3. Save the APK file to your computer
4. File name will be something like: `escolta-pro-1.0.0.apk`

---

## 📲 Step 2: Transfer to Android Device

### Option A: Direct Download on Device
1. Open the build URL on your Android phone's browser
2. Download directly to the device
3. Skip to Step 3

### Option B: USB Transfer
1. Connect Android device to computer via USB
2. Enable "File Transfer" mode on phone
3. Copy APK to phone's `Downloads` folder

### Option C: Cloud Transfer
1. Upload APK to Google Drive/Dropbox/Email
2. Download on Android device
3. Open the downloaded APK file

---

## ⚙️ Step 3: Enable Installation from Unknown Sources

**Android 8.0+ (Most Common):**
1. When you tap the APK, you'll see a prompt
2. Tap **"Settings"**
3. Enable **"Allow from this source"**
4. Go back and tap **"Install"**

**Manual Method:**
1. Go to **Settings** → **Apps** → **Special app access**
2. Tap **"Install unknown apps"**
3. Find your browser/file manager (Chrome, Files, etc.)
4. Enable **"Allow from this source"**

---

## 🚀 Step 4: Install the APK

1. Tap the downloaded APK file
2. Review app permissions
3. Tap **"Install"**
4. Wait for installation to complete
5. Tap **"Open"** to launch the app

---

## ✅ Step 5: Test Credentials

Use these demo accounts for testing:

### Bodyguard Account
- Email: `guard1@demo.com`
- Password: `Pass@word123`
- Role: Bodyguard (Pro)

### Client Account
- Email: `client1@demo.com`
- Password: `Pass@word123`
- Role: Client

### Admin Account
- Email: `admin@escoltapro.com`
- Password: `Admin@123`
- Role: Admin

---

## 🧪 Test Checklist

### Authentication
- [ ] Sign in successfully
- [ ] Email verification works
- [ ] Password reset flow
- [ ] Sign out and sign back in

### Firestore/Functions
- [ ] User profile loads correctly
- [ ] Can view bookings list
- [ ] Can create new booking
- [ ] Real-time updates work

### Location Tracking (Requires Real Device)
- [ ] GPS permissions granted
- [ ] Location updates in background
- [ ] T-10 geofencing (10km radius)
- [ ] Location shown on map

### Push Notifications (Requires Real Device)
- [ ] Notification permission granted
- [ ] Receive booking notifications
- [ ] Receive chat messages
- [ ] Notification tap opens app

### Payments (Sandbox Mode)
- [ ] View pricing
- [ ] Enter sandbox credit card:
  - **Card:** 4111 1111 1111 1111
  - **Expiry:** Any future date
  - **CVV:** 123
- [ ] Payment processing works
- [ ] Transaction appears in Braintree sandbox

### Error Handling
- [ ] No crashes during normal use
- [ ] Errors logged to Crashlytics/Sentry
- [ ] Graceful error messages shown

---

## 🐛 Troubleshooting

### "App Not Installed" Error
- **Cause:** Previous version conflict
- **Fix:** Uninstall old version first, then reinstall

### "Parse Error" 
- **Cause:** Corrupted download
- **Fix:** Re-download the APK

### App Crashes on Launch
- **Cause:** Missing Google Play Services
- **Fix:** Update Google Play Services from Play Store

### Location Not Working
- **Cause:** Permission denied
- **Fix:** Settings → Apps → Escolta Pro → Permissions → Enable Location (All the time)

### Notifications Not Working
- **Cause:** Permission denied or battery optimization
- **Fix:** 
  1. Settings → Apps → Escolta Pro → Permissions → Enable Notifications
  2. Settings → Battery → Escolta Pro → Disable battery optimization

---

## 📊 Reporting Issues

When reporting bugs, please include:

1. **Device Info:**
   - Manufacturer (Samsung, Google, etc.)
   - Model (Galaxy S23, Pixel 7, etc.)
   - Android version (12, 13, 14, etc.)

2. **Steps to Reproduce:**
   - What did you do?
   - What happened?
   - What should have happened?

3. **Screenshots/Logs:**
   - Take screenshots of errors
   - Share relevant details

---

## 🔒 Security Notes

- ✅ **Safe to Install**: APK is built by Expo/EAS (trusted service)
- ✅ **Production Data**: Uses real Firebase production database
- ✅ **Sandbox Payments**: Braintree in sandbox mode (no real money)
- ✅ **Signed Build**: APK is cryptographically signed with keystore

---

## 🚀 Next Steps After Testing

1. Test all features listed in the checklist
2. Document any bugs or issues
3. Share feedback with development team
4. Once validated, prepare for production release

---

## 📞 Support

For help or questions:
- Check the troubleshooting section above
- Review logs in Firebase Console
- Contact development team

---

**Build Information:**
- Build Profile: `internal-testing`
- Firebase Project: `escolta-pro-fe90e`
- Braintree Mode: `sandbox`
- App Version: `1.0.0`
- Build Date: October 23, 2025
