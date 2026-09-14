# 🧪 Testing Hosted Fields - Quick Guide

**Status**: ✅ Deployed and Ready to Test  
**Date**: October 21, 2025, 3:50 PM

---

## ✅ Deployment Complete!

- ✅ Cloud Functions deployed successfully
- ✅ Endpoint verified: https://api-fqzvp2js5q-uc.a.run.app/payments/hosted-fields-page
- ✅ HTML page returns 200 OK (13,911 bytes)
- ✅ Metro bundler running on http://localhost:8081
- ✅ Development build ready

---

## 🚀 Test Now - 5 Minute Checklist

### Step 1: Open iOS Simulator

In the Metro terminal, press **`i`** to open iOS simulator.

**Expected**: App launches in simulator

---

### Step 2: Login as Test Client

- Email: `client@demo.com`
- Password: `<contrasena en tu .env local, no en el repositorio>`

---

### Step 3: Create a Booking

1. Browse bodyguards or use "Book Now"
2. Select dates: Tomorrow + day after
3. Select time: 9 AM - 5 PM
4. Press "Continue" → "Proceed to Payment"

---

### Step 4: Verify New Payment UI ⭐ **CRITICAL**

Look for these **NEW** elements:

#### ✅ Native Input Field
```
Cardholder Name
┌─────────────────────────────┐
│ [Type your name here]       │
└─────────────────────────────┘
```

#### ✅ WebView with Card Fields
- **Dark theme** (not white!)
- **Loading spinner** initially
- After 5-10 seconds, 4 fields appear:
  - Card Number
  - MM/YY and CVV
  - Postal Code

#### ❌ What You Should NOT See
- External Safari window
- "Enter Card Details" button
- White/bright background
- Stuck on "Cargando..." forever

---

### Step 5: Enter Test Card

1. **Cardholder Name**: `Test User`
2. **Card Number**: `4111 1111 1111 1111`
3. **Expiration**: `12/25`
4. **CVV**: `123`
5. **Postal Code**: `12345`

---

### Step 6: Submit Payment

Press **"Pay $620.40"** button

**Expected**:
- Button shows loading
- Success after 2-5 seconds
- Payment sheet closes
- Booking confirmed

**Metro logs should show**:
```
[BraintreeHostedFields] Page loaded
[BraintreeHostedFields] Braintree fields ready
[BraintreeHostedFields] Payment nonce received
[Payment] Transaction successful: txn_xxxxx
```

---

## 🎯 Success Criteria

- [ ] Payment form opens **in the app** (not Safari)
- [ ] Cardholder name input visible (native)
- [ ] WebView loads card fields (dark theme)
- [ ] Fields are interactive
- [ ] Fields show gold border on focus
- [ ] Payment processes successfully
- [ ] No crashes

---

## 🐛 Troubleshooting

### Old UI Still Showing?

**Solution**: In Metro terminal, press **`r`** to reload

### WebView Blank/White?

**Test endpoint**:
```bash
curl https://api-fqzvp2js5q-uc.a.run.app/payments/hosted-fields-page | head -20
```

### "Failed to load payment form"?

Check `app.config.js` → `extra.apiUrl` matches:  
`https://api-fqzvp2js5q-uc.a.run.app`

---

## 📝 Additional Test Cards

- **Visa**: `4111 1111 1111 1111` ✅
- **Mastercard**: `5555 5555 5555 4444` ✅
- **Amex**: `3782 822463 10005` ✅
- **Declined**: `4000 0000 0000 0002` ❌

All cards: Exp `12/25`, CVV `123`, Postal `12345`

---

**Ready**: 🚀 **Press `i` in Metro terminal to start testing!**
