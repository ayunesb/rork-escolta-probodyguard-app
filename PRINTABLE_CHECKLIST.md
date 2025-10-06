# 📋 PRINTABLE DEPLOYMENT CHECKLIST

**Print this page and check off each step as you complete it!**

---

## 📅 Date: ____________  Time Started: ____________

---

## ✅ PREPARATION (5 minutes)

- [ ] Computer is on and connected to internet
- [ ] Terminal/Command Prompt is open
- [ ] I'm in the project folder (ran `ls` or `dir` to verify)
- [ ] I have the Braintree credentials ready
- [ ] I have opened START_HERE.md for reference

---

## ✅ INSTALLATION (10 minutes)

### Step 1: Install Firebase CLI
- [ ] Ran: `npm install -g firebase-tools`
- [ ] Waited for installation to complete (2-5 minutes)
- [ ] Verified: `firebase --version` shows a version number

### Step 2: Login to Firebase
- [ ] Ran: `firebase login`
- [ ] Browser opened automatically
- [ ] Signed in with Google account
- [ ] Clicked "Allow" on permissions screen
- [ ] Saw "Success!" message in terminal

### Step 3: Navigate to Functions Folder
- [ ] Ran: `cd functions`
- [ ] Prompt now shows "functions" in the path

---

## ✅ SETUP (10 minutes)

### Step 4: Create package.json
- [ ] Ran: `npm init -y`
- [ ] Saw "Wrote to package.json" message

### Step 5: Install Main Dependencies
- [ ] Copied and pasted: `npm install firebase-admin@^12.0.0 firebase-functions@^4.5.0 express@^4.18.2 cors@^2.8.5 braintree@^3.19.0`
- [ ] Pressed Enter
- [ ] Waited for installation (3-5 minutes)
- [ ] Saw "added X packages" message

### Step 6: Install Dev Dependencies
- [ ] Copied and pasted: `npm install --save-dev @types/express@^4.17.21 @types/cors@^2.8.17 typescript@^5.3.3`
- [ ] Pressed Enter
- [ ] Waited for installation (1 minute)
- [ ] Saw "added X packages" message

### Step 7: Build TypeScript
- [ ] Ran: `npx tsc`
- [ ] Waited for build (30 seconds)
- [ ] No error messages appeared

### Step 8: Go Back to Root
- [ ] Ran: `cd ..`
- [ ] Prompt no longer shows "functions"

---

## ✅ CONFIGURATION (5 minutes)

### Step 9: Set Braintree Credentials

- [ ] Ran: `firebase functions:config:set braintree.merchant_id="8jbcpm9yj7df7w4h"`
- [ ] Saw: "✔ Functions config updated."

- [ ] Ran: `firebase functions:config:set braintree.public_key="fnig6rkd6vbkmxt"`
- [ ] Saw: "✔ Functions config updated."

- [ ] Ran: `firebase functions:config:set braintree.private_key="c96f93d2d472395ed66339"`
- [ ] Saw: "✔ Functions config updated."

### Step 10: Verify Config
- [ ] Ran: `firebase functions:config:get`
- [ ] Saw all three Braintree credentials listed

---

## ✅ DEPLOYMENT (10 minutes)

### Step 11: Deploy Functions
- [ ] Ran: `firebase deploy --only functions`
- [ ] Waited patiently (5-10 minutes)
- [ ] Saw progress messages
- [ ] Saw "✔ Deploy complete!" message

### Step 12: Copy Function URL
- [ ] Found "Function URL (api):" in terminal output
- [ ] Copied the full URL
- [ ] Wrote it here: _______________________________________________

**If I missed it:**
- [ ] Ran: `firebase functions:list`
- [ ] Copied the URL for "api"

---

## ✅ APP CONFIGURATION (5 minutes)

### Step 13: Update App Config
- [ ] Opened code editor (VS Code, etc.)
- [ ] Opened file: `config/env.ts`
- [ ] Found line: `API_URL: process.env.EXPO_PUBLIC_API_URL || undefined,`
- [ ] Changed to: `API_URL: process.env.EXPO_PUBLIC_API_URL || "YOUR_URL_HERE",`
- [ ] Pasted my function URL from Step 12
- [ ] Saved the file (Ctrl+S or Cmd+S)

---

## ✅ VERIFICATION (5 minutes)

### Step 14: Check Firebase Console
- [ ] Opened browser
- [ ] Went to: https://console.firebase.google.com
- [ ] Clicked on: escolta-pro-fe90e
- [ ] Clicked: Functions (left menu)
- [ ] Saw 5 functions listed:
  - [ ] api
  - [ ] handlePaymentWebhook
  - [ ] processPayouts
  - [ ] generateInvoice
  - [ ] recordUsageMetrics

### Step 15: Test Function URL
- [ ] Opened browser
- [ ] Pasted function URL in address bar
- [ ] Pressed Enter
- [ ] Saw a response (not 404 error)

### Step 16: Check Logs
- [ ] Ran: `firebase functions:log`
- [ ] Saw log entries (no critical errors)

---

## ✅ FINAL CHECKS

- [ ] All 5 functions are deployed
- [ ] Function URL is working
- [ ] App config is updated
- [ ] No errors in logs
- [ ] Firebase Console shows healthy functions

---

## 🎉 SUCCESS!

**Time Completed: ____________**

**Total Time Taken: ____________**

---

## 📝 NOTES & ISSUES

Write down any problems you encountered and how you solved them:

```
Issue 1: ___________________________________________________________

Solution: __________________________________________________________


Issue 2: ___________________________________________________________

Solution: __________________________________________________________


Issue 3: ___________________________________________________________

Solution: __________________________________________________________
```

---

## 🔗 IMPORTANT INFORMATION TO SAVE

**Function URL:**
```
___________________________________________________________________
```

**Firebase Project ID:**
```
escolta-pro-fe90e
```

**Braintree Merchant ID:**
```
8jbcpm9yj7df7w4h
```

**Deployment Date:**
```
___________________________________________________________________
```

**Deployed By:**
```
___________________________________________________________________
```

---

## 📞 QUICK REFERENCE COMMANDS

**View logs:**
```bash
firebase functions:log
```

**List functions:**
```bash
firebase functions:list
```

**Check config:**
```bash
firebase functions:config:get
```

**Redeploy:**
```bash
firebase deploy --only functions
```

**Check Firebase CLI version:**
```bash
firebase --version
```

---

## 🆘 IF SOMETHING WENT WRONG

**Which step failed?** Step #: ______

**Error message:**
```
___________________________________________________________________

___________________________________________________________________

___________________________________________________________________
```

**What I tried:**
```
___________________________________________________________________

___________________________________________________________________

___________________________________________________________________
```

**Check these resources:**
- [ ] TROUBLESHOOTING_GUIDE.md
- [ ] Firebase Console logs
- [ ] Terminal error messages

---

## 📊 DEPLOYMENT STATISTICS

**Functions Deployed:** _____ / 5

**Deployment Attempts:** _____

**Errors Encountered:** _____

**Errors Resolved:** _____

**Overall Experience:** 😊 😐 😞 (circle one)

---

## 🎯 NEXT STEPS

After successful deployment:

- [ ] Test payment flow in the app
- [ ] Monitor logs for 24 hours
- [ ] Set up Braintree webhook URL
- [ ] Test refund functionality
- [ ] Check Firebase usage/billing
- [ ] Document any issues for future reference

---

## 💡 LESSONS LEARNED

What would I do differently next time?

```
___________________________________________________________________

___________________________________________________________________

___________________________________________________________________
```

What was easier than expected?

```
___________________________________________________________________

___________________________________________________________________

___________________________________________________________________
```

What was harder than expected?

```
___________________________________________________________________

___________________________________________________________________

___________________________________________________________________
```

---

## 📅 FUTURE UPDATES

**Next Deployment Scheduled:** _______________

**Reminder:** Future deployments are much faster (5 minutes)!

**Quick Update Process:**
1. Make code changes
2. `cd functions && npm run build`
3. `cd .. && firebase deploy --only functions`
4. Done!

---

**Keep this checklist for future reference!**

**Date Completed: ____________**

**Signature: ____________________**

---

## 🏆 ACHIEVEMENT UNLOCKED!

```
┌─────────────────────────────────────────┐
│                                         │
│         🏆 CLOUD FUNCTIONS MASTER 🏆    │
│                                         │
│   You successfully deployed Firebase    │
│   Cloud Functions with Braintree        │
│   payment integration!                  │
│                                         │
│   Level: Beginner → Intermediate ✨     │
│                                         │
│   Skills Gained:                        │
│   ✅ Firebase CLI                       │
│   ✅ Cloud Functions                    │
│   ✅ Payment Integration                │
│   ✅ TypeScript Building                │
│   ✅ Deployment Process                 │
│                                         │
│   Congratulations! 🎉                   │
│                                         │
└─────────────────────────────────────────┘
```

---

**Print this page and keep it with your project documentation!**
