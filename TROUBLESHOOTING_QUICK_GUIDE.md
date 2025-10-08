# Quick Troubleshooting Guide

## Common Issues & Solutions

### 🔴 Login Stuck / Not Working

**Symptoms:**
- Login button shows loading spinner indefinitely
- No error message displayed
- Console shows Firebase or network errors

**Solutions:**
1. Check `.env` file has correct API URL:
   ```
   EXPO_PUBLIC_API_URL=http://localhost:8081
   ```

2. Verify development server is running:
   ```bash
   bun run start
   ```

3. Check Firebase imports in backend routes use `@/config/firebase`:
   ```typescript
   import { auth, db } from "@/config/firebase";
   ```

4. Clear cache and restart:
   ```bash
   rm -rf node_modules/.cache
   bun run start
   ```

---

### 🔴 "Cannot find module '@/lib/firebase'"

**Solution:**
This file was deleted. Update imports to:
```typescript
import { auth, db } from "@/config/firebase";
```

---

### 🔴 "auth is not a function" or "db is not a function"

**Solution:**
Firebase exports are objects, not functions. Use directly:
```typescript
// ❌ Wrong
const authInstance = auth();
const dbInstance = db();

// ✅ Correct
import { auth, db } from "@/config/firebase";
await signInWithEmailAndPassword(auth, email, password);
```

---

### 🔴 Context Provider Missing Error

**Symptoms:**
- Error: "useLocationTracking must be used within LocationTrackingProvider"
- App crashes when navigating to tabs

**Solution:**
Verify `app/_layout.tsx` has all providers:
```typescript
<AuthProvider>
  <LanguageProvider>
    <NotificationProvider>
      <LocationTrackingProvider>
        <Stack />
      </LocationTrackingProvider>
    </NotificationProvider>
  </LanguageProvider>
</AuthProvider>
```

---

### 🔴 Payment Processing Fails

**Symptoms:**
- Braintree authentication errors
- "Invalid credentials" in payment flow

**Solution:**
Check `functions/src/index.ts` has correct credentials:
```typescript
publicKey: 'fnjq66rkd6vbkmxt',  // Not 'fnig6rkd6vbkmxt'
privateKey: 'c96f93d2d472395ed663393d6e4e2976',  // Full key
```

Also verify `.env` has complete keys:
```
BRAINTREE_PUBLIC_KEY=fnjq66rkd6vbkmxt
BRAINTREE_PRIVATE_KEY=c96f93d2d472395ed663393d6e4e2976
```

---

### 🔴 API Returns HTML Instead of JSON

**Symptoms:**
- Console error: "API endpoint returned HTML instead of JSON"
- tRPC errors about content-type

**Solution:**
1. Make sure you started the app with `bun run start` (not just `expo start`)
2. Check API URL in `.env` is correct
3. Verify backend server is running on port 8081

---

### 🔴 TypeScript Errors in functions/src/index.ts

**Symptoms:**
- Errors about missing firebase-functions, firebase-admin, etc.

**Solution:**
These are non-critical. The functions are already deployed. To fix:
```bash
cd functions
npm install
npm run build
```

---

### 🔴 Role-Based Routing Not Working

**Symptoms:**
- All users redirect to same screen
- Wrong dashboard shown for user role

**Solution:**
Check `app/index.tsx` routing logic:
```typescript
switch (user.role) {
  case 'client':
  case 'guard':
    router.replace('/(tabs)/home');
    break;
  case 'company':
    router.replace('/(tabs)/company-home');
    break;
  case 'admin':
    router.replace('/(tabs)/admin-home');
    break;
}
```

---

## Quick Checks

### ✅ Environment Setup
```bash
# Check .env file exists
cat .env

# Verify API URL
grep EXPO_PUBLIC_API_URL .env

# Check Firebase config
grep EXPO_PUBLIC_FIREBASE .env
```

### ✅ Server Status
```bash
# Check if server is running
curl http://localhost:8081/api/health

# Should return:
# {"status":"ok","timestamp":"...","message":"Backend is running"}
```

### ✅ Firebase Connection
```bash
# Check Firebase project
firebase projects:list

# Should show: escolta-pro-fe90e
```

---

## Demo Accounts

Use these for testing:

| Role | Email | Password |
|------|-------|----------|
| Client | client@demo.com | demo123 |
| Guard | guard1@demo.com | demo123 |
| Company | company@demo.com | demo123 |
| Admin | admin@demo.com | demo123 |

---

## Emergency Reset

If nothing works, try this:

```bash
# 1. Stop all processes
# Press Ctrl+C in terminal

# 2. Clear all caches
rm -rf node_modules/.cache
rm -rf .expo

# 3. Reinstall dependencies (if needed)
bun install

# 4. Restart server
bun run start
```

---

## Getting Help

### Check Logs
1. **App Console:** Look for errors in browser/terminal
2. **Backend Logs:** Check terminal running `bun run start`
3. **Firebase Console:** Check Firestore rules and data

### Common Log Patterns

**Good:**
```
[Firebase] App initialized in X ms
[Auth] Sign in successful: user@email.com
[Backend] POST /api/trpc/auth.signIn
```

**Bad:**
```
[Firebase] Initialization error
[Auth] Sign in error: auth/invalid-credential
[Backend] Error: Cannot find module
```

---

## File Structure Reference

```
app/
  _layout.tsx          # Root layout with providers
  index.tsx            # Initial route with role-based redirect
  (tabs)/
    _layout.tsx        # Tab navigation with role-based tabs
    home.tsx           # Client/Guard home
    company-home.tsx   # Company dashboard
    admin-home.tsx     # Admin dashboard
  auth/
    sign-in.tsx        # Login screen
    sign-up.tsx        # Registration screen

backend/
  hono.ts              # Backend server
  trpc/
    app-router.ts      # tRPC router
    routes/
      auth/            # Auth endpoints

config/
  firebase.ts          # Firebase initialization (USE THIS)

contexts/
  AuthContext.tsx      # Authentication state
  LocationTrackingContext.tsx  # Location tracking

.env                   # Environment variables
```

---

## Quick Commands

```bash
# Start development server
bun run start

# Deploy Firebase functions
cd functions && npm run build && firebase deploy --only functions

# Check Firebase project
firebase projects:list

# View Firebase logs
firebase functions:log

# Clear cache
rm -rf node_modules/.cache .expo

# Reinstall dependencies
bun install
```
