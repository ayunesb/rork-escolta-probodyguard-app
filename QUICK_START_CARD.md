# 🚀 QUICK START CARD
**Print this and keep it on your desk!**

---

## 📋 DEPLOYMENT IN 11 STEPS

```
┌─────────────────────────────────────────────────────────┐
│  FIREBASE CLOUD FUNCTIONS DEPLOYMENT                    │
│  Project: escolta-pro-fe90e                             │
└─────────────────────────────────────────────────────────┘

1️⃣  INSTALL CLI
    npm install -g firebase-tools

2️⃣  LOGIN
    firebase login

3️⃣  GO TO FUNCTIONS
    cd functions

4️⃣  INIT PACKAGE
    npm init -y

5️⃣  INSTALL DEPS
    npm install firebase-admin@^12.0.0 firebase-functions@^4.5.0 express@^4.18.2 cors@^2.8.5 braintree@^3.19.0

6️⃣  INSTALL DEV DEPS
    npm install --save-dev @types/express@^4.17.21 @types/cors@^2.8.17 typescript@^5.3.3

7️⃣  BUILD
    npx tsc

8️⃣  GO BACK
    cd ..

9️⃣  SET CREDENTIALS
    firebase functions:config:set braintree.merchant_id="8jbcpm9yj7df7w4h"
    firebase functions:config:set braintree.public_key="fnig6rkd6vbkmxt"
    firebase functions:config:set braintree.private_key="c96f93d2d472395ed66339"

🔟  DEPLOY
    firebase deploy --only functions

1️⃣1️⃣  GET URL
    firebase functions:list
    Copy the URL and update config/env.ts

✅  DONE!
```

---

## ⏱️ TIME ESTIMATE

```
┌──────────────────────────────────┐
│ First Time:  25-30 minutes       │
│ Updates:     5 minutes           │
└──────────────────────────────────┘
```

---

## 🆘 EMERGENCY COMMANDS

```
┌─────────────────────────────────────────────────────────┐
│  View Logs:                                             │
│  firebase functions:log                                 │
│                                                         │
│  List Functions:                                        │
│  firebase functions:list                                │
│                                                         │
│  Check Config:                                          │
│  firebase functions:config:get                          │
│                                                         │
│  Redeploy:                                              │
│  firebase deploy --only functions --force               │
└─────────────────────────────────────────────────────────┘
```

---

## 🔗 IMPORTANT LINKS

```
┌─────────────────────────────────────────────────────────┐
│  Firebase Console:                                      │
│  https://console.firebase.google.com/project/           │
│  escolta-pro-fe90e                                      │
│                                                         │
│  Functions:                                             │
│  https://console.firebase.google.com/project/           │
│  escolta-pro-fe90e/functions                            │
│                                                         │
│  Braintree Sandbox:                                     │
│  https://sandbox.braintreegateway.com                   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔑 CREDENTIALS

```
┌─────────────────────────────────────────────────────────┐
│  Merchant ID:  8jbcpm9yj7df7w4h                         │
│  Public Key:   fnig6rkd6vbkmxt                          │
│  Private Key:  c96f93d2d472395ed66339                   │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ SUCCESS CHECKLIST

```
┌─────────────────────────────────────────────────────────┐
│  ✅ Terminal shows "Deploy complete!"                   │
│  ✅ Firebase Console shows 5 functions                  │
│  ✅ Function URL works in browser                       │
│  ✅ config/env.ts updated with URL                      │
│  ✅ No errors in logs                                   │
└─────────────────────────────────────────────────────────┘
```

---

## 📚 DOCUMENTATION

```
┌─────────────────────────────────────────────────────────┐
│  Full Guide:        MANUAL_DEPLOYMENT_GUIDE.md          │
│  Quick Reference:   QUICK_DEPLOYMENT_CHECKLIST.md       │
│  Troubleshooting:   TROUBLESHOOTING_GUIDE.md            │
│  Visual Guide:      VISUAL_GUIDE.md                     │
│  Start Here:        START_HERE.md                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 FUNCTION URL

```
┌────────────────────��────────────────────────────────────┐
│  After deployment, your URL will be:                    │
│                                                         │
│  https://us-central1-escolta-pro-fe90e.                 │
│  cloudfunctions.net/api                                 │
│                                                         │
│  Write your actual URL here:                            │
│  ___________________________________________________    │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 UPDATE PROCESS

```
┌─────────────────────────────────────────────────────────┐
│  1. Edit code in functions/src/index.ts                 │
│  2. cd functions && npm run build                       │
│  3. cd .. && firebase deploy --only functions           │
│  4. Done! ✅                                            │
└─────────────────────────────────────────────────────────┘
```

---

## 🐛 COMMON ERRORS

```
┌─────────────────────────────────────────────────────────┐
│  "firebase: command not found"                          │
│  → npm install -g firebase-tools                        │
│                                                         │
│  "Permission denied"                                    │
│  → sudo npm install -g firebase-tools                   │
│                                                         │
│  "Not logged in"                                        │
│  → firebase login                                       │
│                                                         │
│  "Cannot find module"                                   │
│  → cd functions && npm install                          │
│                                                         │
│  "Build failed"                                         │
│  → cd functions && rm -rf node_modules && npm install   │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 DEPLOYED FUNCTIONS

```
┌─────────────────────────────────────────────────────────┐
│  1. api                  - Payment processing           │
│  2. handlePaymentWebhook - Braintree webhooks           │
│  3. processPayouts       - Weekly payouts (Mon 9am)     │
│  4. generateInvoice      - Invoice generation           │
│  5. recordUsageMetrics   - Daily metrics (midnight)     │
└─────────────────────────────────────────────────────────┘
```

---

## 💰 COST MONITORING

```
┌─────────────────────────────────────────────────────────┐
│  Free Tier:                                             │
│  • 2M invocations/month                                 │
│  • 400K GB-seconds/month                                │
│  • 200K CPU-seconds/month                               │
│                                                         │
│  Check usage:                                           │
│  Firebase Console → Usage and billing                   │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 NOTES

```
┌─────────────────────────────────────────────────────────┐
│  Deployment Date: _____________________________________  │
│                                                         │
│  Deployed By: __________________________________________  │
│                                                         │
│  Issues Encountered:                                    │
│  ___________________________________________________    │
│  ___________________________________________________    │
│  ___________________________________________________    │
│                                                         │
│  Solutions:                                             │
│  ___________________________________________________    │
│  ___________________________________________________    │
│  ___________________________________________________    │
└─────────────────────────────────────────────────────────┘
```

---

## 🎉 YOU GOT THIS!

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              🚀 READY TO DEPLOY! 🚀                     │
│                                                         │
│  Follow the steps above and you'll have your            │
│  Cloud Functions deployed in 30 minutes!                │
│                                                         │
│  Need help? Check the full guides!                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

**Cut along the dotted line and keep this card handy!**

✂️ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
