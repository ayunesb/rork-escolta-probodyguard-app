# 🧪 Stripe Testing Summary

## ✅ What's Been Implemented

### 1. Real Stripe Integration
- ✅ Stripe React Native SDK integrated (`@stripe/stripe-react-native`)
- ✅ StripeProvider added to app layout (native only)
- ✅ Payment Intent creation endpoint
- ✅ Refund endpoint
- ✅ Automatic fallback to mock mode if keys not configured

### 2. Backend Routes
- ✅ `POST /api/trpc/payments.createIntent` - Creates Stripe payment intent
- ✅ `POST /api/trpc/payments.refund` - Processes refunds
- ✅ Proper error handling and validation
- ✅ Metadata tracking (booking ID)

### 3. Frontend Integration
- ✅ Native payment sheet for iOS/Android
- ✅ Web payment form (card input)
- ✅ Payment confirmation flow
- ✅ Error handling and user feedback

---

## 🚀 How to Test

### Step 1: Get Stripe Test Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Make sure you're in **TEST MODE** (toggle in top right)
3. Copy your keys:
   - Publishable key: `pk_test_...`
   - Secret key: `sk_test_...`

### Step 2: Configure Environment

Update your `.env` file:
```env
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

### Step 3: Test Stripe API Connection

Run the test script:
```bash
bun run scripts/test-stripe.ts
```

Expected output:
```
🔍 Testing Stripe Integration...

1️⃣ Testing Payment Intent Creation...
✅ Payment Intent Created: pi_xxxxx
   Amount: $100.00
   Status: requires_payment_method

2️⃣ Testing Payment Intent Retrieval...
✅ Payment Intent Retrieved: pi_xxxxx
   Status: requires_payment_method
   Metadata: { bookingId: 'test-booking-123' }

3️⃣ Testing Payment Intent Cancellation...
✅ Payment Intent Canceled: pi_xxxxx
   Status: canceled

✅ All Stripe tests passed!
```

### Step 4: Test in App

1. **Restart the app** (important after updating .env):
   ```bash
   bun run start
   ```

2. **Sign in** with test account:
   - Email: `client@test.com`
   - Password: `Test123!`

3. **Create a booking**:
   - Select any guard
   - Fill in booking details
   - Proceed to payment

4. **Enter test card**:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/25`
   - CVV: `123`
   - Name: `Test User`

5. **Complete payment**:
   - Review price breakdown
   - Tap "Pay $XXX.XX"
   - Wait for confirmation

6. **Verify in Stripe Dashboard**:
   - Go to [Stripe Payments](https://dashboard.stripe.com/test/payments)
   - You should see your test payment
   - Check metadata for booking ID

---

## 💳 Test Cards

### Successful Payments
| Card Number | Description |
|------------|-------------|
| `4242 4242 4242 4242` | Visa - Always succeeds |
| `5555 5555 5555 4444` | Mastercard - Always succeeds |
| `3782 822463 10005` | Amex - Always succeeds |

### Failed Payments
| Card Number | Error |
|------------|-------|
| `4000 0000 0000 0002` | Card declined |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0000 0000 0069` | Expired card |

### 3D Secure
| Card Number | Description |
|------------|-------------|
| `4000 0027 6000 3184` | Requires authentication |

**Note**: Use any future expiry date (e.g., `12/25`), any 3-digit CVV (e.g., `123`), and any name.

---

## 🔍 What to Verify

### In the App
- [ ] Payment form displays correctly
- [ ] Card validation works
- [ ] Loading states show during processing
- [ ] Success message appears with booking details
- [ ] Start code is generated
- [ ] Booking appears in "Bookings" tab
- [ ] Error messages are user-friendly

### In Stripe Dashboard
- [ ] Payment appears in [Payments](https://dashboard.stripe.com/test/payments)
- [ ] Amount is correct (in cents)
- [ ] Currency is USD
- [ ] Metadata contains booking ID
- [ ] Status is "succeeded"
- [ ] Customer is created (if applicable)

### Error Handling
- [ ] Invalid card shows error
- [ ] Network errors are handled
- [ ] Declined cards show appropriate message
- [ ] User can retry after failure

---

## 🐛 Troubleshooting

### "Invalid API Key" Error
**Cause**: Stripe keys not configured or incorrect

**Solution**:
1. Verify keys in `.env` file
2. Make sure you're using TEST mode keys (start with `pk_test_` and `sk_test_`)
3. Restart the app after updating `.env`

### "Payment Failed" Error
**Cause**: Using invalid test card or network issue

**Solution**:
1. Use a valid test card: `4242 4242 4242 4242`
2. Check internet connection
3. Verify backend is running
4. Check console logs for details

### Payment Succeeds but Booking Not Created
**Cause**: Firebase or backend issue

**Solution**:
1. Check Firebase connection
2. Verify Firestore rules
3. Check backend logs
4. Ensure booking creation endpoint works

### "Mock Mode" Warning in Logs
**Cause**: Stripe keys not configured

**Solution**:
1. Add real Stripe test keys to `.env`
2. Restart the app
3. The app will automatically use real Stripe API

---

## 📊 Test Scenarios

### Scenario 1: Standard Booking ($200-300)
1. Select guard with $50/hour rate
2. Duration: 4 hours
3. Vehicle: Standard
4. Protection: Unarmed
5. Expected total: ~$220 (includes 10% platform fee)

### Scenario 2: Premium Booking ($600-800)
1. Select high-rated guard ($75/hour)
2. Duration: 8 hours
3. Vehicle: Armored (+25% fee)
4. Protection: Armed (+15% fee)
5. Expected total: ~$750

### Scenario 3: Failed Payment
1. Use card: `4000 0000 0000 0002`
2. Expected: "Card declined" error
3. Booking should NOT be created
4. User can retry with different card

### Scenario 4: Refund (Admin Only)
1. Create successful booking
2. Login as admin
3. Go to Admin → Refunds
4. Select booking
5. Process full refund
6. Verify in Stripe Dashboard

---

## 🔐 Security Checklist

- [x] Stripe secret key stored in environment variable
- [x] Secret key never exposed to client
- [x] Payment amounts validated on backend
- [x] Minimum amount enforced ($0.50)
- [x] Metadata includes booking ID for tracking
- [x] HTTPS used for all API calls
- [x] Error messages don't expose sensitive info

---

## 📱 Platform-Specific Notes

### iOS/Android (Native)
- Uses native Stripe payment sheet
- Better UX with native UI
- Supports Apple Pay / Google Pay (in production)
- 3D Secure authentication works natively

### Web
- Uses custom card input form
- Stripe.js integration (via API)
- 3D Secure opens in modal
- Full functionality maintained

---

## 🚀 Production Checklist

Before going live:

- [ ] Replace test keys with live keys
- [ ] Test with real card (small amount)
- [ ] Set up Stripe webhooks
- [ ] Configure payout schedule
- [ ] Add business verification
- [ ] Set up fraud detection rules
- [ ] Test refund flow with real payment
- [ ] Configure email receipts
- [ ] Set up dispute handling
- [ ] Add terms of service
- [ ] Enable 3D Secure for all payments
- [ ] Set up monitoring and alerts

---

## 📞 Resources

- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe React Native SDK](https://stripe.com/docs/payments/accept-a-payment?platform=react-native)
- [Test Card Numbers](https://stripe.com/docs/testing#cards)

---

## ✅ Quick Test Checklist

- [ ] Stripe test keys added to `.env`
- [ ] App restarted after env update
- [ ] Test script passes (`bun run scripts/test-stripe.ts`)
- [ ] Can create booking with test card `4242 4242 4242 4242`
- [ ] Payment appears in Stripe Dashboard
- [ ] Booking created successfully
- [ ] Start code generated
- [ ] Can view active booking
- [ ] Failed payment handled correctly
- [ ] Error messages are clear

---

**Status**: ✅ Ready for testing!

**Next Steps**:
1. Add your Stripe test keys to `.env`
2. Run `bun run scripts/test-stripe.ts`
3. Test payment flow in the app
4. Verify in Stripe Dashboard

For detailed testing instructions, see `STRIPE_TESTING_GUIDE.md`.
