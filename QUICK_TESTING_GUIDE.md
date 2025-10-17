# 🚀 Quick Testing Guide - Payment System
**Date:** October 16, 2025  
**Status:** ✅ READY TO TEST

---

## ✅ Automated Tests - PASSED

All automated backend tests have passed successfully:
- ✅ Firebase Functions running
- ✅ Firestore running
- ✅ Authentication service running
- ✅ Storage service running
- ✅ Client token generation working
- ✅ Hosted payment form accessible
- ✅ Environment variables configured
- ✅ Firestore connection verified

---

## 🧪 Manual Testing Steps

### Step 1: Start the App

The backend is already running! Just start the frontend:

```bash
# Start the Expo app
bun run start
```

Or if you prefer:
```bash
npx expo start --tunnel
```

### Step 2: Test Payment Flow

#### Option A: Browser Testing (Quick Test)

Open this URL in your browser to test the payment form directly:

```
http://127.0.0.1:5001/escolta-pro-fe90e/us-central1/api/payments/hosted-form?clientToken=PASTE_TOKEN_HERE&amount=100
```

To get a fresh token, run:
```bash
curl http://127.0.0.1:5001/escolta-pro-fe90e/us-central1/api/payments/client-token | jq -r '.clientToken'
```

**Test Card Details:**
```
Card Number: 4111 1111 1111 1111
Expiry Date: 12/25
CVV: 123
Postal Code: 12345
```

#### Option B: Full App Testing

1. **Launch the App**
   - Scan QR code with Expo Go (mobile)
   - Or press `w` for web browser

2. **Sign In / Sign Up**
   - Create a test account or use existing

3. **Browse Guards**
   - Navigate to Guards tab
   - Select any guard

4. **Create Booking**
   - Fill in booking details:
     - Date: Tomorrow
     - Time: Any time
     - Duration: 4 hours
     - Protection Type: Armed
     - Vehicle Type: Standard
     - Dress Code: Business Casual

5. **Proceed to Payment**
   - Click "Continue to Payment"
   - You'll see the PaymentSheet modal

6. **Enter Payment Details**
   - Use test card: `4111 1111 1111 1111`
   - Expiry: `12/25`
   - CVV: `123`
   - Zip: `12345`

7. **Submit Payment**
   - Click "Pay" button
   - Wait for processing
   - Should see success message with start code

8. **Verify Booking**
   - Check booking appears in "Active Bookings"
   - Verify start code is displayed
   - Confirm amount charged is correct

---

## 🧪 Test Scenarios

### Scenario 1: Successful Payment ✅
**Card:** 4111 1111 1111 1111  
**Expected:** Payment succeeds, booking created, start code generated

### Scenario 2: Card Declined ❌
**Card:** 4000 0000 0000 0002  
**Expected:** Payment fails, error message shown, no booking created

### Scenario 3: 3D Secure Required 🔒
**Card:** 4000 0000 0000 3220  
**Expected:** 3D Secure challenge appears, complete authentication

### Scenario 4: Insufficient Funds 💳
**Card:** 4000 0000 0000 9995  
**Expected:** Payment fails with "Insufficient funds" error

### Scenario 5: Save Card for Later 💾
**Card:** 4111 1111 1111 1111  
**Action:** Check "Save card" before paying  
**Expected:** Card saved to user's account, visible in payment methods

---

## 📊 What to Check

### During Payment
- [ ] Loading spinner shows while processing
- [ ] Form validation works (invalid card number rejected)
- [ ] Error messages are clear and helpful
- [ ] Payment sheet can be cancelled
- [ ] Amount displayed is correct

### After Successful Payment
- [ ] Success message appears
- [ ] Start code is generated (6 digits)
- [ ] Booking appears in "Active Bookings"
- [ ] Payment record created in Firestore
- [ ] Notification sent (if implemented)
- [ ] User redirected to booking details

### After Failed Payment
- [ ] Error message is clear
- [ ] User can retry payment
- [ ] No booking created
- [ ] No charge made
- [ ] Form resets properly

---

## 🔍 Debugging

### Check Console Logs

**Frontend logs to look for:**
```
[PaymentSheet] Loading payment sheet for user: ...
[Payment] Requesting client token for user: ...
[Payment] Client token received
[Payment] Processing payment: ...
[Payment] Payment successful: ...
```

**Backend logs to look for:**
```
[Braintree] Generating client token for customer: ...
[Braintree] Client token generated successfully
[Braintree] Processing checkout: ...
[Braintree] Transaction successful: ...
[Braintree] Payment record created: ...
```

### Check Firestore

1. Open Firebase Console or emulator UI
2. Navigate to Collections
3. Check `payments` collection for new records
4. Verify fields:
   - `transactionId`
   - `userId`
   - `bookingId`
   - `amount`
   - `status`
   - `createdAt`

### Check Braintree Dashboard

1. Go to: https://sandbox.braintreegateway.com/
2. Login with your credentials
3. Navigate to Transactions
4. Verify test transactions appear

---

## 🚨 Common Issues

### Issue: "Failed to get client token"
**Solution:** Check Firebase Functions are running:
```bash
ps aux | grep firebase
```

### Issue: "Payment processing failed"
**Solution:** Check Braintree credentials in `.env`:
```bash
grep BRAINTREE .env
```

### Issue: "API endpoint returned HTML"
**Solution:** Restart Expo dev server:
```bash
pkill -f expo
bun run start
```

### Issue: Payment succeeds but no booking created
**Solution:** Check Firestore rules and permissions:
```bash
cat firestore.rules
```

---

## 📈 Performance Benchmarks

**Expected Response Times:**
- Client token generation: < 500ms
- Payment processing: < 2s
- Firestore write: < 300ms
- Total payment flow: < 3s

**Monitor these in console:**
```javascript
// Example timing logs
[Payment] Client token received (450ms)
[Payment] Payment successful (1.8s)
[Firestore] Payment record created (250ms)
```

---

## ✅ Test Completion Checklist

### Basic Tests
- [ ] Get client token successfully
- [ ] Open payment form
- [ ] Enter valid card details
- [ ] Submit payment
- [ ] Receive success confirmation
- [ ] Verify booking created

### Advanced Tests
- [ ] Test card decline handling
- [ ] Test 3D Secure flow
- [ ] Test saved card payment
- [ ] Test payment retry after failure
- [ ] Test cancelling payment
- [ ] Test with different amounts
- [ ] Test with different currencies (if supported)

### Edge Cases
- [ ] Test with very large amounts
- [ ] Test with minimum amounts
- [ ] Test rapid multiple payments (idempotency)
- [ ] Test with poor network connection
- [ ] Test with invalid tokens
- [ ] Test with expired cards

---

## 📞 Next Steps After Testing

1. **Document Issues Found**
   - Create tickets for bugs
   - Note UX improvements
   - List feature requests

2. **Update Documentation**
   - Add screenshots
   - Document new flows
   - Update troubleshooting guide

3. **Prepare for Production**
   - Switch to production Braintree credentials
   - Update Firebase project
   - Configure monitoring
   - Set up alerts

---

## 📚 Additional Resources

- **Full Audit Report:** `COMPREHENSIVE_AUDIT_OCTOBER_2025.md`
- **Test Script:** `test-payment-system.sh`
- **Phase 5 Testing:** `PHASE_5_TESTING_PLAN.md`
- **Current Status:** `CURRENT_STATUS.md`
- **Troubleshooting:** `TROUBLESHOOTING_GUIDE.md`

---

## 🎯 Success Criteria

Payment system is considered **production-ready** when:

✅ All test scenarios pass  
✅ No critical bugs found  
✅ Response times within benchmarks  
✅ Error handling is robust  
✅ User experience is smooth  
✅ Security is verified  
✅ Documentation is complete  

---

**Ready to test?** Run:
```bash
bun run start
```

**Questions?** Check the full audit report or troubleshooting guide.

**Good luck! 🚀**
