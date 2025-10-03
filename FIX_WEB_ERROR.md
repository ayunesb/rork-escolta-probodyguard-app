# Fix Web Bundling Error

## Problem
The app is trying to bundle for web, but `react-native-maps` is a native-only module.

## Solution

### 1. Stop the current dev server
Press `Ctrl+C` in the terminal running the dev server.

### 2. Clear Metro cache
```bash
npx expo start --clear
```

### 3. Start ONLY for native platforms (no web)
```bash
bun run start
```

**DO NOT** run `bun run start-web` or `bun run start-web-dev` - these will try to bundle for web.

### 4. Test on device/simulator
- For iOS: Press `i` in the terminal
- For Android: Press `a` in the terminal  
- Scan QR code with Expo Go app on your phone

## Why This Happens
Even though the code has `Platform.OS !== 'web'` checks and conditional requires, Metro's bundler analyzes all possible imports during the bundling phase. When web bundling is enabled, it tries to resolve `react-native-maps` which fails because it's native-only.

## Verification
After starting with `bun run start`, you should see:
- No web option in the Metro menu
- Only iOS and Android build options
- No errors about "codegenNativeCommands"

## If Error Persists
The app might be cached with web configuration. Try:
```bash
rm -rf node_modules/.cache
rm -rf .expo
npx expo start --clear
```
