# 📱 QUICK START - Mobile Webhook Testing

## ✅ You're Ready! App is running on iPhone 15 Plus

### Current Status:
- ✅ Expo running with tunnel
- ✅ App opened on iPhone 15 Plus simulator
- ✅ Webhook handlers deployed
- ✅ Firebase Functions active

---

## 🎯 Quick Test Steps

### 1. Start Webhook Log Monitoring (New Terminal)

Open a new terminal and run:
```bash
cd /Users/abrahamyunes/blindado/rork-escolta-probodyguard-app
firebase functions:log --only api -f
```

Keep this running - you'll see webhooks arrive in real-time!

### 2. Open Firestore Console

Open in browser:
```
https://console.firebase.google.com/project/escolta-pro-fe90e/firestore/databases/-default-/data/~2Fwebhook_logs
```

Keep this tab open - refresh to see new webhook logs appear.

### 3. Test in the App

**In the iPhone simulator:**

1. **Login** to the app with your test account
2. **Navigate to payment/subscription section**
3. **Make a test payment** with:
   ```
   Card: 4111 1111 1111 1111
   Expiry: 12/25
   CVV: 123
   ZIP: 12345
   ```

### 4. Watch for Webhooks

**What to look for:**

**Terminal logs** should show:
```
[Webhook] Received request
[Webhook] Signature verified successfully
[Webhook] Parsed notification: subscription_charged_successfully
Processing subscription webhook...
```

**Firestore** should show new document in `webhook_logs`:
```
kind: "subscription_charged_successfully"
verified: true
timestamp: (just now)
```

---

## 🧪 Test Scenarios

### Test 1: Successful Payment
1. Use card: `4111 1111 1111 1111`
2. Complete payment in app
3. Check terminal logs for webhook
4. Refresh Firestore - new webhook_logs entry should appear

**Expected webhook**: `subscription_charged_successfully` or `transaction_settled`

### Test 2: Failed Payment
1. Use card: `4000 0000 0000 0002` (Decline card)
2. Try to make payment
3. Check for webhook notification

**Expected webhook**: `subscription_charged_unsuccessfully`

### Test 3: Cancel Subscription
1. Go to subscription settings in app
2. Cancel subscription
3. Watch for webhook

**Expected webhook**: `subscription_canceled`

---

## 🔍 Quick Verification

After each payment action:

**Check 1: Terminal Logs**
```bash
# In your monitoring terminal, look for:
[Webhook] Received request
[Webhook] Signature verified successfully ✅
```

**Check 2: Firestore Console**
- Refresh `webhook_logs` collection
- Look for newest document
- Verify `verified: true`

**Check 3: App Behavior**
- Does app show success/error message?
- Does subscription status update?
- Does payment complete?

---

## 📊 Quick Scorecard

Mark as you test:

- [ ] Payment successful → Webhook received
- [ ] Payment failed → Webhook received
- [ ] Subscription canceled → Webhook received
- [ ] All webhooks show `verified: true`
- [ ] App behavior matches webhook data

---

## 🆘 Quick Troubleshooting

### No webhook appearing?
```bash
# Check if functions are up
firebase functions:list

# Check recent logs
firebase functions:log --only api | grep -i webhook | tail -20
```

### Webhook received but not processing?
```bash
# Look for errors
firebase functions:log --only api | grep -i error | tail -20
```

### App payment not working?
- Check if using sandbox/test mode
- Verify Braintree credentials in app
- Check app console for errors

---

## 🚀 Ready to Test!

**Right now:**
1. Open new terminal → run: `firebase functions:log --only api -f`
2. Open browser → Firestore webhook_logs
3. In iPhone simulator → make a test payment
4. Watch logs and Firestore for webhook!

---

**Full guide**: See `MOBILE_WEBHOOK_TESTING.md`

**Current time**: $(date)
