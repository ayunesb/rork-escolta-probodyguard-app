#!/bin/bash

# Quick Start Guide for Braintree Webhook Testing
# This script provides step-by-step instructions

echo "🚀 Braintree Webhook Quick Start Guide"
echo "======================================"
echo ""

# Step 1: Check deployment
echo "📦 STEP 1: Verify Deployment"
echo "----------------------------"
echo "Checking if functions are deployed..."
if firebase functions:list | grep -q "api"; then
    echo "✅ Functions are deployed"
else
    echo "❌ Functions not deployed"
    echo "   Run: firebase deploy --only functions"
    exit 1
fi
echo ""

# Step 2: Get webhook URL
echo "🔗 STEP 2: Your Webhook URL"
echo "----------------------------"
WEBHOOK_URL="https://us-central1-escolta-pro-fe90e.cloudfunctions.net/api/webhooks/braintree"
echo "Copy this URL:"
echo ""
echo "   $WEBHOOK_URL"
echo ""
echo "✅ URL copied to clipboard (if pbcopy available)"
echo "$WEBHOOK_URL" | pbcopy 2>/dev/null || true
echo ""

# Step 3: Braintree setup instructions
echo "🎯 STEP 3: Configure in Braintree"
echo "----------------------------"
echo "1. Open: https://sandbox.braintreegateway.com"
echo "2. Login with your sandbox credentials"
echo "3. Click Settings (gear icon) → Webhooks"
echo "4. Click 'New Webhook'"
echo "5. Paste URL: $WEBHOOK_URL"
echo "6. Select these events:"
echo "   ✓ subscription_charged_successfully"
echo "   ✓ subscription_charged_unsuccessfully"
echo "   ✓ subscription_canceled"
echo "   ✓ subscription_expired"
echo "   ✓ dispute_opened"
echo "   ✓ dispute_lost"
echo "   ✓ dispute_won"
echo "   ✓ disbursement"
echo "   ✓ disbursement_exception"
echo "7. Click 'Create Webhook'"
echo ""

# Step 4: Test webhook
echo "🧪 STEP 4: Test the Webhook"
echo "----------------------------"
echo "In Braintree Dashboard:"
echo "1. Find your webhook in the list"
echo "2. Click 'Test' button"
echo "3. Select an event (e.g., subscription_charged_successfully)"
echo "4. Click 'Send Test Notification'"
echo "5. Verify response shows '200 OK'"
echo ""

# Step 5: Verify in Firestore
echo "✅ STEP 5: Verify in Firestore"
echo "----------------------------"
echo "Open Firebase Console: https://console.firebase.google.com"
echo "1. Select project: escolta-pro-fe90e"
echo "2. Go to Firestore Database"
echo "3. Check 'webhook_logs' collection for new entries"
echo "4. Verify data in appropriate collections:"
echo "   - subscriptions (for subscription events)"
echo "   - disputes (for dispute events)"
echo "   - payouts (for disbursement events)"
echo "   - notifications (for admin alerts)"
echo ""

# Step 6: Run automated tests
echo "🔍 STEP 6: Run Automated Tests"
echo "----------------------------"
echo "Run the test script:"
echo "   ./test-webhooks.sh"
echo ""

# Step 7: Monitor logs
echo "📊 STEP 7: Monitor Logs"
echo "----------------------------"
echo "Watch real-time logs:"
echo "   firebase functions:log --only api"
echo ""
echo "Or view in console:"
echo "   https://console.firebase.google.com/project/escolta-pro-fe90e/functions/logs"
echo ""

# Summary
echo "=========================================="
echo "📚 Additional Resources"
echo "=========================================="
echo "• Full Testing Guide: ./WEBHOOK_TESTING_GUIDE.md"
echo "• Automated Tests: ./test-webhooks.sh"
echo "• Braintree Docs: https://developer.paypal.com/braintree/docs/guides/webhooks"
echo ""
echo "🎉 Ready to test! Follow the steps above."
echo ""

# Ask if user wants to open Braintree dashboard
read -p "Open Braintree sandbox dashboard now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    open "https://sandbox.braintreegateway.com" 2>/dev/null || \
    xdg-open "https://sandbox.braintreegateway.com" 2>/dev/null || \
    echo "Please open: https://sandbox.braintreegateway.com"
fi

# Ask if user wants to open Firebase console
read -p "Open Firebase Console now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    open "https://console.firebase.google.com/project/escolta-pro-fe90e/firestore" 2>/dev/null || \
    xdg-open "https://console.firebase.google.com/project/escolta-pro-fe90e/firestore" 2>/dev/null || \
    echo "Please open: https://console.firebase.google.com/project/escolta-pro-fe90e/firestore"
fi

echo ""
echo "✅ Setup guide complete!"
