# ⚡ WHAT YOU NEED TO DO NOW

## ✅ Firebase is Running
Check: `ps aux | grep firebase` - You'll see it's running on PID 46865

## ❌ Expo Keeps Stopping
My commands keep interrupting it when I check the output.

---

## 🎯 YOU Run These Commands

### Terminal 1 is already running Firebase ✅

### Terminal 2 - Start Expo:
```bash
cd /Users/abrahamyunes/blindado/rork-escolta-probodyguard-app
bun run start
```

**WAIT FOR:**
```
› Metro waiting on http://localhost:8081
› Press s │ switch to Expo Go
```

**THEN:**
1. **Press: `s`** to switch to Expo Go (fixes "no development build" error)
2. **Press: `i`** to open iOS Simulator

**LEAVE IT RUNNING!**

---

## 📱 Then in the iOS Simulator:

1. **Create Client Account:**
   - Tap "Sign Up"
   - Email: client@demo.com
   - Password: demo123
   - Role: CLIENT
   - Sign out

2. **Create Guard Account:**
   - Tap "Sign Up"  
   - Email: guard1@demo.com
   - Password: demo123
   - Role: GUARD
   - Sign out

3. **TEST THE CRASH FIX:**
   - Sign in as client@demo.com
   - Guards → Book → Pay
   - Card: 4111 1111 1111 1111 / 12/25 / 123
   - **Tap "View Booking"** in alert
   - ✅ Should work without crash!

---

## 🔍 What's Fixed

File: `app/booking-payment.tsx` (line 84-89)
```typescript
setTimeout(() => {
  router.replace({...});
}, 300);
```

This 300ms delay prevents the iOS crash (SIGABRT) that happened when navigation occurred during alert dismissal.

---

## ✅ Status

- Firebase: RUNNING (PID 46865) ✅
- Expo: YOU need to start it
- iOS Fix: APPLIED ✅
- Next: Run `bun run start` and press `i`
