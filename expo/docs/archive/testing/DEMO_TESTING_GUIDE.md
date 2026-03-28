# 🧪 Demo Testing Guide

Complete guide to test all features of the Escolta Pro app with demo accounts.

---

## 📋 Demo Accounts

### 👤 Client Account
```
Email: client@demo.com
Password: demo123
Role: Client
```
**Can do:**
- Browse available guards
- Create bookings
- Make payments
- Chat with guards
- Rate guards after service
- View booking history

### 🛡️ Guard Account #1
```
Email: guard1@demo.com
Password: demo123
Name: Mike Security
Role: Guard
```
**Can do:**
- View assigned bookings
- Accept/decline bookings
- Update availability
- Chat with clients
- Update location during active bookings
- Complete bookings

### 🛡️ Guard Account #2
```
Email: guard2@demo.com
Password: demo123
Name: Sarah Protection
Role: Guard
```
**Can do:**
- Same as Guard #1
- Higher rating (4.9) for testing

### 🏢 Company Account
```
Email: company@demo.com
Password: demo123
Name: Elite Security
Role: Company
```
**Can do:**
- Manage multiple guards
- View all company bookings
- Assign guards to bookings
- View analytics
- Handle refunds

### 👨‍💼 Admin Account
```
Email: admin@demo.com
Password: demo123
Role: Admin
```
**Can do:**
- Full access to all features
- View all bookings
- Manage users
- Handle disputes
- View analytics
- Process refunds

---

## 🧪 Test Scenarios

### 1. Authentication Flow

#### Test Sign Up
1. Open the app
2. Tap "Sign Up"
3. Fill in details:
   - Email: `test@example.com`
   - Password: `test123`
   - First Name: `Test`
   - Last Name: `User`
   - Phone: `+1234567890`
   - Role: `Client`
4. Tap "Sign Up"
5. ✅ Should redirect to home screen
6. ✅ Should see welcome message

#### Test Sign In
1. Sign out if logged in
2. Tap "Sign In"
3. Enter: `client@demo.com` / `demo123`
4. Tap "Sign In"
5. ✅ Should redirect to home screen
6. ✅ Should see user name in profile

#### Test Sign Out
1. Go to Profile tab
2. Tap "Sign Out"
3. ✅ Should redirect to sign-in screen

---

### 2. Guard Browsing & Search

#### Test Guard List
1. Sign in as `client@demo.com`
2. Go to Home tab
3. ✅ Should see list of available guards
4. ✅ Should see guard ratings, rates, and specialties

#### Test Guard Filters
1. On Home tab, tap filter icon
2. Select filters:
   - Price range: $40-$50
   - Rating: 4.5+
   - Specialty: "VIP Protection"
3. Apply filters
4. ✅ Should see filtered results
5. ✅ Should only show guards matching criteria

#### Test Guard Detail
1. Tap on "Mike Security" guard card
2. ✅ Should see full profile
3. ✅ Should see certifications, languages, reviews
4. ✅ Should see "Book Now" button
5. ✅ Should see location on map

---

### 3. Booking Creation Flow

#### Test Quick Booking
1. Sign in as `client@demo.com`
2. Tap on a guard card
3. Tap "Book Now"
4. ✅ Should see booking form
5. ✅ Pickup location should be pre-filled with current location
6. Fill in details:
   - Date: Select from dropdown (today or future)
   - Time: Select from dropdown (e.g., "2:00 PM")
   - Duration: 4 hours
   - Service Type: "Event Security"
   - Special Instructions: "VIP event at hotel"
7. Tap "Continue to Payment"
8. ✅ Should see payment screen
9. ✅ Should see total cost calculation

#### Test Booking from Map
1. On Home tab, tap map view
2. Tap on a guard marker
3. Tap "Book" on the popup
4. ✅ Should open booking form
5. ✅ Date and time should be dropdowns
6. ✅ Location should be pre-filled
7. Complete booking as above

#### Test Schedule Booking
1. Go to Bookings tab
2. Tap "Schedule New Booking"
3. ✅ Should see booking form
4. ✅ Should have date/time dropdowns
5. Complete booking flow

---

### 4. Payment Flow

#### Test Payment Success
1. Create a booking (follow steps above)
2. On payment screen, enter test card:
   ```
   Card Number: 4242 4242 4242 4242
   Expiry: 12/25
   CVC: 123
   ZIP: 12345
   ```
3. Tap "Pay Now"
4. ✅ Should show processing indicator
5. ✅ Should redirect to booking confirmation
6. ✅ Should see booking in "Active Bookings"

#### Test Payment Failure
1. Create a booking
2. Enter declined card:
   ```
   Card Number: 4000 0000 0000 0002
   ```
3. Tap "Pay Now"
4. ✅ Should show error message
5. ✅ Should stay on payment screen
6. ✅ Should allow retry

---

### 5. Active Booking Management

#### Test Guard Acceptance (Guard Side)
1. Sign in as `guard1@demo.com`
2. Go to Bookings tab
3. ✅ Should see pending booking
4. Tap on booking
5. Tap "Accept Booking"
6. ✅ Should move to "Active Bookings"
7. ✅ Client should receive notification

#### Test Location Tracking
1. With active booking as guard
2. Tap "Start Tracking"
3. ✅ Should request location permission
4. Grant permission
5. ✅ Should see "Tracking Active" indicator
6. Switch to client account
7. Open the booking
8. ✅ Should see guard's real-time location on map

#### Test Booking Chat
1. Open an active booking (as client or guard)
2. Tap "Chat" button
3. Send a message: "On my way!"
4. ✅ Should see message appear
5. Switch to other account
6. Open same booking chat
7. ✅ Should see the message
8. Reply: "Great, see you soon!"
9. ✅ Both users should see messages in real-time

---

### 6. Booking Completion & Rating

#### Test Complete Booking (Guard Side)
1. Sign in as `guard1@demo.com`
2. Open active booking
3. Tap "Complete Booking"
4. ✅ Should show completion confirmation
5. ✅ Should move to "Completed Bookings"

#### Test Rating System (Client Side)
1. Sign in as `client@demo.com`
2. Go to Bookings tab
3. Open completed booking
4. ✅ Should see "Rate Service" button
5. Tap "Rate Service"
6. Select rating: 5 stars
7. Select tags: "Professional", "On Time", "Friendly"
8. Write review: "Excellent service, very professional!"
9. Add tip: $20
10. Tap "Submit Rating"
11. ✅ Should see thank you message
12. ✅ Rating should appear on guard's profile

---

### 7. Company Features

#### Test Guard Management
1. Sign in as `company@demo.com`
2. Go to Profile tab
3. Tap "Manage Guards"
4. ✅ Should see list of company guards
5. Tap on a guard
6. Update availability
7. ✅ Should save changes

#### Test Booking Assignment
1. As company, go to Bookings
2. ✅ Should see all company bookings
3. Tap on unassigned booking
4. Tap "Assign Guard"
5. Select guard from list
6. ✅ Guard should receive notification
7. ✅ Booking should show assigned guard

---

### 8. Admin Features

#### Test Analytics Dashboard
1. Sign in as `admin@demo.com`
2. Go to Profile tab
3. Tap "Analytics"
4. ✅ Should see:
   - Total bookings
   - Revenue charts
   - Active users
   - Popular guards
   - Booking trends

#### Test Refund Processing
1. As admin, go to Profile
2. Tap "Refunds"
3. ✅ Should see refund requests
4. Tap on a request
5. Review details
6. Tap "Approve Refund"
7. ✅ Should process refund
8. ✅ Client should receive notification

#### Test Guard Reassignment
1. As admin, open any booking
2. Tap "Reassign Guard"
3. Select new guard
4. Add reason: "Original guard unavailable"
5. Tap "Confirm Reassignment"
6. ✅ Both guards should receive notifications
7. ✅ Client should be notified

---

### 9. Notifications

#### Test Push Notifications
1. Enable notifications when prompted
2. Create a booking as client
3. ✅ Guard should receive notification
4. Accept booking as guard
5. ✅ Client should receive notification
6. Send chat message
7. ✅ Other user should receive notification

#### Test In-App Notifications
1. Tap notification bell icon
2. ✅ Should see list of notifications
3. Tap on a notification
4. ✅ Should navigate to relevant screen

---

### 10. Offline Support

#### Test Offline Mode
1. Turn on airplane mode
2. Open the app
3. ✅ Should show cached data
4. ✅ Should show "Offline" indicator
5. Try to create booking
6. ✅ Should show "No internet" message
7. Turn off airplane mode
8. ✅ Should sync automatically
9. ✅ Should show "Online" indicator

---

### 11. Error Handling

#### Test Network Errors
1. Turn on airplane mode
2. Try to sign in
3. ✅ Should show friendly error message
4. ✅ Should offer retry option

#### Test Invalid Input
1. Try to create booking with:
   - Past date
   - Invalid duration (0 hours)
   - Empty required fields
2. ✅ Should show validation errors
3. ✅ Should highlight invalid fields

#### Test Session Expiry
1. Sign in
2. Wait for token to expire (or manually expire)
3. Try to perform action
4. ✅ Should redirect to sign-in
5. ✅ Should show "Session expired" message

---

## 🐛 Known Issues to Test

### High Priority
- [ ] Location tracking accuracy on iOS vs Android
- [ ] Payment processing with 3D Secure cards
- [ ] Real-time chat message delivery
- [ ] Push notification delivery on background/killed app

### Medium Priority
- [ ] Map performance with many guards
- [ ] Image upload for KYC documents
- [ ] Booking cancellation flow
- [ ] Refund processing time

### Low Priority
- [ ] Profile picture upload
- [ ] Language switching
- [ ] Dark mode support
- [ ] Accessibility features

---

## 📊 Performance Testing

### Load Testing
1. Create 10+ bookings rapidly
2. ✅ Should handle without crashes
3. ✅ Should maintain responsiveness

### Memory Testing
1. Navigate through all screens
2. Create and complete bookings
3. Upload images
4. ✅ Should not leak memory
5. ✅ Should not crash on low memory

### Battery Testing
1. Enable location tracking
2. Keep app open for 1 hour
3. ✅ Should not drain battery excessively
4. ✅ Should optimize location updates

---

## 🔒 Security Testing

### Authentication
- [ ] Cannot access protected routes without login
- [ ] Session expires after timeout
- [ ] Password requirements enforced
- [ ] Cannot access other users' data

### Authorization
- [ ] Clients cannot access guard-only features
- [ ] Guards cannot access admin features
- [ ] Company can only manage their guards
- [ ] Admin has full access

### Data Protection
- [ ] Sensitive data encrypted in transit
- [ ] Payment info not stored locally
- [ ] User data properly isolated
- [ ] API endpoints properly secured

---

## ✅ Production Readiness Checklist

### Functionality
- [ ] All user flows work end-to-end
- [ ] No critical bugs
- [ ] Error handling in place
- [ ] Loading states implemented

### Performance
- [ ] App loads in < 3 seconds
- [ ] Smooth scrolling and animations
- [ ] Efficient data fetching
- [ ] Optimized images

### Security
- [ ] Authentication working
- [ ] Authorization enforced
- [ ] Data encrypted
- [ ] API secured

### UX/UI
- [ ] Consistent design
- [ ] Intuitive navigation
- [ ] Clear error messages
- [ ] Responsive layouts

### Testing
- [ ] All test scenarios pass
- [ ] No console errors
- [ ] Works on iOS and Android
- [ ] Works on web

---

## 🚀 Next Steps After Testing

1. **Fix Critical Bugs**: Address any blocking issues found
2. **Optimize Performance**: Improve slow areas
3. **Enhance UX**: Refine based on testing feedback
4. **Add Analytics**: Track user behavior
5. **Prepare for Launch**: Final production checklist

---

## 📞 Support

If you encounter issues during testing:
1. Check console logs for errors
2. Verify Firebase configuration
3. Ensure all services are enabled
4. Check network connectivity
5. Review security rules

---

## 🎉 Happy Testing!

This guide covers all major features and flows. Test thoroughly and document any issues found.
