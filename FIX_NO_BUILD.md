# 🔧 FIX: "No development build installed"

## ❌ The Problem

```
CommandError: No development build (com.escolta.pro) for this project is installed.
```

This happens because the iOS simulator doesn't have your custom development build installed.

---

## ✅ SOLUTION: Use Expo Go

### Step 1: Start Expo
```bash
bun run start
```

### Step 2: Switch to Expo Go
When Metro is running and you see:
```
› Press s │ switch to Expo Go
```

**Press: `s`** (lowercase s)

### Step 3: Open iOS Simulator
After switching to Expo Go, **press: `i`**

---

## 📱 What This Does

- **Development Build** = Custom build with native code (requires building with EAS)
- **Expo Go** = Pre-built app with standard Expo modules (no build needed)

For testing the iOS crash fix, **Expo Go is perfect!**

---

## 🎯 Full Command Sequence

```bash
# Start Expo
bun run start

# Wait for "Metro waiting on http://localhost:8081"

# Press: s (switch to Expo Go)
# Press: i (open iOS simulator)
```

The crash fix will work the same in Expo Go!

---

## ⚠️ Alternative: Build Development Build

If you need the full custom build:

```bash
# Install EAS CLI
npm install -g eas-cli

# Build for iOS simulator
eas build --profile development --platform ios

# Install the .app file in simulator
```

But this takes 20+ minutes. **Use Expo Go for testing!**
