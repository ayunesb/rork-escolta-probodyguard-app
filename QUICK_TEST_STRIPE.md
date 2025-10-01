# ⚡ Quick Stripe Test Guide

## 🔑 Setup (One-time)

1. **Get Stripe keys**: https://dashboard.stripe.com/test/apikeys
2. **Update `.env`**:
   ```env
   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
   STRIPE_SECRET_KEY=sk_test_YOUR_KEY
   ```
3. **Restart app**: `bun run start`

---

## 🧪 Test API Connection

```bash
bun run scripts/test-stripe.ts
```

Should see: ✅ All Stripe tests passed!

---

## 💳 Test in App

### 1. Sign In
- Email: `client@test.com`
- Password: `Test123!`

### 2. Book a Guard
- Select any guard
- Fill booking details
- Proceed to payment

### 3. Enter Test Card
- **Card**: `4242 4242 4242 4242`
- **Expiry**: `12/25`
- **CVV**: `123`
- **Name**: `Test User`

### 4. Complete Payment
- Tap "Pay $XXX.XX"
- Wait for confirmation
- Get start code

### 5. Verify
- Check [Stripe Dashboard](https://dashboard.stripe.com/test/payments)
- See payment with booking ID

---

## 🎯 Test Cards

| Card | Result |
|------|--------|
| `4242 4242 4242 4242` | ✅ Success |
| `4000 0000 0000 0002` | ❌ Declined |
| `4000 0000 0000 9995` | ❌ Insufficient funds |

---

## ✅ Checklist

- [ ] Keys in `.env`
- [ ] App restarted
- [ ] Test script passes
- [ ] Payment succeeds
- [ ] Appears in Stripe Dashboard
- [ ] Booking created
- [ ] Start code generated

---

## 🐛 Issues?

**"Invalid API Key"**
→ Check `.env` and restart app

**"Payment Failed"**
→ Use card `4242 4242 4242 4242`

**"Mock Mode"**
→ Add real Stripe test keys

---

**Full Guide**: See `STRIPE_TESTING_GUIDE.md`
