# 🧪 MANUAL WEBHOOK TESTING WALKTHROUGH

**Test Date**: October 21, 2025  
**Tester**: Abraham Yunes  
**Status**: 🔄 IN PROGRESS

---

## 🎯 Quick Start - Follow These Steps

### ✅ Step 1: Verify System is Ready (2 minutes)

**Check that functions are deployed:**
```bash
firebase functions:list
```

**Expected**: You should see `api` function listed as ACTIVE

**Check recent logs:**
```bash
firebase functions:log --only api | head -30
```

**Expected**: Should see Braintree initialization logs

---

### ✅ Step 2: Open Braintree Dashboard (1 minute)

**Action**: 
1. Open your browser
2. Go to: https://sandbox.braintreegateway.com
3. Login with your credentials

**Expected**: You should see the Braintree sandbox dashboard

---

### ✅ Step 3: Navigate to Webhooks (1 minute)

**Action**:
1. In Braintree Dashboard, click **Settings** (gear icon)
2. Click **Webhooks** in the left sidebar
3. You should see your webhook listed

**Your Webhook URL**:
```
https://us-central1-escolta-pro-fe90e.cloudfunctions.net/api/webhooks/braintree
```

**Expected Status**: 
- ✅ ENABLED
- ✅ Shows "Disbursement +22 more" or similar

---

### ✅ Step 4: Test Webhook Connection (2 minutes)

**Action**:
1. Click on your webhook URL in the list
2. Look for a **"Check URL"** button or **"Test"** button
3. Click it

**Expected Result**:
- ✅ "Success! Server responded with 200"
- ✅ Green checkmark or success message

**If you see an error**:
- Check that the URL is exactly correct
- Verify functions are deployed
- Check Firebase Functions logs

---

### ✅ Step 5: Send Test Subscription Event (3 minutes)

**Action**:
1. Still in webhook details/edit page
2. Look for **"Test Notification"** section or dropdown
3. Select event: **`subscription_charged_successfully`**
4. Click **"Send Test Notification"** button

**Expected Result**:
- ✅ "Test notification sent successfully"
- ✅ Server responded with 200 or 204

**Now Verify in Firestore**:
1. Open: https://console.firebase.google.com/project/escolta-pro-fe90e/firestore
2. Go to **`webhook_logs`** collection
3. Look for the newest document

**What to check in webhook_logs**:
```
kind: "subscription_charged_successfully"
verified: true
timestamp: (recent timestamp)
rawData: (should have subscription data)
```

**Check subscriptions collection**:
1. Go to **`subscriptions`** collection in Firestore
2. Look for newly created/updated documents
3. Should see status updates

✅ **PASS** if you see the webhook logged with `verified: true`

---

### ✅ Step 6: Test Dispute Event with Admin Alert (3 minutes)

**Action**:
1. In Braintree webhook test section
2. Select event: **`dispute_opened`**
3. Click **"Send Test Notification"**

**Expected Result**:
- ✅ "Test notification sent successfully"

**Verify in Firestore**:

**Check webhook_logs**:
1. New document with `kind: "dispute_opened"`
2. `verified: true`

**Check disputes collection**:
1. Go to **`disputes`** collection
2. Should see new dispute record with:
   - `disputeId`
   - `amount`
   - `status`
   - `timestamp`

**Check notifications collection** (Admin Alert):
1. Go to **`notifications`** collection
2. Look for new document with:
   - `type: "dispute_opened"`
   - `severity: "high"`
   - `title: "🚨 Payment Dispute Opened"`
   - `userId: (admin user ID if exists)`

✅ **PASS** if dispute logged AND admin notification created

---

### ✅ Step 7: Test Disbursement Event (2 minutes)

**Action**:
1. In Braintree webhook test section
2. Select event: **`disbursement`**
3. Click **"Send Test Notification"**

**Verify in Firestore**:

**Check webhook_logs**:
- New document with `kind: "disbursement"`

**Check payouts collection**:
1. Go to **`payouts`** collection
2. Should see new payout record with:
   - `disbursementId`
   - `amount`
   - `status`
   - `disbursedAt`

✅ **PASS** if payout record created

---

### ✅ Step 8: Test Failed Payment (3 minutes)

**Action**:
1. Select event: **`subscription_charged_unsuccessfully`**
2. Click **"Send Test Notification"**

**Verify in Firestore**:

**Check webhook_logs**:
- Document with `kind: "subscription_charged_unsuccessfully"`

**Check subscriptions collection**:
- Status should update to `"past_due"` or similar

**Check notifications collection**:
- User notification should be created
- Type: `"subscription_charged_unsuccessfully"`
- Should have payment failure message

✅ **PASS** if subscription status updated AND user notification created

---

### ✅ Step 9: Check Cloud Functions Logs (2 minutes)

**Action**:
```bash
firebase functions:log --only api | grep -i webhook | head -50
```

**What to look for**:
- ✅ `[Webhook] Received request`
- ✅ `[Webhook] Signature verified successfully`
- ✅ `[Webhook] Parsed notification: subscription_charged_successfully` (or other events)
- ✅ No error messages
- ✅ Successful processing logs

**Check for errors**:
```bash
firebase functions:log --only api | grep -i error | head -20
```

**Expected**: Should see minimal or no errors related to webhooks

✅ **PASS** if logs show successful webhook processing

---

### ✅ Step 10: Test Security - Invalid Request (1 minute)

**Action** (in terminal):
```bash
curl -X POST \
  https://us-central1-escolta-pro-fe90e.cloudfunctions.net/api/webhooks/braintree \
  -H "Content-Type: application/json" \
  -d '{"unauthorized": "request"}' \
  -w "\nHTTP Status: %{http_code}\n"
```

**Expected Result**:
```json
{"error":"Missing signature or payload"}
HTTP Status: 400
```

✅ **PASS** if request is rejected with 400 error

---

## 📊 TEST SCORECARD

Mark each test as you complete it:

| # | Test | Status | Notes |
|---|------|--------|-------|
| 1 | System Ready Check | ⬜ | Functions deployed? |
| 2 | Braintree Dashboard Access | ⬜ | Can you login? |
| 3 | Webhook Listed | ⬜ | Webhook visible & enabled? |
| 4 | "Check URL" Test | ⬜ | Returns 200? |
| 5 | Subscription Success Event | ⬜ | Logged & processed? |
| 6 | Dispute Event + Admin Alert | ⬜ | Both logs & alert? |
| 7 | Disbursement Event | ⬜ | Payout created? |
| 8 | Failed Payment + User Alert | ⬜ | Status & notification? |
| 9 | Cloud Functions Logs | ⬜ | No errors? |
| 10 | Security Rejection | ⬜ | Unauthorized blocked? |

**Passing Score**: 8/10 or better  
**Your Score**: ___/10

---

## 🆘 Troubleshooting

### Issue: "Check URL" fails with 403
**Solution**: 
- Verify Braintree credentials in Firebase Functions config
- Check that functions are deployed
- Verify webhook URL is exactly correct

### Issue: Webhook logs not appearing in Firestore
**Solution**:
- Check Firebase Functions logs: `firebase functions:log --only api`
- Verify Firestore rules allow writes to webhook_logs
- Check if handler is throwing errors

### Issue: Admin notifications not created
**Solution**:
- Check if admin users exist in Firestore `users` collection
- Look for users with `role: "admin"`
- Check Cloud Functions logs for notification creation errors

### Issue: Events received but not processed
**Solution**:
- Check signature verification logs
- Verify event type is one of the 11 supported
- Check for handler errors in logs

---

## 📞 Quick Commands

**View latest logs**:
```bash
firebase functions:log --only api --limit 50
```

**Check webhook logs in Firestore** (requires script):
```bash
node test_webhook_system.js
```

**Open Firestore Console**:
```bash
open https://console.firebase.google.com/project/escolta-pro-fe90e/firestore
```

**Open Braintree Dashboard**:
```bash
open https://sandbox.braintreegateway.com
```

---

## ✅ Completion Checklist

After completing all tests:

- [ ] All 10 tests passed (or at least 8/10)
- [ ] Webhook_logs collection has multiple entries
- [ ] Different event types processed successfully
- [ ] Admin notifications working for critical events
- [ ] User notifications working for relevant events
- [ ] No critical errors in Cloud Functions logs
- [ ] Security validation rejecting unauthorized requests
- [ ] Ready to update MANUAL_TEST_WALKTHROUGH.md with results

---

## 📝 Your Test Results

**Fill this in as you test**:

### Test 1: System Ready
- Functions deployed: ⬜ Yes / ⬜ No
- Logs showing Braintree init: ⬜ Yes / ⬜ No

### Test 4: Check URL
- Response code: _____
- Success message: ⬜ Yes / ⬜ No

### Test 5: Subscription Success
- Webhook logged: ⬜ Yes / ⬜ No
- Subscription updated: ⬜ Yes / ⬜ No
- Verified: true: ⬜ Yes / ⬜ No

### Test 6: Dispute Event
- Webhook logged: ⬜ Yes / ⬜ No
- Dispute record created: ⬜ Yes / ⬜ No
- Admin notification created: ⬜ Yes / ⬜ No

### Test 7: Disbursement
- Webhook logged: ⬜ Yes / ⬜ No
- Payout record created: ⬜ Yes / ⬜ No

### Test 8: Failed Payment
- Webhook logged: ⬜ Yes / ⬜ No
- Status updated to past_due: ⬜ Yes / ⬜ No
- User notification created: ⬜ Yes / ⬜ No

### Test 9: Logs Review
- Webhook processing logs found: ⬜ Yes / ⬜ No
- Signature verification working: ⬜ Yes / ⬜ No
- No critical errors: ⬜ Yes / ⬜ No

### Test 10: Security
- Unauthorized request rejected: ⬜ Yes / ⬜ No
- Returned 400 error: ⬜ Yes / ⬜ No

---

**Ready to begin? Start with Step 1! ⬆️**

**Estimated Total Time**: 20-25 minutes

**Last Updated**: October 21, 2025  
**Status**: Ready for manual testing
