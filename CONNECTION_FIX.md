# 🔧 CONNECTION ISSUE - EASY FIX

**Problem**: App showing "Error loading app - Failed to connect to http://localhost:8081"

**Why**: iOS Simulator can't connect to `localhost` - it needs your Mac's actual IP address

---

## ✅ QUICK FIX - DO THIS NOW:

### Step 1: In the iPhone Simulator
1. **Tap "OK"** on the error dialog (if still visible)
2. The app will show "No development servers found"

### Step 2: Reload the App
**Two ways to reload**:

#### Option A: Shake to Reload (EASIEST)
1. In the simulator menu: **Device** → **Shake**
2. Dev menu will appear
3. Tap **"Reload"**

#### Option B: Press 'r' in Terminal
Just press `r` in the terminal where Metro is running

---

## 🎯 ALTERNATIVE: ENTER URL MANUALLY

If the shake doesn't work:

### In the Simulator:
1. Look for **"Enter URL manually"** link
2. Tap it
3. Enter: `http://192.168.0.42:8081`
4. Tap "Connect"

---

## 📱 WHAT I SEE IN YOUR SCREENSHOT:

```
✅ App installed: "Escolta Pro"
✅ Development Build active
❌ Shows: "No development servers found"
⚠️ Error: "Failed to connect to http://localhost:8081"
```

**The fix**: Get the app to use `192.168.0.42:8081` instead of `localhost:8081`

---

## 🔄 IF THAT DOESN'T WORK:

I'll need to rebuild the app with the correct bundler URL. But try the shake/reload first!

---

**Metro is running on port 8081 - the app just needs to connect to the right address!** 🎯
