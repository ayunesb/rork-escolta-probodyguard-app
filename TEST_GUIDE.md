# EscoltaPRO - Testing Guide

## Demo Accounts

### Client Accounts
Use these accounts to test booking guards and client features:

**Client 1 - Standard User**
- Email: `client@test.com`
- Password: `any password`
- Features: Book guards, view bookings, rate services, chat with guards

**Client 2 - VIP User**
- Email: `vip@test.com`
- Password: `any password`
- Features: Same as Client 1, test multiple bookings

### Guard Accounts (Freelancers)
Use these accounts to test guard features and accept bookings:

**Guard 1 - Chris Martinez**
- Email: `chris@escoltapro.com`
- Password: `any password`
- Type: Freelancer
- Rate: $150/hour
- Location: Times Square area (40.7580, -73.9855)
- Specialties: Executive protection, 12 years experience
- Status: Available

**Guard 2 - George Thompson**
- Email: `george@escoltapro.com`
- Password: `any password`
- Type: Freelancer
- Rate: $175/hour
- Location: Midtown East (40.7489, -73.9680)
- Specialties: Special Forces background, threat assessment
- Status: Available

**Guard 3 - David Chen**
- Email: `david@escoltapro.com`
- Password: `any password`
- Type: Freelancer
- Rate: $145/hour
- Location: Central Park area (40.7549, -73.9840)
- Specialties: VIP protection, risk management
- Status: Available

### Company Guard Account
Use this account to test company-employed guard features:

**Guard 4 - Maria Rodriguez**
- Email: `maria@escoltapro.com`
- Password: `any password`
- Type: Company Employee (Company ID: company-1)
- Rate: $160/hour
- Location: Upper West Side (40.7614, -73.9776)
- Specialties: Former Secret Service, multilingual
- Status: Available

### Company Admin Account
Use this account to test company management features:

**Company Admin**
- Email: `company@test.com`
- Password: `any password`
- Company ID: `company-1`
- Features: Manage guards, view analytics, handle refunds, reassign guards

### Platform Admin Account
Use this account to test platform-wide admin features:

**Platform Admin**
- Email: `admin@test.com`
- Password: `any password`
- Features: View all bookings, analytics, refunds, system-wide management

---

## Testing Scenarios

### 1. Client Booking Flow

#### Immediate Booking (Book Now)
1. Sign in as `client@test.com`
2. Go to Home tab
3. See map with 4 available guards nearby
4. Tap on a guard marker to see their profile card
5. Tap "Book Now" on the profile card
6. Fill in booking details:
   - **Date**: Select from dropdown (today or future dates)
   - **Time**: Select from dropdown (hourly slots)
   - **Duration**: Enter hours (e.g., 4)
   - **Pickup Location**: Auto-filled with your current location
   - **Destination**: Enter destination address
   - **Vehicle Type**: Select (standard/luxury/armored)
   - **Protection Type**: Select (armed/unarmed)
   - **Dress Code**: Select (suit/business_casual/casual)
   - **Number of Protectees**: Enter number
   - **Number of Protectors**: Enter number
7. Review pricing breakdown
8. Tap "Continue to Payment"
9. Enter payment details (test mode)
10. Confirm booking
11. Receive booking confirmation with start code

#### Scheduled Booking
1. Sign in as `client@test.com`
2. Go to Home tab
3. Tap "Schedule Booking" button
4. Select future date and time from dropdowns
5. Enter location (or use current location)
6. See available guards for that time/location
7. Select a guard and complete booking

### 2. Guard Accepting Booking

1. Sign in as `chris@escoltapro.com` (or any guard account)
2. Go to Bookings tab
3. See incoming booking request
4. Review booking details:
   - Client information
   - Date, time, duration
   - Pickup and destination
   - Payment amount
   - Special requirements
5. Tap "Accept Booking"
6. Booking status changes to "accepted"
7. Receive start code for verification

### 3. Active Booking & Tracking

#### Starting the Job (Guard Side)
1. Sign in as guard who accepted the booking
2. Go to Bookings tab
3. Find accepted booking
4. At scheduled time, tap "Start Job"
5. Enter the 6-digit start code provided to client
6. Job status changes to "in_progress"
7. Real-time location tracking begins

#### Monitoring (Client Side)
1. Sign in as client who made the booking
2. Go to Bookings tab
3. Tap on active booking
4. See real-time guard location on map
5. View estimated arrival time
6. Access chat feature to communicate with guard

### 4. Chat Feature

1. During active booking, tap "Chat" button
2. Send text messages to guard/client
3. Messages appear in real-time
4. Test sending:
   - Text messages
   - Location updates
   - Status updates

### 5. Completing & Rating

#### Completing Job (Guard Side)
1. When service is complete, tap "Complete Job"
2. Confirm completion
3. Job status changes to "completed"
4. Payment is processed

#### Rating Service (Client Side)
1. After job completion, go to Bookings tab
2. Tap on completed booking
3. Tap "Rate Service"
4. Provide ratings for:
   - Overall experience (1-5 stars)
   - Professionalism (1-5 stars)
   - Punctuality (1-5 stars)
   - Communication (1-5 stars)
   - Language Clarity (1-5 stars)
5. Write optional review
6. Submit rating
7. Rating appears on guard's profile

### 6. Company Features

#### Managing Company Guards
1. Sign in as `company@test.com`
2. View all company-employed guards
3. See Maria Rodriguez (company guard)
4. Monitor her bookings and performance

#### Guard Reassignment
1. When a company guard is unavailable
2. Company admin receives reassignment request
3. Review available guards
4. Assign replacement guard
5. Client receives notification (if approval required)
6. Client approves/rejects reassignment

#### Analytics Dashboard
1. Sign in as company admin
2. Go to Analytics section
3. View metrics:
   - Total bookings
   - Revenue breakdown
   - Guard performance
   - Client satisfaction
   - Booking trends

### 7. Refund Management

#### Requesting Refund (Client)
1. Sign in as client
2. Go to completed/cancelled booking
3. Tap "Request Refund"
4. Provide reason
5. Submit request

#### Processing Refund (Admin)
1. Sign in as `admin@test.com`
2. Go to Refunds section
3. Review refund requests
4. Approve or deny with reason
5. Client receives notification

### 8. Location & Map Features

#### Viewing Available Guards
1. Sign in as client
2. Home tab shows map with guard markers
3. Guards are color-coded by availability
4. Tap marker to see guard details
5. Guards update position in real-time

#### Filtering Guards
1. Use date/time dropdowns to filter
2. Map updates to show only available guards
3. Change location to see guards in other areas

### 9. Profile & KYC

#### Guard Profile Setup
1. Sign in as guard
2. Go to Profile tab
3. Upload documents:
   - Security license
   - Vehicle documents
   - Insurance certificates
4. Add certifications
5. Set hourly rate
6. Update bio and photos
7. Submit for KYC approval

#### Client Profile
1. Sign in as client
2. Go to Profile tab
3. Update personal information
4. View booking history
5. Manage payment methods

---

## Testing Payment Flow

### Test Card Numbers (Stripe Test Mode)
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`
- **Expired Card**: Use any past expiry date
- **CVC**: Any 3 digits
- **ZIP**: Any 5 digits

### Payment Breakdown
For a $150/hour guard, 4-hour booking:
- **Subtotal**: $600
- **Stripe Fee (3%)**: $18
- **Platform Cut (10%)**: $60
- **Guard Payout**: $522

---

## Testing Notifications

### Push Notifications (Mobile Only)
1. Grant notification permissions
2. Test scenarios:
   - New booking request (guard receives)
   - Booking accepted (client receives)
   - Job started (client receives)
   - Job completed (both receive)
   - New chat message (both receive)
   - Refund processed (client receives)

---

## Testing Offline Support

1. Sign in and browse guards
2. Turn off internet connection
3. App continues to work with cached data
4. View previously loaded guards
5. View booking history
6. Turn internet back on
7. Data syncs automatically

---

## Testing Error Handling

### Network Errors
1. Turn off internet during booking
2. See user-friendly error message
3. Retry option available

### Invalid Input
1. Try booking with invalid dates
2. Try entering negative duration
3. See validation errors

### Payment Failures
1. Use declined test card
2. See payment error message
3. Retry payment option

---

## Key Features to Verify

### ✅ Real-time Features
- [ ] Guard location updates on map
- [ ] Chat messages appear instantly
- [ ] Booking status changes reflect immediately
- [ ] Notifications arrive in real-time

### ✅ Security Features
- [ ] Start code verification works
- [ ] KYC document upload secure
- [ ] Payment processing secure
- [ ] User data protected

### ✅ Business Logic
- [ ] Correct payment calculations
- [ ] Platform cut (10%) applied correctly
- [ ] Stripe fee (3%) calculated properly
- [ ] Guard payout accurate
- [ ] Refunds process correctly

### ✅ User Experience
- [ ] Smooth navigation between screens
- [ ] Loading states show appropriately
- [ ] Error messages are clear
- [ ] Forms validate properly
- [ ] Maps load and display correctly

### ✅ Multi-role Support
- [ ] Client features work correctly
- [ ] Guard features work correctly
- [ ] Company admin features work correctly
- [ ] Platform admin features work correctly

---

## Known Test Data

### Pre-existing Bookings
The app includes 2 mock bookings for testing:

**Booking 1 - Completed**
- Client: client-1
- Guard: Chris Martinez
- Date: September 28, 2025
- Status: Completed
- Rating: 5 stars
- Amount: $600

**Booking 2 - Accepted**
- Client: client-1
- Guard: George Thompson
- Date: October 2, 2025
- Status: Accepted
- Amount: $1,400

---

## Troubleshooting

### Can't see guards on map?
- Check location permissions
- Ensure you're signed in as client
- Verify internet connection

### Booking not appearing?
- Check Bookings tab
- Verify you're signed in with correct account
- Pull to refresh

### Chat not working?
- Ensure booking is active
- Check internet connection
- Verify both users are signed in

### Payment failing?
- Use test card numbers provided above
- Check all fields are filled
- Verify internet connection

---

## Support

For issues or questions during testing:
1. Check console logs for error details
2. Verify you're using correct test accounts
3. Ensure all permissions are granted
4. Try signing out and back in

---

## Quick Test Checklist

- [ ] Sign in as client
- [ ] View guards on map
- [ ] Create a booking
- [ ] Sign in as guard
- [ ] Accept booking
- [ ] Start job with code
- [ ] Test chat feature
- [ ] Complete job
- [ ] Rate service as client
- [ ] View analytics as admin
- [ ] Test refund flow
- [ ] Verify notifications work
- [ ] Check offline support

---

**Last Updated**: October 1, 2025
**App Version**: 1.0.0
**Test Environment**: Development/Staging
