# 🚀 Correct Xcode + Metro Workflow

## ⚠️ **Important: Order Matters!**

For React Native apps, you MUST start Metro BEFORE running the app in Xcode.

---

## 📋 **Correct Workflow:**

### **Step 1: Start Metro Bundler FIRST**
Open a terminal and run:
```bash
cd /Users/abrahamyunes/blindado/rork-escolta-probodyguard-app
bun run start
```

**Wait for:**
```
› Metro waiting on http://localhost:8081
```

**LEAVE THIS TERMINAL RUNNING!** Don't close it.

---

### **Step 2: THEN Build in Xcode**
1. Open Xcode (already done ✅)
2. Select iPhone 15 simulator
3. Press `⌘ + R` to build and run

The app will now connect to Metro successfully!

---

## 🔍 **Why This Order?**

React Native apps have **TWO parts:**
1. **Native iOS app** (Objective-C/Swift) - Built by Xcode
2. **JavaScript bundle** (React Native code) - Served by Metro

The iOS app connects to Metro on port 8081 to load your JavaScript code. If Metro isn't running, the app crashes immediately on launch.

---

## 🐛 **The Crash You Just Saw:**

```
Exception Type: EXC_CRASH (SIGABRT)
Could not connect to development server
URL: http://s4ia8mk-ayunesb-8081.exp.direct/...
```

This happens when:
- Metro isn't running
- Metro is on a different port
- Network/firewall blocking connection

---

## ✅ **Testing Checklist:**

1. ✅ Firebase Emulators Running (Already done - PID 46865)
2. ❌ Metro Bundler Running ← **YOU NEED THIS**
3. ⏳ iOS App in Simulator ← Will work after Step 2

---

## 🎯 **After Both Are Running:**

Once the app loads successfully in the simulator:

1. **Create Test Accounts:**
   - Sign Up: `client@demo.com` / `demo123` (CLIENT)
   - Sign Up: `guard1@demo.com` / `demo123` (GUARD)

2. **Test Payment Navigation Fix:**
   - Sign in as client
   - Guards → Book → Pay (`4111 1111 1111 1111` / `12/25` / `123`)
   - Tap "View Booking" ← Should navigate smoothly (NO CRASH!)

---

## 💡 **Quick Reference:**

| What | Command | Status |
|------|---------|--------|
| Firebase | `ps aux \| grep firebase` | ✅ Running (PID 46865) |
| Metro | `bun run start` | ❌ **START THIS NOW** |
| iOS App | Xcode `⌘ + R` | ⏳ After Metro is ready |

---

**Start Metro now, then rebuild in Xcode!** 🚀
