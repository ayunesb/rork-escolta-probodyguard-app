# Payment System Verification Guide

## Quick Verification

Run the automated verification script:

```bash
npx ts-node scripts/verify-payment-system.ts
```

This will check:
- ✅ Environment variables are properly configured
- ✅ Braintree credentials are valid
- ✅ Client token generation works
- ✅ Payment processing works
- ✅ Security checks (private keys not exposed)
- ✅ Firebase integration

---

## Manual Testing Steps

### 1. Start the Development Server

```bash
npm start
```

### 2. Test on Web (Recommended for Initial Testing)

**Why Web First?**
- Web uses Braintree Hosted Fields - the most secure implementation
- Real card tokenization without fake nonces
- Easier to debug with browser dev tools

**Steps:**
1. Press `w` to open in web browser
2. Navigate to the payment flow:
   - Sign in or create an account
   - Select a guard
   - Create a booking
   - Proceed to payment screen

**Test Cards (Sandbox):**
```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25 (any future date)
```

**What to Check:**
- ✅ Payment form loads with card fields
- ✅ Card number field accepts input
- ✅ CVV and expiry fields work
- ✅ "Pay" button is enabled when form is filled
- ✅ Payment processes successfully
- ✅ Success message shows booking details
- ✅ Check browser console for any errors

### 3. Test on Mobile (iOS/Android)

**Note:** Mobile uses a simplified mock flow because native Braintree modules require custom development builds.

**Steps:**
1. Scan QR code with your device
2. Navigate to payment screen
3. Click "Pay" button
4. Verify mock payment completes

---

## Payment Flow Architecture

### Client Side (Frontend)

**Web:** `components/BraintreePaymentForm.web.tsx`
- Uses Braintree Hosted Fields
- Tokenizes card data securely
- Never exposes card details to your server

**Native:** `components/BraintreePaymentForm.native.tsx`
- Mock implementation (uses fake-valid-nonce)
- For production, requires: `react-native-braintree-dropin-ui`

**Service:** `services/braintreeService.ts`
- Handles API calls to backend
- Gets client tokens
- Processes payments

### Backend (Server)

**Braintree Config:** `backend/lib/braintree.ts`
- Initializes Braintree gateway
- Uses server-side credentials (secure)

**Client Token:** `backend/trpc/routes/payments/braintree/client-token/route.ts`
- Generates client tokens for frontend

**Checkout:** `backend/trpc/routes/payments/braintree/checkout/route.ts`
- Processes payments
- Creates transaction records
- Stores payment data in Firebase

---

## Security Checklist

### ✅ Verified Security Measures

1. **Private Keys Protected**
   - ✅ `BRAINTREE_PRIVATE_KEY` is NOT exposed to client
   - ✅ Only backend has access to private credentials
   - ✅ Client only receives tokenization key

2. **Payment Tokenization**
   - ✅ Web: Uses Hosted Fields (PCI compliant)
   - ✅ Card data never touches your server
   - ✅ Only payment nonces are transmitted

3. **Rate Limiting**
   - ✅ Payment endpoints have rate limiting
   - ✅ Prevents brute force attacks

4. **Authentication**
   - ✅ Payment endpoints require authentication
   - ✅ Only logged-in users can make payments

---

## Environment Variables

### Required Backend Variables (in .env)
```bash
BRAINTREE_ENV=sandbox
BRAINTREE_MERCHANT_ID=your_merchant_id
BRAINTREE_PUBLIC_KEY=your_public_key
BRAINTREE_PRIVATE_KEY=your_private_key
```

### Client-Safe Variables (in .env)
```bash
EXPO_PUBLIC_BRAINTREE_ENV=sandbox
```

### ⚠️ NEVER expose these to client:
- ❌ BRAINTREE_PRIVATE_KEY
- ❌ BRAINTREE_MERCHANT_ID (backend only)

---

## Current Status

### ✅ What's Working

1. **Braintree Integration**
   - Client token generation
   - Payment processing
   - Refund support
   - Sandbox testing

2. **Web Payment Form**
   - Hosted Fields integration
   - Card tokenization
   - Real-time validation
   - Secure payment processing

3. **Backend Processing**
   - Transaction creation
   - Payment record storage in Firebase
   - Fee calculation (platform, guard, company)
   - Rate limiting

4. **Security**
   - Private keys not exposed
   - Tokenized payments
   - Authenticated endpoints
   - Rate limiting

### ⚠️ Known Limitations

1. **Mobile Native**
   - Uses mock nonces (not real cards)
   - For production: Install `react-native-braintree-dropin-ui`
   - Requires custom development build (not Expo Go compatible)

2. **Sandbox Mode**
   - Currently in Braintree sandbox
   - Only test cards work
   - For production: Switch to production credentials

---

## Troubleshooting

### Payment fails with "configuration error"
**Solution:** Run verification script to check credentials
```bash
npx ts-node scripts/verify-payment-system.ts
```

### Web payment form doesn't show
**Solution:** Check browser console for CSP errors. Verify `app.config.js` has Braintree domains in CSP.

### "Client token generation failed"
**Solution:** 
1. Verify Braintree credentials in `.env`
2. Check if credentials are for correct environment (sandbox/production)
3. Verify backend server is running

### Mobile payment doesn't work
**Solution:** This is expected in Expo Go. Mobile uses mock flow. For production, you need:
1. Create custom development build
2. Install `react-native-braintree-dropin-ui`
3. Configure native modules

---

## Production Readiness

### Before Going to Production

1. **Switch to Production Environment**
   ```bash
   # In .env
   BRAINTREE_ENV=production
   EXPO_PUBLIC_BRAINTREE_ENV=production
   ```

2. **Update Credentials**
   - Get production merchant credentials from Braintree
   - Update all BRAINTREE_* variables

3. **Test End-to-End**
   - Test with real (small amount) transactions
   - Verify refunds work
   - Test error handling

4. **Mobile Native**
   - Build custom development build
   - Install Braintree native modules
   - Test on physical devices

5. **Monitoring**
   - Set up Sentry error tracking
   - Monitor Braintree dashboard
   - Set up payment alerts

---

## Test Results

Run the verification script and paste results here:

```bash
npx ts-node scripts/verify-payment-system.ts
```

Expected output:
```
✅ Env Variable: BRAINTREE_ENV is set
✅ Env Variable: BRAINTREE_MERCHANT_ID is set
✅ Env Variable: BRAINTREE_PUBLIC_KEY is set
✅ Env Variable: BRAINTREE_PRIVATE_KEY is set
✅ Security Check: Private key is not exposed to client
✅ Gateway Init: Braintree gateway initialized successfully
✅ Client Token: Successfully generated client token
✅ Payment Processing: Payment processed successfully
✅ PAYMENT SYSTEM IS FULLY FUNCTIONAL!
```

---

## Support

If you encounter issues:

1. **Check Logs**
   - Browser console (Web)
   - Metro bundler console
   - Backend logs

2. **Run Verification**
   ```bash
   npx ts-node scripts/verify-payment-system.ts
   ```

3. **Check Braintree Dashboard**
   - https://sandbox.braintreegateway.com (sandbox)
   - https://www.braintreegateway.com (production)
   - View transactions, errors, and logs

4. **Common Issues**
   - Invalid credentials: Regenerate in Braintree dashboard
   - CSP errors: Update `app.config.js`
   - Network errors: Check firewall/proxy settings
