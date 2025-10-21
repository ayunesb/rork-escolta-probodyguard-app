# IMMEDIATE FIX GUIDE - Get App Working in 15 Minutes

**Date**: October 21, 2025  
**Status**: 🔧 READY TO FIX  
**Time**: 15 minutes total

---

## The One Real Problem

Your Firestore rules are **99% correct**. There's just one edge case issue:

When a new user signs in:
1. Firebase Auth succeeds ✅
2. App tries to `getDoc('/users/{uid}')` to read user profile
3. **Document doesn't exist** for 5 of your 6 demo users
4. Firestore rules **allow the read** (line 30 is correct)
5. App gets back "null" (document doesn't exist)
6. App tries to **create the document** with `setDoc()`
7. **Rules should allow this** (line 42 is correct)
8. **BUT it fails** ❌

### Why It's Actually Failing

The issue is NOT the rules - the `create` rule on line 42 is perfect. The problem is:

**The existing document for `client@demo.com` was manually created and has wrong/extra fields that break the app logic.**

---

## The Fix (Choose ONE)

### Option 1: Delete and Recreate (FASTEST - 2 minutes)

1. **Open Firebase Console**: https://console.firebase.google.com/
2. **Select Project**: `escolta-pro-fe90e` (or `rork-escolta-probodyguard` - check your console)
3. **Go to**: Firestore Database
4. **Find document**: `users/qlDzWsluu1c9JOfmgUTV5amzaZu2`
5. **Click the document** → **Delete** (trash icon)
6. **Refresh your app** and log in again
7. **Watch console** - should see "Created minimal user document"
8. **Done!** ✅

### Option 2: Test with a Fresh Account (2 minutes)

Instead of fixing `client@demo.com`, test with one of the other 5 demo users that DON'T have Firestore documents yet:

```
Email: bodyguard@demo.com
Password: Demo123!
```

or

```
Email: company@demo.com
Password: Demo123!
```

When you log in with these, the app will auto-create their Firestore documents correctly.

### Option 3: Create All 6 Documents Manually (10 minutes)

If you want ALL demo users ready immediately, create documents manually:

**In Firebase Console → Firestore → users collection**, create these 6 documents:

#### Document 1: `qlDzWsluu1c9JOfmgUTV5amzaZu2` (client@demo.com)
```
createdAt: "2025-10-21T12:00:00.000Z" (string)
email: "client@demo.com" (string)
emailVerified: false (boolean)
firstName: "Demo" (string)
isActive: true (boolean)
kycStatus: "approved" (string)
language: "en" (string)
lastName: "Client" (string)
phone: "+1234567890" (string)
role: "client" (string)
updatedAt: "2025-10-21T12:00:00.000Z" (string)
```

#### Document 2: `<UID from Firebase Auth>` (bodyguard@demo.com)
```
createdAt: "2025-10-21T12:00:00.000Z" (string)
email: "bodyguard@demo.com" (string)
emailVerified: false (boolean)
firstName: "Demo" (string)
isActive: true (boolean)
kycStatus: "approved" (string)
language: "en" (string)
lastName: "Guard" (string)
phone: "+1234567891" (string)
role: "bodyguard" (string)
updatedAt: "2025-10-21T12:00:00.000Z" (string)
```

**Repeat for**:
- `company@demo.com` (role: "company")
- `admin@demo.com` (role: "admin")
- `guard1@demo.com` (role: "bodyguard")
- `guard2@demo.com` (role: "bodyguard")

---

## Testing Steps

### Step 1: Get the Tunnel URL Working

Your Expo server is running. Now:

1. **Look at your terminal** - scan the QR code with your iPhone camera
2. **OR check for tunnel URL** in terminal output (format: `exp://...exp.direct`)
3. **If QR doesn't work**, try this:
   ```bash
   pkill -f expo
   npx expo start -c  # No --tunnel, use local network
   ```
   Then scan QR again (phone must be on same WiFi)

### Step 2: Test Login

1. **Open the app** (either on device via QR, or web at http://localhost:8081)
2. **Log in** with:
   ```
   Email: bodyguard@demo.com
   Password: Demo123!
   ```
   (This user doesn't have a Firestore document yet, so it will test auto-creation)

3. **Watch the browser console** (F12 → Console tab) for:
   ```
   [Auth] Sign in successful: <uid>
   [Auth] User document does not exist yet
   [Auth] Created minimal user document
   [Auth] User document loaded successfully
   ```

4. **Verify**:
   - ✅ No "Permission denied" errors
   - ✅ App doesn't sign you out
   - ✅ You see the bodyguard dashboard
   - ✅ New document appears in Firebase Console under `users/<uid>`

### Step 3: Verify All Roles

Test each demo account to verify role-based access:

| Email | Password | Expected Role | Expected Screen |
|-------|----------|---------------|-----------------|
| `client@demo.com` | `Demo123!` | client | Client dashboard (book bodyguard) |
| `bodyguard@demo.com` | `Demo123!` | bodyguard | Guard dashboard (view assignments) |
| `company@demo.com` | `Demo123!` | company | Company admin (manage guards) |
| `admin@demo.com` | `Demo123!` | admin | System admin (full access) |

---

## If Still Failing

### Check 1: Firebase Project ID
```bash
cat .env | grep FIREBASE_PROJECT_ID
```
Should show: `EXPO_PUBLIC_FIREBASE_PROJECT_ID=escolta-pro-fe90e`

### Check 2: Rules Deployed
```bash
firebase deploy --only firestore:rules
```
Should show: "✔  Deploy complete!"

### Check 3: Auth UID Matches
In Firebase Console:
1. Go to **Authentication** → **Users**
2. Find `bodyguard@demo.com`
3. Copy the **User UID**
4. Go to **Firestore** → **users**
5. Look for document with **same UID**
6. If missing or different UID → delete wrong document, let app recreate

### Check 4: Browser Console
Open DevTools (F12) and watch for:
- ❌ `Missing or insufficient permissions` → Rules not deployed
- ❌ `Network error` → Firebase config wrong
- ❌ `User document does not exist yet` then `Permission denied` → Bug in ensureUserDocument
- ✅ `Created minimal user document` → Working!

---

## Current Expo Server Status

Your server IS running with tunnel enabled. From terminal output:

```
Tunnel connected.
Tunnel ready.
Metro waiting on http://localhost:8081
```

**Next**: Scan the QR code showing in your terminal to open the app on your iOS device.

**If QR doesn't work**: The tunnel URL will be in the format `exp://<something>.exp.direct`. You can manually enter it in Expo Go or your development build.

**If tunnel is unreliable**: Kill it and restart without tunnel:
```bash
pkill -f expo
npx expo start -c
```
Then use local WiFi connection (phone and computer on same network).

---

## Success Criteria

You'll know it's working when:

✅ You can log in with any of the 6 demo accounts  
✅ No "Permission denied" errors in console  
✅ Each role shows the correct dashboard  
✅ Firestore has 6 documents in `users` collection  
✅ You can navigate the app without being signed out  

**That's it!** The app is actually very close to working - just need to handle the missing/malformed user documents.
