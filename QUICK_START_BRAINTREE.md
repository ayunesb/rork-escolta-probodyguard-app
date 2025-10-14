# Quick Start: Braintree Payments

## 🚀 Get Started in 5 Minutes

### Step 1: Get Braintree Credentials

1. Go to https://sandbox.braintreegateway.com/
2. Sign up for a sandbox account
3. Navigate to **Settings** → **API**
4. Copy your credentials

### Step 2: Update Environment Variables

Edit `.env`:

```env
BRAINTREE_ENV=sandbox
BRAINTREE_MERCHANT_ID=paste_your_merchant_id_here
BRAINTREE_PUBLIC_KEY=paste_your_public_key_here
BRAINTREE_PRIVATE_KEY=paste_your_private_key_here
EXPO_PUBLIC_BRAINTREE_TOKENIZATION_KEY=paste_your_tokenization_key_here
PAYMENTS_CURRENCY=MXN
```

### Step 3: Restart Server

```bash
# Stop the server (Ctrl+C)
# Start again
bun run start
```

### Step 4: Test Payment

1. Open app → Create a booking
2. Go to payment screen
3. Enter test card:
   - **Card**: 4111 1111 1111 1111
   - **Expiry**: 12/25
   - **CVV**: 123
   - **Name**: Test User
4. Click "Pay MXN $XXX.XX"
5. ✅ Success! Booking confirmed

---

## 🧪 Test Cards

| Card Number | Result |
|-------------|--------|
| 4111 1111 1111 1111 | ✅ Success |
| 5555 5555 5555 4444 | ✅ Success (Mastercard) |
| 4000 1111 1111 1115 | ❌ Declined |
| 4000 1111 1111 1123 | ❌ Insufficient Funds |

---

## 📱 Payment Flow

```
User → Booking → Payment Screen → Enter Card → Pay → Success!
```

---

## 🔧 Troubleshooting

### "Braintree configuration is missing"
→ Check `.env` file has all variables  
→ Restart server

### "Transaction failed"
→ Use test card: 4111 1111 1111 1111  
→ Check Braintree sandbox dashboard

### "Invalid nonce"
→ Refresh page and try again

---

## 📚 Full Documentation

See `PAYMENTS_SETUP.md` for complete guide.

---

## ✅ What's Working

- ✅ Payments in MXN
- ✅ Saved cards (one-tap)
- ✅ Refunds
- ✅ Payment ledger
- ✅ Guard/company payouts
- ✅ No Braintree code

---

## 🎯 Production Checklist

- [ ] Create production Braintree account
- [ ] Update `.env` with production credentials
- [ ] Change `BRAINTREE_ENV=production`
- [ ] Test with real card
- [ ] Monitor dashboard

---

**Ready to accept payments! 🎉**
