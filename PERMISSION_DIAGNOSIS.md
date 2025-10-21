# Firestore Permission Diagnosis

## Current Status: PERMISSION DENIED ❌

### Problem
After fresh Bun server restart, login with `client@demo.com` fails with:
```
[Auth] Permission denied on getDoc. Attempting self-create...
[Auth] ensureUserDocument failed: Missing or insufficient permissions.
```

### What We Know

1. **Firebase Auth Works**: User successfully authenticates (UID: `qlDzWsluu1c9JOfmgUTV5amzaZu2`)
2. **Rules Deployed**: Latest Firestore rules deployed successfully
3. **Document Exists**: User document exists in Firestore with 14 fields
4. **Read Rule Looks Correct**:
   ```javascript
   allow get: if isAuthenticated() && request.auth.uid == userId;
   ```

### Investigation Steps

#### Step 1: Check Document Structure in Firebase Console
Go to: https://console.firebase.google.com/project/escolta-pro-fe90e/firestore/data/users/qlDzWsluu1c9JOfmgUTV5amzaZu2

**Expected Fields** (14 total):
- ✅ `email` (string)
- ✅ `role` (string: "client")
- ✅ `firstName` (string)
- ✅ `lastName` (string)
- ✅ `phone` (string)
- ✅ `language` (string)
- ✅ `kycStatus` (string)
- ✅ `createdAt` (string/timestamp)
- ✅ `isActive` (boolean)
- ✅ `emailVerified` (boolean)
- ✅ `updatedAt` (string/timestamp)
- ✅ `pushToken` (string, optional)
- ✅ `pushTokenUpdatedAt` (timestamp, optional)
- ✅ `braintreeCustomerId` (string, optional)

#### Step 2: Check Field Types
The issue might be **field type mismatches**:

| Field | Expected Type | Check in Console |
|-------|---------------|------------------|
| `isActive` | **boolean** | Is it string "true" or boolean true? |
| `emailVerified` | **boolean** | Is it string "false" or boolean false? |
| `createdAt` | **string or timestamp** | What type is it? |
| `updatedAt` | **string or timestamp** | What type is it? |

#### Step 3: Verify Rule Function

The `getUserData()` function might be failing:
```javascript
function getUserData() {
  return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
}
```

This tries to read the user's own document, which requires the `get` permission to work first!

### Potential Root Causes

#### ❌ Hypothesis 1: Circular Rule Dependency
The `getUserData()` function calls `get()` which requires permission, but the permission check itself might be using `getUserData()`?

**Check**: Look for circular dependencies in rules

#### ❌ Hypothesis 2: Field Type Mismatch
You manually added fields via console. If you added:
- `isActive: "true"` (string) instead of `true` (boolean)
- `emailVerified: "false"` (string) instead of `false` (boolean)

The app expects booleans but console might have created strings!

#### ❌ Hypothesis 3: Missing Required Fields on Read
Even though the document has 14 fields, the **read operation** might have a validation rule we haven't seen.

### Immediate Fix Options

#### Option 1: Delete and Recreate Document ⚠️
**Risk**: Will sign out user
```
1. Go to Firebase Console
2. Delete document: users/qlDzWsluu1c9JOfmgUTV5amzaZu2
3. Sign in again
4. App will auto-create with correct types
```

#### Option 2: Fix Field Types in Console 🔧
**Safer approach**:
```
1. Go to Firebase Console
2. Check `isActive` - should be boolean `true`, not string "true"
3. Check `emailVerified` - should be boolean `false`, not string "false"
4. Check `createdAt` - should be timestamp
5. Check `updatedAt` - should be timestamp
6. Save changes
7. Refresh app
```

#### Option 3: Simplify Read Rule Temporarily 🚨
**DEBUG ONLY - DO NOT USE IN PRODUCTION**:
```javascript
// TEMPORARY DEBUG RULE
allow get: if true;  // Allow anyone to read any document
```
This will tell us if it's a rule problem or document problem.

### Next Steps

1. **Check document in Firebase Console** - verify field types
2. **If types are wrong** → Use Option 2 (fix types)
3. **If types are correct** → Use Option 1 (delete and recreate)
4. **If still fails** → Enable debug rule (Option 3) to isolate issue

### Expected Behavior After Fix

```
[Auth] Sign in successful: qlDzWsluu1c9JOfmgUTV5amzaZu2
[Auth] User document loaded successfully  ← Should see this
[Auth] User state populated with 14 fields
→ Redirect to /client dashboard
```

### Documentation References
- Current firestore.rules: Line 30 (read permission)
- AuthContext.tsx: ensureUserDocument function
- types/index.ts: User interface (14 fields)

---
**Status**: Awaiting manual verification of document field types in Firebase Console
