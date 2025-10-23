# 📱 Push Notifications Setup Guide
## EAS Development Build Requirements for Expo SDK 53+

**Status:** 🔴 **REQUIRED** - Expo Go does not support Expo SDK 53+ push notifications

---

## ⚠️ Critical Information

**Expo Go Limitation:**
- Expo Go does NOT support `expo-notifications` with Expo SDK 53+
- You **MUST** use EAS Development Builds for testing push notifications
- This is an official Expo limitation, not a bug

**Official Documentation:**
- https://docs.expo.dev/versions/latest/sdk/notifications/
- https://docs.expo.dev/develop/development-builds/introduction/
- https://docs.expo.dev/push-notifications/overview/

---

## 🚀 Setup Steps

### 1. Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

### 2. Configure EAS Build

Your project already has `eas.json` configured. Verify the configuration:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

### 3. Build Development Client

#### For iOS Simulator (Testing on Mac):
```bash
eas build --profile development --platform ios
```

#### For Android Emulator or Physical Device:
```bash
eas build --profile development --platform android
```

#### For iOS Physical Device:
```bash
# Register your device first
eas device:create

# Then build
eas build --profile development --platform ios --device
```

### 4. Install Development Build

#### iOS Simulator:
1. Download the `.tar.gz` file from EAS Build
2. Extract and drag the `.app` to simulator
3. Or use:
```bash
eas build:run --profile development --platform ios
```

#### Android:
```bash
# Install the APK on emulator or device
eas build:run --profile development --platform android
```

### 5. Start Development Server

```bash
npx expo start --dev-client
```

### 6. Configure Push Notification Credentials

#### For iOS:
You need an Apple Push Notification Service (APNs) certificate:

```bash
# EAS will guide you through this
eas credentials
```

Required:
- Apple Developer account ($99/year)
- APNs Auth Key or Push Certificate
- Bundle identifier registered in App Store Connect

#### For Android:
You need Firebase Cloud Messaging (FCM) credentials:

1. Go to Firebase Console → Project Settings → Cloud Messaging
2. Copy the Server Key
3. Add to `app.json`:

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

---

## 🧪 Testing Push Notifications

### 1. Get Expo Push Token

When you run the development build, the app will request permission and generate a push token. You can see it in the logs:

```
[Auth] Expo Push Token: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
```

### 2. Test with Expo Push Tool

```bash
# Visit: https://expo.dev/notifications

# Or use CLI:
npx expo-notifications send \
  --to ExponentPushToken[YOUR_TOKEN] \
  --title "Test Notification" \
  --body "This is a test from Expo" \
  --data '{"bookingId": "test123"}'
```

### 3. Test with Your Cloud Functions

```typescript
// From your backend (Cloud Functions)
import { Expo } from 'expo-server-sdk';

const expo = new Expo();

const messages = [{
  to: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
  sound: 'default',
  title: 'New Booking Request',
  body: 'You have a new booking request',
  data: { bookingId: '123' },
}];

await expo.sendPushNotificationsAsync(messages);
```

---

## 🔧 Troubleshooting

### "Expo Go doesn't support this SDK version"
**Solution:** Use EAS Development Build (see steps above)

### "No push token generated"
**Check:**
1. Device permissions granted
2. Running on development build (not Expo Go)
3. `expo-notifications` and `expo-device` installed
4. APNs/FCM credentials configured

### "Notifications not received"
**Check:**
1. Token is valid (ExponentPushToken[...])
2. Device is not in Do Not Disturb mode
3. App has notification permissions
4. FCM/APNs credentials are valid
5. Backend is sending to correct token

### Build fails with "Missing credentials"
**Solution:**
```bash
eas credentials
# Follow prompts to add APNs/FCM credentials
```

---

## 📋 Checklist Before Testing

- [ ] EAS CLI installed and logged in
- [ ] Development build created for your platform
- [ ] Development build installed on device/simulator
- [ ] Push notification permissions granted in app
- [ ] Expo push token generated and logged
- [ ] APNs (iOS) or FCM (Android) credentials configured
- [ ] Backend can send to the token
- [ ] Test notification received successfully

---

## 🔐 Security Notes

### DO NOT:
❌ Hardcode push tokens in client code
❌ Expose FCM server key in client
❌ Send sensitive data in notification payload
❌ Store unencrypted tokens in Firestore without security rules

### DO:
✅ Store push tokens securely in Firestore with proper rules
✅ Keep FCM server key in Firebase Functions environment
✅ Use data payloads for sensitive information (encrypted)
✅ Implement token refresh logic
✅ Delete tokens when user logs out

---

## 📚 Additional Resources

- [Expo Notifications API Reference](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Push Notification Security](https://docs.expo.dev/push-notifications/overview/#security-considerations)
- [EAS Build Configuration](https://docs.expo.dev/build/introduction/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Apple Push Notifications](https://developer.apple.com/documentation/usernotifications)

---

## ⏭️ Next Steps

1. **Development Testing:**
   - Build development client for your platform
   - Install and test on device/simulator
   - Verify push token generation

2. **Production Preparation:**
   - Configure production APNs/FCM credentials
   - Test end-to-end notification flow
   - Implement notification handlers in app

3. **Deployment:**
   - Create production build with `eas build --platform all`
   - Submit to app stores
   - Monitor notification delivery metrics

---

**Last Updated:** October 22, 2025
**Status:** Ready for implementation
**Priority:** P1 (Required for full app functionality)
