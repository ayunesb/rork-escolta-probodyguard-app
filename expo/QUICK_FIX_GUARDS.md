# Quick Fix Guide - Guard Account Passwords

## TL;DR
✅ **client@demo.com works perfectly** with password `<contrasena en tu .env local, no en el repositorio>`  
❌ **guard1 and guard2** exist but have wrong passwords  
🔧 **Fix**: Reset their passwords in Firebase Console (2 minutes)

---

## How to Fix (Step-by-Step)

### Step 1: Open Firebase Console
1. Go to: https://console.firebase.google.com/
2. Click on project: **escolta-pro-fe90e**

### Step 2: Navigate to Authentication
1. In left sidebar, click **Authentication**
2. Click **Users** tab
3. You should see your users list

### Step 3: Reset guard1@demo.com Password
1. Find `guard1@demo.com` in the list
2. Click the **three dots (⋮)** on the right
3. Select **Reset password**
4. In the popup, enter: `<contrasena en tu .env local, no en el repositorio>`
5. Click **Save**

### Step 4: Reset guard2@demo.com Password
1. Find `guard2@demo.com` in the list
2. Click the **three dots (⋮)** on the right
3. Select **Reset password**
4. In the popup, enter: `<contrasena en tu .env local, no en el repositorio>`
5. Click **Save**

### Step 5: Verify It Worked
Run this command:
```bash
node verify-all-users.cjs
```

Expected output:
```
✅ WORKING - client@demo.com
✅ WORKING - guard1@demo.com
✅ WORKING - guard2@demo.com

Total: 3/3 users working correctly
```

---

## Alternative: Delete and Recreate

If you can't find the reset password option:

### Step 1: Delete Old Accounts
1. Firebase Console → Authentication → Users
2. Find `guard1@demo.com` - click three dots → **Delete user**
3. Find `guard2@demo.com` - click three dots → **Delete user**

### Step 2: Recreate with Script
```bash
node reset-guard-passwords.cjs
```

This will create both accounts with password `<contrasena en tu .env local, no en el repositorio>`

---

## After Fix - Test in App

### Test Guard Login
1. Open your app
2. Login with: `guard1@demo.com` / `<contrasena en tu .env local, no en el repositorio>`
3. Should see guard dashboard ✅

### Test Chat/Messaging
1. Login as client (`client@demo.com` / `<contrasena en tu .env local, no en el repositorio>`)
2. Create a booking
3. Login as guard (different device/simulator)
4. Accept the booking
5. Send messages from both sides
6. Verify they appear in real-time

---

## Current Passwords

| Email | Password | Status |
|-------|----------|--------|
| client@demo.com | `<contrasena en tu .env local, no en el repositorio>` | ✅ Working |
| guard1@demo.com | `<contrasena en tu .env local, no en el repositorio>` | ⚠️ Need to reset |
| guard2@demo.com | `<contrasena en tu .env local, no en el repositorio>` | ⚠️ Need to reset |

---

## That's It!

Just reset those two passwords and you're done. All three accounts will work perfectly. 🎉
