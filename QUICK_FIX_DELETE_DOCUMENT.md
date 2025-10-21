# ⚡ QUICK FIX - Delete Document and Let App Recreate

## The Fastest Way to Fix This (60 seconds)

### Step 1: Delete the Problematic Document
In your Firebase Console (which you already have open):

1. Click on the document: `qlDzWsluu1c9JOfmgUTV5amzaZu2`
2. Click the **trash/delete icon** (top right)
3. Confirm deletion

### Step 2: Log In Again
1. Go to your app: http://localhost:8081
2. Log in with: `client@demo.com` / `Demo123!`
3. The app will automatically create the document with the correct structure

### Step 3: Verify in Console
Refresh your Firebase Console and you should see the document recreated with exactly these 11 fields:
```
email: "client@demo.com"
role: "client"
firstName: ""
lastName: ""
phone: ""
language: "en"
kycStatus: "pending"
createdAt: "2025-10-21T12:34:56.789Z" (ISO string)
isActive: true
emailVerified: false
updatedAt: "2025-10-21T12:34:56.789Z" (ISO string)
```

## Why This Works

Your app code (`contexts/AuthContext.tsx`) uses:
```typescript
createdAt: new Date().toISOString()
updatedAt: new Date().toISOString()
```

This creates **ISO 8601 string timestamps** like `"2025-10-21T12:34:56.789Z"`, which is exactly what you need.

The manual document creation was adding extra fields or wrong types that confused the app logic.

---

## Alternative: If You Want to Keep the Document

If you want to manually fix it instead of deleting, make sure it has **ONLY** these 11 fields with these **exact types**:

| Field | Type | Value |
|-------|------|-------|
| `email` | string | `"client@demo.com"` |
| `role` | string | `"client"` |
| `firstName` | string | `"John"` or `""` |
| `lastName` | string | `"Client"` or `""` |
| `phone` | string | `"+1234567890"` or `""` |
| `language` | string | `"en"` |
| `kycStatus` | string | `"approved"` or `"pending"` |
| `createdAt` | string | `"2025-10-21T12:00:00.000Z"` |
| `isActive` | boolean | `true` |
| `emailVerified` | boolean | `true` |
| `updatedAt` | string | `"2025-10-21T12:00:00.000Z"` |

**You can delete these extra fields** (they're added at runtime, not required):
- ❌ `pushToken`
- ❌ `pushTokenUpdatedAt`
- ❌ `id` (if present)

---

## TL;DR

**DELETE the document and log in again** - fastest and cleanest solution!
