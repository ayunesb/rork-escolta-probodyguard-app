# 🚀 Test Stripe Integration NOW

## ⚡ Quick Start (5 minutes)

### Step 1: Get Your Stripe Keys (2 min)

1. Open: https://dashboard.stripe.com/test/apikeys
2. Make sure **TEST MODE** is ON (toggle in top right)
3. Copy both keys:
   - **Publishable key**: Starts with `pk_test_`
   - **Secret key**: Starts with `sk_test_` (click "Reveal test key")

### Step 2: Update .env File (1 min)

Open `.env` in your project root and update these lines:

```env
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

**Important**: Replace `YOUR_KEY_HERE` with your actual keys!

### Step 3: Restart the App (1 min)

Stop the current server (Ctrl+C) and restart:

```bash
bun run start
```

### Step 4: Test API Connection (30 sec)

In a new terminal, run:

```bash
bun run scripts/test-stripe.ts
```

You should see:
```
✅ Payment Intent Created: pi_xxxxx
✅ Payment Intent Retrieved: pi_xxxxx
✅ Payment Intent Canceled: pi_xxxxx
✅ All Stripe tests passed!
```

### Step 5: Test in App (1 min)

1. Open the app (scan QR code or open in browser)
2. Sign in:
   - Email: `client@test.com`
   - Password: `Test123!`
3. Tap any guard → "Book Now"
4. Fill booking details:
   - Select date/time
   - Choose duration (e.g., 4 hours)
   - Select vehicle type
   - Select protection type
   - Tap "Continue to Payment"
5. Enter test card:
   - **Card**: `4242 4242 4242 4242`
   - **Expiry**: `12/25`
   - **CVV**: `123`
   - **Name**: `Test User`
6. Tap "Pay $XXX.XX"
7. Wait for success message with start code!

### Step 6: Verify in Stripe (30 sec)

1. Open: https://dashboard.stripe.com/test/payments
2. You should see your payment!
3. Click on it to see details:
   - Amount
   - Status: "Succeeded"
   - Metadata: booking ID

---

## ✅ Success Checklist

After completing the steps above, verify:

- [ ] Test script passes without errors
- [ ] App shows payment form
- [ ] Can enter card details
- [ ] Payment processes successfully
- [ ] Booking confirmation appears
- [ ] Start code is generated (6 digits)
- [ ] Payment appears in Stripe Dashboard
- [ ] Booking appears in "Bookings" tab

---

## 🎯 What You're Testing

### Payment Flow
1. **Create Payment Intent**: Backend creates intent with Stripe
2. **Show Payment Form**: User enters card details
3. **Process Payment**: Stripe charges the card
4. **Create Booking**: If payment succeeds, booking is created
5. **Generate Start Code**: 6-digit code for guard to start service

### Price Calculation
- Base rate × hours = Subtotal
- + Vehicle fee (if armored: +25%)
- + Protection fee (if armed: +15%)
- + Platform fee (10% of total)
- = Final amount

### Example Booking
- Guard: $50/hour
- Duration: 4 hours
- Vehicle: Armored
- Protection: Armed
- **Total**: ~$308

---

## 💳 Test Cards Reference

### ✅ Successful Payments
```
4242 4242 4242 4242  (Visa)
5555 5555 5555 4444  (Mastercard)
3782 822463 10005    (Amex)
```

### ❌ Failed Payments
```
4000 0000 0000 0002  (Declined)
4000 0000 0000 9995  (Insufficient funds)
4000 0000 0000 0069  (Expired card)
```

### 🔐 3D Secure
```
4000 0027 6000 3184  (Requires authentication)
```

**For all cards**:
- Expiry: Any future date (e.g., `12/25`)
- CVV: Any 3 digits (e.g., `123`)
- Name: Any name

---

## 🐛 Troubleshooting

### Problem: "Invalid API Key"
**Solution**: 
1. Check `.env` file has correct keys
2. Keys should start with `pk_test_` and `sk_test_`
3. Restart the app

### Problem: "Mock Mode" in logs
**Solution**: 
1. Stripe keys not configured properly
2. Update `.env` with real test keys
3. Restart the app

### Problem: Payment fails
**Solution**: 
1. Use test card: `4242 4242 4242 4242`
2. Check internet connection
3. Verify backend is running
4. Check console for error details

### Problem: Booking not created
**Solution**: 
1. Check Firebase connection
2. Verify Firestore rules
3. Check backend logs
4. Ensure payment succeeded first

---

## 📊 Where to Check Results

### In the App
- **Bookings Tab**: See all your bookings
- **Active Booking**: View booking details, track guard, chat
- **Profile**: View payment history

### In Stripe Dashboard
- **Payments**: https://dashboard.stripe.com/test/payments
- **Customers**: https://dashboard.stripe.com/test/customers
- **Logs**: https://dashboard.stripe.com/test/logs

### In Firebase Console
- **Firestore**: Check `bookings` collection
- **Authentication**: Verify user exists

---

## 🎬 Video Walkthrough (Text Version)

### Recording 1: Setup (2 min)
1. Show Stripe Dashboard
2. Copy test keys
3. Update .env file
4. Restart app
5. Run test script

### Recording 2: Payment Flow (3 min)
1. Open app
2. Sign in
3. Select guard
4. Fill booking details
5. Enter payment info
6. Complete payment
7. Show success message
8. Show booking in app

### Recording 3: Verification (1 min)
1. Open Stripe Dashboard
2. Show payment
3. Show metadata
4. Show amount

---

## 📝 Test Report Template

After testing, document your results:

```
Date: [DATE]
Tester: [YOUR NAME]

✅ Setup Complete
- Stripe keys configured: YES/NO
- Test script passed: YES/NO
- App restarted: YES/NO

✅ Payment Test
- Card accepted: YES/NO
- Payment processed: YES/NO
- Amount correct: YES/NO
- Booking created: YES/NO
- Start code generated: YES/NO

✅ Stripe Dashboard
- Payment visible: YES/NO
- Amount matches: YES/NO
- Metadata correct: YES/NO
- Status succeeded: YES/NO

✅ Error Handling
- Invalid card rejected: YES/NO
- Error message shown: YES/NO
- Can retry payment: YES/NO

Issues Found:
[LIST ANY ISSUES]

Screenshots:
[ATTACH SCREENSHOTS]
```

---

## 🚀 Next Steps After Testing

### If Everything Works ✅
1. Test with different card numbers
2. Test failed payment scenarios
3. Test refund flow (admin)
4. Test on different devices
5. Test on web and mobile

### If Issues Found ❌
1. Check console logs
2. Verify all environment variables
3. Check Firebase connection
4. Review error messages
5. Check Stripe Dashboard logs

---

## 📞 Need Help?

### Check These First
1. `STRIPE_TESTING_GUIDE.md` - Detailed testing guide
2. `STRIPE_FLOW_DIAGRAM.md` - Visual flow diagrams
3. `STRIPE_TEST_SUMMARY.md` - Implementation summary
4. Console logs - Check for error messages

### Common Issues
- **Keys not working**: Make sure you're in TEST mode
- **Payment fails**: Use test card `4242 4242 4242 4242`
- **Booking not created**: Check Firebase rules
- **App crashes**: Check console for errors

---

## 🎯 Success Criteria

Your Stripe integration is working if:

1. ✅ Test script passes
2. ✅ Can create payment intent
3. ✅ Can enter card details
4. ✅ Payment processes successfully
5. ✅ Booking is created
6. ✅ Start code is generated
7. ✅ Payment appears in Stripe Dashboard
8. ✅ Can view booking in app
9. ✅ Error handling works
10. ✅ Can retry failed payments

---

## ⏱️ Time Estimate

- Setup: 5 minutes
- First test: 2 minutes
- Additional tests: 1 minute each
- Verification: 2 minutes
- **Total**: ~10 minutes

---

**Ready? Let's test!** 🚀

Start with Step 1 above and work your way through. You'll have Stripe working in less than 10 minutes!
