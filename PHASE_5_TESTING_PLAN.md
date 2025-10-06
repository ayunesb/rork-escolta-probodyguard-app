# Phase 5: Comprehensive Testing Plan

**Goal**: Verify all flows work perfectly across all user roles

**Status**: 🚀 STARTING
**Estimated Time**: 12 hours
**Date Started**: 2025-01-06

---

## Testing Environment Setup

### Prerequisites
- [ ] Firebase project configured
- [ ] Braintree sandbox credentials active
- [ ] Demo accounts created and verified
- [ ] Test devices ready (iOS/Android/Web)
- [ ] Network throttling tools available
- [ ] Screen recording software ready

### Demo Accounts
```
Client: client@demo.com | demo123
Guard 1: guard1@demo.com | demo123
Guard 2: guard2@demo.com | demo123
Company: company@demo.com | demo123
Admin: admin@demo.com | demo123
```

---

## Task 5.1: Client Flow Testing ⏱️ 3 hours

### 5.1.1 Scheduled Cross-City Job (Complete Flow)

#### Sign Up & Verification
- [ ] Navigate to sign-up screen
- [ ] Fill in all fields (First Name, Last Name, Email, Phone, Password)
- [ ] Select "Client" role
- [ ] Accept all required terms (Terms, Privacy, Data Processing)
- [ ] Submit form
- [ ] Verify email verification screen appears
- [ ] Check email inbox for verification link
- [ ] Click verification link
- [ ] Verify redirect to sign-in page
- [ ] Sign in with new credentials
- [ ] Verify successful login and redirect to home

**Expected Result**: ✅ New client account created, verified, and logged in

#### KYC Document Upload
- [ ] Navigate to Profile tab
- [ ] Find KYC/Document upload section
- [ ] Upload government-issued ID (front)
- [ ] Upload government-issued ID (back)
- [ ] Submit for approval
- [ ] Verify "Pending Approval" status shown
- [ ] Sign in as admin@demo.com
- [ ] Navigate to Admin KYC tab
- [ ] Find pending client approval
- [ ] Review uploaded documents
- [ ] Approve KYC
- [ ] Sign back in as client
- [ ] Verify "Approved" status shown

**Expected Result**: ✅ Client KYC approved and can proceed with bookings

#### Browse & Filter Guards
- [ ] Navigate to Home tab
- [ ] Verify guard list loads
- [ ] Apply filter: "Armed"
- [ ] Verify only armed guards shown
- [ ] Apply filter: "Armored" (vehicle type)
- [ ] Verify results update
- [ ] Apply language filter: "Spanish"
- [ ] Verify Spanish-speaking guards shown
- [ ] Clear all filters
- [ ] Switch to Map view
- [ ] Verify guards appear as markers on map
- [ ] Tap a guard marker
- [ ] Verify guard card appears at bottom

**Expected Result**: ✅ Filters work correctly, map view functional

#### View Guard Profile
- [ ] Select a guard from list
- [ ] Verify guard detail page opens
- [ ] Check profile photo gallery (swipe through)
- [ ] Verify height/weight displayed
- [ ] Verify certifications/licenses shown
- [ ] Check languages list
- [ ] View ratings and reviews
- [ ] Check availability calendar
- [ ] Verify hourly rate displayed
- [ ] Scroll through all sections

**Expected Result**: ✅ Complete guard profile visible with all details

#### Build Quote for Cross-City Job
- [ ] Tap "Book Now" on guard profile
- [ ] Select Protection Type: "Armed"
- [ ] Select Vehicle Type: "Armored"
- [ ] Select Dress Code: "Suit"
- [ ] Set Number of Protectors: 2
- [ ] Set Number of Protectees: 1
- [ ] Set Duration: 6 hours
- [ ] Select Date: Tomorrow
- [ ] Select Time: 10:00 AM
- [ ] Enter Pickup Address: Different city (e.g., "Guadalajara, Mexico")
- [ ] Show map and verify location
- [ ] Enter Destination: Another address in same city
- [ ] Add 2 route stops (optional)
- [ ] Verify price breakdown shows:
  - Base rate calculation
  - Armed protection surcharge (+30%)
  - Armored vehicle surcharge (+50%)
  - Processing fee
  - Total in MXN
- [ ] Verify NO platform cut or guard payout shown to client

**Expected Result**: ✅ Quote built correctly, price breakdown accurate, only total shown

#### Payment with New Card
- [ ] Tap "Proceed to Payment"
- [ ] Verify payment sheet opens
- [ ] Verify amount matches quote
- [ ] Select "Add New Card"
- [ ] Enter test card: 4111 1111 1111 1111
- [ ] Enter expiry: 12/25
- [ ] Enter CVV: 123
- [ ] Enter ZIP: 12345
- [ ] Check "Save card for future use"
- [ ] Submit payment
- [ ] Verify payment processing indicator
- [ ] Verify success message
- [ ] Verify redirect to booking detail page
- [ ] Navigate to Profile → Payment Methods
- [ ] Verify card saved (last 4 digits: 1111)
- [ ] Verify card marked as default

**Expected Result**: ✅ Payment successful, card saved, booking created

#### Before T-10 Behavior
- [ ] View booking detail page
- [ ] Verify status: "Pending" or "Accepted"
- [ ] Verify NO map shown
- [ ] Verify ETA countdown displayed
- [ ] Verify "Guard will be trackable at T-10 minutes" message
- [ ] Check booking details are correct
- [ ] Verify chat button available
- [ ] Test sending a message to guard
- [ ] Verify message delivered

**Expected Result**: ✅ No map before T-10, ETA shown, chat works

#### At T-10 Behavior
- [ ] Wait until T-10 minutes (or manually adjust booking time for testing)
- [ ] Verify map automatically appears
- [ ] Verify guard location marker visible
- [ ] Verify guard's real-time location updates
- [ ] Verify route line drawn from guard to pickup
- [ ] Verify ETA updates dynamically
- [ ] Verify "Guard is on the way" status

**Expected Result**: ✅ Map appears at T-10, guard location tracked

#### Enter Start Code
- [ ] Guard arrives at pickup location
- [ ] Guard shows start code to client
- [ ] Client enters start code in app
- [ ] Verify code validation
- [ ] Test wrong code (should show error)
- [ ] Test rate limiting (3 attempts max)
- [ ] Enter correct code
- [ ] Verify "Service Started" status
- [ ] Verify tracking begins
- [ ] Verify timer starts counting

**Expected Result**: ✅ Start code validated, service begins, tracking active

#### Extend Service
- [ ] During active service, tap "Extend Service"
- [ ] Select additional 30 minutes
- [ ] Verify new total calculated
- [ ] Verify extension doesn't exceed 8-hour cap
- [ ] Confirm extension
- [ ] Verify payment processed with saved card
- [ ] Verify new end time displayed
- [ ] Verify timer updated

**Expected Result**: ✅ Service extended, payment processed, 8-hour cap enforced

#### Complete & Rate
- [ ] Service reaches end time
- [ ] Verify "Service Completed" status
- [ ] Verify rating prompt appears
- [ ] Rate guard: 5 stars overall
- [ ] Rate breakdown:
  - Professionalism: 5 stars
  - Punctuality: 5 stars
  - Communication: 5 stars
  - Language: 5 stars
- [ ] Write review: "Excellent service!"
- [ ] Submit rating
- [ ] Verify rating submitted successfully
- [ ] Navigate to booking history
- [ ] Verify booking shows as completed
- [ ] Verify rating displayed

**Expected Result**: ✅ Service completed, rating submitted

#### View Billing
- [ ] Navigate to Profile → Billing History
- [ ] Find completed booking
- [ ] Tap to view receipt
- [ ] Verify shows:
  - Total amount in MXN only
  - Date and time
  - Guard name
  - Service duration
  - Breakdown of charges
- [ ] Verify NO fees or platform cuts shown
- [ ] Verify NO guard payout shown
- [ ] Download/share receipt
- [ ] Verify receipt format correct

**Expected Result**: ✅ Billing shows MXN total only, no internal fees visible

---

### 5.1.2 Instant Job (Quick Flow)

#### Book Instant Job
- [ ] Navigate to Home
- [ ] Tap "Book Instant Job" or select guard
- [ ] Select "Instant" booking type
- [ ] Set minimal options (unarmed, standard vehicle)
- [ ] Set duration: 2 hours
- [ ] Enter current location as pickup
- [ ] Verify instant pricing shown
- [ ] Tap "Book Now"

**Expected Result**: ✅ Instant booking created

#### Pay with Saved Card (One-Tap)
- [ ] Verify payment sheet shows saved card
- [ ] Verify card is pre-selected
- [ ] Tap "Pay with •••• 1111"
- [ ] Verify no additional card entry required
- [ ] Verify payment processes immediately
- [ ] Verify booking confirmed

**Expected Result**: ✅ One-tap payment successful

#### No Map Until Start Code
- [ ] View booking detail
- [ ] Verify NO map shown initially
- [ ] Verify "Waiting for guard to arrive" message
- [ ] Wait for guard acceptance
- [ ] Verify still no map until start code

**Expected Result**: ✅ Map hidden until start code entered

#### Enter Start Code & Track
- [ ] Guard arrives and shows code
- [ ] Enter start code
- [ ] Verify map appears immediately
- [ ] Verify guard location tracked
- [ ] Verify service timer starts
- [ ] Monitor location updates

**Expected Result**: ✅ Map appears after code, tracking works

#### Complete & Rate
- [ ] Service completes
- [ ] Rate guard
- [ ] Verify rating submitted
- [ ] Check billing

**Expected Result**: ✅ Instant job completed successfully

---

## Task 5.2: Guard Flow Testing ⏱️ 3 hours

### 5.2.1 Freelance Guard Flow

#### Sign Up as Guard
- [ ] Navigate to sign-up
- [ ] Fill in all fields
- [ ] Select "Guard" role
- [ ] Accept all terms
- [ ] Submit and verify email
- [ ] Sign in as new guard

**Expected Result**: ✅ Guard account created

#### Upload All Documents
- [ ] Navigate to Profile → Documents
- [ ] Upload government ID (front & back)
- [ ] Upload security license
- [ ] Upload firearms license (if armed)
- [ ] Upload driver's license
- [ ] Upload vehicle registration
- [ ] Upload insurance documents
- [ ] Upload 3 outfit photos:
  - Suit
  - Business casual
  - Tactical gear
- [ ] Upload vehicle photos (3 angles)
- [ ] Submit all for approval
- [ ] Verify "Pending Approval" status

**Expected Result**: ✅ All documents uploaded

#### Admin Approval
- [ ] Sign in as admin@demo.com
- [ ] Navigate to Admin KYC
- [ ] Find pending guard
- [ ] Review all documents
- [ ] Verify photo quality
- [ ] Approve all documents
- [ ] Sign back in as guard
- [ ] Verify "Approved" status

**Expected Result**: ✅ Guard KYC approved

#### Set Availability & Rate
- [ ] Navigate to Profile → Availability
- [ ] Set hourly rate: $50/hr
- [ ] Set available days: Mon-Fri
- [ ] Set available hours: 8 AM - 8 PM
- [ ] Set service radius: 50 miles
- [ ] Enable instant bookings
- [ ] Save settings
- [ ] Verify settings saved

**Expected Result**: ✅ Availability configured

#### See Pending Job
- [ ] Navigate to Home (Guard view)
- [ ] Verify "Available Jobs" section
- [ ] Verify pending job appears
- [ ] Check job details:
  - Date and time
  - Location
  - Duration
  - Protection type
  - Vehicle type
  - Payout amount (net MXN)
- [ ] Verify payout calculation correct

**Expected Result**: ✅ Pending jobs visible with correct payout

#### Accept Job
- [ ] Tap on pending job
- [ ] Review full job details
- [ ] Verify client information (name only, no contact)
- [ ] Tap "Accept Job"
- [ ] Verify confirmation dialog
- [ ] Confirm acceptance
- [ ] Verify job moves to "Accepted" status
- [ ] Verify client receives notification
- [ ] Verify job details accessible

**Expected Result**: ✅ Job accepted, client notified

#### Show Start Code to Client
- [ ] Navigate to accepted booking
- [ ] Verify start code displayed prominently
- [ ] Verify code is 6 digits
- [ ] Show code to client (in person or via chat)
- [ ] Wait for client to enter code
- [ ] Verify service starts when code validated
- [ ] Verify "Service Active" status

**Expected Result**: ✅ Start code shown, service begins

#### Track Location
- [ ] Verify location tracking active
- [ ] Check location permissions granted
- [ ] Verify location updates every 10 seconds
- [ ] Move around and verify updates
- [ ] Verify client can see location
- [ ] Check battery usage is reasonable

**Expected Result**: ✅ Location tracked accurately

#### Chat with Client (Test Translation)
- [ ] Open chat from booking detail
- [ ] Send message in English: "Hello, I'm on my way"
- [ ] Verify message sent
- [ ] Client responds in Spanish: "Gracias"
- [ ] Verify translation appears
- [ ] Send message with special characters
- [ ] Test typing indicators
- [ ] Verify real-time delivery

**Expected Result**: ✅ Chat works, translation functional

#### Complete Job
- [ ] Service reaches end time
- [ ] Tap "Complete Service"
- [ ] Verify completion confirmation
- [ ] Verify status changes to "Completed"
- [ ] Verify client prompted to rate
- [ ] Wait for client rating
- [ ] Verify rating received

**Expected Result**: ✅ Job completed successfully

#### View Payout
- [ ] Navigate to Profile → Earnings
- [ ] Find completed job
- [ ] Verify payout amount (net MXN only)
- [ ] Verify NO platform cut shown
- [ ] Verify NO processing fees shown
- [ ] Verify payout breakdown:
  - Base earnings
  - Bonuses (if any)
  - Total net payout
- [ ] Check payout schedule
- [ ] Verify bank account info

**Expected Result**: ✅ Payout shows net MXN only, no internal fees

---

### 5.2.2 Company Guard Flow

#### Company Assigns Job
- [ ] Sign in as company@demo.com
- [ ] Navigate to Company Guards tab
- [ ] View roster of company guards
- [ ] Select a guard
- [ ] Tap "Assign Job"
- [ ] Select pending booking
- [ ] Confirm assignment
- [ ] Verify guard receives notification

**Expected Result**: ✅ Job assigned to company guard

#### Guard Accepts
- [ ] Sign in as assigned guard
- [ ] View assigned job notification
- [ ] Review job details
- [ ] Accept assignment
- [ ] Verify company notified

**Expected Result**: ✅ Company guard accepts job

#### Complete Flow
- [ ] Follow same flow as freelance guard
- [ ] Complete service
- [ ] Verify completion

**Expected Result**: ✅ Service completed

#### Verify Payout Based on Company Toggle
- [ ] Sign in as company@demo.com
- [ ] Navigate to Settings
- [ ] Check "Payout Method" toggle
- [ ] If "Company Pays Guards":
  - [ ] Verify guard sees "Paid by Company"
  - [ ] Verify no payout amount shown to guard
  - [ ] Verify company sees full payout
- [ ] If "Platform Pays Guards":
  - [ ] Verify guard sees net payout
  - [ ] Verify company sees commission
- [ ] Toggle setting and verify changes

**Expected Result**: ✅ Payout method respected

---

## Task 5.3: Company Flow Testing ⏱️ 2 hours

### Sign In as Company
- [ ] Sign in as company@demo.com
- [ ] Verify company dashboard loads
- [ ] Verify company-specific tabs visible

**Expected Result**: ✅ Company logged in

### Import CSV Roster
- [ ] Navigate to Company Guards tab
- [ ] Tap "Import Roster"
- [ ] Select CSV file with guard data
- [ ] Verify CSV format validation
- [ ] Upload file
- [ ] Verify guards imported
- [ ] Check guard profiles created
- [ ] Verify all fields populated correctly

**Expected Result**: ✅ Roster imported successfully

### Approve Guard Documents
- [ ] View roster list
- [ ] Select guard with pending documents
- [ ] Review uploaded documents
- [ ] Approve or reject each document
- [ ] Add notes if rejecting
- [ ] Submit approval
- [ ] Verify guard notified

**Expected Result**: ✅ Document approval works

### Assign Roster Guard to Booking
- [ ] View pending bookings
- [ ] Select a booking
- [ ] Tap "Assign Guard"
- [ ] View available roster guards
- [ ] Filter by qualifications
- [ ] Select guard
- [ ] Confirm assignment
- [ ] Verify guard notified

**Expected Result**: ✅ Guard assigned to booking

### Reassign Guard
- [ ] View active booking
- [ ] Tap "Reassign Guard"
- [ ] Select new guard
- [ ] Submit reassignment request
- [ ] Verify client approval required
- [ ] Sign in as client
- [ ] Review reassignment request
- [ ] Approve or reject
- [ ] Verify reassignment processed

**Expected Result**: ✅ Reassignment requires client approval

### View Payments
- [ ] Navigate to Payments tab
- [ ] View payment history
- [ ] Verify shows:
  - Total bookings revenue
  - Company commission (if applicable)
  - Guard payouts (if company pays)
- [ ] Verify NO platform fees shown
- [ ] Verify NO processing fees shown
- [ ] Filter by date range
- [ ] Export to CSV

**Expected Result**: ✅ Payments visible, no internal fees shown

### Toggle Payout Method
- [ ] Navigate to Settings
- [ ] Find "Payout Method" toggle
- [ ] Current: "Platform Pays Guards"
- [ ] Toggle to "Company Pays Guards"
- [ ] Verify confirmation dialog
- [ ] Confirm change
- [ ] Verify setting saved
- [ ] Create test booking
- [ ] Verify payout method applied
- [ ] Toggle back and verify

**Expected Result**: ✅ Payout toggle works correctly

### Verify Can't See Freelancers
- [ ] Navigate to Guards list
- [ ] Verify only company roster guards shown
- [ ] Verify no freelance guards visible
- [ ] Search for freelance guard by name
- [ ] Verify no results
- [ ] Verify company can't assign freelancers

**Expected Result**: ✅ Company isolated from freelancers

---

## Task 5.4: Admin Flow Testing ⏱️ 2 hours

### Approve Client KYC
- [ ] Sign in as admin@demo.com
- [ ] Navigate to Admin KYC tab
- [ ] Filter by "Clients"
- [ ] Select pending client
- [ ] Review ID documents (front & back)
- [ ] Verify photo quality
- [ ] Verify information matches
- [ ] Approve KYC
- [ ] Verify client notified
- [ ] Verify client status updated

**Expected Result**: ✅ Client KYC approved

### Approve Guard KYC
- [ ] Filter by "Guards"
- [ ] Select pending guard
- [ ] Review all documents:
  - Government ID
  - Security license
  - Firearms license
  - Driver's license
  - Vehicle registration
  - Insurance
  - Outfit photos (3)
  - Vehicle photos (3)
- [ ] Verify all documents valid
- [ ] Approve all documents
- [ ] Verify guard notified
- [ ] Verify guard can now accept jobs

**Expected Result**: ✅ Guard KYC approved

### Approve Company KYC
- [ ] Filter by "Companies"
- [ ] Select pending company
- [ ] Review company documents:
  - Business registration
  - Tax ID
  - Insurance certificate
  - Owner ID
- [ ] Verify documents valid
- [ ] Approve company
- [ ] Verify company notified
- [ ] Verify company can now operate

**Expected Result**: ✅ Company KYC approved

### Freeze/Unfreeze User
- [ ] Navigate to Admin Users tab
- [ ] Select a user
- [ ] Tap "Freeze Account"
- [ ] Enter reason: "Suspicious activity"
- [ ] Confirm freeze
- [ ] Verify user account frozen
- [ ] Sign in as frozen user
- [ ] Verify login blocked with message
- [ ] Sign back in as admin
- [ ] Tap "Unfreeze Account"
- [ ] Verify user can log in again

**Expected Result**: ✅ Freeze/unfreeze works

### Issue Full Refund
- [ ] Navigate to Admin Refunds tab
- [ ] Select completed booking
- [ ] Tap "Issue Refund"
- [ ] Select "Full Refund"
- [ ] Enter reason: "Service quality issue"
- [ ] Confirm refund
- [ ] Verify refund processed
- [ ] Verify client receives refund
- [ ] Verify guard payout adjusted
- [ ] Verify booking status updated

**Expected Result**: ✅ Full refund processed

### Issue Partial Refund
- [ ] Select another booking
- [ ] Tap "Issue Refund"
- [ ] Select "Partial Refund"
- [ ] Enter amount: 50% of total
- [ ] Enter reason: "Service ended early"
- [ ] Confirm refund
- [ ] Verify partial refund processed
- [ ] Verify amounts adjusted correctly

**Expected Result**: ✅ Partial refund processed

### View Ledger
- [ ] Navigate to Admin Analytics tab
- [ ] View financial ledger
- [ ] Verify shows:
  - Total bookings revenue
  - Processing fees collected
  - Platform cuts collected
  - Guard payouts
  - Net platform revenue
  - Refunds issued
- [ ] Verify all fees and cuts visible (admin only)
- [ ] Filter by date range
- [ ] Verify calculations accurate
- [ ] Check month-over-month comparison

**Expected Result**: ✅ Full ledger visible with all fees

### Export CSV
- [ ] Tap "Export Data"
- [ ] Select date range
- [ ] Select data type: "All Transactions"
- [ ] Tap "Export"
- [ ] Verify CSV downloads
- [ ] Open CSV file
- [ ] Verify all columns present:
  - Booking ID
  - Date
  - Client
  - Guard
  - Amount
  - Fees
  - Platform cut
  - Guard payout
  - Status
- [ ] Verify data accurate

**Expected Result**: ✅ CSV export works

### Trigger PANIC Test
- [ ] Sign in as client on test device
- [ ] Navigate to active booking
- [ ] Tap "PANIC" button
- [ ] Verify confirmation dialog
- [ ] Confirm panic alert
- [ ] Sign in as admin
- [ ] Verify admin console alert appears
- [ ] Verify alert shows:
  - Client name
  - Location
  - Booking details
  - Timestamp
- [ ] Verify alert is prominent (red, flashing)

**Expected Result**: ✅ Panic alert received

### Resolve PANIC with Notes
- [ ] In admin console, tap on panic alert
- [ ] Review alert details
- [ ] Tap "Resolve"
- [ ] Enter resolution notes: "False alarm, client confirmed safe"
- [ ] Attach any relevant info
- [ ] Submit resolution
- [ ] Verify alert marked as resolved
- [ ] Verify client notified
- [ ] Verify notes saved to booking

**Expected Result**: ✅ Panic resolved with notes

---

## Task 5.5: Negative Testing ⏱️ 2 hours

### Wrong Start Code (Rate Limiting)
- [ ] Create active booking
- [ ] Enter wrong start code: "000000"
- [ ] Verify error message: "Invalid code"
- [ ] Enter wrong code again: "111111"
- [ ] Verify error message
- [ ] Enter wrong code third time: "222222"
- [ ] Verify error message
- [ ] Try fourth attempt
- [ ] Verify rate limit error: "Too many attempts. Try again in 5 minutes"
- [ ] Wait 5 minutes
- [ ] Verify can try again
- [ ] Enter correct code
- [ ] Verify service starts

**Expected Result**: ✅ Rate limiting works (3 attempts, 5-minute cooldown)

### Payment Decline → Recovery
- [ ] Create booking
- [ ] Enter declined test card: 4000 0000 0000 0002
- [ ] Submit payment
- [ ] Verify decline error message
- [ ] Verify booking status: "Payment Failed"
- [ ] Tap "Retry Payment"
- [ ] Enter valid card: 4111 1111 1111 1111
- [ ] Submit payment
- [ ] Verify payment succeeds
- [ ] Verify booking status: "Confirmed"

**Expected Result**: ✅ Payment recovery works

### 3DS Required → Complete Flow
- [ ] Create booking
- [ ] Enter 3DS test card: 4000 0027 6000 3184
- [ ] Submit payment
- [ ] Verify 3DS challenge appears
- [ ] Complete 3DS authentication
- [ ] Verify payment succeeds
- [ ] Verify booking confirmed

**Expected Result**: ✅ 3DS flow works

### Permissions Denied → Helpful Guidance
- [ ] Deny location permission
- [ ] Try to create booking
- [ ] Verify helpful error: "Location permission required to book protection"
- [ ] Tap "Enable Location"
- [ ] Verify redirects to settings
- [ ] Enable permission
- [ ] Return to app
- [ ] Verify booking works
- [ ] Repeat for:
  - Camera permission (document upload)
  - Notification permission
  - Microphone permission (if voice chat)

**Expected Result**: ✅ Permission errors helpful, recovery smooth

### Poor Connectivity → Queued Messages
- [ ] Enable airplane mode
- [ ] Open active booking chat
- [ ] Send message: "Test message"
- [ ] Verify message shows "Sending..." status
- [ ] Disable airplane mode
- [ ] Verify message sends automatically
- [ ] Verify "Delivered" status appears
- [ ] Verify recipient receives message

**Expected Result**: ✅ Messages queued and sent when online

### Time Zone Skew → Verify T-10 Correct
- [ ] Change device time zone
- [ ] Create booking for specific time
- [ ] Verify T-10 countdown uses correct time zone
- [ ] Verify map appears at correct T-10 moment
- [ ] Change time zone again
- [ ] Verify countdown adjusts correctly

**Expected Result**: ✅ T-10 timing correct across time zones

### Duplicate Payment Taps → Idempotency
- [ ] Create booking
- [ ] Tap "Pay Now" rapidly 5 times
- [ ] Verify only one payment processed
- [ ] Verify no duplicate charges
- [ ] Check payment history
- [ ] Verify single transaction

**Expected Result**: ✅ Idempotency prevents duplicate charges

### Extend Beyond 8h → Error
- [ ] Create booking with 7 hours duration
- [ ] Start service
- [ ] Try to extend by 2 hours
- [ ] Verify error: "Cannot exceed 8-hour maximum"
- [ ] Try to extend by 1 hour
- [ ] Verify extension succeeds (total 8 hours)
- [ ] Try to extend again
- [ ] Verify error: "Maximum duration reached"

**Expected Result**: ✅ 8-hour cap enforced

### Cancel Completed Booking → Error
- [ ] View completed booking
- [ ] Tap "Cancel Booking"
- [ ] Verify error: "Cannot cancel completed booking"
- [ ] Verify cancel button disabled or hidden
- [ ] Verify refund option available instead

**Expected Result**: ✅ Cannot cancel completed bookings

---

## Phase 5 Deliverables

### Documentation
- [ ] All test cases executed
- [ ] Screenshots captured for each flow
- [ ] Screen recordings of critical flows
- [ ] Bug reports filed for any issues
- [ ] Test results documented

### Quality Metrics
- [ ] All happy paths work: ✅/❌
- [ ] All edge cases handled: ✅/❌
- [ ] All negative tests pass: ✅/❌
- [ ] Performance acceptable: ✅/❌
- [ ] UI/UX smooth: ✅/❌

### Sign-Off Checklist
- [ ] Client flow complete and verified
- [ ] Guard flow complete and verified
- [ ] Company flow complete and verified
- [ ] Admin flow complete and verified
- [ ] Negative testing complete
- [ ] All critical bugs fixed
- [ ] All documentation updated
- [ ] Ready for production deployment

---

## Bug Tracking Template

### Bug Report Format
```
**Bug ID**: BUG-001
**Severity**: Critical/High/Medium/Low
**Component**: [Auth/Booking/Payment/Chat/etc]
**User Role**: [Client/Guard/Company/Admin]
**Description**: [Clear description of the issue]
**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3
**Expected Result**: [What should happen]
**Actual Result**: [What actually happens]
**Screenshots**: [Attach screenshots]
**Device**: [iOS 17/Android 13/Web Chrome]
**Status**: Open/In Progress/Fixed/Closed
```

---

## Performance Benchmarks

### Target Metrics
- [ ] App launch time: < 3 seconds
- [ ] Screen transition: < 300ms
- [ ] API response time: < 1 second
- [ ] Map load time: < 2 seconds
- [ ] Payment processing: < 5 seconds
- [ ] Chat message delivery: < 500ms
- [ ] Location update frequency: Every 10 seconds
- [ ] Battery drain: < 5% per hour of tracking

### Actual Metrics
- App launch time: _____ seconds
- Screen transition: _____ ms
- API response time: _____ ms
- Map load time: _____ seconds
- Payment processing: _____ seconds
- Chat message delivery: _____ ms
- Location update frequency: _____ seconds
- Battery drain: _____ % per hour

---

## Security Checklist

- [ ] All API endpoints require authentication
- [ ] Role-based access control enforced
- [ ] Sensitive data encrypted at rest
- [ ] Sensitive data encrypted in transit (HTTPS)
- [ ] Payment data never stored locally
- [ ] PII access logged and audited
- [ ] Rate limiting on all endpoints
- [ ] Input validation on all forms
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Secure session management
- [ ] Password complexity enforced
- [ ] Account lockout after failed attempts
- [ ] Two-factor authentication available

---

## Accessibility Checklist

- [ ] Screen reader compatible
- [ ] Sufficient color contrast
- [ ] Touch targets ≥ 44x44 points
- [ ] Text scalable
- [ ] Keyboard navigation (web)
- [ ] Focus indicators visible
- [ ] Error messages clear and helpful
- [ ] Form labels associated correctly
- [ ] Alternative text for images
- [ ] Captions for videos

---

## Cross-Platform Testing

### iOS Testing
- [ ] iPhone 12 Pro (iOS 16)
- [ ] iPhone 14 Pro Max (iOS 17)
- [ ] iPad Pro (iPadOS 17)

### Android Testing
- [ ] Samsung Galaxy S21 (Android 12)
- [ ] Google Pixel 7 (Android 13)
- [ ] OnePlus 9 (Android 12)

### Web Testing
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)

### Screen Sizes
- [ ] Small phone (< 5.5")
- [ ] Medium phone (5.5" - 6.5")
- [ ] Large phone (> 6.5")
- [ ] Tablet (7" - 10")
- [ ] Desktop (1920x1080)

---

## Final Checklist

### Pre-Production
- [ ] All Phase 5 tests passed
- [ ] All critical bugs fixed
- [ ] All documentation complete
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Accessibility audit passed
- [ ] Cross-platform testing complete
- [ ] Stakeholder sign-off obtained

### Production Readiness
- [ ] Firebase production project configured
- [ ] Braintree production credentials added
- [ ] Environment variables set
- [ ] Analytics configured
- [ ] Error tracking configured (Sentry/etc)
- [ ] App store listings prepared
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Support email configured
- [ ] Monitoring dashboards set up

---

**Phase 5 Status**: 🚀 READY TO START
**Next Action**: Begin Task 5.1 - Client Flow Testing
**Estimated Completion**: 12 hours from start
