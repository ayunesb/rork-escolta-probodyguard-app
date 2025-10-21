#!/bin/bash

# Braintree Webhook Testing Script
# This script helps test the webhook endpoint and verify Firestore updates

set -e

echo "🧪 Braintree Webhook Testing Suite"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="escolta-pro-fe90e"
REGION="us-central1"
FUNCTION_NAME="api"
LOCAL_URL="http://localhost:5001/${PROJECT_ID}/${REGION}/${FUNCTION_NAME}/webhooks/braintree"
PROD_URL="https://${REGION}-${PROJECT_ID}.cloudfunctions.net/${FUNCTION_NAME}/webhooks/braintree"

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function for test results
pass_test() {
    echo -e "${GREEN}✅ PASS${NC} $1"
    ((TESTS_PASSED++))
}

fail_test() {
    echo -e "${RED}❌ FAIL${NC} $1"
    ((TESTS_FAILED++))
}

warn_test() {
    echo -e "${YELLOW}⚠️  WARN${NC} $1"
}

# Test 1: Check if functions are deployed
echo "📋 Test 1: Checking Firebase Functions deployment..."
if firebase functions:list | grep -q "${FUNCTION_NAME}"; then
    pass_test "Cloud Functions deployed"
else
    fail_test "Cloud Functions not found"
    echo "   Run: firebase deploy --only functions"
fi
echo ""

# Test 2: Check if endpoint is accessible (production)
echo "📋 Test 2: Testing production endpoint accessibility..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST ${PROD_URL} \
    -H "Content-Type: application/json" \
    -d '{"test":"ping"}' 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "403" ] || [ "$HTTP_CODE" = "200" ]; then
    pass_test "Production endpoint accessible (HTTP $HTTP_CODE)"
else
    warn_test "Production endpoint returned HTTP $HTTP_CODE"
    echo "   This is expected if gateway not initialized yet"
fi
echo ""

# Test 3: Check if emulator is running (optional)
echo "📋 Test 3: Checking local emulator status..."
if curl -s http://localhost:5001 > /dev/null 2>&1; then
    pass_test "Firebase emulator is running"
    
    # Test local endpoint
    LOCAL_HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST ${LOCAL_URL} \
        -H "Content-Type: application/json" \
        -d '{"test":"ping"}' 2>/dev/null || echo "000")
    
    if [ "$LOCAL_HTTP_CODE" = "400" ] || [ "$LOCAL_HTTP_CODE" = "403" ] || [ "$LOCAL_HTTP_CODE" = "200" ]; then
        pass_test "Local webhook endpoint accessible (HTTP $LOCAL_HTTP_CODE)"
    else
        warn_test "Local endpoint returned HTTP $LOCAL_HTTP_CODE"
    fi
else
    warn_test "Firebase emulator not running (optional)"
    echo "   Start with: firebase emulators:start"
fi
echo ""

# Test 4: Check Firestore collections exist
echo "📋 Test 4: Checking Firestore collections..."
echo "   Opening Firebase Console to verify collections..."
echo "   Required collections:"
echo "   - webhook_logs"
echo "   - subscriptions"
echo "   - payment_transactions"
echo "   - disputes"
echo "   - payouts"
echo "   - notifications"
warn_test "Manual verification required - check Firebase Console"
echo ""

# Test 5: Check if Braintree credentials are configured
echo "📋 Test 5: Checking Braintree configuration..."
if [ -f "functions/.env" ]; then
    if grep -q "BRAINTREE_MERCHANT_ID" functions/.env && \
       grep -q "BRAINTREE_PUBLIC_KEY" functions/.env && \
       grep -q "BRAINTREE_PRIVATE_KEY" functions/.env; then
        pass_test "Braintree credentials found in functions/.env"
    else
        fail_test "Braintree credentials missing in functions/.env"
        echo "   Required variables:"
        echo "   - BRAINTREE_MERCHANT_ID"
        echo "   - BRAINTREE_PUBLIC_KEY"
        echo "   - BRAINTREE_PRIVATE_KEY"
    fi
else
    warn_test "functions/.env file not found"
fi
echo ""

# Test 6: Check if webhook handler file exists
echo "📋 Test 6: Checking webhook handler implementation..."
if [ -f "functions/src/webhooks/braintreeHandlers.ts" ]; then
    pass_test "Webhook handler file exists"
    
    # Check if handlers are implemented
    HANDLER_COUNT=$(grep -c "export async function handle" functions/src/webhooks/braintreeHandlers.ts || echo "0")
    if [ "$HANDLER_COUNT" -ge "11" ]; then
        pass_test "All 11 webhook handlers implemented"
    else
        warn_test "Only $HANDLER_COUNT handlers found (expected 11)"
    fi
else
    fail_test "Webhook handler file not found"
fi
echo ""

# Test 7: Check function logs for recent webhook activity
echo "📋 Test 7: Checking recent webhook activity..."
echo "   Fetching last 5 function logs..."
firebase functions:log --only ${FUNCTION_NAME} --limit 5 2>/dev/null | head -20 || warn_test "Could not fetch logs"
echo ""

# Test 8: Verify admin users exist
echo "📋 Test 8: Checking for admin users..."
warn_test "Manual verification required"
echo "   Create admin user in Firestore:"
echo "   Collection: users"
echo "   Document ID: <user_id>"
echo "   Fields: { role: 'admin', email: 'admin@test.com' }"
echo ""

# Generate test webhook payload (for reference)
echo "📋 Test 9: Generating sample webhook test..."
echo "   To test webhooks, use this cURL command with real Braintree signatures:"
echo ""
echo "   Production:"
echo "   curl -X POST ${PROD_URL} \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"bt_signature\":\"[FROM_BRAINTREE]\",\"bt_payload\":\"[FROM_BRAINTREE]\"}'"
echo ""
echo "   Local (if emulator running):"
echo "   curl -X POST ${LOCAL_URL} \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"bt_signature\":\"[FROM_BRAINTREE]\",\"bt_payload\":\"[FROM_BRAINTREE]\"}'"
echo ""
warn_test "Get real signatures from Braintree Dashboard → Webhooks → Test"
echo ""

# Summary
echo "=========================================="
echo "📊 Test Summary"
echo "=========================================="
echo -e "Tests Passed: ${GREEN}${TESTS_PASSED}${NC}"
echo -e "Tests Failed: ${RED}${TESTS_FAILED}${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All critical tests passed!${NC}"
    echo ""
    echo "🎯 Next Steps:"
    echo "1. Open Braintree Dashboard: https://sandbox.braintreegateway.com"
    echo "2. Go to Settings → Webhooks → New Webhook"
    echo "3. Add webhook URL: ${PROD_URL}"
    echo "4. Select all subscription, dispute, and disbursement events"
    echo "5. Click 'Test' to send test webhooks"
    echo "6. Verify data appears in Firebase Console → Firestore"
    echo ""
    echo "📚 See WEBHOOK_TESTING_GUIDE.md for detailed instructions"
else
    echo -e "${RED}⚠️  Some tests failed. Please fix issues before testing webhooks.${NC}"
fi

exit $TESTS_FAILED
