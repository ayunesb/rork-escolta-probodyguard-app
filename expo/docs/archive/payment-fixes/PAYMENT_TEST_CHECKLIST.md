# Payment System Test Checklist

## Automated Verification

### Run the Verification Script

```bash
npx ts-node scripts/verify-payment-system.ts
```

**Expected Result:** All checks should pass ✅

---

## Manual Testing

### Prerequisites

1. ✅ Backend server is running
2. ✅ Environment variables are set in `.env`
3. ✅ Braintree sandbox credentials are configured

### Start the App

```bash
npm start
```

Then press `w` for web (recommended for payment testing)

---

## Test Checklist

### 1. Environment Check ✅

- [ ] Run: `npx ts-node scripts/verify-payment-system.ts`
- [ ] All environment variables present
- [ ] Braintree connection successful
- [ ] Test payment processes successfully
- [ ] No security warnings about exposed keys

**Expected Output:**
```
✅ Passed: 15+
❌ Failed: 0
⚠️  Warnings: 0-2 (acceptable)
```

---

### 2. Web Payment Form ✅

Navigate to: **Home → Select Guard → Create Booking → Payment**

- [ ] Payment form loads without errors
- [ ] Card number field is visible and clickable
- [ ] Expiry date field is visible and clickable
- [ ] CVV field is visible and clickable
- [ ] Amount displays correctly
- [ ] Booking summary shows guard info

**Test Card:**
```
Card: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25
```

---

### 3. Payment Processing ✅

- [ ] Enter test card details
- [ ] Click "Pay" button
- [ ] Loading indicator shows
- [ ] Payment processes (5-10 seconds)
- [ ] Success alert appears
- [ ] Booking ID and start code shown
- [ ] Redirects to booking screen

**Console Output:**
Look for these logs in browser console:
```
[BraintreeService] Getting client token
[BraintreePaymentForm Web] Client token loaded
[BraintreePaymentForm Web] Tokenizing card
[BraintreePaymentForm Web] Processing payment
[Braintree] Processing checkout
[Braintree] Transaction successful
[BraintreePaymentForm Web] Payment successful
```

---

### 4. Backend Verification ✅

Check backend logs for:

- [ ] `[Braintree] Generating client token`
- [ ] `[Braintree] Client token generated successfully`
- [ ] `[Braintree] Processing checkout`
- [ ] `[Braintree] Transaction successful: {id}`
- [ ] `[Braintree] Payment record created: {id}`

---

### 5. Firebase Verification ✅

Check Firebase Console → Firestore → `payments` collection

- [ ] New payment document created
- [ ] Contains `transactionId`
- [ ] Contains `userId`
- [ ] Contains `amount` and `amountCents`
- [ ] Contains fee breakdown (platform, guard, company)
- [ ] Status is "submitted_for_settlement" or "settling"
- [ ] Timestamp is recent

**Document Structure:**
```json
{
  "transactionId": "abc123",
  "userId": "user_id",
  "bookingId": "booking_id",
  "amount": 100,
  "amountCents": 10000,
  "currency": "MXN",
  "status": "submitted_for_settlement",
  "platformFeeCents": 1500,
  "guardPayoutCents": 7000,
  "companyPayoutCents": 1500,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

### 6. Braintree Dashboard ✅

Login to: https://sandbox.braintreegateway.com

Navigate to: **Transactions**

- [ ] New transaction appears
- [ ] Amount matches ($10.00 or booking amount)
- [ ] Status is "Submitted for Settlement"
- [ ] Transaction ID matches Firebase record
- [ ] Payment method shows (Visa ending in 1111)

---

### 7. Error Handling ✅

Test error scenarios:

**Invalid Card:**
```
Card: 4000 0000 0000 0002
CVV: 123
Expiry: 12/25
```
- [ ] Shows error message
- [ ] Payment doesn't process
- [ ] User can retry

**Empty Fields:**
- [ ] Try to pay with empty card number
- [ ] Shows validation error
- [ ] Button disabled or error shown

**Network Error:**
- [ ] Stop backend server
- [ ] Try to make payment
- [ ] Shows network error
- [ ] User can retry when server is back

---

### 8. Mobile Testing (Optional) ⚠️

**Note:** Mobile uses mock flow in Expo Go

- [ ] Open app on mobile device (scan QR)
- [ ] Navigate to payment screen
- [ ] Info message shows about native module
- [ ] Can click "Pay" button
- [ ] Mock payment completes
- [ ] Success message appears

---

## Security Verification

### Check app.config.js

- [ ] No `BRAINTREE_PRIVATE_KEY` in extra section
- [ ] Only `braintreeEnv` is exposed
- [ ] No merchant credentials exposed

### Check .env

- [ ] `BRAINTREE_PRIVATE_KEY` is set (backend only)
- [ ] No `EXPO_PUBLIC_BRAINTREE_PRIVATE_KEY`
- [ ] Credentials are sandbox (for testing)

### Check Browser Network Tab

- [ ] Open DevTools → Network
- [ ] Filter for "braintree" or "checkout"
- [ ] Inspect request payloads
- [ ] Card details NOT visible in requests
- [ ] Only payment nonce is sent
- [ ] Private keys NOT in responses

---

## Performance Check

### Payment Speed

- [ ] Client token generation: < 2 seconds
- [ ] Card tokenization: < 3 seconds
- [ ] Payment processing: < 5 seconds
- [ ] Total flow: < 10 seconds

### Console Errors

- [ ] No React errors
- [ ] No TypeScript errors
- [ ] No CORS errors
- [ ] No CSP violations
- [ ] Braintree scripts load successfully

---

## Edge Cases

### Rapid Clicks

- [ ] Click "Pay" multiple times quickly
- [ ] Button disables after first click
- [ ] Only one payment processes
- [ ] Rate limiting prevents duplicates

### Page Reload

- [ ] Fill payment form
- [ ] Reload page
- [ ] Form resets correctly
- [ ] New client token generated
- [ ] Can complete payment

### Session Timeout

- [ ] Start payment flow
- [ ] Wait 30+ minutes (or clear auth token)
- [ ] Try to pay
- [ ] Shows authentication error
- [ ] Redirects to login

---

## Production Readiness (Future)

### Before Production Launch

- [ ] Switch BRAINTREE_ENV to "production"
- [ ] Update with production credentials
- [ ] Test with real small transaction ($0.50)
- [ ] Verify production transactions in Braintree
- [ ] Set up webhook notifications
- [ ] Configure production Firebase
- [ ] Enable App Check for production
- [ ] Set up monitoring and alerts
- [ ] Create mobile production build
- [ ] Install native Braintree modules
- [ ] Test on iOS physical device
- [ ] Test on Android physical device

---

## Sign-Off

### Date: ______________

### Tested By: ______________

### Test Results

| Category | Status | Notes |
|----------|--------|-------|
| Automated Verification | ⬜ Pass / ⬜ Fail | |
| Web Payment Form | ⬜ Pass / ⬜ Fail | |
| Payment Processing | ⬜ Pass / ⬜ Fail | |
| Backend Verification | ⬜ Pass / ⬜ Fail | |
| Firebase Verification | ⬜ Pass / ⬜ Fail | |
| Braintree Dashboard | ⬜ Pass / ⬜ Fail | |
| Error Handling | ⬜ Pass / ⬜ Fail | |
| Security Check | ⬜ Pass / ⬜ Fail | |

### Overall Status: ⬜ PASS / ⬜ FAIL

### Notes:
```
[Add any additional observations or issues here]
```

---

## Quick Commands Reference

```bash
# Run verification script
npx ts-node scripts/verify-payment-system.ts

# Start development server
npm start

# Open in web
# Press 'w' after npm start

# Check environment
node scripts/checkEnv.js

# View logs
# Backend: Terminal where npm start ran
# Frontend: Browser console (F12)

# Clear cache and restart
npm start -- --clear
```

---

## Troubleshooting Quick Fixes

### Payment form doesn't show
```bash
# Clear cache and restart
npm start -- --clear
```

### Client token error
```bash
# Verify credentials
npx ts-node scripts/verify-payment-system.ts
```

### Backend not responding
```bash
# Check if backend is running
# Should see: [Braintree] Gateway initialized
# If not, restart: npm start
```

### Braintree scripts blocked
```bash
# Check browser console for CSP errors
# Verify app.config.js has Braintree domains
```

---

## Success Criteria

✅ Payment system is working if:

1. Automated verification passes all checks
2. Web payment form loads and accepts input
3. Test payment processes successfully
4. Transaction appears in Braintree dashboard
5. Payment record created in Firebase
6. No security warnings or exposed credentials
7. Error handling works for invalid inputs
8. Console shows no critical errors

---

## Support Resources

- **Braintree Sandbox:** https://sandbox.braintreegateway.com
- **Braintree Docs:** https://developer.paypal.com/braintree/docs
- **Test Cards:** https://developer.paypal.com/braintree/docs/reference/general/testing
- **Firebase Console:** https://console.firebase.google.com
- **Verification Script:** `npx ts-node scripts/verify-payment-system.ts`
- **Guide:** See `PAYMENT_VERIFICATION_GUIDE.md`
