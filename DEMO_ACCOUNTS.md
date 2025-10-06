# Demo Accounts Setup

This document explains how to set up and use demo accounts for testing different user roles in the Escolta Pro app.

## Available User Roles

The app supports 4 user roles:
1. **Client** - Books protection services
2. **Guard** - Provides protection services
3. **Company** - Manages multiple guards
4. **Admin** - System administration

## Demo Account Credentials

### Existing Demo Accounts
- **Client**: `client@demo.com` / `demo123`
- **Guard**: `guard1@demo.com` / `demo123`

### Accounts That Need to Be Created
- **Company**: `company@demo.com` / `demo123`
- **Admin**: `admin@demo.com` / `demo123`

## How to Create Missing Demo Accounts

Since Firebase Authentication requires actual sign-up, you need to create these accounts manually:

### Option 1: Using the App (Recommended)

1. Open the app and go to the Sign Up page
2. Select the role you want to create (Company or Admin)
3. Fill in the form:
   - **Email**: `company@demo.com` (or `admin@demo.com`)
   - **Password**: `demo123`
   - **First Name**: `Demo`
   - **Last Name**: `Company` (or `Admin`)
   - **Phone**: `+1-555-0100`
4. Click "Create Account"
5. The account will be created in Firebase

### Option 2: Using Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `escolta-pro-fe90e`
3. Navigate to Authentication > Users
4. Click "Add User"
5. Enter email and password
6. After creating the user, go to Firestore Database
7. Create a document in the `users` collection with the user's UID:
   ```json
   {
     "email": "company@demo.com",
     "role": "company",
     "firstName": "Demo",
     "lastName": "Company",
     "phone": "+1-555-0100",
     "language": "en",
     "kycStatus": "approved",
     "createdAt": "2025-01-06T00:00:00.000Z",
     "companyName": "Demo Security Company",
     "guards": []
   }
   ```

## Testing Different Roles

### Testing as Client
1. Sign in with `client@demo.com` / `demo123`
2. You should see the home screen with options to book protection services
3. You can create bookings and view your booking history

### Testing as Guard
1. Sign in with `guard1@demo.com` / `demo123`
2. You should see pending booking requests
3. You can accept/reject bookings and track active jobs

### Testing as Company
1. Sign in with `company@demo.com` / `demo123`
2. You should see a company dashboard
3. You can manage guards and view company bookings

### Testing as Admin
1. Sign in with `admin@demo.com` / `demo123`
2. You should see an admin dashboard
3. You can manage all users, bookings, and system settings

## Current Limitations

⚠️ **Important**: The app currently routes all users to the same home screen (`/(tabs)/home`) regardless of role. This needs to be fixed to provide role-specific experiences:

- **Client** → Client home with booking options
- **Guard** → Guard dashboard with pending requests
- **Company** → Company dashboard with guard management
- **Admin** → Admin panel with system management

## Next Steps

To fully support company and admin roles, the following needs to be implemented:

1. ✅ Add Company and Admin role options to sign-up page
2. ✅ Update sign-in page to show all demo account credentials
3. ⚠️ Create role-based routing logic in `app/index.tsx`
4. ⚠️ Create company-specific pages (dashboard, guard management)
5. ⚠️ Create admin-specific pages (user management, system settings)
6. ⚠️ Update tab navigation to show role-appropriate tabs

## Troubleshooting

### "Invalid email address" error
- Make sure you're entering the email correctly without extra spaces
- The email should be in lowercase

### "No account found with this email"
- The account hasn't been created yet
- Follow the steps above to create the account

### "User document not found" error
- The Firebase Authentication user exists, but the Firestore document is missing
- Create the user document in Firestore as described in Option 2 above

### Login redirects to sign-in page twice
- This is a known issue that has been fixed
- The app should now only require one login attempt
