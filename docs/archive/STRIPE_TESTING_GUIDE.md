# Stripe Testing Guide

## 🔑 Setup Instructions

### 1. Get Your Stripe Test Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Make sure you're in **TEST MODE** (toggle in top right)
3. Copy your keys:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...`

### 2. Add Keys to .env File

Update your `.env` file:
```env
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

### 3. Restart the App

After updating `.env`, restart your development server:
```bash
bun run start
```

---

## 💳 Test Card Numbers

Use these test cards in the payment form:

### ✅ Successful Payments

| Card Number | Brand | Description |
|------------|-------|-------------|
| `4242 4242 4242 4242` | Visa | Always succeeds |
| `5555 5555 5555 4444` | Mastercard | Always succeeds |
| `3782 822463 10005` | American Express | Always succeeds |

### ❌ Failed Payments

| Card Number | Brand | Error |
|------------|-------|-------|
| `4000 0000 0000 0002` | Visa | Card declined |
| `4000 0000 0000 9995` | Visa | Insufficient funds |
| `4000 0000 0000 0069` | Visa | Expired card |

### 🔐 3D Secure Authentication

| Card Number | Brand | Description |
|------------|-------|-------------|
| `4000 0027 6000 3184` | Visa | Requires authentication |

### Additional Test Details
- **Expiry Date**: Any future date (e.g., `12/25`)
- **CVV**: Any 3 digits (e.g., `123`)
- **Cardholder Name**: Any name

---

## 🧪 Testing Flow

### Step 1: Create a Booking
1. Open the app
2. Sign in with test account:
   - Email: `client@test.com`
   - Password: `Test123!`
3. Browse guards on the home screen
4. Select a guard and tap "Book Now"

### Step 2: Fill Booking Details
1. Select date and time from dropdowns
2. Choose duration (hours)
3. Select vehicle type (Standard/Armored)
4. Select protection type (Armed/Unarmed)
5. Choose dress code
6. Enter number of protectees
7. Verify pickup location (auto-filled)
8. Tap "Continue to Payment"

### Step 3: Complete Payment
1. Enter test card details:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/25`
   - CVV: `123`
   - Name: `Test User`
2. Review price breakdown
3. Tap "Pay $XXX.XX"
4. Wait for confirmation

### Step 4: Verify Booking
1. You'll receive a 6-digit start code
2. Booking appears in "Bookings" tab
3. You can track guard location in real-time
4. Chat with guard
5. Rate service after completion

---

## 🔍 Verify in Stripe Dashboard

### Check Payment
1. Go to [Stripe Payments](https://dashboard.stripe.com/test/payments)
2. You should see your test payment
3. Click on it to view details:
   - Amount
   - Customer info
   - Metadata (booking ID)

### Check Customer
1. Go to [Stripe Customers](https://dashboard.stripe.com/test/customers)
2. Find the customer created for the booking
3. View payment methods saved

### Check Refunds (Admin Only)
1. Go to Admin → Refunds in the app
2. Select a booking to refund
3. Process refund
4. Verify in [Stripe Refunds](https://dashboard.stripe.com/test/refunds)

---

## 📱 Platform-Specific Testing

### iOS/Android (Native)
- Uses `@stripe/stripe-react-native`
- Full native payment UI
- Supports Apple Pay / Google Pay (in production)
- 3D Secure authentication works natively

### Web
- Uses Stripe.js via web integration
- Card input form
- 3D Secure opens in modal

---

## 🐛 Common Issues & Solutions

### Issue: "Invalid API Key"
**Solution**: 
- Make sure you copied the correct keys from Stripe Dashboard
- Ensure you're using TEST mode keys (start with `pk_test_` and `sk_test_`)
- Restart the app after updating `.env`

### Issue: "Payment Failed"
**Solution**:
- Check you're using a valid test card number
- Verify expiry date is in the future
- Check Stripe Dashboard for error details

### Issue: "Network Error"
**Solution**:
- Ensure backend is running
- Check internet connection
- Verify `EXPO_PUBLIC_TOOLKIT_URL` in `.env`

### Issue: Payment succeeds but booking doesn't create
**Solution**:
- Check Firebase connection
- Verify Firestore rules allow writes
- Check console logs for errors

---

## 💰 Test Scenarios

### Scenario 1: Standard Booking
- Guard: Any available guard
- Duration: 4 hours
- Vehicle: Standard
- Protection: Unarmed
- Expected: ~$200-300

### Scenario 2: Premium Booking
- Guard: High-rated guard
- Duration: 8 hours
- Vehicle: Armored (+$100)
- Protection: Armed (+$50)
- Expected: ~$600-800

### Scenario 3: Failed Payment
- Use card: `4000 0000 0000 0002`
- Expected: Payment declined error
- Booking should NOT be created

### Scenario 4: Refund Flow (Admin)
1. Create successful booking
2. Login as admin
3. Go to Admin → Refunds
4. Process full refund
5. Verify in Stripe Dashboard

---

## 🔐 Security Testing

### Test Rate Limiting
1. Try making 10+ payment requests rapidly
2. Should be rate limited after 5 attempts
3. Wait 15 minutes and try again

### Test Authentication
1. Try accessing payment endpoint without auth
2. Should return 401 Unauthorized

### Test Amount Validation
1. Try creating payment with $0
2. Should fail validation
3. Try negative amount
4. Should fail validation

---

## 📊 Monitoring

### Check Logs
```bash
# Backend logs
tail -f backend/logs/stripe.log

# App logs
# Check console in Expo Dev Tools
```

### Metrics to Monitor
- Payment success rate
- Average payment time
- Failed payment reasons
- Refund rate

---

## 🚀 Going to Production

### Before Launch Checklist
- [ ] Replace test keys with live keys
- [ ] Test with real card (small amount)
- [ ] Set up webhooks for payment events
- [ ] Configure payout schedule
- [ ] Add business verification
- [ ] Set up fraud detection rules
- [ ] Test refund flow with real payment
- [ ] Configure email receipts
- [ ] Set up dispute handling
- [ ] Add terms of service

### Switch to Live Mode
1. Get live keys from Stripe Dashboard (LIVE mode)
2. Update `.env`:
   ```env
   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY
   STRIPE_SECRET_KEY=sk_live_YOUR_KEY
   ```
3. Test with small real payment
4. Monitor first transactions closely

---

## 📞 Support

### Stripe Resources
- [Stripe Testing Docs](https://stripe.com/docs/testing)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Support](https://support.stripe.com/)

### App Support
- Check `SECURITY_AUDIT.md` for security best practices
- Check `PRODUCTION_CHECKLIST.md` for deployment steps
- Check console logs for detailed error messages

---

## 🎯 Quick Test Commands

### Test Payment Creation
```bash
# In browser console or API client
curl -X POST http://localhost:8081/api/trpc/payments.createIntent \
  -H "Content-Type: application/json" \
  -d '{"bookingId":"test-123","amount":10000}'
```

### Test Refund
```bash
curl -X POST http://localhost:8081/api/trpc/payments.refund \
  -H "Content-Type: application/json" \
  -d '{"paymentIntentId":"pi_xxx","amount":5000}'
```

---

## ✅ Testing Checklist

- [ ] Stripe test keys added to `.env`
- [ ] App restarted after env update
- [ ] Can create booking with test card
- [ ] Payment appears in Stripe Dashboard
- [ ] Booking created in Firebase
- [ ] Start code generated
- [ ] Can view active booking
- [ ] Can track guard location
- [ ] Can chat with guard
- [ ] Can complete and rate booking
- [ ] Admin can process refunds
- [ ] Failed payments handled correctly
- [ ] Error messages are user-friendly
- [ ] Loading states work properly

---

**Ready to test!** Start with the successful payment flow using card `4242 4242 4242 4242`, then try other scenarios.
