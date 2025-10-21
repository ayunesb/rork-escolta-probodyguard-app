# 🚀 Quick Test: Payment Form Fix

**Status**: Fix applied, Metro restarting  
**Time Required**: 5 minutes  
**Test Account**: client@demo.com / Demo1234!

---

## What We Fixed

**Problem**: Payment form hung on "Cargando formulario de pago..."  
**Cause**: App tried to fetch saved cards for non-existent Braintree customer (404 error)  
**Solution**: Handle 404 gracefully, return empty array, let form load normally

---

## Test Now (5 Steps)

### 1. Wait for Metro (30 seconds)

Metro bundler is restarting with clean cache. Watch terminal for:
```
› Metro waiting on exp://...
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

### 2. Reload App in Simulator

**If app already open**:
- Press `Cmd+D` in simulator
- Select "Reload"

**If app closed**:
```bash
open -a Simulator
# Then launch Escolta Pro from home screen
```

### 3. Test Payment Flow

1. **Login**: client@demo.com / Demo1234!
2. **Navigate**: "Buscar Guardias" → Select any guard
3. **Book**: Create booking (any date/time)
4. **Pay**: Tap "Proceder al Pago"
5. **Watch**: Payment form should load immediately (no hanging!)

### 4. Expected Console Output

Open terminal running Metro, watch for:
```
[Payment] Requesting client token...
[Payment] Client token received
[Payment] No saved cards found (first-time user)  ← NEW MESSAGE
```

**If you see this**: ✅ **FIX WORKING**

### 5. Complete Payment (Optional)

**Test Card**: 4111 1111 1111 1111  
**CVV**: 123  
**Expiry**: 12/25  
**ZIP**: 12345

After payment:
- Wait 30-60 seconds
- Check Firestore: https://console.firebase.google.com/project/escolta-pro-fe90e/firestore
- Look in `webhook_logs` collection
- Should see webhook: `transaction_settled` or `subscription_charged_successfully`

---

## Quick Verification

### ✅ Success Indicators
- [ ] Payment form loads without hanging
- [ ] Console shows "No saved cards found (first-time user)"
- [ ] Card entry fields visible
- [ ] Can enter card details
- [ ] Payment processes successfully
- [ ] Webhook appears in Firestore (if you completed payment)

### ❌ If Still Broken
1. Check Metro bundler fully restarted
2. Force reload app (Cmd+D → Reload)
3. Check console for new error messages
4. Verify .env has production API URL

---

## Current Status

| Component | Status |
|-----------|--------|
| Code Fix | ✅ Applied |
| Metro Bundler | 🔄 Restarting |
| Simulator | ⏳ Waiting for reload |
| Payment Form | ⏳ Ready to test |

---

## Next After This Works

Once payment form loads successfully:

**Option A: Test Webhooks via Mobile** (15 min)
- Complete payment in app
- Wait for webhook
- Verify in Firestore

**Option B: Test Webhooks via Dashboard** (5 min)
- Faster and more comprehensive
- Can test all 11 event types
- No dependency on app
- See: `QUICK_WEBHOOK_TEST.md`

---

**Ready?** Open simulator and test the payment flow! 🎯
