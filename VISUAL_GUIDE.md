# 🎨 VISUAL GUIDE - Where to Click and What to Type

This guide shows you **exactly** where to go and what to do.

---

## 🖥️ PART 1: OPENING TERMINAL

### On Mac:

```
┌─────────────────────────────────────────┐
│  1. Press: Command (⌘) + Space         │
│                                         │
│  2. You'll see:                         │
│     ┌─────────────────────────────┐    │
│     │ 🔍 Spotlight Search         │    │
│     └─────────────────────────────┘    │
│                                         │
│  3. Type: Terminal                      │
│                                         │
│  4. Press: Enter                        │
│                                         │
│  5. Terminal opens! ✅                  │
└─────────────────────────────────────────┘
```

### On Windows:

```
┌─────────────────────────────────────────┐
│  1. Press: Windows Key + R              │
│                                         │
│  2. You'll see:                         │
│     ┌─────────────────────────────┐    │
│     │ Run                         │    │
│     │ Open: [________]            │    │
│     │       [OK] [Cancel]         │    │
│     └─────────────────────────────┘    │
│                                         │
│  3. Type: cmd                           │
│                                         │
│  4. Press: Enter                        │
│                                         │
│  5. Command Prompt opens! ✅            │
└─────────────────────────────────────────┘
```

---

## 📂 PART 2: FINDING YOUR PROJECT FOLDER

### What Your Terminal Looks Like:

```
┌────────────────────────────────────────────────┐
│ Terminal                              - □ ✕    │
├────────────────────────────────────────────────┤
│                                                │
│ Last login: Mon Jan 15 10:30:00               │
│ yourname@computer ~ %                         │
│ █                                             │
│                                                │
│                                                │
│                                                │
└────────────────────────────────────────────────┘
```

The `█` is your cursor - this is where you type!

### Finding Your Project:

**Option 1: If you know the path**
```
Type: cd /Users/yourname/Documents/escolta-pro
Press: Enter
```

**Option 2: If you don't know the path**
```
1. Open Finder (Mac) or File Explorer (Windows)
2. Find your project folder
3. Drag the folder into Terminal
4. The path appears automatically!
5. Press: Enter
```

### How to Verify You're in the Right Place:

```
Type: ls        (Mac/Linux)
  or: dir       (Windows)
Press: Enter

You should see:
┌────────────────────────────────────────┐
│ app/                                   │
│ assets/                                │
│ functions/                             │
│ config/                                │
│ package.json                           │
│ ... (more files)                       │
└────────────────────────────────────────┘
```

---

## 🔧 PART 3: INSTALLING FIREBASE CLI

### What to Type:

```
┌────────────────────────────────────────────────┐
│ Terminal                              - □ ✕    │
├────────────────────────────────────────────────┤
│                                                │
│ yourname@computer escolta-pro %               │
│ npm install -g firebase-tools█                │
│                                                │
└────────────────────────────────────────────────┘
```

Press: **Enter**

### What You'll See:

```
┌────────────────────────────────────────────────┐
│ Terminal                              - □ ✕    │
├────────────────────────────────────────────────┤
│                                                │
│ npm install -g firebase-tools                 │
│                                                │
│ ⠋ Installing...                               │
│ ⠙ Installing...                               │
│ ⠹ Installing...                               │
│ ⠸ Installing...                               │
│                                                │
│ (This takes 2-5 minutes)                      │
│                                                │
│ added 623 packages in 3m                      │
│                                                │
│ ✅ Done!                                       │
└────────────────────────────────────────────────┘
```

---

## 🔐 PART 4: LOGGING INTO FIREBASE

### What to Type:

```
┌────────────────────────────────────────────────┐
│ Terminal                              - □ ✕    │
├────────────────────────────────────────────────┤
│                                                │
│ yourname@computer escolta-pro %               │
│ firebase login█                               │
│                                                │
└────────────────────────────────────────────────┘
```

Press: **Enter**

### What Happens:

```
Step 1: Terminal shows:
┌────────────────────────────────────────────────┐
│ ? Allow Firebase to collect CLI usage and     │
│   error reporting information? (Y/n)          │
│ █                                             │
└────────────────────────────────────────────────┘

Type: Y
Press: Enter


Step 2: Browser opens automatically:
┌────────────────────────────────────────────────┐
│ 🌐 Browser                           - □ ✕    │
├────────────────────────────────────────────────┤
│                                                │
│  ┌──────────────────────────────────────┐    │
│  │         Firebase CLI Login           │    │
│  │                                      │    │
│  │  Sign in with Google                 │    │
│  │                                      │    │
│  │  📧 your-email@example.com           │    │
│  │                                      │    │
│  │  [Continue]                          │    │
│  └──────────────────────────────────────┘    │
│                                                │
└────────────────────────────────────────────────┘

Click: Continue


Step 3: Permission screen:
┌────────────────────────────────────────────────┐
│  Firebase CLI wants to:                       │
│  ✓ View and manage your Firebase projects    │
│  ✓ View and manage your data                 │
│                                                │
│  [Cancel]  [Allow]                            │
└────────────────────────────────────────────────┘

Click: Allow


Step 4: Success!
┌────────────────────────────────────────────────┐
│  ✅ Success!                                   │
│                                                │
│  You are now logged in to Firebase CLI        │
│                                                │
│  You can close this window.                   │
└────────────────────────────────────────────────┘

Close browser, go back to Terminal


Step 5: Terminal shows:
┌────────────────────────────────────────────────┐
│ ✔ Success! Logged in as your-email@example.com│
│                                                │
│ yourname@computer escolta-pro %               │
│ █                                             │
└────────────────────────────────────────────────┘
```

---

## 📦 PART 5: INSTALLING DEPENDENCIES

### Navigate to Functions Folder:

```
┌────────────────────────────────────────────────┐
│ Terminal                              - □ ✕    │
├────────────────────────────────────────────────┤
│                                                │
│ yourname@computer escolta-pro %               │
│ cd functions█                                 │
│                                                │
└────────────────────────────────────────────────┘
```

Press: **Enter**

Notice the prompt changes:
```
yourname@computer functions %
```

### Create package.json:

```
Type: npm init -y
Press: Enter

You'll see:
┌────────────────────────────────────────────────┐
│ Wrote to /path/to/functions/package.json      │
│                                                │
│ {                                              │
│   "name": "functions",                         │
│   "version": "1.0.0",                          │
│   ...                                          │
│ }                                              │
└────────────────────────────────────────────────┘
```

### Install Main Dependencies:

```
Copy this ENTIRE line:
npm install firebase-admin@^12.0.0 firebase-functions@^4.5.0 express@^4.18.2 cors@^2.8.5 braintree@^3.19.0

Paste into Terminal
Press: Enter

You'll see:
┌────────────────────────────────────────────────┐
│ npm install firebase-admin@^12.0.0 ...        │
│                                                │
│ ⠋ Installing...                               │
│ ⠙ Installing...                               │
│                                                │
│ (This takes 3-5 minutes)                      │
│                                                │
│ added 234 packages in 4m                      │
│                                                │
│ ✅ Done!                                       │
└────────────────────────────────────────────────┘
```

### Install Dev Dependencies:

```
Copy this ENTIRE line:
npm install --save-dev @types/express@^4.17.21 @types/cors@^2.8.17 typescript@^5.3.3

Paste into Terminal
Press: Enter

You'll see:
┌────────────────────────────────────────────────┐
│ npm install --save-dev @types/express...      │
│                                                │
│ ⠋ Installing...                               │
│                                                │
│ added 12 packages in 30s                      │
│                                                │
│ ✅ Done!                                       │
└────────────────────────────────────────────────┘
```

---

## 🔨 PART 6: BUILDING THE CODE

### What to Type:

```
┌────────────────────────────────────────────────┐
│ Terminal                              - □ ✕    │
├────────────────────────────────────────────────┤
│                                                │
│ yourname@computer functions %                 │
│ npx tsc█                                      │
│                                                │
└────────────────────────────────────────────────┘
```

Press: **Enter**

### What You'll See:

```
┌────────────────────────────────────────────────┐
│ npx tsc                                       │
│                                                │
│ (Building... takes 30 seconds)                │
│                                                │
│ yourname@computer functions %                 │
│ █                                             │
└────────────────────────────────────────────────┘
```

If successful, you'll see no errors - just returns to prompt!

---

## 🔑 PART 7: SETTING BRAINTREE CREDENTIALS

### Go Back to Root Folder:

```
Type: cd ..
Press: Enter

Prompt changes to:
yourname@computer escolta-pro %
```

### Set Credentials (3 Commands):

**Command 1:**
```
Copy: firebase functions:config:set braintree.merchant_id="8jbcpm9yj7df7w4h"
Paste into Terminal
Press: Enter

You'll see:
✔ Functions config updated.
```

**Command 2:**
```
Copy: firebase functions:config:set braintree.public_key="fnig6rkd6vbkmxt"
Paste into Terminal
Press: Enter

You'll see:
✔ Functions config updated.
```

**Command 3:**
```
Copy: firebase functions:config:set braintree.private_key="c96f93d2d472395ed66339"
Paste into Terminal
Press: Enter

You'll see:
✔ Functions config updated.
```

---

## 🚀 PART 8: DEPLOYING!

### The Big Command:

```
┌────────────────────────────────────────────────┐
│ Terminal                              - □ ✕    │
├────────────────────────────────────────────────┤
│                                                │
│ yourname@computer escolta-pro %               │
│ firebase deploy --only functions█            │
│                                                │
└────────────────────────────────────────────────┘
```

Press: **Enter**

### What You'll See (This Takes 5-10 Minutes):

```
┌────────────────────────────────────────────────┐
│ firebase deploy --only functions              │
│                                                │
│ === Deploying to 'escolta-pro-fe90e'...       │
│                                                │
│ i  deploying functions                        │
│ i  functions: ensuring required API           │
│    cloudfunctions.googleapis.com is enabled   │
│ ✔ functions: required API enabled             │
│                                                │
│ i  functions: preparing functions directory   │
│ i  functions: packaged functions (45.23 KB)   │
│ ✔ functions: functions folder uploaded        │
│                                                │
│ i  functions: creating Node.js 18 function    │
│    api(us-central1)...                        │
│ ⠋ functions: creating functions...            │
│ ⠙ functions: creating functions...            │
│ ⠹ functions: creating functions...            │
│                                                │
│ (This part takes 5-10 minutes)                │
│                                                │
│ ✔ functions[api(us-central1)]: Successful     │
│ ✔ functions[handlePaymentWebhook]: Successful │
│ ✔ functions[processPayouts]: Successful       │
│ ✔ functions[generateInvoice]: Successful      │
│ ✔ functions[recordUsageMetrics]: Successful   │
│                                                │
│ ✔ Deploy complete!                            │
│                                                │
│ Project Console:                               │
│ https://console.firebase.google.com/project/   │
│ escolta-pro-fe90e/overview                    │
│                                                │
│ Function URL (api):                            │
│ https://us-central1-escolta-pro-fe90e.        │
│ cloudfunctions.net/api                        │
│                                                │
│ ⚠️ COPY THIS URL! ⚠️                          │
└────────────────────────────────────────────────┘
```

---

## 📋 PART 9: COPYING THE FUNCTION URL

### Where to Find It:

```
Look for this in your Terminal:
┌────────────────────────────────────────────────┐
│ Function URL (api):                            │
│ https://us-central1-escolta-pro-fe90e.        │
│ cloudfunctions.net/api                        │
└────────────────────────────────────────────────┘

Select the URL with your mouse
Copy it (Ctrl+C or Cmd+C)
```

### If You Missed It:

```
Type: firebase functions:list
Press: Enter

You'll see:
┌────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────┐   │
│ │ Function Name │ URL                     │   │
│ ├─────────────────────────────────────────┤   │
│ │ api           │ https://us-central1-... │   │
│ │ handlePayment │ https://us-central1-... │   │
│ │ processPayouts│ (scheduled)             │   │
│ │ generateInvoice│ (callable)             │   │
│ │ recordUsage   │ (scheduled)             │   │
│ └─────────────────────────────────────────┘   │
└────────────────────────────────────────────────┘

Copy the URL next to "api"
```

---

## 📝 PART 10: UPDATING YOUR APP CONFIG

### Open Your Code Editor:

```
1. Open VS Code (or your editor)
2. Navigate to: config/env.ts
3. Find this line:

   API_URL: process.env.EXPO_PUBLIC_API_URL || undefined,

4. Change it to:

   API_URL: process.env.EXPO_PUBLIC_API_URL || "https://us-central1-escolta-pro-fe90e.cloudfunctions.net/api",

5. Save the file (Ctrl+S or Cmd+S)
```

### Visual:

```
BEFORE:
┌────────────────────────────────────────────────┐
│ config/env.ts                         - □ ✕   │
├────────────────────────────────────────────────┤
│ export const ENV = {                          │
│   API_URL: process.env.EXPO_PUBLIC_API_URL    │
│            || undefined,                      │
│   ...                                          │
│ };                                             │
└────────────────────────────────────────────────┘

AFTER:
┌────────────────────────────────────────────────┐
│ config/env.ts                         - □ ✕   │
├────────────────────────────────────────────────┤
│ export const ENV = {                          │
│   API_URL: process.env.EXPO_PUBLIC_API_URL    │
│            || "https://us-central1-escolta-   │
│               pro-fe90e.cloudfunctions.net/   │
│               api",                            │
│   ...                                          │
│ };                                             │
└────────────────────────────────────────────────┘
```

---

## ✅ PART 11: VERIFYING IT WORKS

### Check Firebase Console:

```
1. Open browser
2. Go to: https://console.firebase.google.com
3. You'll see:

┌────────────────────────────────────────────────┐
│ 🌐 Firebase Console                  - □ ✕    │
├────────────────────────────────────────────────┤
│                                                │
│  Your Projects:                                │
│                                                │
│  ┌──────────────────────────────────────┐    │
│  │  escolta-pro-fe90e                   │    │
│  │  Last updated: Just now              │    │
│  │  [Open]                              │    │
│  └──────────────────────────────────────┘    │
│                                                │
└────────────────────────────────────────────────┘

4. Click: Open
5. Click: Functions (in left menu)
6. You should see:

┌────────────────────────────────────────────────┐
│ Functions                                      │
├────────────────────────────────────────────────┤
│                                                │
│  ✅ api                                        │
│  ✅ handlePaymentWebhook                       │
│  ✅ processPayouts                             │
│  ✅ generateInvoice                            │
│  ✅ recordUsageMetrics                         │
│                                                │
│  All functions are healthy! ✅                 │
└────────────────────────────────────────────────┘
```

### Test in Browser:

```
1. Copy your function URL
2. Paste into browser address bar
3. Press Enter
4. You should see something (not 404)
```

---

## 🎉 SUCCESS!

```
┌────────────────────────────────────────────────┐
│                                                │
│              🎉 CONGRATULATIONS! 🎉            │
│                                                │
│     You've successfully deployed your          │
│          Cloud Functions to Firebase!          │
│                                                │
│  ✅ 5 functions deployed                       │
│  ✅ Braintree credentials configured           │
│  ✅ App config updated                         │
│  ✅ Everything is working!                     │
│                                                │
│         Your app can now process               │
│              payments! 💳                      │
│                                                │
└────────────────────────────────────────────────┘
```

---

## 🔍 WHAT TO DO IF YOU SEE ERRORS

### Red Text in Terminal:

```
┌────────────────────────────────────────────────┐
│ ❌ Error: Command not found                   │
└────────────────────────────────────────────────┘

→ Check TROUBLESHOOTING_GUIDE.md
→ Search for your error message
```

### Deployment Failed:

```
┌────────────────────────────────────────────────┐
│ ✖ Deploy failed                               │
│ Error: ...                                     │
└────────────────────────────────────────────────┘

→ Read the error message carefully
→ Check TROUBLESHOOTING_GUIDE.md
→ Try: firebase functions:log
```

### Can't Find Function URL:

```
Type: firebase functions:list
Press: Enter

Copy the URL shown
```

---

## 📞 QUICK HELP

### Check Logs:
```
Type: firebase functions:log
Press: Enter
```

### List Functions:
```
Type: firebase functions:list
Press: Enter
```

### Check Config:
```
Type: firebase functions:config:get
Press: Enter
```

---

**You did it! Great job! 🚀**

Now your app can process payments through Firebase Cloud Functions!
