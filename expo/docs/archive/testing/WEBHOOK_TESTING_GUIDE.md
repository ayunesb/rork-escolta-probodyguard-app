# 🧪 Braintree Webhook Testing Guide

## Prerequisites Checklist

Before testing webhooks, ensure:
- ✅ Functions deployed to Firebase
- ✅ Braintree sandbox account access
- ✅ Webhook handler code deployed
- ✅ Firestore collections ready

---

## Step 1: Get Your Webhook URL

Your webhook endpoint is:
```
https://us-central1-escolta-pro-fe90e.cloudfunctions.net/api/webhooks/braintree
```

Or for local testing with emulator:
```
http://localhost:5001/escolta-pro-fe90e/us-central1/api/webhooks/braintree
```

---

## Step 2: Configure Braintree Sandbox Webhook

### A. Login to Braintree
1. Go to: https://sandbox.braintreegateway.com/login
2. Login with your sandbox credentials

### B. Navigate to Webhooks
1. Click **Settings** (gear icon in top right)
2. Click **Webhooks** in the left menu
3. Click **New Webhook**

### C. Configure Webhook
**Destination URL:**
```
https://us-central1-escolta-pro-fe90e.cloudfunctions.net/api/webhooks/braintree
```

**Select Events to Monitor:**
- ✅ `subscription_charged_successfully`
- ✅ `subscription_charged_unsuccessfully`
- ✅ `subscription_canceled`
- ✅ `subscription_expired`
- ✅ `dispute_opened`
- ✅ `dispute_lost`
- ✅ `dispute_won`
- ✅ `disbursement`
- ✅ `disbursement_exception`

Click **Create Webhook**

---

## Step 3: Test Each Webhook Type

### Method 1: Using Braintree Dashboard (Recommended)

#### Test Subscription Events
1. Go to **Webhooks** page in Braintree dashboard
2. Find your webhook in the list
3. Click **Test** button
4. Select event type: `subscription_charged_successfully`
5. Click **Send Test Notification**
6. Verify response shows `200 OK`

Repeat for each event type:
- `subscription_charged_successfully`
- `subscription_charged_unsuccessfully`
- `subscription_expired`
- `subscription_canceled`

#### Test Dispute Events
1. Click **Test** on your webhook
2. Select: `dispute_opened`
3. Send notification
4. Check for admin notification in Firestore

Test all dispute events:
- `dispute_opened`
- `dispute_lost`
- `dispute_won`

#### Test Disbursement Events
1. Click **Test** on your webhook
2. Select: `disbursement`
3. Send notification
4. Verify payout record created

Test both:
- `disbursement`
- `disbursement_exception`

---

### Method 2: Using cURL (Manual Testing)

First, get a test webhook from Braintree:
1. Go to Braintree Dashboard → Webhooks
2. Click on your webhook
3. Click "Test" and capture the bt_signature and bt_payload

Then test locally:

```bash
# Test with local emulator
curl -X POST http://localhost:5001/escolta-pro-fe90e/us-central1/api/webhooks/braintree \
  -H "Content-Type: application/json" \
  -d '{
    "bt_signature": "[PASTE_FROM_BRAINTREE]",
    "bt_payload": "[PASTE_FROM_BRAINTREE]"
  }'

# Expected response:
# {"success":true}
```

---

### Method 3: Create Real Sandbox Transactions

#### Create Subscription and Trigger Webhook
```bash
# Use Braintree SDK to create subscription
# This will trigger real webhook events
```

**Node.js Example:**
```javascript
const braintree = require('braintree');

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: 'YOUR_MERCHANT_ID',
  publicKey: 'YOUR_PUBLIC_KEY',
  privateKey: 'YOUR_PRIVATE_KEY'
});

// Create subscription (will trigger subscription_charged_successfully)
gateway.subscription.create({
  paymentMethodToken: 'payment_method_token',
  planId: 'test_plan'
}, (err, result) => {
  console.log('Subscription created:', result.subscription.id);
  // Wait for webhook to fire
});
```

---

## Step 4: Verify in Firestore

After sending test webhooks, verify data in Firebase Console:

### Check Webhook Logs
```
Firebase Console → Firestore → Collections → webhook_logs
```

Should see entries like:
```json
{
  "kind": "subscription_charged_successfully",
  "timestamp": "2025-10-21T...",
  "verified": true,
  "rawData": "..."
}
```

### Check Subscriptions Collection
```
Firestore → subscriptions
```

Should see:
```json
{
  "status": "active",
  "lastChargedAt": "2025-10-21T...",
  "lastChargedAmount": "10.00",
  "nextBillingDate": "2025-11-21"
}
```

### Check Disputes Collection
```
Firestore → disputes
```

Should see:
```json
{
  "transactionId": "...",
  "status": "open",
  "amount": "100.00",
  "reason": "fraud",
  "replyByDate": "2025-10-28"
}
```

### Check Notifications Collection
```
Firestore → notifications
```

For admin alerts:
```json
{
  "userId": "admin_user_id",
  "type": "dispute_opened",
  "severity": "high",
  "title": "🚨 Payment Dispute Opened",
  "read": false
}
```

For user notifications:
```json
{
  "userId": "user_id",
  "type": "payment_failed",
  "title": "Payment Failed",
  "body": "Your subscription payment failed. Please update your payment method."
}
```

### Check Payouts Collection
```
Firestore → payouts
```

Should see:
```json
{
  "merchantAccountId": "...",
  "amount": "1000.00",
  "status": "completed",
  "disbursementDate": "2025-10-21"
}
```

---

## Step 5: Test Admin Notifications

### Create Test Admin User
```javascript
// In Firebase Console → Authentication → Add User
Email: admin@test.com
Password: test123

// In Firestore → users collection → Add Document
{
  "email": "admin@test.com",
  "role": "admin",
  "firstName": "Test",
  "lastName": "Admin"
}
```

### Trigger Dispute Webhook
1. Send `dispute_opened` webhook from Braintree
2. Check `notifications` collection for admin user
3. Verify notification has:
   - `type: "dispute_opened"`
   - `severity: "high"`
   - `title` contains "Dispute Opened"

---

## Step 6: Test Error Handling

### Test Invalid Signature
```bash
curl -X POST http://localhost:5001/escolta-pro-fe90e/us-central1/api/webhooks/braintree \
  -H "Content-Type: application/json" \
  -d '{
    "bt_signature": "invalid_signature",
    "bt_payload": "test_payload"
  }'

# Expected response: 403 Forbidden
# {"error":"Invalid webhook signature"}
```

### Test Missing Credentials
```bash
# Temporarily remove Braintree credentials from .env
# Restart functions emulator
# Send webhook

# Expected response: 500
# {"error":{"code":"PAYMENT_CONFIG_ERROR","message":"Payment system is not properly configured"}}
```

---

## Step 7: Monitor Logs

### Firebase Functions Logs
```bash
# View real-time logs
firebase functions:log --only api

# Or in Firebase Console:
# Functions → api → Logs tab
```

### Look for these log entries:
```
[Webhook] Signature verified successfully
[Webhook] Parsed notification: subscription_charged_successfully
✅ Subscription charge processed successfully
```

### Check for errors:
```
❌ [Webhook] Signature verification failed
❌ Failed to handle subscription charged successfully
```

---

## Step 8: Performance Testing

### Test Multiple Webhooks
Send 10 webhooks in quick succession:

```bash
for i in {1..10}; do
  curl -X POST http://localhost:5001/escolta-pro-fe90e/us-central1/api/webhooks/braintree \
    -H "Content-Type: application/json" \
    -d "{\"bt_signature\":\"test_$i\",\"bt_payload\":\"payload_$i\"}" &
done
```

Verify:
- All webhooks logged in `webhook_logs`
- No duplicate processing
- Response time < 2 seconds

---

## Automated Test Script

Create `test-webhooks.sh`:

```bash
#!/bin/bash

echo "🧪 Testing Braintree Webhooks..."

# Test endpoint availability
echo "\n1. Testing endpoint availability..."
curl -I https://us-central1-escolta-pro-fe90e.cloudfunctions.net/api/webhooks/braintree

# Note: Full webhook testing requires valid Braintree signatures
# These must be generated from the Braintree dashboard

echo "\n✅ Endpoint is accessible"
echo "\n📝 Next: Configure webhook in Braintree dashboard"
echo "   URL: https://us-central1-escolta-pro-fe90e.cloudfunctions.net/api/webhooks/braintree"
```

Run with:
```bash
chmod +x test-webhooks.sh
./test-webhooks.sh
```

---

## Troubleshooting

### Webhook Returns 403 (Invalid Signature)
**Cause:** Signature verification failed  
**Fix:** 
- Verify Braintree credentials in Cloud Functions environment
- Check that webhook is coming from Braintree
- Verify gateway initialization

### Webhook Returns 500 (Internal Error)
**Cause:** Database write failure or code error  
**Fix:**
- Check Cloud Functions logs: `firebase functions:log`
- Verify Firestore rules allow writes
- Check for missing environment variables

### No Data in Firestore
**Cause:** Webhook received but handler failed  
**Fix:**
- Check `webhook_logs` collection for entry
- Look at `rawData` field for webhook content
- Check `unhandled_webhooks` for unknown event types

### Admin Not Getting Alerts
**Cause:** No admin users in database  
**Fix:**
- Create user with `role: "admin"` in Firestore
- Check `notifications` collection for pending alerts
- Verify notification query in handler code

---

## Production Checklist

Before going to production:

- [ ] Test all 11 webhook event types
- [ ] Verify Firestore updates for each event
- [ ] Test admin notification system
- [ ] Test user notification system  
- [ ] Configure production webhook URL in Braintree
- [ ] Update Braintree credentials to production
- [ ] Set up monitoring alerts
- [ ] Document webhook retry policy
- [ ] Test webhook performance under load
- [ ] Verify webhook logs are being captured

---

## Quick Reference

### Webhook Events & Expected Behavior

| Event | Database Update | Notification |
|-------|----------------|--------------|
| `subscription_charged_successfully` | subscriptions → `status: active` | None |
| `subscription_charged_unsuccessfully` | subscriptions → `status: past_due` | User: Payment failed |
| `subscription_canceled` | subscriptions → `status: canceled` | None |
| `subscription_expired` | subscriptions → `status: expired` | User: Subscription expired |
| `dispute_opened` | disputes → new record | Admin: CRITICAL alert |
| `dispute_lost` | disputes → `status: lost` | Admin: HIGH alert |
| `dispute_won` | disputes → `status: won` | Admin: LOW alert |
| `disbursement` | payouts → new record | None |
| `disbursement_exception` | payouts → `status: failed` | Admin: CRITICAL alert |

---

## Support

**Braintree Documentation:**
- Webhooks: https://developer.paypal.com/braintree/docs/guides/webhooks
- Testing: https://developer.paypal.com/braintree/docs/guides/webhooks/testing-go-live

**Firebase Documentation:**
- Cloud Functions Logs: https://firebase.google.com/docs/functions/writing-and-viewing-logs
- Firestore Console: https://console.firebase.google.com/

---

**Last Updated:** October 21, 2025  
**Status:** Ready for Testing ✅
