# Payment Testing Guide

## Quick Start Testing

### 1. Restart Your Development Server
```bash
# Stop the current server (Ctrl+C)
# Then restart with:
bun run start
```

This ensures all environment variable changes are loaded.

---

## Test Payment Flow

### Step 1: Navigate to Booking
1. Open the app
2. Sign in with your test account
3. Select a guard from the home screen
4. Fill in booking details:
   - Date and time
   - Duration (e.g., 2 hours)
   - Protection type (Armed/Unarmed)
   - Vehicle type (Standard/Armored)
   - Pickup address
5. Click "Continue to Payment"

### Step 2: Enter Payment Details

Use Stripe test cards (these won't charge real money):

#### ✅ Successful Payment
```
Card Number: 4242 4242 4242 4242
Expiry: 12/34 (any future date)
CVV: 123 (any 3 digits)
Name: Test User
```

#### ❌ Card Declined
```
Card Number: 4000 0000 0000 0002
Expiry: 12/34
CVV: 123
Name: Test User
```

#### ❌ Insufficient Funds
```
Card Number: 4000 0000 0000 9995
Expiry: 12/34
CVV: 123
Name: Test User
```

### Step 3: Complete Payment
1. Click "Add Card & Pay"
2. Wait for processing
3. Verify success message appears
4. Check booking is created

---

## What to Watch For

### Console Logs
Monitor these log prefixes:
- `[Payment]` - Payment flow progress
- `[Stripe Web]` or `[Stripe]` - Stripe integration
- `[tRPC Client]` - API communication
- `[Backend]` - Server responses

### Expected Flow
```
[Payment] Starting payment process
[Payment] Using payment method: new
[Payment] Processing new payment method
[Stripe Web] Creating payment intent
[tRPC Client] Request to: http://localhost:8081/api/trpc
[Backend] POST /api/trpc/payments.createIntent
[Stripe Web] Payment intent created successfully
[Payment] Payment intent created: pi_xxx
[Stripe Web] Confirming payment
[Payment] Payment completed successfully
```

### Success Indicators
✅ No HTML/JSON parse errors  
✅ Payment intent created with ID starting with `pi_`  
✅ Booking confirmation alert appears  
✅ Redirected to active booking screen  

### Error Indicators
❌ "Unexpected token '<'" error = tRPC connection issue  
❌ "Invalid API key" = Stripe configuration problem  
❌ "Payment failed" = Card declined or processing error  

---

## Troubleshooting

### Error: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"

**Cause:** tRPC endpoint returning HTML instead of JSON

**Solutions:**
1. Verify backend is running
2. Check console for `[Backend]` logs
3. Test health endpoint: `http://localhost:8081/api/health`
4. Restart development server

### Error: "Invalid API Key"

**Cause:** Stripe keys not loaded

**Solutions:**
1. Check `.env` file has Stripe keys
2. Restart development server
3. Verify keys in Stripe dashboard

### Payment Succeeds but No Booking

**Cause:** Post-payment logic failure

**Solutions:**
1. Check Firebase permissions
2. Verify user authentication
3. Check console for errors after payment

---

## Verify in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Payments** section
3. Look for recent payment intents
4. Verify amount matches booking cost
5. Check payment status (succeeded/failed)

---

## Testing Checklist

### Basic Flow
- [ ] Can navigate to payment screen
- [ ] Cost breakdown displays correctly
- [ ] Can enter card details
- [ ] Payment processes without errors
- [ ] Success message appears
- [ ] Booking is created

### Saved Cards
- [ ] Card is saved after first payment
- [ ] Can select saved card for next booking
- [ ] Can remove saved card
- [ ] Can add multiple cards

### Error Handling
- [ ] Declined card shows error message
- [ ] Network error shows retry option
- [ ] Invalid card number is rejected
- [ ] Missing fields show validation

### Web Compatibility
- [ ] Payment form renders on web
- [ ] Can complete payment on web browser
- [ ] No console errors on web

---

## Next Steps After Testing

### If Tests Pass ✅
1. Review Stripe dashboard for test payments
2. Test on mobile device (iOS/Android)
3. Verify saved cards functionality
4. Test refund flow (if implemented)
5. Ready for production!

### If Tests Fail ❌
1. Copy full error message from console
2. Check which step failed
3. Review troubleshooting section
4. Contact support with error details

---

## Important Notes

⚠️ **LIVE KEYS WARNING**  
Your `.env` file currently has LIVE Stripe keys. This means:
- Real charges will be processed
- Real money will be transferred
- Use test cards only for testing

🔄 **For Safe Testing**  
Consider switching to Stripe test keys:
```
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

---

## Support

If you encounter issues:
1. Check console logs for error details
2. Review `PRODUCTION_AUDIT_REPORT.md`
3. Verify all fixes were applied
4. Restart development server
5. Clear browser cache (for web testing)

**Ready to test!** 🚀
