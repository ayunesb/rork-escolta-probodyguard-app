# 🚀 Quick Start Guide

Get up and running with Escolta Pro in 5 minutes!

---

## 📦 Installation

```bash
# Install dependencies
bun install

# Start the development server
bun start
```

---

## 🔥 Firebase Setup (Required)

### 1. Enable Firebase Services

Go to [Firebase Console](https://console.firebase.google.com/project/escolta-pro-fe90e):

1. **Firestore Database**
   - Click "Create Database"
   - Choose "Test mode"
   - Click "Enable"

2. **Authentication**
   - Go to Authentication
   - Click "Get Started"
   - Enable "Email/Password"

3. **Storage**
   - Go to Storage
   - Click "Get Started"
   - Choose "Test mode"

### 2. Seed Demo Data

```bash
# Create demo accounts and guards
bun run scripts/seed-firebase.ts
```

---

## 👥 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| **Client** | client@demo.com | <contrasena en tu .env local, no en el repositorio> |
| **Guard 1** | guard1@demo.com | <contrasena en tu .env local, no en el repositorio> |
| **Guard 2** | guard2@demo.com | <contrasena en tu .env local, no en el repositorio> |
| **Company** | company@demo.com | <contrasena en tu .env local, no en el repositorio> |
| **Admin** | admin@demo.com | <contrasena en tu .env local, no en el repositorio> |

---

## 🧪 Quick Test Flow

### As Client (client@demo.com)
1. Sign in
2. Browse guards on Home tab
3. Tap a guard → "Book Now"
4. Fill booking form (date/time dropdowns, location pre-filled)
5. Enter test card: `4242 4242 4242 4242`
6. Complete payment
7. View booking in Bookings tab
8. Chat with guard
9. Rate service after completion

### As Guard (guard1@demo.com)
1. Sign in
2. Go to Bookings tab
3. Accept pending booking
4. Start location tracking
5. Chat with client
6. Complete booking

### As Company (company@demo.com)
1. Sign in
2. View all company bookings
3. Assign guards to bookings
4. Manage guard availability

### As Admin (admin@demo.com)
1. Sign in
2. View analytics
3. Process refunds
4. Reassign guards
5. Manage all users

---

## 🗺️ Test Booking Flow

### Quick Booking
```
Home → Guard Card → Book Now → Fill Form → Pay → Done
```

### Map Booking
```
Home → Map View → Guard Marker → Book → Fill Form → Pay → Done
```

### Schedule Booking
```
Bookings → Schedule New → Fill Form → Pay → Done
```

---

## 💳 Test Payment Cards

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0000 0000 9995 | Insufficient funds |

**Expiry**: Any future date (e.g., 12/25)  
**CVC**: Any 3 digits (e.g., 123)  
**ZIP**: Any 5 digits (e.g., 12345)

---

## 📱 Key Features to Test

### ✅ Must Test
- [ ] Sign up / Sign in
- [ ] Browse guards
- [ ] Create booking with dropdowns for date/time
- [ ] Location pre-filled in booking form
- [ ] Payment processing
- [ ] Real-time chat
- [ ] Location tracking
- [ ] Rating system

### 🎯 Should Test
- [ ] Guard acceptance
- [ ] Booking completion
- [ ] Notifications
- [ ] Offline mode
- [ ] Error handling
- [ ] Company features
- [ ] Admin features

---

## 🐛 Common Issues

### "Firebase: Error (auth/operation-not-allowed)"
**Fix**: Enable Email/Password auth in Firebase Console

### "Missing or insufficient permissions"
**Fix**: Update Firestore security rules (see FIREBASE_SETUP.md)

### Demo accounts not working
**Fix**: Run seed script: `bun run scripts/seed-firebase.ts`

### Location not pre-filling
**Fix**: Grant location permissions when prompted

### Date/Time not showing as dropdown
**Fix**: Check booking-create.tsx has proper dropdown components

---

## 📚 Documentation

- **Full Setup**: See `FIREBASE_SETUP.md`
- **Testing Guide**: See `DEMO_TESTING_GUIDE.md`
- **Security**: See `SECURITY_AUDIT.md`
- **Production**: See `PRODUCTION_CHECKLIST.md`

---

## 🎯 Quick Verification

Run through this checklist to verify everything works:

```bash
# 1. Start the app
bun start

# 2. Sign in as client
Email: client@demo.com
Password: <contrasena en tu .env local, no en el repositorio>

# 3. Create a booking
- Select guard
- Pick date from dropdown
- Pick time from dropdown
- Location should be pre-filled
- Complete payment

# 4. Sign in as guard
Email: guard1@demo.com
Password: <contrasena en tu .env local, no en el repositorio>

# 5. Accept booking
- Go to Bookings tab
- Accept the booking
- Start tracking
- Chat with client

# 6. Complete booking
- Mark as complete
- Client rates service
```

---

## 🚀 You're Ready!

If all the above works, your app is ready for testing!

**Next Steps**:
1. Test all scenarios in `DEMO_TESTING_GUIDE.md`
2. Fix any bugs found
3. Review `PRODUCTION_CHECKLIST.md`
4. Deploy to production

---

## 💡 Pro Tips

- Use **client@demo.com** for most testing
- Use **guard1@demo.com** to test guard features
- Use **admin@demo.com** for admin features
- Check Firebase Console to see data in real-time
- Check browser/app console for debug logs
- Test on both mobile and web

---

## 🆘 Need Help?

1. Check console logs for errors
2. Review Firebase Console for data
3. Verify all services are enabled
4. Check `.env` file has correct values
5. Ensure internet connection is stable

---

**Happy Building! 🎉**
