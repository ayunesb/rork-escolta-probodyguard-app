# 🔧 TROUBLESHOOTING GUIDE

Common problems and how to fix them.

---

## 🚨 PROBLEM 1: "firebase: command not found"

### What it means:
Firebase CLI is not installed on your computer.

### How to fix:
```bash
npm install -g firebase-tools
```

### If that doesn't work:
**On Mac/Linux:**
```bash
sudo npm install -g firebase-tools
```
(It will ask for your computer password)

**On Windows:**
1. Close Command Prompt
2. Right-click Command Prompt
3. Select "Run as Administrator"
4. Run the command again

### How to verify it's fixed:
```bash
firebase --version
```
Should show: `13.0.0` or similar

---

## 🚨 PROBLEM 2: "Permission denied" or "EACCES"

### What it means:
You don't have permission to install packages globally.

### How to fix:
**On Mac/Linux:**
```bash
sudo npm install -g firebase-tools
```

**On Windows:**
1. Open Command Prompt as Administrator
2. Run the command again

### Alternative fix (Mac/Linux):
Change npm's default directory:
```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
source ~/.profile
```

Then try installing again:
```bash
npm install -g firebase-tools
```

---

## 🚨 PROBLEM 3: "Not logged in" or "Authentication error"

### What it means:
You're not logged into Firebase.

### How to fix:
```bash
firebase login
```

### If browser doesn't open:
```bash
firebase login --no-localhost
```
Then:
1. Copy the URL shown in terminal
2. Paste it in your browser
3. Sign in
4. Copy the code shown
5. Paste it back in terminal

### How to verify it's fixed:
```bash
firebase projects:list
```
Should show your projects including `escolta-pro-fe90e`

---

## 🚨 PROBLEM 4: "Project not found" or "Permission denied to project"

### What it means:
Either the project doesn't exist or you don't have access.

### How to fix:
1. Go to: https://console.firebase.google.com
2. Check if you see `escolta-pro-fe90e` in your projects
3. If not, ask the project owner to add you

### To add yourself:
1. Go to Firebase Console
2. Click on `escolta-pro-fe90e`
3. Click Settings (gear icon) → Users and permissions
4. Click "Add member"
5. Add your email with "Editor" or "Owner" role

### How to verify it's fixed:
```bash
firebase use escolta-pro-fe90e
```
Should show: `Now using project escolta-pro-fe90e`

---

## 🚨 PROBLEM 5: "npm: command not found"

### What it means:
Node.js and npm are not installed.

### How to fix:
**Download and install Node.js:**
1. Go to: https://nodejs.org
2. Download the LTS version (left button)
3. Run the installer
4. Follow the installation wizard
5. Restart your terminal

### How to verify it's fixed:
```bash
node --version
npm --version
```
Should show version numbers like `v18.17.0` and `9.6.7`

---

## 🚨 PROBLEM 6: Build fails with TypeScript errors

### What it means:
There are errors in the TypeScript code.

### How to fix:
1. Make sure you're in the functions folder:
   ```bash
   cd functions
   ```

2. Delete node_modules and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   ```

3. Try building again:
   ```bash
   npx tsc
   ```

### If errors persist:
Check the error message. Common issues:
- Missing dependencies → Run `npm install` again
- Wrong TypeScript version → Run `npm install --save-dev typescript@^5.3.3`
- Syntax errors → Check the code in `src/index.ts`

---

## 🚨 PROBLEM 7: "Cannot find module 'firebase-functions'"

### What it means:
Dependencies are not installed.

### How to fix:
```bash
cd functions
npm install firebase-admin@^12.0.0 firebase-functions@^4.5.0 express@^4.18.2 cors@^2.8.5 braintree@^3.19.0
```

### If that doesn't work:
1. Delete package-lock.json:
   ```bash
   rm package-lock.json
   ```

2. Delete node_modules:
   ```bash
   rm -rf node_modules
   ```

3. Install again:
   ```bash
   npm install
   ```

---

## 🚨 PROBLEM 8: Deploy fails with "Insufficient permissions"

### What it means:
Your Firebase account doesn't have permission to deploy.

### How to fix:
1. Go to: https://console.firebase.google.com
2. Select: `escolta-pro-fe90e`
3. Click: Settings → Users and permissions
4. Make sure your email has "Owner" or "Editor" role

### Alternative:
Ask the project owner to deploy for you, or to give you the right permissions.

---

## 🚨 PROBLEM 9: Deploy succeeds but functions don't work

### What it means:
Functions are deployed but have runtime errors.

### How to check:
```bash
firebase functions:log
```

### Common causes:

#### A) Missing environment variables
**Fix:**
```bash
firebase functions:config:set braintree.merchant_id="8jbcpm9yj7df7w4h"
firebase functions:config:set braintree.public_key="fnig6rkd6vbkmxt"
firebase functions:config:set braintree.private_key="c96f93d2d472395ed66339"
```

Then redeploy:
```bash
firebase deploy --only functions
```

#### B) Wrong Node.js version
**Fix:**
Edit `functions/package.json`:
```json
{
  "engines": {
    "node": "18"
  }
}
```

Then redeploy.

#### C) Firestore not enabled
**Fix:**
1. Go to: https://console.firebase.google.com
2. Select: `escolta-pro-fe90e`
3. Click: Firestore Database
4. Click: Create database
5. Choose: Start in production mode
6. Select: Location (choose closest to you)
7. Click: Enable

---

## 🚨 PROBLEM 10: "Error: Cannot find module 'braintree'"

### What it means:
Braintree package is not installed.

### How to fix:
```bash
cd functions
npm install braintree@^3.19.0
npm run build
cd ..
firebase deploy --only functions
```

---

## 🚨 PROBLEM 11: Function URL returns 404

### What it means:
Either the function isn't deployed or the URL is wrong.

### How to check:
1. List your functions:
   ```bash
   firebase functions:list
   ```

2. Check Firebase Console:
   - Go to: https://console.firebase.google.com
   - Select: `escolta-pro-fe90e`
   - Click: Functions
   - You should see 5 functions

### How to fix:
If functions are not listed, redeploy:
```bash
firebase deploy --only functions
```

If functions are listed but URL is wrong, get the correct URL:
```bash
firebase functions:list
```
Copy the URL for the `api` function.

---

## 🚨 PROBLEM 12: "Billing account not configured"

### What it means:
Firebase requires a billing account for Cloud Functions.

### How to fix:
1. Go to: https://console.firebase.google.com
2. Select: `escolta-pro-fe90e`
3. Click: Upgrade (top left)
4. Choose: Blaze plan (Pay as you go)
5. Add a credit card

**Don't worry:** Firebase has a generous free tier:
- 2 million function invocations/month
- 400,000 GB-seconds/month
- You likely won't be charged unless you have high traffic

---

## 🚨 PROBLEM 13: "Cannot read property 'config' of undefined"

### What it means:
Firebase config is not set correctly.

### How to fix:
1. Check current config:
   ```bash
   firebase functions:config:get
   ```

2. If empty, set it:
   ```bash
   firebase functions:config:set braintree.merchant_id="8jbcpm9yj7df7w4h"
   firebase functions:config:set braintree.public_key="fnig6rkd6vbkmxt"
   firebase functions:config:set braintree.private_key="c96f93d2d472395ed66339"
   ```

3. Redeploy:
   ```bash
   firebase deploy --only functions
   ```

---

## 🚨 PROBLEM 14: Slow deployment (taking forever)

### What it means:
Large dependencies or slow internet.

### Normal times:
- First deployment: 5-10 minutes
- Subsequent deployments: 2-5 minutes

### If it's taking longer:
1. Check your internet connection
2. Try deploying one function at a time:
   ```bash
   firebase deploy --only functions:api
   ```

3. If stuck, cancel (Ctrl+C) and try again:
   ```bash
   firebase deploy --only functions --force
   ```

---

## 🚨 PROBLEM 15: "Port 5000 already in use" (when testing locally)

### What it means:
Another process is using port 5000.

### How to fix:
**On Mac/Linux:**
```bash
lsof -ti:5000 | xargs kill -9
```

**On Windows:**
```bash
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

**Or use a different port:**
```bash
firebase emulators:start --only functions --port 5001
```

---

## 🚨 PROBLEM 16: App shows "API_URL is undefined"

### What it means:
You haven't updated the app config with the function URL.

### How to fix:
1. Get your function URL:
   ```bash
   firebase functions:list
   ```
   Copy the URL for `api` (should look like: `https://us-central1-escolta-pro-fe90e.cloudfunctions.net/api`)

2. Open `config/env.ts` in your code editor

3. Find this line:
   ```typescript
   API_URL: process.env.EXPO_PUBLIC_API_URL || undefined,
   ```

4. Change it to:
   ```typescript
   API_URL: process.env.EXPO_PUBLIC_API_URL || "https://us-central1-escolta-pro-fe90e.cloudfunctions.net/api",
   ```

5. Save the file

6. Restart your app

---

## 🚨 PROBLEM 17: Payment fails with "Invalid credentials"

### What it means:
Braintree credentials are wrong or not set.

### How to fix:
1. Check credentials in Firebase:
   ```bash
   firebase functions:config:get
   ```

2. Should show:
   ```json
   {
     "braintree": {
       "merchant_id": "8jbcpm9yj7df7w4h",
       "public_key": "fnig6rkd6vbkmxt",
       "private_key": "c96f93d2d472395ed66339"
     }
   }
   ```

3. If wrong or missing, set them:
   ```bash
   firebase functions:config:set braintree.merchant_id="8jbcpm9yj7df7w4h"
   firebase functions:config:set braintree.public_key="fnig6rkd6vbkmxt"
   firebase functions:config:set braintree.private_key="c96f93d2d472395ed66339"
   ```

4. Redeploy:
   ```bash
   firebase deploy --only functions
   ```

---

## 🚨 PROBLEM 18: "CORS error" when calling function from app

### What it means:
Cross-Origin Resource Sharing is blocking the request.

### How to fix:
The functions already have CORS enabled. If you still see this error:

1. Make sure you're calling the correct URL
2. Check that the function is deployed:
   ```bash
   firebase functions:list
   ```

3. Test the function directly in browser:
   Open: `https://us-central1-escolta-pro-fe90e.cloudfunctions.net/api`
   Should show something (not 404)

4. If still not working, check function logs:
   ```bash
   firebase functions:log
   ```

---

## 🆘 EMERGENCY RESET

If nothing works and you want to start fresh:

### 1. Clean everything:
```bash
cd functions
rm -rf node_modules
rm -rf lib
rm package-lock.json
cd ..
```

### 2. Reinstall:
```bash
cd functions
npm init -y
npm install firebase-admin@^12.0.0 firebase-functions@^4.5.0 express@^4.18.2 cors@^2.8.5 braintree@^3.19.0
npm install --save-dev @types/express@^4.17.21 @types/cors@^2.8.17 typescript@^5.3.3
```

### 3. Build:
```bash
npx tsc
```

### 4. Deploy:
```bash
cd ..
firebase deploy --only functions --force
```

---

## 📞 GETTING HELP

### Check logs first:
```bash
firebase functions:log --limit 100
```

### Check Firebase Console:
https://console.firebase.google.com/project/escolta-pro-fe90e/functions

### Check function status:
```bash
firebase functions:list
```

### Test function directly:
Open in browser:
```
https://us-central1-escolta-pro-fe90e.cloudfunctions.net/api
```

### Common log messages:

#### ✅ Good:
```
Function execution started
Function execution took 234 ms, finished with status code: 200
```

#### ❌ Bad:
```
Function execution failed
Error: Cannot find module 'braintree'
Unhandled error
```

---

## 🎯 VERIFICATION CHECKLIST

After fixing any issue, verify everything works:

- [ ] Firebase CLI installed: `firebase --version`
- [ ] Logged in: `firebase projects:list`
- [ ] Dependencies installed: `ls functions/node_modules`
- [ ] Build successful: `ls functions/lib`
- [ ] Functions deployed: `firebase functions:list`
- [ ] Config set: `firebase functions:config:get`
- [ ] Function URL works: Open in browser
- [ ] App config updated: Check `config/env.ts`
- [ ] No errors in logs: `firebase functions:log`

---

## 💡 PREVENTION TIPS

To avoid problems in the future:

1. **Always check logs** after deployment:
   ```bash
   firebase functions:log
   ```

2. **Test locally first** (optional):
   ```bash
   firebase emulators:start --only functions
   ```

3. **Keep dependencies updated**:
   ```bash
   cd functions
   npm outdated
   npm update
   ```

4. **Monitor usage** to avoid surprise bills:
   https://console.firebase.google.com/project/escolta-pro-fe90e/usage

5. **Set up budget alerts** in Firebase Console:
   Settings → Usage and billing → Budget alerts

---

## 🔍 DEBUGGING COMMANDS

Useful commands for troubleshooting:

```bash
# Check Firebase CLI version
firebase --version

# Check Node.js version
node --version

# Check npm version
npm --version

# List Firebase projects
firebase projects:list

# Check current project
firebase use

# Switch project
firebase use escolta-pro-fe90e

# List all functions
firebase functions:list

# View function logs
firebase functions:log

# View recent logs
firebase functions:log --limit 50

# View logs for specific function
firebase functions:log --only api

# Check function config
firebase functions:config:get

# Delete function config
firebase functions:config:unset braintree

# Delete a function
firebase functions:delete FUNCTION_NAME

# Force redeploy
firebase deploy --only functions --force

# Deploy specific function
firebase deploy --only functions:api

# Check Firebase status
firebase status
```

---

**Remember: Most problems can be solved by checking the logs and reading error messages carefully!**

Good luck! 🚀
