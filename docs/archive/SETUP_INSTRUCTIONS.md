# Setup Instructions - Escolta Pro

## 🚀 Quick Start Guide

### Step 1: Install Dependencies

```bash
bun install
```

### Step 2: Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Name it "Escolta Pro" (or your preferred name)
   - Disable Google Analytics (optional)
   - Click "Create project"

2. **Enable Authentication**
   - In Firebase Console, go to "Authentication"
   - Click "Get started"
   - Enable "Email/Password" sign-in method
   - Save

3. **Create Firestore Database**
   - Go to "Firestore Database"
   - Click "Create database"
   - Start in "production mode"
   - Choose a location close to your users
   - Click "Enable"

4. **Set Up Firebase Storage**
   - Go to "Storage"
   - Click "Get started"
   - Start in "production mode"
   - Click "Done"

5. **Get Firebase Configuration**
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps"
   - Click "Web" icon (</>) to add a web app
   - Register app with nickname "Escolta Pro Web"
   - Copy the configuration object

6. **Deploy Security Rules**
   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools
   
   # Login to Firebase
   firebase login
   
   # Initialize Firebase in your project
   firebase init
   # Select: Firestore, Storage
   # Use existing project
   # Accept default files
   
   # Deploy rules
   firebase deploy --only firestore:rules
   firebase deploy --only storage:rules
   ```

### Step 3: Stripe Setup

1. **Create Stripe Account**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/)
   - Sign up or log in
   - Complete account setup

2. **Get API Keys**
   - Go to "Developers" → "API keys"
   - Copy "Publishable key" (starts with `pk_test_`)
   - Click "Reveal test key" and copy "Secret key" (starts with `sk_test_`)

3. **Set Up Webhooks** (Optional for now)
   - Go to "Developers" → "Webhooks"
   - Click "Add endpoint"
   - URL: `https://your-api-url.com/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Add endpoint

### Step 4: Environment Variables

1. **Copy example file**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your credentials**
   ```bash
   # Firebase
   EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Stripe
   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
   STRIPE_SECRET_KEY=sk_test_your_key

   # Backend (use the URL provided by Rork)
   EXPO_PUBLIC_RORK_API_BASE_URL=https://your-api-url.com
   ```

### Step 5: Create Demo Accounts

1. **Start the app**
   ```bash
   bun run start
   ```

2. **Create accounts through the app**
   - Open the app on your device or web
   - Sign up with these emails:
     - `client@demo.com` (password: `demo123`)
     - `guard@demo.com` (password: `demo123`)
     - `company@demo.com` (password: `demo123`)
     - `admin@demo.com` (password: `demo123`)

3. **Update user roles in Firestore**
   - Go to Firebase Console → Firestore
   - Find each user document
   - Update the `role` field:
     - `client@demo.com` → `client`
     - `guard@demo.com` → `guard`
     - `company@demo.com` → `company`
     - `admin@demo.com` → `admin`

### Step 6: Test the App

1. **Run on mobile**
   ```bash
   bun run start
   # Scan QR code with Expo Go app
   ```

2. **Run on web**
   ```bash
   bun run start-web
   ```

3. **Test key features**
   - Sign in with demo accounts
   - Create a booking as client
   - Accept booking as guard
   - Test chat functionality
   - Test location tracking
   - Test payment flow (test mode)

## 🔧 Troubleshooting

### Firebase Issues

**Error: "Firebase app not initialized"**
- Check that all environment variables are set correctly
- Restart the development server
- Clear cache: `expo start -c`

**Error: "Permission denied"**
- Deploy Firestore security rules: `firebase deploy --only firestore:rules`
- Check that user is authenticated
- Verify user role in Firestore

### Stripe Issues

**Error: "Invalid API key"**
- Verify you're using the correct key (test vs production)
- Check that key is properly set in `.env`
- Restart the development server

**Payment not working**
- Use Stripe test cards: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC
- Any ZIP code

### Location Issues

**Location not updating**
- Grant location permissions in device settings
- Check that location services are enabled
- Verify app has background location permission (mobile only)

**Map not showing**
- Check internet connection
- Verify Google Maps API key (if using)
- Check console for errors

### Build Issues

**TypeScript errors**
- Run `bun install` to ensure all dependencies are installed
- Check that all imports are correct
- Restart TypeScript server in your IDE

**Module not found**
- Clear cache: `expo start -c`
- Delete `node_modules` and reinstall: `rm -rf node_modules && bun install`
- Check that package is listed in `package.json`

## 📱 Platform-Specific Setup

### iOS

1. **Install Expo Go**
   - Download from App Store
   - Open and scan QR code

2. **Permissions**
   - Location: Always allow for background tracking
   - Notifications: Allow
   - Camera: Allow (for document upload)
   - Photos: Allow (for profile pictures)

### Android

1. **Install Expo Go**
   - Download from Google Play Store
   - Open and scan QR code

2. **Permissions**
   - Location: Allow all the time
   - Notifications: Allow
   - Camera: Allow
   - Storage: Allow

### Web

1. **Browser Requirements**
   - Chrome 90+
   - Firefox 88+
   - Safari 14+
   - Edge 90+

2. **Permissions**
   - Location: Allow when prompted
   - Notifications: Allow when prompted

## 🎯 Next Steps

After setup is complete:

1. ✅ Review [TESTING_GUIDE.md](./TESTING_GUIDE.md)
2. ✅ Check [SECURITY_AUDIT.md](./SECURITY_AUDIT.md)
3. ✅ Follow [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)
4. ✅ Explore [IMPROVEMENTS.md](./IMPROVEMENTS.md)

## 💡 Tips

- Use test mode for Stripe during development
- Enable Firebase debug mode for better logging
- Use React DevTools for debugging
- Check console logs for detailed error messages
- Test on multiple devices and browsers

## 📞 Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review Firebase Console for errors
3. Check Stripe Dashboard for payment issues
4. Look at browser/device console logs
5. Review the documentation files

## ✅ Setup Checklist

- [ ] Dependencies installed
- [ ] Firebase project created
- [ ] Authentication enabled
- [ ] Firestore database created
- [ ] Storage set up
- [ ] Security rules deployed
- [ ] Stripe account created
- [ ] API keys obtained
- [ ] Environment variables configured
- [ ] Demo accounts created
- [ ] User roles updated
- [ ] App tested on mobile
- [ ] App tested on web
- [ ] All features working

**Estimated setup time: 30-45 minutes**
