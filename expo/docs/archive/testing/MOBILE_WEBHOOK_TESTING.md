# 📱 MOBILE WEBHOOK TESTING GUIDE
## Testing Webhooks via iOS & Android App

**Test Date**: October 21, 2025  
**Platform**: React Native / Expo  
**App**: Rork Escolta Pro Bodyguard App  
**Status**: 🔄 READY TO TEST

---

## 🎯 Testing Strategy

Instead of manually triggering webhooks from Braintree Dashboard, we'll test by:
1. **Making real payments** in the mobile app
2. **Managing subscriptions** (create, cancel, charge)
3. **Triggering payment events** that cause Braintree to send webhooks
4. **Verifying webhook processing** in real-time

This tests the **COMPLETE flow**: App → Braintree → Webhook → Firebase

---

## 📋 Prerequisites (5 minutes)

### ✅ 1. Metro/Expo Server Running
```bash
# Check if Expo is running
ps aux | grep "expo start"
```

If not running:
```bash
cd /Users/abrahamyunes/blindado/rork-escolta-probodyguard-app
npx expo start --tunnel -c
```

### ✅ 2. App Installed on Device
- **iOS**: Open Expo Go app and scan QR code
- **Android**: Open Expo Go app and scan QR code
- **OR** use iOS Simulator / Android Emulator

### ✅ 3. Test Account Ready
You'll need a test user account with:
- ✅ Email/password for login
- ✅ Demo/test mode enabled
- ✅ Braintree sandbox configured

### ✅ 4. Monitoring Tools Open
Open these in separate tabs:
1. **Firebase Console**: https://console.firebase.google.com/project/escolta-pro-fe90e/firestore
2. **Braintree Dashboard**: https://sandbox.braintreegateway.com
3. **Terminal** for logs: `firebase functions:log --only api -f`

---

## 🧪 Test Scenarios

### Test 1: Subscription Creation (10 minutes)
**What this tests**: `subscription_charged_successfully` webhook

**Steps**:
1. **In the app**: Login with test account
2. Navigate to subscription/payment section
3. Select a subscription plan (monthly/annual bodyguard service)
4. Enter test credit card:
   ```
   Card Number: 4111 1111 1111 1111
   Expiry: 12/25
   CVV: 123
   ZIP: 12345
   ```
5. Complete subscription purchase
6. **Expected**: Success message in app

**Verify Webhook Processing**:

**A. Check App Response**:
- ✅ "Subscription activated" or similar success message
- ✅ User can see active subscription status

**B. Check Firestore** (Firebase Console):
```
Collection: webhook_logs
Look for newest document with:
  kind: "subscription_charged_successfully"
  verified: true
  timestamp: (just now)
```

```
Collection: subscriptions
Look for your subscription:
  userId: (your test user ID)
  status: "active"
  planId: (your plan)
  lastChargedAt: (just now)
  nextBillingDate: (30 days from now)
```

**C. Check Cloud Functions Logs** (Terminal):
```bash
firebase functions:log --only api | grep -A 5 "subscription_charged_successfully"
```

**Expected logs**:
```
[Webhook] Received request
[Webhook] Signature verified successfully
[Webhook] Parsed notification: subscription_charged_successfully
Processing subscription_charged_successfully webhook
Updated subscription: xxx
```

✅ **PASS** if:
- Webhook logged in `webhook_logs` with `verified: true`
- Subscription record created/updated in Firestore
- App shows active subscription status

---

### Test 2: Failed Payment Attempt (8 minutes)
**What this tests**: `subscription_charged_unsuccessfully` webhook

**Steps**:
1. **Use a test card that will fail**:
   ```
   Card Number: 4000 0000 0000 0002 (Declined card)
   Expiry: 12/25
   CVV: 123
   ```
2. Try to create subscription or make payment
3. **Expected**: Payment declined message

**Verify Webhook Processing**:

**Check webhook_logs**:
```
kind: "subscription_charged_unsuccessfully"
verified: true
```

**Check subscriptions collection**:
```
status: "past_due" (or similar)
lastChargeAttempt: (timestamp)
failureReason: (error message)
```

**Check notifications collection**:
```
userId: (your user ID)
type: "subscription_charged_unsuccessfully"
severity: "medium"
title: "Payment Failed"
body: (failure details)
read: false
```

**Check app**:
- ✅ Should show payment failed message
- ✅ May prompt to update payment method

✅ **PASS** if user notification created and subscription status updated

---

### Test 3: Subscription Cancellation (5 minutes)
**What this tests**: `subscription_canceled` webhook

**Steps**:
1. **In the app**: Go to subscription settings
2. Find "Cancel Subscription" option
3. Confirm cancellation
4. **Expected**: Cancellation confirmed

**Verify Webhook Processing**:

**Check webhook_logs**:
```
kind: "subscription_canceled"
verified: true
```

**Check subscriptions collection**:
```
status: "canceled"
canceledAt: (timestamp)
endsAt: (end of billing period)
```

**Check app**:
- ✅ Subscription shows as "Canceled"
- ✅ May show "Active until [date]"

✅ **PASS** if subscription status updated to canceled

---

### Test 4: One-Time Payment (5 minutes)
**What this tests**: Transaction webhooks (`transaction_settled`)

**Steps**:
1. **In the app**: Make a one-time payment
   - Could be: booking a bodyguard, adding credit, etc.
2. Use valid test card:
   ```
   Card Number: 4111 1111 1111 1111
   Expiry: 12/25
   CVV: 123
   ```
3. Complete payment
4. **Expected**: Payment success

**Verify Webhook Processing**:

**Check webhook_logs**:
```
kind: "transaction_settled"
verified: true
```

**Check payment_transactions collection**:
```
transactionId: (Braintree transaction ID)
status: "settled"
amount: (payment amount)
settledAt: (timestamp)
```

✅ **PASS** if transaction logged and status updated

---

### Test 5: Dispute Simulation (Advanced - 10 minutes)
**What this tests**: `dispute_opened` webhook with admin alerts

**Note**: This is harder to test in real-time, but here's how:

**Option A: Braintree Dashboard Simulation**
1. Go to Braintree Dashboard
2. Find a recent transaction from your app
3. Click transaction → "Create Test Dispute"
4. This will trigger `dispute_opened` webhook

**Option B: Special Test Card**
```
Card Number: 4023 8981 2743 6185 (Creates dispute)
Expiry: 12/25
CVV: 123
```
Make payment, then after ~1 minute, dispute webhook should fire

**Verify Webhook Processing**:

**Check webhook_logs**:
```
kind: "dispute_opened"
verified: true
```

**Check disputes collection**:
```
disputeId: (dispute ID)
transactionId: (original transaction)
amount: (disputed amount)
status: "open"
createdAt: (timestamp)
reason: (dispute reason)
```

**Check notifications collection** (ADMIN ALERT):
```
userId: (admin user ID)
type: "dispute_opened"
severity: "high"
title: "🚨 Payment Dispute Opened"
body: "Dispute opened for transaction..."
read: false
```

✅ **PASS** if dispute logged AND admin notification created

---

## 🔄 Real-Time Testing Setup

### Terminal Window 1: Live Logs
```bash
cd /Users/abrahamyunes/blindado/rork-escolta-probodyguard-app
firebase functions:log --only api -f
```

Keep this running - you'll see webhooks arrive in real-time!

### Terminal Window 2: Webhook Log Monitor
```bash
# Create quick monitor script
cat > monitor_webhooks.sh << 'EOF'
#!/bin/bash
echo "🔍 Monitoring webhook_logs collection..."
echo "Press Ctrl+C to stop"
echo ""

while true; do
  clear
  echo "═══════════════════════════════════════"
  echo "📊 WEBHOOK ACTIVITY (Last 5)"
  echo "═══════════════════════════════════════"
  echo ""
  
  firebase functions:log --only api 2>&1 | \
    grep -E "(Webhook|subscription|dispute)" | \
    tail -10
  
  echo ""
  echo "Last updated: $(date)"
  sleep 5
done
EOF

chmod +x monitor_webhooks.sh
./monitor_webhooks.sh
```

### Browser Window: Firestore Live View
1. Open: https://console.firebase.google.com/project/escolta-pro-fe90e/firestore
2. Keep `webhook_logs` collection open
3. Enable auto-refresh (if available)
4. You'll see new documents appear in real-time!

---

## 📊 Test Scorecard

| Test | Event Type | Status | Webhook Logged | Data Updated | Notifications |
|------|-----------|--------|----------------|--------------|---------------|
| Subscription Created | `subscription_charged_successfully` | ⬜ | ⬜ | ⬜ | ⬜ |
| Payment Failed | `subscription_charged_unsuccessfully` | ⬜ | ⬜ | ⬜ | ⬜ |
| Subscription Canceled | `subscription_canceled` | ⬜ | ⬜ | ⬜ | N/A |
| One-Time Payment | `transaction_settled` | ⬜ | ⬜ | ⬜ | N/A |
| Dispute (Optional) | `dispute_opened` | ⬜ | ⬜ | ⬜ | ⬜ |

**Your Score**: ___/5 (or 4/4 if skipping dispute test)

---

## 🎯 What Makes a Test Pass?

For each test to PASS, verify ALL three:

### 1. ✅ Webhook Received & Logged
```
Collection: webhook_logs
{
  kind: "event_type",
  verified: true,  ← MUST be true
  timestamp: recent,
  rawData: { ... }
}
```

### 2. ✅ Data Updated Correctly
Appropriate collection updated:
- Subscriptions → `subscriptions` collection
- Transactions → `payment_transactions` collection
- Disputes → `disputes` collection

### 3. ✅ User Experience Works
- App shows correct status
- User sees success/error messages
- Subscriptions reflect in user account

---

## 🆘 Troubleshooting

### Issue: Webhook not appearing in logs
**Check**:
1. Is webhook URL registered in Braintree?
2. Are functions deployed? `firebase functions:list`
3. Check Braintree logs for webhook delivery attempts
4. Verify Braintree credentials are correct

**Debug command**:
```bash
firebase functions:log --only api | grep -i error
```

### Issue: Webhook received but not processed
**Check**:
1. Look for signature verification errors in logs
2. Check if event type is supported
3. Look for handler errors in Cloud Functions logs

**Debug**:
```bash
firebase functions:log --only api | grep -A 10 "Webhook"
```

### Issue: Data not updating in Firestore
**Check**:
1. Firestore security rules allow writes
2. Handler completed without errors
3. Check specific collection for updates

**Verify rules**:
```bash
cat firestore.rules | grep -A 5 "webhook_logs"
```

### Issue: App payment not triggering webhook
**Check**:
1. Payment actually succeeded in Braintree
2. Check Braintree Dashboard → Transactions
3. Webhook may have delay (30-60 seconds)
4. Check if transaction was in sandbox mode

---

## 📱 Platform-Specific Notes

### iOS Testing
- **Simulator**: Works fine for payment flow testing
- **Real Device**: Better for full integration testing
- **Test Cards**: Same Braintree test cards work
- **Payment UI**: Should use Braintree Drop-in or Hosted Fields

### Android Testing
- **Emulator**: Works fine for payment flow testing
- **Real Device**: Better for full integration testing
- **Test Cards**: Same Braintree test cards work
- **Payment UI**: Should use Braintree SDK

### Expo Go vs Development Build
- **Expo Go**: May have limitations with native payment SDKs
- **Dev Build**: Recommended for full Braintree integration
- **EAS Build**: Required if using custom native modules

---

## 🚀 Quick Start Command

**Open everything you need**:
```bash
# Terminal 1: Start logs monitoring
firebase functions:log --only api -f

# Terminal 2 (new tab): Open Firestore
open "https://console.firebase.google.com/project/escolta-pro-fe90e/firestore"

# Terminal 3 (new tab): Open Braintree
open "https://sandbox.braintreegateway.com"

# Start Expo (if not running)
npx expo start --tunnel
```

---

## ✅ Success Criteria

**Minimum to Pass (4/5 tests)**:
- ✅ Subscription creation webhook works
- ✅ Failed payment webhook works
- ✅ Subscription cancellation webhook works
- ✅ Transaction settlement webhook works

**Bonus**:
- ✅ Dispute webhook works (optional, harder to test)

**System Operational If**:
- All webhooks logged with `verified: true`
- Firestore collections updated correctly
- App shows correct status to users
- No errors in Cloud Functions logs

---

## 📝 Test Results Template

**Fill this out as you test**:

### Test Session Info
- **Date**: October 21, 2025
- **Platform Tested**: ⬜ iOS ⬜ Android ⬜ Both
- **Device**: _________________
- **App Version**: _________________

### Test 1: Subscription Created
- Webhook logged: ⬜ Yes / ⬜ No
- Webhook verified: ⬜ Yes / ⬜ No
- Subscription updated: ⬜ Yes / ⬜ No
- App shows active: ⬜ Yes / ⬜ No
- **Result**: ⬜ PASS / ⬜ FAIL

### Test 2: Payment Failed
- Webhook logged: ⬜ Yes / ⬜ No
- User notification created: ⬜ Yes / ⬜ No
- Status updated to past_due: ⬜ Yes / ⬜ No
- App shows error: ⬜ Yes / ⬜ No
- **Result**: ⬜ PASS / ⬜ FAIL

### Test 3: Subscription Canceled
- Webhook logged: ⬜ Yes / ⬜ No
- Status updated to canceled: ⬜ Yes / ⬜ No
- App reflects cancellation: ⬜ Yes / ⬜ No
- **Result**: ⬜ PASS / ⬜ FAIL

### Test 4: One-Time Payment
- Webhook logged: ⬜ Yes / ⬜ No
- Transaction status: settled
- Payment recorded: ⬜ Yes / ⬜ No
- **Result**: ⬜ PASS / ⬜ FAIL

### Test 5: Dispute (Optional)
- Webhook logged: ⬜ Yes / ⬜ No
- Dispute recorded: ⬜ Yes / ⬜ No
- Admin alert created: ⬜ Yes / ⬜ No
- **Result**: ⬜ PASS / ⬜ FAIL / ⬜ SKIPPED

### Overall Result
- **Tests Passed**: ___/5
- **System Status**: ⬜ OPERATIONAL / ⬜ NEEDS WORK
- **Ready for Production**: ⬜ YES / ⬜ NO

---

## 🎉 Ready to Test!

**Recommended Order**:
1. Start Expo server (if not running)
2. Open monitoring tools (logs, Firestore, Braintree)
3. Launch app on iOS or Android
4. Start with Test 1 (Subscription Creation)
5. Verify webhook arrived before moving to next test
6. Document results as you go

**Estimated Total Time**: 30-40 minutes for all tests

---

**Last Updated**: October 21, 2025  
**Status**: Ready for mobile testing  
**Next Step**: Start Expo and launch the app! 🚀
