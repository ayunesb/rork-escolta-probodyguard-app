# 🔧 Fix Guard Accounts - Simple Steps

## The Problem
Guard accounts exist but we can't reset passwords because Firebase sends reset emails to `guard1@demo.com` and `guard2@demo.com`, which we don't have access to.

## The Solution
Delete and recreate the accounts with the correct password.

---

## Step-by-Step Instructions

### 1. Delete Old Accounts in Firebase Console

You're already in Firebase Console! Just need to switch to the **Authentication** tab.

**Click these in order:**

1. In the left sidebar, click **"Authentication"** (shield icon)
2. Click the **"Users"** tab at the top
3. Find `guard1@demo.com` in the list
4. Click the **three dots (⋮)** on the right side of that row
5. Click **"Delete user"**
6. Click **"Delete"** to confirm
7. Repeat steps 3-6 for `guard2@demo.com`

**That's it for Firebase Console!** ✅

---

### 2. Recreate Accounts with Correct Password

Come back to terminal and run:

```bash
node recreate-guards.cjs
```

This will:
- ✅ Create new Firebase Auth accounts
- ✅ Set password to `Demo123!`
- ✅ Create complete Firestore documents
- ✅ Set all required fields (role, name, phone, etc.)
- ✅ Mark accounts as verified and approved
- ✅ Test that login works

---

### 3. Verify Everything Works

Run the complete verification:

```bash
node verify-complete-setup.cjs
```

Expected output:
```
✅ READY - client@demo.com
✅ READY - guard1@demo.com
✅ READY - guard2@demo.com

Result: 3/3 users ready for testing
```

---

### 4. Start Testing!

```bash
./start-testing.sh
```

Then test the complete flow:
- Client creates booking and pays
- Guard accepts booking
- Start code flow
- Real-time chat

---

## Quick Reference

**Firebase Console URL**: https://console.firebase.google.com/  
**Project**: escolta-pro-fe90e  
**Location**: Authentication → Users  

**Accounts to delete**:
- guard1@demo.com (UID: `G8G0YUdi1eWIqtWZTVdSFT5scZl2`)
- guard2@demo.com (UID: `tuS4v80zBhgru0sUXXtFjilI7L2`)

**After deletion, run**: `node recreate-guards.cjs`

---

## Total Time: ~2 minutes
- Delete 2 users: ~1 minute
- Recreate script: ~30 seconds
- Verification: ~30 seconds

Then you're ready to test! 🚀
