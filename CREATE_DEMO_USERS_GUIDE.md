# Create All 6 Demo Users in Firebase Console

## Quick Guide (10 minutes)

### Step 1: Get User UIDs from Firebase Auth

1. Go to: https://console.firebase.google.com/project/escolta-pro-fe90e/authentication/users
2. You should see all 6 demo accounts listed
3. **Copy each UID** (the long string next to each email)

| Email | UID (copy from Auth console) |
|-------|------------------------------|
| client@demo.com | qlDzWsluu1c9JOfmgUTV5amzaZu2 |
| bodyguard@demo.com | _(copy from console)_ |
| company@demo.com | _(copy from console)_ |
| admin@demo.com | _(copy from console)_ |
| guard1@demo.com | _(copy from console)_ |
| guard2@demo.com | _(copy from console)_ |

---

### Step 2: Create Firestore Documents

Go to: https://console.firebase.google.com/project/escolta-pro-fe90e/firestore

For **EACH** user, click "**Add document**" in the `users` collection:

---

## User 1: client@demo.com

**Document ID**: `qlDzWsluu1c9JOfmgUTV5amzaZu2`

Add these 11 fields:

| Field | Type | Value |
|-------|------|-------|
| `createdAt` | string | `2025-10-21T12:00:00.000Z` |
| `email` | string | `client@demo.com` |
| `emailVerified` | boolean | `true` |
| `firstName` | string | `Demo` |
| `isActive` | boolean | `true` |
| `kycStatus` | string | `approved` |
| `language` | string | `en` |
| `lastName` | string | `Client` |
| `phone` | string | `+1234567890` |
| `role` | string | `client` |
| `updatedAt` | string | `2025-10-21T12:00:00.000Z` |

---

## User 2: bodyguard@demo.com

**Document ID**: _(paste UID from Auth console)_

| Field | Type | Value |
|-------|------|-------|
| `createdAt` | string | `2025-10-21T12:00:00.000Z` |
| `email` | string | `bodyguard@demo.com` |
| `emailVerified` | boolean | `true` |
| `firstName` | string | `Demo` |
| `isActive` | boolean | `true` |
| `kycStatus` | string | `approved` |
| `language` | string | `en` |
| `lastName` | string | `Guard` |
| `phone` | string | `+1234567891` |
| `role` | string | `bodyguard` |
| `updatedAt` | string | `2025-10-21T12:00:00.000Z` |

---

## User 3: company@demo.com

**Document ID**: _(paste UID from Auth console)_

| Field | Type | Value |
|-------|------|-------|
| `createdAt` | string | `2025-10-21T12:00:00.000Z` |
| `email` | string | `company@demo.com` |
| `emailVerified` | boolean | `true` |
| `firstName` | string | `Demo` |
| `isActive` | boolean | `true` |
| `kycStatus` | string | `approved` |
| `language` | string | `en` |
| `lastName` | string | `Company` |
| `phone` | string | `+1234567892` |
| `role` | string | `company` |
| `updatedAt` | string | `2025-10-21T12:00:00.000Z` |

---

## User 4: admin@demo.com

**Document ID**: _(paste UID from Auth console)_

| Field | Type | Value |
|-------|------|-------|
| `createdAt` | string | `2025-10-21T12:00:00.000Z` |
| `email` | string | `admin@demo.com` |
| `emailVerified` | boolean | `true` |
| `firstName` | string | `Demo` |
| `isActive` | boolean | `true` |
| `kycStatus` | string | `approved` |
| `language` | string | `en` |
| `lastName` | string | `Admin` |
| `phone` | string | `+1234567893` |
| `role` | string | `admin` |
| `updatedAt` | string | `2025-10-21T12:00:00.000Z` |

---

## User 5: guard1@demo.com

**Document ID**: _(paste UID from Auth console)_

| Field | Type | Value |
|-------|------|-------|
| `createdAt` | string | `2025-10-21T12:00:00.000Z` |
| `email` | string | `guard1@demo.com` |
| `emailVerified` | boolean | `true` |
| `firstName` | string | `Guard` |
| `isActive` | boolean | `true` |
| `kycStatus` | string | `approved` |
| `language` | string | `en` |
| `lastName` | string | `One` |
| `phone` | string | `+1234567894` |
| `role` | string | `bodyguard` |
| `updatedAt` | string | `2025-10-21T12:00:00.000Z` |

---

## User 6: guard2@demo.com

**Document ID**: _(paste UID from Auth console)_

| Field | Type | Value |
|-------|------|-------|
| `createdAt` | string | `2025-10-21T12:00:00.000Z` |
| `email` | string | `guard2@demo.com` |
| `emailVerified` | boolean | `true` |
| `firstName` | string | `Guard` |
| `isActive` | boolean | `true` |
| `kycStatus` | string | `approved` |
| `language` | string | `en` |
| `lastName` | string | `Two` |
| `phone` | string | `+1234567895` |
| `role` | string | `bodyguard` |
| `updatedAt` | string | `2025-10-21T12:00:00.000Z` |

---

## Tips for Faster Creation

### Copy-Paste JSON (Advanced)

If Firebase Console supports JSON import, you can use these:

```json
{
  "createdAt": "2025-10-21T12:00:00.000Z",
  "email": "client@demo.com",
  "emailVerified": true,
  "firstName": "Demo",
  "isActive": true,
  "kycStatus": "approved",
  "language": "en",
  "lastName": "Client",
  "phone": "+1234567890",
  "role": "client",
  "updatedAt": "2025-10-21T12:00:00.000Z"
}
```

Just change `email`, `lastName`, `phone`, and `role` for each user.

---

## Verification

After creating all 6 documents:

1. **Refresh Firestore Console** - you should see 6 documents in the `users` collection
2. **Test login** at http://localhost:8081
3. **Try each demo account**:
   - client@demo.com / Demo123!
   - bodyguard@demo.com / Demo123!
   - company@demo.com / Demo123!
   - admin@demo.com / Demo123!
   - guard1@demo.com / Demo123!
   - guard2@demo.com / Demo123!

All should log in successfully without permission errors!

---

## Alternative: Let the App Create Them

If you don't want to create them manually:

1. **Just log in with each account one by one**
2. The app will attempt to auto-create the document
3. If it works (no permission errors), great!
4. If it fails, come back and create manually using this guide

The app's `ensureUserDocument` function should create them automatically, but we're not sure if the Firestore rules allow it yet.
