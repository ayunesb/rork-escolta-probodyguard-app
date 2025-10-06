# ⚡ QUICK DEPLOYMENT CHECKLIST

Use this as a quick reference while following the main guide.

---

## ✅ PRE-DEPLOYMENT CHECKLIST

- [ ] Terminal/Command Prompt is open
- [ ] You're in the project root directory
- [ ] You have internet connection
- [ ] You know your Firebase project ID: `escolta-pro-fe90e`

---

## 📝 COMMANDS TO RUN (IN ORDER)

Copy and paste these commands one by one:

### 1. Install Firebase CLI (one-time only)
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Navigate to functions folder
```bash
cd functions
```

### 4. Create package.json
```bash
npm init -y
```

### 5. Install dependencies
```bash
npm install firebase-admin@^12.0.0 firebase-functions@^4.5.0 express@^4.18.2 cors@^2.8.5 braintree@^3.19.0
```

### 6. Install dev dependencies
```bash
npm install --save-dev @types/express@^4.17.21 @types/cors@^2.8.17 typescript@^5.3.3
```

### 7. Build
```bash
npx tsc
```

### 8. Go back to root
```bash
cd ..
```

### 9. Initialize Firebase (if not done)
```bash
firebase init
```
Select: Firestore, Functions
Choose: Use existing project → escolta-pro-fe90e
Language: TypeScript
ESLint: No
Install dependencies: No

### 10. Set Braintree credentials
```bash
firebase functions:config:set braintree.merchant_id="8jbcpm9yj7df7w4h"
firebase functions:config:set braintree.public_key="fnig6rkd6vbkmxt"
firebase functions:config:set braintree.private_key="c96f93d2d472395ed66339"
```

### 11. Deploy!
```bash
firebase deploy --only functions
```

### 12. Get function URLs
```bash
firebase functions:list
```

---

## 🎯 WHAT TO EXPECT

### During Installation (Steps 5-6)
- Takes 3-5 minutes
- You'll see progress bars
- Lots of text scrolling

### During Build (Step 7)
- Takes 30 seconds - 1 minute
- Creates a `lib` folder

### During Deployment (Step 11)
- Takes 5-10 minutes
- Shows upload progress
- Creates 5 functions:
  1. api
  2. handlePaymentWebhook
  3. processPayouts
  4. generateInvoice
  5. recordUsageMetrics

---

## 🔍 HOW TO VERIFY SUCCESS

### After Step 11 (Deploy), you should see:
```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/escolta-pro-fe90e/overview
```

### Check in Firebase Console:
1. Go to: https://console.firebase.google.com
2. Click: escolta-pro-fe90e
3. Click: Functions (left menu)
4. You should see 5 functions listed

---

## 🚨 COMMON ERRORS & QUICK FIXES

| Error | Quick Fix |
|-------|-----------|
| "firebase: command not found" | Run: `npm install -g firebase-tools` |
| "Permission denied" | Mac/Linux: Add `sudo` before command<br>Windows: Run as Administrator |
| "Not logged in" | Run: `firebase login` |
| "Build failed" | Delete `functions/node_modules`<br>Run `npm install` again |
| "Deployment failed" | Check logs: `firebase functions:log` |

---

## 📍 WHERE TO FIND THINGS

### Your Project Files:
```
your-project/
├── functions/
│   ├── src/
│   │   └── index.ts          ← Cloud Functions code
│   ├── package.json          ← Created in Step 4
│   ├── node_modules/         ← Created in Steps 5-6
│   └── lib/                  ← Created in Step 7
├── config/
│   └── env.ts                ← Update with function URL
└── firebase.json             ← Created in Step 9
```

### Firebase Console:
- **URL:** https://console.firebase.google.com
- **Project:** escolta-pro-fe90e
- **Functions:** Left menu → Functions
- **Logs:** Left menu → Functions → Logs tab
- **Usage:** Left menu → Usage and billing

### Braintree Dashboard:
- **URL:** https://sandbox.braintreegateway.com
- **Webhooks:** Settings → Webhooks
- **Transactions:** Transactions (top menu)

---

## 🔗 IMPORTANT URLS TO BOOKMARK

1. **Firebase Console:**
   https://console.firebase.google.com/project/escolta-pro-fe90e

2. **Firebase Functions:**
   https://console.firebase.google.com/project/escolta-pro-fe90e/functions

3. **Firebase Logs:**
   https://console.firebase.google.com/project/escolta-pro-fe90e/functions/logs

4. **Braintree Sandbox:**
   https://sandbox.braintreegateway.com

---

## 📞 HELP COMMANDS

### View logs:
```bash
firebase functions:log
```

### List all functions:
```bash
firebase functions:list
```

### Delete a function:
```bash
firebase functions:delete FUNCTION_NAME
```

### Test locally:
```bash
firebase emulators:start --only functions
```

### Check Firebase CLI version:
```bash
firebase --version
```

### Update Firebase CLI:
```bash
npm install -g firebase-tools@latest
```

---

## 🎯 POST-DEPLOYMENT TASKS

After successful deployment:

- [ ] Copy the function URL from terminal
- [ ] Update `config/env.ts` with the URL
- [ ] Test payment in your app
- [ ] Set up webhook in Braintree dashboard
- [ ] Monitor logs for first 24 hours
- [ ] Check Firebase usage/billing

---

## 💡 PRO TIPS

1. **Save your function URL** - You'll need it in your app
2. **Check logs regularly** - `firebase functions:log`
3. **Monitor costs** - Firebase Console → Usage and billing
4. **Test in sandbox first** - Before going to production
5. **Keep credentials secret** - Never commit to GitHub

---

## 🆘 STILL STUCK?

### Option 1: Check Detailed Guide
Open: `MANUAL_DEPLOYMENT_GUIDE.md`

### Option 2: Check Firebase Logs
```bash
firebase functions:log --limit 50
```

### Option 3: Check Firebase Console
Go to: https://console.firebase.google.com/project/escolta-pro-fe90e/functions

### Option 4: Redeploy
```bash
cd functions
npm run build
cd ..
firebase deploy --only functions --force
```

---

**Remember: Take your time, read error messages carefully, and don't skip steps!**

Good luck! 🚀
