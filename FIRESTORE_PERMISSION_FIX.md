# 🔴 CRITICAL: Firestore Permission Error Fix

## Problem
Demo user `client@demo.com` (UID: `qlDzWsluu1c9JOfmgUTV5amzaZu2`) cannot access Firestore because their user document doesn't exist.

## Immediate Fix: Create User Document via Firebase Console

### Step 1: Open Firebase Console
1. Go to https://console.firebase.google.com/
2. Select your project: `rork-escolta-probodyguard`
3. Navigate to **Firestore Database**

### Step 2: Create User Document
1. Click "Start collection" or navigate to existing `users` collection
2. Document ID: `qlDzWsluu1c9JOfmgUTV5amzaZu2`
3. Add the following fields:

```json
{
  "email": "client@demo.com",
  "role": "client",
  "firstName": "Demo",
  "lastName": "Client",
  "phone": "+1234567890",
  "language": "en",
  "kycStatus": "approved",
  "createdAt": [Firebase Timestamp - Use Firebase.firestore.Timestamp.now()],
  "updatedAt": [Firebase Timestamp - Use Firebase.firestore.Timestamp.now()],
  "isActive": true,
  "emailVerified": true
}
```

### Step 3: Repeat for Other Demo Accounts
Create similar documents for:
- **Bodyguard**: `bodyguard@demo.com` (role: "bodyguard")
- **Company Admin**: `company@demo.com` (role: "company")
- **System Admin**: `admin@demo.com` (role: "admin")

---

## Long-Term Fix: Update Firestore Rules

The current rules create a chicken-and-egg problem. Here's the recommended fix:

### Updated `firestore.rules` (Lines 26-42):

```javascript
// === USERS COLLECTION ===
match /users/{userId} {
  // Allow authenticated users to read their own document
  allow get: if isAuthenticated() && request.auth.uid == userId;
  
  // Allow admin/company to list users
  allow list: if isAuthenticated() && (
    (exists(/databases/$(database)/documents/users/$(request.auth.uid)) && 
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin') ||
    (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'company')
  );
  
  // ✅ FIX: Allow self-creation on first sign-in
  allow create: if isAuthenticated() && 
    request.auth.uid == userId && 
    request.resource.data.keys().hasAll(['email', 'role', 'firstName', 'lastName', 'phone', 'language', 'kycStatus', 'createdAt']) &&
    request.resource.data.email == request.auth.token.email; // ✅ Verify email matches auth
  
  // Allow self-update or admin update
  allow update: if isAuthenticated() && (
    request.auth.uid == userId ||
    (exists(/databases/$(database)/documents/users/$(request.auth.uid)) && 
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin')
  );
  
  // Only admin can delete
  allow delete: if isAuthenticated() && 
    exists(/databases/$(database)/documents/users/$(request.auth.uid)) && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

**Key Change**: The `create` rule now properly validates that the email in the document matches the authenticated user's email from Firebase Auth token.

---

## Alternative: Cloud Function Auto-Creation

Create a Cloud Function that triggers on user creation:

```typescript
// functions/src/index.ts - Add this function
export const createUserDocument = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new Error('Unauthenticated');

  const userDoc = await admin.firestore().collection('users').doc(uid).get();
  if (userDoc.exists) {
    return { success: true, message: 'User document already exists' };
  }

  await admin.firestore().collection('users').doc(uid).set({
    email: request.auth.token.email,
    role: 'client', // Default role
    firstName: '',
    lastName: '',
    phone: '',
    language: 'en',
    kycStatus: 'pending',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    isActive: true,
    emailVerified: request.auth.token.email_verified || false
  });

  return { success: true, message: 'User document created' };
});
```

Then call this from the client after sign-in.

---

## Testing After Fix

1. Clear browser cache and reload
2. Sign in with `client@demo.com` / `Demo123!`
3. Verify no more permission errors
4. Check Firestore Console to confirm document exists

---

## Related Audit Finding

This issue was identified in **NASA_GRADE_FINAL_AUDIT_REPORT_OCT_2025.md** as:
- **Component**: Authentication & User Management
- **Severity**: High
- **Finding**: Firestore rules prevent new user self-registration

**Status**: 🟡 SANDBOX ONLY - Must fix before production launch
