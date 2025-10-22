# 🔨 Building Development Build for Simulator

**Status**: Building iOS development build  
**Current**: Waiting for device selection  
**Time Required**: 5-10 minutes (first build)

---

## What's Happening

The error `No development build (com.escolta.pro) for this project is installed` means the app needs to be compiled and installed in the simulator.

We're now running: `npx expo run:ios --device`

This will:
1. ✅ Compile the native iOS project
2. ✅ Install development build in simulator
3. ✅ Launch the app automatically
4. ✅ Connect to Metro bundler

---

## Action Required

**In the terminal**, you should see:
```
? Select a device › 
❯   iPhone 15 Plus (17.5)
    iPhone SE (3rd generation) (17.5)
    ...
```

**Select**: `iPhone 15 Plus (17.5)` (press Enter)

---

## What Happens Next

### Phase 1: Pod Install (2-3 min)
```
› Installing CocoaPods...
› Installing iOS dependencies...
```

### Phase 2: Building (3-5 min)
```
› Building iOS app...
› Compiling...
› Linking...
```

### Phase 3: Installing (30 sec)
```
› Installing app on iPhone 15 Plus...
› Launching app...
```

### Phase 4: Success! 🎉
```
› Successfully launched app on iPhone 15 Plus
› Metro bundler connected
```

---

## Timeline

| Phase | Duration | What's Happening |
|-------|----------|------------------|
| Pod Install | 2-3 min | Installing native dependencies |
| Build | 3-5 min | Compiling Swift/Objective-C code |
| Install | 30 sec | Installing to simulator |
| Launch | 10 sec | Opening app |
| **Total** | **5-10 min** | First-time build is slow |

**Subsequent builds**: ~1-2 minutes (cached)

---

## Troubleshooting

### If Build Fails

**Error**: "CocoaPods not found"
```bash
sudo gem install cocoapods
cd ios && pod install
```

**Error**: "xcodebuild failed"
```bash
cd ios
xcodebuild -workspace EscoltaProBodyguardApp.xcworkspace -scheme EscoltaProBodyguardApp clean
cd ..
npx expo run:ios --device
```

**Error**: "Simulator not found"
```bash
# Boot simulator first
open -a Simulator
# Wait for simulator to fully load, then retry
```

---

## After Successful Build

### 1. App Will Launch Automatically
- Simulator opens
- App installs
- App launches with splash screen
- Connects to Metro

### 2. Test Payment Fix
1. Login: client@demo.com / Demo1234!
2. Create booking
3. Open payment sheet
4. **Expected**: Form loads immediately! ✅

### 3. Watch Console
Look for: `[Payment] No saved cards found (first-time user)`

---

## Alternative: Use Expo Go (Faster)

If build takes too long or fails, you can use Expo Go instead:

### Option A: iOS Expo Go
```bash
# Stop current build (Ctrl+C)
npx expo start --clear

# In terminal, press: s (switch to Expo Go)
# Then press: i (open iOS)
```

### Option B: Physical Device
1. Install "Expo Go" from App Store
2. Scan QR code from Metro terminal
3. App loads instantly (no build needed)

**Note**: Some native features may not work in Expo Go, but payment flow should work fine.

---

## Current Status

- ⏳ **Waiting**: Device selection
- 🔄 **Next**: Building iOS app (5-10 min)
- 📱 **Goal**: Install development build with payment fix
- ✅ **Then**: Test payment form loading

---

**Action Required**: Select "iPhone 15 Plus (17.5)" in the terminal prompt!
