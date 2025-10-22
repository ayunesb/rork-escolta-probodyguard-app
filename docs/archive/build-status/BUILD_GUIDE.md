# iOS & Android Build Guide

## Overview

This guide covers building **Escolta Pro** for iOS and Android. The app is **native-only** (no web support) and requires proper setup for both platforms.

---

## Prerequisites

### General Requirements

- **Node.js**: v18+ (LTS recommended)
- **Bun**: Latest version (package manager)
- **Expo CLI**: v53+
- **Git**: For version control

### iOS Requirements

- **macOS**: Required for iOS builds
- **Xcode**: v15+ (latest stable)
- **CocoaPods**: v1.12+
- **iOS Simulator**: Included with Xcode
- **Apple Developer Account**: For device testing & App Store

### Android Requirements

- **Android Studio**: Latest stable
- **Android SDK**: API 33+ (Android 13+)
- **Java JDK**: v17+
- **Android Emulator**: Configured in Android Studio

---

## Initial Setup

### 1. Clone & Install Dependencies

```bash
# Clone repository
git clone <your-repo-url>
cd escolta-pro

# Install dependencies
bun install

# Install iOS pods (macOS only)
cd ios && pod install && cd ..
```

### 2. Configure Environment

Create `.env` file:

```bash
EXPO_PUBLIC_BRAINTREE_ENV=sandbox
EXPO_PUBLIC_BRAINTREE_MERCHANT_ID=8jbcpm9yj7df7w4h
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### 3. Verify Configuration

Check `app.json`:

```json
{
  "expo": {
    "name": "Escolta Pro",
    "slug": "escolta-pro",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "app.rork.escolta-pro",
      "supportsTablet": true
    },
    "android": {
      "package": "app.rork.escolta_pro",
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "FOREGROUND_SERVICE",
        "FOREGROUND_SERVICE_LOCATION"
      ]
    }
  }
}
```

---

## Development Builds

### Start Development Server

```bash
# Start Expo dev server
bun start

# Or with specific platform
bun run ios      # iOS simulator
bun run android  # Android emulator
```

### iOS Simulator

```bash
# Start iOS simulator
bun run ios

# Or specify device
expo run:ios --device "iPhone 15 Pro"
```

**Troubleshooting iOS**:

```bash
# Clean build
cd ios && rm -rf build Pods && pod install && cd ..

# Reset Metro cache
expo start --clear

# Rebuild native modules
expo prebuild --clean
```

### Android Emulator

```bash
# Start Android emulator
bun run android

# Or specify device
expo run:android --device emulator-5554
```

**Troubleshooting Android**:

```bash
# Clean build
cd android && ./gradlew clean && cd ..

# Reset Metro cache
expo start --clear

# Rebuild native modules
expo prebuild --clean
```

---

## Production Builds

### iOS Production Build

#### Option 1: EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios --profile production
```

#### Option 2: Local Build

```bash
# Generate native iOS project
expo prebuild --platform ios

# Open in Xcode
open ios/EscoltaPro.xcworkspace

# In Xcode:
# 1. Select "Any iOS Device" as target
# 2. Product → Archive
# 3. Distribute App → App Store Connect
```

**iOS Build Checklist**:

- [ ] Update version in `app.json`
- [ ] Configure signing in Xcode
- [ ] Set production API URL
- [ ] Update Braintree to production
- [ ] Test on physical device
- [ ] Archive and upload to App Store Connect

### Android Production Build

#### Option 1: EAS Build (Recommended)

```bash
# Build for Android
eas build --platform android --profile production
```

#### Option 2: Local Build

```bash
# Generate native Android project
expo prebuild --platform android

# Build release APK
cd android
./gradlew assembleRelease

# Or build AAB for Play Store
./gradlew bundleRelease

# Output:
# APK: android/app/build/outputs/apk/release/app-release.apk
# AAB: android/app/build/outputs/bundle/release/app-release.aab
```

**Android Build Checklist**:

- [ ] Update version in `app.json`
- [ ] Generate signing key
- [ ] Configure `android/gradle.properties`
- [ ] Set production API URL
- [ ] Update Braintree to production
- [ ] Test on physical device
- [ ] Upload AAB to Play Console

---

## Signing Configuration

### iOS Code Signing

1. **Create App ID** in Apple Developer Portal
2. **Generate Certificates**:
   - Development Certificate
   - Distribution Certificate
3. **Create Provisioning Profiles**:
   - Development Profile
   - App Store Profile
4. **Configure in Xcode**:
   - Select project → Signing & Capabilities
   - Choose team and provisioning profile

### Android Signing

Generate keystore:

```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore escolta-pro.keystore \
  -alias escolta-pro \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

Configure `android/gradle.properties`:

```properties
MYAPP_UPLOAD_STORE_FILE=escolta-pro.keystore
MYAPP_UPLOAD_KEY_ALIAS=escolta-pro
MYAPP_UPLOAD_STORE_PASSWORD=your_store_password
MYAPP_UPLOAD_KEY_PASSWORD=your_key_password
```

Update `android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            storeFile file(MYAPP_UPLOAD_STORE_FILE)
            storePassword MYAPP_UPLOAD_STORE_PASSWORD
            keyAlias MYAPP_UPLOAD_KEY_ALIAS
            keyPassword MYAPP_UPLOAD_KEY_PASSWORD
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

---

## Native Dependencies

### Required Packages

All native packages are included in Expo Go v53:

- `expo-location` - Location tracking
- `expo-notifications` - Push notifications
- `expo-local-authentication` - Biometric auth
- `expo-image-picker` - Document upload
- `expo-document-picker` - File selection
- `react-native-maps` - Map display
- `@react-native-community/datetimepicker` - Date/time selection

### Verify Native Modules

```bash
# Check installed packages
bun list

# Verify iOS pods
cd ios && pod list && cd ..

# Verify Android dependencies
cd android && ./gradlew dependencies && cd ..
```

---

## Testing

### Unit Tests

```bash
# Run tests
bun test

# With coverage
bun test --coverage
```

### E2E Tests (Optional)

```bash
# Install Detox
npm install -g detox-cli

# Build for testing
detox build --configuration ios.sim.debug

# Run tests
detox test --configuration ios.sim.debug
```

---

## Performance Optimization

### iOS Optimization

1. **Enable Hermes** (default in Expo 53)
2. **Optimize Images**:
   - Use `expo-image` for caching
   - Compress assets before bundling
3. **Reduce Bundle Size**:
   - Remove unused dependencies
   - Use dynamic imports for large modules

### Android Optimization

1. **Enable Hermes** (default in Expo 53)
2. **Enable ProGuard**:
   ```gradle
   buildTypes {
       release {
           minifyEnabled true
           proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
       }
   }
   ```
3. **Split APKs by ABI**:
   ```gradle
   splits {
       abi {
           enable true
           reset()
           include "armeabi-v7a", "arm64-v8a", "x86", "x86_64"
           universalApk false
       }
   }
   ```

---

## Deployment

### iOS App Store

1. **Prepare**:
   - Screenshots (6.5", 5.5" displays)
   - App icon (1024x1024)
   - Privacy policy URL
   - App description

2. **Upload**:
   - Archive in Xcode
   - Upload to App Store Connect
   - Submit for review

3. **Review Process**:
   - Typically 1-3 days
   - Address any rejections
   - Release when approved

### Google Play Store

1. **Prepare**:
   - Screenshots (phone, tablet)
   - Feature graphic (1024x500)
   - App icon (512x512)
   - Privacy policy URL
   - App description

2. **Upload**:
   - Create release in Play Console
   - Upload AAB file
   - Complete store listing
   - Submit for review

3. **Review Process**:
   - Typically 1-2 days
   - Address any issues
   - Release to production

---

## Troubleshooting

### Common Issues

**Metro Bundler Errors**:
```bash
expo start --clear
rm -rf node_modules && bun install
```

**iOS Build Fails**:
```bash
cd ios && rm -rf Pods build && pod install && cd ..
expo prebuild --clean
```

**Android Build Fails**:
```bash
cd android && ./gradlew clean && cd ..
expo prebuild --clean
```

**Location Not Working**:
- Check permissions in `app.json`
- Request permissions at runtime
- Test on physical device (not simulator)

**Maps Not Displaying**:
- Verify `react-native-maps` is installed
- Check API keys (if required)
- Test on physical device

---

## CI/CD Setup (Optional)

### GitHub Actions Example

```yaml
name: Build iOS & Android

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: bun install
      - run: eas build --platform all --non-interactive
```

---

## Support

- **Expo Docs**: https://docs.expo.dev/
- **React Native**: https://reactnative.dev/
- **Braintree**: https://developer.paypal.com/braintree/

---

**Last Updated**: 2025-01-03
