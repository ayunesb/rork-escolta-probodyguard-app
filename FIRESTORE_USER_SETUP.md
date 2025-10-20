# 🔥 Firestore User Documents Setup Guide

## Problem
Firebase Authentication users exist, but their corresponding Firestore user documents are missing, causing "Missing or insufficient permissions" errors.

## Authenticated Users (From Firebase Console)
1. **ayunesb@icloud.com** - UID: `2WsotElPkEWEmEUtFCSRSf...`
2. **admin@demo.com** - UID: `pps98dksWbg1VXNVFWeIY4a...`
3. **company@demo.com** - UID: `FhkheaWDIAf3gmlWnJvvtk3c...`
4. **guard1@demo.com** - UID: `G8G0YUdi1eWIqtWZTVdSFT5...`
5. **guard2@demo.com** - UID: `1uS4v80zBhgruUsUXXtlFjiI7L2`
6. **client@demo.com** - UID: `qlDzWsluu1c9JOfmgUV5am...` ⚠️ (Login failed due to missing Firestore doc)

---

## 📋 Step-by-Step Fix

### Step 1: Open Firestore Database
1. In Firebase Console, click **Firestore Database** in the left sidebar
2. If you see "Start collection", you need to create the `users` collection
3. If `users` collection exists, click on it

### Step 2: Create User Documents

For **EACH** user above, create a document with the following structure:

---

#### 👤 Document 1: client@demo.com
**Collection**: `users`  
**Document ID**: `qlDzWsluu1c9JOfmgUV5am` (copy exact UID from screenshot)

**Fields**:
```
email (string): "client@demo.com"
role (string): "client"
firstName (string): "Demo"
lastName (string): "Client"
phone (string): "+1234567890"
language (string): "en"
kycStatus (string): "approved"
isActive (boolean): true
emailVerified (boolean): true
createdAt (timestamp): [Click "Add field" > Type: timestamp > Click clock icon]
updatedAt (timestamp): [Click "Add field" > Type: timestamp > Click clock icon]
```

---

#### 👨‍💼 Document 2: admin@demo.com
**Collection**: `users`  
**Document ID**: `pps98dksWbg1VXNVFWeIY4a` (copy exact UID)

**Fields**:
```
email (string): "admin@demo.com"
role (string): "admin"
firstName (string): "System"
lastName (string): "Admin"
phone (string): "+1234567891"
language (string): "en"
kycStatus (string): "approved"
isActive (boolean): true
emailVerified (boolean): true
createdAt (timestamp): [Current timestamp]
updatedAt (timestamp): [Current timestamp]
```

---

#### 🏢 Document 3: company@demo.com
**Collection**: `users`  
**Document ID**: `FhkheaWDIAf3gmlWnJvvtk3c` (copy exact UID)

**Fields**:
```
email (string): "company@demo.com"
role (string): "company"
firstName (string): "Company"
lastName (string): "Admin"
phone (string): "+1234567892"
language (string): "en"
kycStatus (string): "approved"
isActive (boolean): true
emailVerified (boolean): true
createdAt (timestamp): [Current timestamp]
updatedAt (timestamp): [Current timestamp]
companyName (string): "Demo Security Inc"
```

---

#### 🛡️ Document 4: guard1@demo.com
**Collection**: `users`  
**Document ID**: `G8G0YUdi1eWIqtWZTVdSFT5` (copy exact UID)

**Fields**:
```
email (string): "guard1@demo.com"
role (string): "bodyguard"
firstName (string): "Guard"
lastName (string): "One"
phone (string): "+1234567893"
language (string): "en"
kycStatus (string): "approved"
isActive (boolean): true
emailVerified (boolean): true
createdAt (timestamp): [Current timestamp]
updatedAt (timestamp): [Current timestamp]
availability (string): "available"
rating (number): 4.8
```

---

#### 🛡️ Document 5: guard2@demo.com
**Collection**: `users`  
**Document ID**: `1uS4v80zBhgruUsUXXtlFjiI7L2` (copy exact UID)

**Fields**:
```
email (string): "guard2@demo.com"
role (string): "bodyguard"
firstName (string): "Guard"
lastName (string): "Two"
phone (string): "+1234567894"
language (string): "en"
kycStatus (string): "approved"
isActive (boolean): true
emailVerified (boolean): true
createdAt (timestamp): [Current timestamp]
updatedAt (timestamp): [Current timestamp]
availability (string): "available"
rating (number): 4.5
```

---

#### 👨‍💻 Document 6: ayunesb@icloud.com
**Collection**: `users`  
**Document ID**: `2WsotElPkEWEmEUtFCSRSf` (copy exact UID)

**Fields**:
```
email (string): "ayunesb@icloud.com"
role (string): "admin"
firstName (string): "Abraham"
lastName (string): "Yunes"
phone (string): "+1234567895"
language (string): "en"
kycStatus (string): "approved"
isActive (boolean): true
emailVerified (boolean): true
createdAt (timestamp): [Current timestamp]
updatedAt (timestamp): [Current timestamp]
```

---

## 🚀 After Creating All Documents

1. **Refresh your web app** (clear cache if needed)
2. **Sign in** with `client@demo.com` / `Demo123!`
3. **Verify** no more permission errors in console
4. **Test other accounts** (admin, company, guards)

---

## 📸 Visual Guide: How to Add Fields in Firestore

1. Click **"Start collection"** (if first time) or **"Add document"**
2. Enter **Collection ID**: `users`
3. Enter **Document ID**: (paste UID from Authentication tab)
4. Click **"Add field"**
5. For each field:
   - Field name: `email`
   - Type: `string`
   - Value: `"client@demo.com"`
6. For timestamp fields:
   - Type: Select **"timestamp"**
   - Click the **clock icon** to set current time
7. Click **"Save"**

---

## ⚡ Alternative: Automated Script (Advanced)

If you have Firebase Admin SDK set up locally, you can run this script:

```javascript
// create-demo-users.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const users = [
  { uid: 'qlDzWsluu1c9JOfmgUV5am', email: 'client@demo.com', role: 'client', firstName: 'Demo', lastName: 'Client' },
  { uid: 'pps98dksWbg1VXNVFWeIY4a', email: 'admin@demo.com', role: 'admin', firstName: 'System', lastName: 'Admin' },
  { uid: 'FhkheaWDIAf3gmlWnJvvtk3c', email: 'company@demo.com', role: 'company', firstName: 'Company', lastName: 'Admin' },
  { uid: 'G8G0YUdi1eWIqtWZTVdSFT5', email: 'guard1@demo.com', role: 'bodyguard', firstName: 'Guard', lastName: 'One' },
  { uid: '1uS4v80zBhgruUsUXXtlFjiI7L2', email: 'guard2@demo.com', role: 'bodyguard', firstName: 'Guard', lastName: 'Two' },
  { uid: '2WsotElPkEWEmEUtFCSRSf', email: 'ayunesb@icloud.com', role: 'admin', firstName: 'Abraham', lastName: 'Yunes' }
];

async function createUsers() {
  for (const user of users) {
    await admin.firestore().collection('users').doc(user.uid).set({
      ...user,
      phone: '+1234567890',
      language: 'en',
      kycStatus: 'approved',
      isActive: true,
      emailVerified: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`✅ Created user: ${user.email}`);
  }
}

createUsers().then(() => console.log('Done!')).catch(console.error);
```

---

## 🎯 Next Steps After Fix

1. ✅ Create all 6 user documents in Firestore
2. 🔄 Reload the web app
3. 🔐 Test login with `client@demo.com`
4. 🧪 Test other demo accounts
5. 📊 Verify app functionality (booking, payments, etc.)

**Need help?** Check the Firebase Console screenshots in the chat for exact UIDs!
