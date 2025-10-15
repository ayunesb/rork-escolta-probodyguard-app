# App Store Preparation Guide

## Overview
This guide covers preparing the Escolta Pro app for submission to Apple App Store and Google Play Store.

## Pre-Submission Checklist

### 1. App Store Requirements

#### iOS App Store Requirements
- [ ] **Xcode Version:** Latest stable version
- [ ] **iOS Target:** Minimum iOS 13.0+
- [ ] **App Icons:** All required sizes (1024×1024 for store)
- [ ] **Screenshots:** All device sizes and orientations
- [ ] **Privacy Policy:** Required URL in app listing
- [ ] **App Review Guidelines:** Compliance verified

#### Google Play Store Requirements  
- [ ] **Target SDK:** Android API level 34+
- [ ] **App Bundle:** AAB format required
- [ ] **App Icons:** Adaptive icons for Android
- [ ] **Screenshots:** Phone and tablet sizes
- [ ] **Content Rating:** Age-appropriate rating
- [ ] **Data Safety:** Privacy declarations completed

### 2. EAS Production Build Configuration

#### Update EAS Configuration
Ensure your `eas.json` is configured for store submissions:

```json
{
  "cli": {
    "version": ">= 13.2.1"
  },
  "build": {
    "production": {
      "ios": {
        "resourceClass": "m-medium",
        "autoIncrement": "buildNumber"
      },
      "android": {
        "buildType": "app-bundle",
        "resourceClass": "medium",
        "autoIncrement": "versionCode"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your_apple_id",
        "ascAppId": "your_app_store_connect_app_id",
        "appleTeamId": "your_team_id"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account-key.json",
        "track": "internal"
      }
    }
  }
}
```

### 3. App Configuration for Production

#### Update app.config.js for Production
```javascript
export default {
  expo: {
    name: 'Escolta Pro',
    slug: 'escolta-pro',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.escolta.pro",
      buildNumber: "1",
      config: {
        usesNonExemptEncryption: false
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "This app uses location to match you with nearby security guards.",
        NSCameraUsageDescription: "This app uses camera to verify identity and document incidents.",
        NSMicrophoneUsageDescription: "This app uses microphone for emergency calls and communication.",
        NSContactsUsageDescription: "This app accesses contacts to help you share your location with emergency contacts."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      package: 'com.escolta.pro',
      versionCode: 1,
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION", 
        "CAMERA",
        "RECORD_AUDIO",
        "READ_CONTACTS"
      ]
    },
    plugins: [
      "expo-location",
      "expo-camera", 
      "expo-av",
      "expo-contacts",
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff"
        }
      ]
    ],
    extra: {
      eas: {
        projectId: '7cee6c31-9a1c-436d-9baf-57fc8a43b651'
      }
    }
  },
  scheme: 'escoltapro'
};
```

## Asset Preparation

### 1. App Icons

#### iOS Icons Required
- **App Store:** 1024×1024 PNG (no alpha, no rounded corners)
- **iPhone:** 60×60, 120×120, 180×180
- **iPad:** 76×76, 152×152
- **Settings:** 29×29, 58×58, 87×87

#### Android Icons Required
- **Play Store:** 512×512 PNG
- **Adaptive Icon:** 108×108 foreground + background
- **Legacy Icon:** 48×48, 72×72, 96×96, 144×144, 192×192

#### Generate Icons Script
```bash
# Install icon generator
npm install -g @expo/image-utils

# Generate all required icon sizes
npx @expo/image-utils resize assets/icon.png --width 1024 --height 1024 --output assets/icon-1024.png
```

### 2. Screenshots

#### iOS Screenshots Required
- **iPhone 15 Pro Max:** 1320×2868, 2868×1320
- **iPhone 15 Pro:** 1206×2622, 2622×1206  
- **iPad Pro 13":** 2048×2732, 2732×2048

#### Android Screenshots Required
- **Phone:** 1080×1920 minimum
- **7" Tablet:** 1200×1920 minimum
- **10" Tablet:** 1920×1200 minimum

### 3. Splash Screen
```javascript
// Configure in app.config.js
splash: {
  image: './assets/splash.png',
  resizeMode: 'contain',
  backgroundColor: '#ffffff'
}
```

## App Store Connect Setup

### 1. Create App Record

#### iOS - App Store Connect
1. Login to [App Store Connect](https://appstoreconnect.apple.com)
2. Go to **My Apps** → **+** → **New App**
3. Fill out app information:
   - **Platform:** iOS
   - **Name:** Escolta Pro
   - **Primary Language:** Spanish (Mexico)
   - **Bundle ID:** com.escolta.pro
   - **SKU:** escolta-pro-ios

#### Android - Google Play Console
1. Login to [Google Play Console](https://play.google.com/console)
2. **Create app** → **Create new app**
3. Fill out app details:
   - **App name:** Escolta Pro
   - **Default language:** Spanish (Mexico)
   - **App or game:** App
   - **Free or paid:** Free

### 2. App Information

#### App Store Listing (iOS)
```
Name: Escolta Pro
Subtitle: Professional Security Services
Description: Connect with professional security guards for personal protection services in Mexico. Book verified guards, track your security detail in real-time, and ensure your safety with our comprehensive security platform.

Keywords: security, bodyguard, protection, safety, escort, professional, mexico

Support URL: https://escoltapro.com/support
Marketing URL: https://escoltapro.com
Privacy Policy URL: https://escoltapro.com/privacy

Content Rating: 4+ (No objectionable content)
```

#### Play Store Listing (Android)
```
App name: Escolta Pro  
Short description: Professional security services platform
Full description: Connect with professional security guards for personal protection services in Mexico. Our platform provides verified security professionals, real-time tracking, secure payment processing, and comprehensive safety features.

Category: Business
Content rating: Everyone
Target audience: Adults

Privacy Policy: https://escoltapro.com/privacy
```

## Build and Submission Process

### 1. Production Build Commands

#### iOS Production Build
```bash
# Create iOS production build
eas build --platform ios --profile production

# Wait for build completion
eas build:list

# Download build (optional)
eas build:download [build-id]
```

#### Android Production Build  
```bash
# Create Android production build
eas build --platform android --profile production

# Wait for build completion
eas build:list

# Download AAB file (optional)
eas build:download [build-id]
```

### 2. Automated Submission

#### iOS Submission
```bash
# Submit to App Store Connect
eas submit --platform ios --profile production

# Manual submission alternative
eas build --platform ios --profile production --auto-submit
```

#### Android Submission
```bash
# Submit to Google Play Console
eas submit --platform android --profile production

# Manual submission alternative  
eas build --platform android --profile production --auto-submit
```

### 3. Manual Submission Process

#### iOS Manual Submission
1. **Upload build** to App Store Connect (done by EAS)
2. **Add app information** and screenshots
3. **Configure pricing** and availability
4. **Submit for review**
5. **Monitor review status**

#### Android Manual Submission
1. **Upload AAB** to Google Play Console
2. **Complete store listing**
3. **Set up pricing** and distribution
4. **Submit for review**
5. **Monitor review status**

## Testing Before Submission

### 1. TestFlight Beta Testing (iOS)
```bash
# Create TestFlight build
eas build --platform ios --profile preview

# Add external testers in App Store Connect
# Collect feedback and iterate
```

### 2. Internal Testing (Android)
```bash
# Create internal testing build
eas submit --platform android --track internal

# Add internal testers in Play Console
# Test before promoting to production
```

### 3. Pre-Submission Validation

#### Functionality Testing
- [ ] All core features working
- [ ] Payment processing functional
- [ ] Push notifications working
- [ ] Deep linking operational
- [ ] Location services accurate
- [ ] Camera/microphone permissions

#### Performance Testing
- [ ] App startup time < 3 seconds
- [ ] Smooth navigation and transitions
- [ ] Memory usage optimized
- [ ] Battery usage reasonable
- [ ] Network requests efficient

#### Store Guidelines Compliance
- [ ] No crashes or major bugs
- [ ] User interface follows platform guidelines
- [ ] Content appropriate for rating
- [ ] Privacy policy complete and accessible
- [ ] All required permissions justified

## Review Process Management

### 1. iOS App Review

#### Common Rejection Reasons
- **Incomplete information** in App Store Connect
- **Missing privacy policy** or incorrect URL
- **Crashes during review** process
- **Guideline violations** (content, functionality)
- **Incomplete app** or placeholder content

#### Review Timeline
- **Standard review:** 24-48 hours
- **Expedited review:** Available for critical issues
- **Rejection response:** Address issues and resubmit

### 2. Google Play Review

#### Common Rejection Reasons
- **Policy violations** (content, permissions)
- **Incomplete store listing** information
- **Technical issues** or crashes
- **Inappropriate content rating**
- **Missing privacy policy**

#### Review Timeline
- **Standard review:** 3-7 days for new apps
- **Update review:** 1-3 days
- **Policy violation:** May require longer resolution

### 3. Post-Approval Process

#### iOS Release Management
- **Phased rollout:** Gradual user availability
- **Release monitoring:** Track downloads and reviews
- **Update scheduling:** Plan future releases

#### Android Release Management
- **Staged rollout:** Percentage-based release
- **Production monitoring:** Track crash rates
- **Update management:** Manage rollout percentage

## Monitoring and Analytics

### 1. App Store Analytics

#### iOS - App Store Connect Analytics
- **Impressions and downloads**
- **Conversion rates**
- **User retention**
- **Crash reports**
- **Customer reviews**

#### Android - Google Play Console
- **Install statistics**
- **User acquisition**
- **User behavior**
- **Performance metrics**
- **Review analysis**

### 2. Custom Analytics Integration

#### Firebase Analytics
```javascript
// Track app store conversion
Analytics.logEvent('app_store_download', {
  platform: 'ios',
  version: '1.0.0',
  source: 'organic'
});
```

#### Sentry Monitoring
```javascript
// Track app store specific events
Sentry.addBreadcrumb({
  message: 'App Store version launched',
  level: 'info',
  data: { version: '1.0.0', platform: 'ios' }
});
```

## Post-Launch Strategy

### 1. Launch Week Monitoring
- **Monitor crash rates** hourly
- **Track user feedback** and reviews
- **Respond to critical issues** immediately
- **Collect user feedback** for improvements

### 2. Update Strategy
- **Regular updates** every 2-4 weeks
- **Security patches** as needed
- **Feature releases** based on user feedback
- **Performance optimizations** continuously

### 3. Marketing Integration
- **ASO (App Store Optimization)** ongoing
- **Social media promotion** coordinated with launch
- **Press releases** for major updates
- **User acquisition campaigns** targeted

## Troubleshooting Guide

### Common Build Issues
```bash
# Clear EAS cache
eas build --clear-cache

# Check build logs
eas build:view [build-id]

# Validate configuration
eas build:configure
```

### Common Submission Issues
- **Invalid bundle identifier:** Check app.config.js and native config
- **Missing entitlements:** Add required iOS capabilities
- **Version conflicts:** Increment version/build numbers
- **Asset issues:** Validate icon and screenshot requirements

## Success Metrics

### Launch Success Indicators
- **Successful store approval** within review timeframe
- **Zero critical crashes** in first 48 hours
- **Positive review sentiment** > 4.0 rating
- **Download targets** met within first week
- **Payment processing** functioning smoothly

### Long-term Success Metrics
- **Monthly active users** growth
- **User retention** rates
- **Revenue per user** trending upward
- **App store ranking** improvements
- **Customer satisfaction** scores