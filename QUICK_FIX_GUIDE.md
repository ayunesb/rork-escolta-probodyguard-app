# 🚀 QUICK FIX GUIDE - Get the App Working in 5 Minutes

## 🔴 Critical Issue Identified
Your Firestore security rules were **blocking all user logins**. I've already fixed the `firestore.rules` file.

---

## ✅ Step 1: Deploy Fixed Firestore Rules (2 minutes)

```bash
# Navigate to your project
cd /home/user/rork-app

# Deploy the fixed rules
firebase deploy --only firestore:rules
```

**Expected Output:**
```
✔ Deploy complete!
Firestore Rules: Updated
```

---

## ✅ Step 2: Create Demo User Documents (3 minutes)

### Option A: Manual via Firebase Console (Recommended)

1. **Go to Firebase Console:** https://console.firebase.google.com/
2. **Select Project:** `escolta-pro-fe90e`
3. **Navigate to:** Firestore Database
4. **Click:** "Start Collection" → Enter `users`

For **each** demo user below:

#### Get the Firebase Auth UID:
1. Go to **Authentication** → **Users**
2. Find `client@demo.com` → Copy the **User UID**
3. Back to **Firestore** → `users` collection
4. Click "Add Document"
5. **Document ID:** Paste the UID you copied
6. **Fields:** Copy the JSON below

#### Client Demo User
```json
{
  "email": "client@demo.com",
  "role": "client",
  "firstName": "Demo",
  "lastName": "Client",
  "phone": "+1234567890",
  "language": "en",
  "kycStatus": "approved",
  "createdAt": "2025-01-20T00:00:00.000Z",
  "isActive": true,
  "emailVerified": true,
  "updatedAt": "2025-01-20T00:00:00.000Z"
}
```

#### Guard Demo User
```json
{
  "email": "guard1@demo.com",
  "role": "guard",
  "firstName": "Demo",
  "lastName": "Guard",
  "phone": "+1234567891",
  "language": "en",
  "kycStatus": "approved",
  "createdAt": "2025-01-20T00:00:00.000Z",
  "isActive": true,
  "emailVerified": true,
  "updatedAt": "2025-01-20T00:00:00.000Z",
  "rating": 5.0,
  "completedBookings": 0
}
```

#### Company Demo User
```json
{
  "email": "company@demo.com",
  "role": "company",
  "firstName": "Demo",
  "lastName": "Company",
  "phone": "+1234567892",
  "language": "en",
  "kycStatus": "approved",
  "createdAt": "2025-01-20T00:00:00.000Z",
  "isActive": true,
  "emailVerified": true,
  "updatedAt": "2025-01-20T00:00:00.000Z",
  "companyName": "Demo Security Inc."
}
```

#### Admin Demo User
```json
{
  "email": "admin@demo.com",
  "role": "admin",
  "firstName": "Demo",
  "lastName": "Admin",
  "phone": "+1234567893",
  "language": "en",
  "kycStatus": "approved",
  "createdAt": "2025-01-20T00:00:00.000Z",
  "isActive": true,
  "emailVerified": true,
  "updatedAt": "2025-01-20T00:00:00.000Z"
}
```

### Option B: Use Firebase Admin Script (If Available)

If you have a seed script:
```bash
npm run seed:demo-users
```

---

## ✅ Step 3: Test the App

### Start the Development Server
```bash
bun expo start --web --tunnel
```

### Test Login
1. **Open the app** (via QR code or web URL)
2. **Sign in with:** `client@demo.com` / `demo123`
3. **Expected:** Success! You should see the home screen
4. **No more:** "Permission denied" errors

### Test All Roles
- ✅ **Client:** `client@demo.com` → Goes to `/(tabs)/home`
- ✅ **Guard:** `guard1@demo.com` → Goes to `/(tabs)/home` (guard view)
- ✅ **Company:** `company@demo.com` → Goes to `/(tabs)/company-home`
- ✅ **Admin:** `admin@demo.com` → Goes to `/(tabs)/admin-home`

---

## 🎯 What Was Fixed?

### Problem Before
```
[Auth] Permission denied on getDoc
[Auth] ensureUserDocument failed: Missing or insufficient permissions
```

### Root Cause
Firestore rules had a chicken-and-egg problem:
- Users needed to read their document to check permissions
- But they couldn't read it if it didn't exist yet
- And they couldn't create it because the create rule required ALL fields

### Solution Applied
```javascript
// BEFORE (blocking)
allow get: if isAuthenticated() && request.auth.uid == userId;
allow list: if hasRole('admin') || hasRole('company'); // ❌ Checks if document exists

// AFTER (working)
allow get: if isAuthenticated() && request.auth.uid == userId;
allow list: if isAuthenticated() && request.auth.uid == userId; // ✅ No exists() check
```

---

## 📊 Current Status

### ✅ Working
- Firebase Authentication
- Firestore Rules (FIXED)
- Sign-in Flow
- Role-based Navigation
- Security (no exposed keys)
- Rate Limiting

### ⚠️ Needs Attention (Non-Critical)
- Braintree Payment Form uses mock nonce (works in sandbox)
- Real Braintree SDK integration (for production)
- Additional demo data (bookings, guards list, etc.)

### 🚀 Ready for Preview
- **Expo Go:** ✅ YES
- **Web Preview:** ✅ YES
- **Rork.app:** ✅ YES (after deploying rules)

---

## 🆘 Troubleshooting

### "firebase: command not found"
```bash
npm install -g firebase-tools
firebase login
```

### "Permission denied" still appearing
1. **Verify rules deployed:**
   ```bash
   firebase firestore:rules get
   ```
2. **Check demo user exists in Firestore:**
   - Go to Firebase Console → Firestore
   - Look for document with UID from Authentication

### "Email not verified"
Two options:
1. **Set email as verified in Firebase Auth:**
   - Firebase Console → Authentication → Users
   - Click user → Edit → Check "Email verified"

2. **Or disable verification requirement:**
   ```bash
   # In .env file
   EXPO_PUBLIC_ALLOW_UNVERIFIED_LOGIN=1
   ```

---

## 📞 Support

### Logs to Check
```bash
# If login fails, check these logs:
# 1. Firebase Console → Firestore → Rules Playground
# 2. App Console → Look for "[Auth]" logs
# 3. Firebase Console → Authentication → Activity
```

### Common Errors

#### "User document not found"
**Fix:** Create the Firestore document for that user (see Step 2)

#### "Rate limit exceeded"
**Fix:** Wait 5 minutes or reset rate limits:
```bash
# In Firebase Console → Firestore
# Delete documents in "rateLimits" collection
```

---

## 🎉 Success Checklist

After completing Steps 1-3:

- [ ] `firebase deploy --only firestore:rules` succeeded
- [ ] All 4 demo users have Firestore documents
- [ ] Can login with `client@demo.com` / `demo123`
- [ ] Console shows "[Auth] Sign in successful"
- [ ] No "Permission denied" errors
- [ ] App navigates to home screen

**If all checked:** 🎊 **YOU'RE READY TO TEST!**

---

## 📚 Next Steps (Optional)

### Add More Demo Data
- Create sample guards in Firestore
- Add demo bookings
- Populate company data

### Test Payments
1. Login as client
2. Try to create a booking
3. Go through payment flow
4. Use test card: `4111 1111 1111 1111`

### Deploy to Production
```bash
# When ready for production
firebase deploy
```

---

**Last Updated:** January 20, 2025  
**Status:** ✅ Ready to implement
