# EAS Build Testing Guide

## Overview
This guide covers testing EAS (Expo Application Services) builds for both development and production scenarios.

## Prerequisites

### 1. Install Required Dependencies
```bash
# Install expo-dev-client for development builds
npx expo install expo-dev-client

# Update EAS CLI to latest version
npm install -g eas-cli@latest
```

### 2. EAS Authentication
```bash
# Login to your Expo account
eas login

# Verify authentication
eas whoami
```

## Build Profiles Configuration

Our `eas.json` includes three build profiles:

### Development Profile
- **Purpose:** Testing on physical devices with live reload
- **Features:** Development client, internal distribution
- **Use Case:** Developer testing, QA testing

### Preview Profile  
- **Purpose:** Internal testing and staging
- **Features:** Production-like build, internal distribution
- **Use Case:** Stakeholder review, pre-production testing

### Production Profile
- **Purpose:** App Store/Play Store submission
- **Features:** Optimized builds, store-ready
- **Use Case:** Final release builds

## iOS Credentials Setup

### Development Builds (Internal Distribution)
```bash
# Set up iOS credentials for development
eas credentials

# Follow prompts to:
# 1. Generate or select development certificate
# 2. Register test devices
# 3. Create/update provisioning profile
```

### Production Builds (App Store)
```bash
# Set up iOS credentials for App Store
eas credentials -p ios --profile production

# Follow prompts to:
# 1. Generate or select distribution certificate  
# 2. Create/update App Store provisioning profile
```

## Android Credentials Setup

### Development Builds
- No special setup required for development APKs
- Android builds work out of the box

### Production Builds (Play Store)
```bash
# Set up Android credentials for Play Store
eas credentials -p android --profile production

# Upload or generate:
# 1. Android Keystore
# 2. Key alias and passwords
```

## Build Commands

### Development Builds
```bash
# iOS development build
eas build --platform ios --profile development

# Android development build  
eas build --platform android --profile development

# Both platforms
eas build --platform all --profile development
```

### Preview Builds
```bash
# iOS preview build
eas build --platform ios --profile preview

# Android preview build
eas build --platform android --profile preview

# Both platforms
eas build --platform all --profile preview
```

### Production Builds
```bash
# iOS production build
eas build --platform ios --profile production

# Android production build
eas build --platform android --profile production

# Both platforms
eas build --platform all --profile production
```

## Testing Workflow

### 1. Development Testing

**Step 1: Create Development Build**
```bash
eas build --platform ios --profile development
```

**Step 2: Install on Device**
- Download from EAS dashboard
- Install via TestFlight (iOS) or direct APK (Android)
- Use development client for live reload

**Step 3: Test Features**
- Deep linking: `nobodyguard://booking/123`
- Push notifications
- Payment flows
- Firebase integration

### 2. Preview Testing

**Step 1: Create Preview Build**
```bash
eas build --platform all --profile preview
```

**Step 2: Stakeholder Testing**
- Share build with team/stakeholders
- Test production-like experience
- Validate all features work in production mode

### 3. Production Testing

**Step 1: Create Production Build**
```bash
eas build --platform all --profile production
```

**Step 2: Final Validation**
- Test builds extensively before submission
- Verify all store requirements met
- Check app performance and stability

## Monitoring Builds

### EAS Dashboard
- Visit: https://expo.dev/accounts/[username]/projects/escolta-pro/builds
- Monitor build progress
- Download completed builds
- View build logs

### CLI Commands
```bash
# List all builds
eas build:list

# View specific build
eas build:view [build-id]

# Cancel running build
eas build:cancel [build-id]

# Download build artifacts
eas build:download [build-id]
```

## CI/CD Integration

The GitHub Actions workflow automatically triggers builds on:
- **Push to main branch:** Creates preview builds
- **Manual trigger:** Can create production builds

### Manual CI/CD Build Trigger
```bash
# Trigger GitHub Actions build
git commit --allow-empty -m "Trigger EAS build"
git push origin main
```

## Troubleshooting

### Common Issues

**1. Credentials Not Found**
```bash
# Set up credentials interactively
eas credentials -p ios
eas credentials -p android
```

**2. Build Fails**
```bash
# Check build logs
eas build:view [build-id]

# Clear cache and retry
eas build --platform [platform] --profile [profile] --clear-cache
```

**3. Device Not Registered (iOS)**
```bash
# Register new device
eas device:create

# Update provisioning profile
eas credentials -p ios
```

**4. Bundle Identifier Conflicts**
- Check `app.config.js` bundle ID matches native config
- Ensure iOS directory doesn't override config

### Debug Commands

```bash
# Validate project configuration
eas build:configure

# Inspect build environment
eas build:inspect

# Test local build (experimental)
eas build --local
```

## Build Optimization

### Performance Tips
- Use appropriate resource classes in `eas.json`
- Enable caching for faster builds
- Optimize bundle size before building

### Cost Optimization
- Use local builds for testing when possible
- Limit concurrent builds
- Cancel unnecessary builds promptly

## Security Considerations

### Credentials Security
- EAS securely stores iOS/Android credentials
- Never commit certificates to version control
- Regularly rotate credentials

### Environment Variables
- Use EAS Secrets for sensitive data
- Configure different secrets per environment
- Validate all secrets are properly set

## Next Steps

1. **Set up iOS credentials** for development builds
2. **Test development build** on physical device
3. **Validate deep linking** and push notifications
4. **Create preview builds** for stakeholder testing
5. **Prepare production credentials** for store submission

## Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [iOS Credentials Setup](https://docs.expo.dev/app-signing/app-credentials/)
- [Android Credentials Setup](https://docs.expo.dev/app-signing/app-credentials/)
- [EAS Dashboard](https://expo.dev)