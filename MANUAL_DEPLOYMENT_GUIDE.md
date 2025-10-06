# 🚀 MANUAL DEPLOYMENT GUIDE - Step by Step

This guide will walk you through deploying the Cloud Functions manually. Follow each step carefully.

---

## 📋 WHAT YOU NEED BEFORE STARTING

1. **A computer** with internet connection
2. **Terminal/Command Prompt** access (we'll show you how to open it)
3. **Your Firebase project** (escolta-pro-fe90e)
4. **Braintree credentials** (already in Rork environment variables)

---

## 🖥️ STEP 1: OPEN TERMINAL/COMMAND PROMPT

### On Mac:
1. Press `Command + Space` to open Spotlight
2. Type "Terminal"
3. Press Enter

### On Windows:
1. Press `Windows Key + R`
2. Type "cmd"
3. Press Enter

### On Linux:
1. Press `Ctrl + Alt + T`

---

## 📂 STEP 2: NAVIGATE TO YOUR PROJECT

In the terminal, type these commands one by one (press Enter after each):

```bash
cd /path/to/your/project
```

**Replace `/path/to/your/project`** with the actual location of your project folder.

**Example:**
- Mac: `cd /Users/yourname/Documents/escolta-pro`
- Windows: `cd C:\Users\yourname\Documents\escolta-pro`

To verify you're in the right place, type:
```bash
ls
```
(or `dir` on Windows)

You should see folders like: `app`, `functions`, `assets`, etc.

---

## 🔧 STEP 3: INSTALL FIREBASE CLI

This is a one-time installation. In your terminal, type:

```bash
npm install -g firebase-tools
```

Wait for it to finish (may take 2-5 minutes).

---

## 🔐 STEP 4: LOGIN TO FIREBASE

Type this command:

```bash
firebase login
```

This will:
1. Open your web browser
2. Ask you to sign in with your Google account
3. Ask for permissions - click "Allow"
4. Show "Success!" message

Go back to your terminal - you should see "✔ Success! Logged in as your-email@example.com"

---

## 📦 STEP 5: NAVIGATE TO FUNCTIONS FOLDER

Type:

```bash
cd functions
```

---

## 📝 STEP 6: CREATE PACKAGE.JSON

Type this command:

```bash
npm init -y
```

You should see a message like "Wrote to /path/to/functions/package.json"

---

## 📥 STEP 7: INSTALL DEPENDENCIES

Copy and paste this ENTIRE command (it's long):

```bash
npm install firebase-admin@^12.0.0 firebase-functions@^4.5.0 express@^4.18.2 cors@^2.8.5 braintree@^3.19.0
```

Press Enter and wait (may take 3-5 minutes).

Then install development dependencies:

```bash
npm install --save-dev @types/express@^4.17.21 @types/cors@^2.8.17 typescript@^5.3.3
```

---

## 🔨 STEP 8: BUILD THE FUNCTIONS

Type:

```bash
npm run build
```

If you see an error "npm run build not found", first run:

```bash
npx tsc
```

---

## 🌐 STEP 9: INITIALIZE FIREBASE PROJECT

Go back to the root folder:

```bash
cd ..
```

Now initialize Firebase:

```bash
firebase init
```

You'll see a menu. Use arrow keys to navigate:

1. **Select features:** Use spacebar to select:
   - ✅ Firestore
   - ✅ Functions
   - ✅ Hosting (optional)
   
   Press Enter when done.

2. **Use existing project:** Select "Use an existing project"

3. **Select project:** Choose "escolta-pro-fe90e"

4. **Firestore rules:** Press Enter (use default)

5. **Firestore indexes:** Press Enter (use default)

6. **Functions language:** Select "TypeScript"

7. **Use ESLint:** Type "N" and press Enter

8. **Install dependencies:** Type "N" (we already did this)

9. **Public directory:** Press Enter (use default "public")

10. **Single-page app:** Type "Y" and press Enter

---

## 🔑 STEP 10: SET BRAINTREE CREDENTIALS

The Braintree credentials are already in Rork's environment. We need to set them in Firebase:

```bash
firebase functions:config:set braintree.merchant_id="8jbcpm9yj7df7w4h"
```

```bash
firebase functions:config:set braintree.public_key="fnig6rkd6vbkmxt"
```

```bash
firebase functions:config:set braintree.private_key="c96f93d2d472395ed66339"
```

After each command, you should see "✔ Functions config updated."

---

## 🚀 STEP 11: DEPLOY FUNCTIONS

Now for the big moment! Type:

```bash
firebase deploy --only functions
```

This will:
1. Upload your functions to Firebase
2. Take 3-10 minutes
3. Show progress bars

**What you'll see:**
```
✔ functions: Finished running predeploy script.
i  functions: ensuring required API cloudfunctions.googleapis.com is enabled...
i  functions: ensuring required API cloudbuild.googleapis.com is enabled...
✔ functions: required API cloudfunctions.googleapis.com is enabled
✔ functions: required API cloudbuild.googleapis.com is enabled
i  functions: preparing functions directory for uploading...
i  functions: packaged functions (XX.XX KB) for uploading
✔ functions: functions folder uploaded successfully
i  functions: creating Node.js 18 function api...
i  functions: creating Node.js 18 function handlePaymentWebhook...
i  functions: creating Node.js 18 function processPayouts...
i  functions: creating Node.js 18 function generateInvoice...
i  functions: creating Node.js 18 function recordUsageMetrics...
✔ functions[api]: Successful create operation.
✔ functions[handlePaymentWebhook]: Successful create operation.
✔ functions[processPayouts]: Successful create operation.
✔ functions[generateInvoice]: Successful create operation.
✔ functions[recordUsageMetrics]: Successful create operation.

✔ Deploy complete!
```

---

## 📝 STEP 12: GET YOUR FUNCTION URLS

After deployment, you'll see URLs like:

```
Function URL (api): https://us-central1-escolta-pro-fe90e.cloudfunctions.net/api
```

**COPY THIS URL!** You'll need it for the next step.

If you missed it, type:

```bash
firebase functions:list
```

---

## 🔗 STEP 13: UPDATE YOUR APP WITH THE FUNCTION URL

1. Open your project in your code editor
2. Find the file: `config/env.ts`
3. Look for the line with `API_URL`
4. Replace it with your function URL from Step 12

**Example:**
```typescript
API_URL: "https://us-central1-escolta-pro-fe90e.cloudfunctions.net/api"
```

5. Save the file

---

## ✅ STEP 14: VERIFY DEPLOYMENT

Test if your functions are working:

```bash
curl https://YOUR-FUNCTION-URL/health
```

Replace `YOUR-FUNCTION-URL` with the URL from Step 12.

Or visit the URL in your web browser.

---

## 🎉 SUCCESS!

Your Cloud Functions are now deployed! Here's what you deployed:

✅ **Payment API** - Handles Braintree payments
✅ **Webhook Handler** - Receives payment notifications
✅ **Payout Processor** - Runs every Monday at 9 AM
✅ **Invoice Generator** - Creates invoices for bookings
✅ **Usage Metrics** - Records daily usage

---

## 🆘 TROUBLESHOOTING

### Error: "Firebase CLI not found"
**Solution:** Run `npm install -g firebase-tools` again

### Error: "Permission denied"
**Solution:** 
- Mac/Linux: Add `sudo` before the command: `sudo npm install -g firebase-tools`
- Windows: Run Command Prompt as Administrator

### Error: "Project not found"
**Solution:** Make sure you're logged in: `firebase login`

### Error: "Build failed"
**Solution:** 
1. Delete `node_modules` folder in functions directory
2. Run `npm install` again
3. Run `npm run build` again

### Error: "Insufficient permissions"
**Solution:** 
1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: escolta-pro-fe90e
3. Go to Settings → Users and permissions
4. Make sure your account has "Owner" or "Editor" role

### Functions deployed but not working
**Solution:**
1. Check logs: `firebase functions:log`
2. Make sure Braintree credentials are set correctly
3. Verify the function URL is correct in your app

---

## 📞 NEED HELP?

If you get stuck:

1. **Check the logs:**
   ```bash
   firebase functions:log
   ```

2. **Check Firebase Console:**
   - Go to: https://console.firebase.google.com
   - Select: escolta-pro-fe90e
   - Click: Functions (in left menu)
   - You should see your 5 functions listed

3. **Test individual function:**
   ```bash
   firebase functions:shell
   ```

---

## 🔄 UPDATING FUNCTIONS LATER

If you need to update the functions in the future:

1. Make your code changes
2. Navigate to functions folder: `cd functions`
3. Build: `npm run build`
4. Deploy: `firebase deploy --only functions`

---

## 📊 MONITORING YOUR FUNCTIONS

To see how your functions are performing:

1. Go to: https://console.firebase.google.com
2. Select: escolta-pro-fe90e
3. Click: Functions
4. Click on any function name to see:
   - Invocations (how many times it ran)
   - Execution time
   - Memory usage
   - Errors

---

## 💰 COST MONITORING

Firebase Functions have a free tier:
- 2 million invocations/month
- 400,000 GB-seconds/month
- 200,000 CPU-seconds/month

To monitor costs:
1. Go to: https://console.firebase.google.com
2. Select: escolta-pro-fe90e
3. Click: Usage and billing (in left menu)

---

## 🎯 NEXT STEPS

After deployment:

1. ✅ Update `config/env.ts` with your function URL
2. ✅ Test payment flow in your app
3. ✅ Set up Braintree webhook URL in Braintree dashboard
4. ✅ Test refund functionality
5. ✅ Verify scheduled functions are running

---

**That's it! You've successfully deployed your Cloud Functions! 🎊**
