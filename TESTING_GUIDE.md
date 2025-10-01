# Escolta Pro - Testing & Demo Guide

## 🔐 Demo Accounts

### Client Account
- **Email**: `client@demo.com`
- **Password**: `demo123`
- **Role**: Client (Book security services)

### Guard (Freelancer) Account
- **Email**: `guard@demo.com`
- **Password**: `demo123`
- **Role**: Guard (Accept and complete bookings)

### Company Account
- **Email**: `company@demo.com`
- **Password**: `demo123`
- **Role**: Company (Manage guards and bookings)

### Admin Account
- **Email**: `admin@demo.com`
- **Password**: `demo123`
- **Role**: Admin (Full system access)

## 🧪 Testing Scenarios

### 1. Authentication Flow
1. Open the app
2. Sign up with a new account or use demo credentials
3. Verify email validation
4. Test sign out and sign in again
5. Test password reset (if implemented)

### 2. Booking Creation (Client)
1. Sign in as `client@demo.com`
2. Go to Home tab
3. Select a guard from the map or list
4. Click "Book Now"
5. Fill in booking details:
   - **Date**: Select from dropdown
   - **Time**: Select from dropdown
   - **Duration**: Enter hours
   - **Pickup Location**: Auto-filled with current location
   - **Vehicle Type**: Standard/Armored
   - **Protection Type**: Armed/Unarmed
   - **Dress Code**: Suit/Business Casual/Tactical/Casual
   - **Number of Protectees**: 1-10
   - **Number of Protectors**: 1-10
6. Review quote
7. Proceed to payment
8. Complete payment (test mode)
9. Verify booking appears in Bookings tab

### 3. Booking Management (Guard)
1. Sign in as `guard@demo.com`
2. Go to Bookings tab
3. View incoming booking requests
4. Accept a booking
5. View booking details and start code
6. Navigate to pickup location
7. Enter start code to begin service
8. Complete the booking
9. View payment details

### 4. Real-Time Chat
1. Create a booking as client
2. Guard accepts the booking
3. Both users can access chat from booking details
4. Send messages back and forth
5. Verify real-time message delivery
6. Test auto-translation (if different languages selected)

### 5. Location Tracking
1. Guard accepts a booking
2. Client can see guard's real-time location on map
3. Verify "En Route" status updates
4. Check estimated arrival time
5. Test location updates during active booking

### 6. Rating System
1. Complete a booking
2. Client rates the guard (1-5 stars)
3. Provide detailed ratings:
   - Professionalism
   - Punctuality
   - Communication
   - Language Clarity
4. Write a review
5. Verify rating appears on guard profile

### 7. Company Features
1. Sign in as `company@demo.com`
2. View all company guards
3. Assign guards to bookings
4. Handle guard reassignments
5. View company analytics
6. Manage payout settings

### 8. Admin Features
1. Sign in as `admin@demo.com`
2. View all bookings system-wide
3. Process refunds
4. Review KYC documents
5. View analytics dashboard
6. Manage user accounts

## 🔍 What to Verify

### Functionality Checklist
- [ ] User authentication (sign up, sign in, sign out)
- [ ] Location permissions requested properly
- [ ] Map displays guards correctly
- [ ] Booking creation with all options
- [ ] Payment flow (test mode)
- [ ] Real-time chat messaging
- [ ] Location tracking during bookings
- [ ] Push notifications (if enabled)
- [ ] Rating and review system
- [ ] Guard reassignment flow
- [ ] Refund processing
- [ ] Multi-language support
- [ ] Offline mode with cached data

### UI/UX Checklist
- [ ] Responsive design on different screen sizes
- [ ] Loading states and skeleton screens
- [ ] Error messages are user-friendly
- [ ] Navigation is intuitive
- [ ] Forms have proper validation
- [ ] Buttons have proper feedback
- [ ] Images load correctly
- [ ] Icons are appropriate
- [ ] Colors are consistent
- [ ] Typography is readable

### Performance Checklist
- [ ] App loads quickly
- [ ] Smooth scrolling and animations
- [ ] No memory leaks
- [ ] Efficient data fetching
- [ ] Proper caching
- [ ] Optimized images
- [ ] Minimal re-renders

### Security Checklist
- [ ] Passwords are not visible
- [ ] API keys are not exposed
- [ ] User data is encrypted
- [ ] Proper authentication checks
- [ ] Rate limiting on API calls
- [ ] Input sanitization
- [ ] Secure payment processing

## 🐛 Known Issues & Limitations

### Current Limitations
1. **Firebase Setup Required**: You need to configure Firebase with your own project credentials
2. **Stripe Test Mode**: Payment processing is in test mode
3. **Mock Data**: Some features use mock data until backend is fully connected
4. **Translation**: Auto-translation requires external API integration
5. **Push Notifications**: Requires Expo push notification setup

### Testing on Different Platforms

#### Web Testing
```bash
npm run start-web
```
- Test in Chrome, Firefox, Safari
- Verify responsive design
- Check web-specific features

#### iOS Testing
- Scan QR code with Expo Go app
- Test on different iOS versions
- Verify iOS-specific permissions

#### Android Testing
- Scan QR code with Expo Go app
- Test on different Android versions
- Verify Android-specific permissions

## 📊 Test Data

### Sample Booking Data
- **Pickup Address**: "123 Main St, Los Angeles, CA"
- **Destination**: "456 Oak Ave, Beverly Hills, CA"
- **Duration**: 4 hours
- **Date**: Tomorrow
- **Time**: 10:00 AM
- **Vehicle**: Armored
- **Protection**: Armed
- **Dress Code**: Suit
- **Protectees**: 2
- **Protectors**: 2

### Sample Guard Data
- **Name**: John Doe
- **Rating**: 4.8/5.0
- **Hourly Rate**: $75/hr
- **Languages**: English, Spanish
- **Certifications**: Armed Security License, CPR Certified
- **Experience**: 5 years

## 🚀 Production Readiness

### Before Going Live
1. **Configure Firebase**:
   - Set up Firebase project
   - Add environment variables
   - Configure Firestore security rules
   - Set up Firebase Storage rules

2. **Configure Stripe**:
   - Get production API keys
   - Set up webhooks
   - Configure payment methods
   - Test with real cards

3. **Set Up Push Notifications**:
   - Configure Expo push notifications
   - Test notification delivery
   - Handle notification permissions

4. **Security Audit**:
   - Review all API endpoints
   - Check authentication flows
   - Verify data encryption
   - Test rate limiting

5. **Performance Optimization**:
   - Optimize images
   - Minimize bundle size
   - Enable caching
   - Test on slow networks

6. **Legal Compliance**:
   - Add privacy policy
   - Add terms of service
   - GDPR compliance (if applicable)
   - Payment processing compliance

## 📞 Support

For issues or questions:
- Check the code comments
- Review the TEST_GUIDE.md
- Check Firebase console for errors
- Review Stripe dashboard for payment issues

## 🎯 Success Criteria

The app is ready for production when:
- ✅ All demo accounts work correctly
- ✅ All testing scenarios pass
- ✅ No critical bugs found
- ✅ Performance is acceptable
- ✅ Security audit passed
- ✅ Firebase is properly configured
- ✅ Stripe payments work in production mode
- ✅ Push notifications are working
- ✅ All platforms tested (iOS, Android, Web)
