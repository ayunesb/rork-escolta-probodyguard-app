#!/bin/bash

# 📱 MOBILE WEBHOOK TESTING - QUICK SETUP
# This script opens all the tools you need for testing

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║       📱 MOBILE WEBHOOK TESTING - SETUP WIZARD              ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if Expo is running
echo "🔍 Step 1: Checking Expo status..."
if ps aux | grep -E "expo start" | grep -v grep > /dev/null; then
    echo "   ✅ Expo is running!"
    echo "   📱 Scan QR code with Expo Go app to launch"
else
    echo "   ⚠️  Expo not running"
    echo "   Starting Expo now..."
    echo ""
    echo "   Run this in a new terminal:"
    echo "   cd /Users/abrahamyunes/blindado/rork-escolta-probodyguard-app"
    echo "   npx expo start --tunnel"
    echo ""
    read -p "Press Enter after starting Expo..."
fi

echo ""
echo "🌐 Step 2: Opening monitoring dashboards..."
echo ""

# Open Firestore Console
echo "   📊 Opening Firebase Console (Firestore)..."
open "https://console.firebase.google.com/project/escolta-pro-fe90e/firestore/databases/-default-/data/~2Fwebhook_logs"
sleep 1

# Open Braintree Dashboard
echo "   💳 Opening Braintree Sandbox Dashboard..."
open "https://sandbox.braintreegateway.com"
sleep 1

echo ""
echo "📋 Step 3: Testing Tools Setup"
echo ""
echo "   You now have 3 options for monitoring:"
echo ""
echo "   Option A: Live logs in this terminal (Recommended)"
echo "   Option B: Webhook monitor script"
echo "   Option C: Manual log checking"
echo ""

read -p "Start live webhook monitoring? (y/n): " start_logs

if [[ $start_logs == "y" || $start_logs == "Y" ]]; then
    echo ""
    echo "🔍 Starting live webhook monitoring..."
    echo "   Press Ctrl+C to stop"
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "          LIVE WEBHOOK LOGS - Watching for events..."
    echo "═══════════════════════════════════════════════════════════"
    echo ""
    
    # Start live logs with webhook filtering
    firebase functions:log --only api 2>&1 | grep --line-buffered -E "(Webhook|subscription|dispute|transaction|Braintree)" | while read line; do
        echo "$(date '+%H:%M:%S') | $line"
    done
else
    echo ""
    echo "📝 Manual Monitoring Instructions:"
    echo ""
    echo "   Terminal Command (run in new window):"
    echo "   firebase functions:log --only api -f"
    echo ""
    echo "   OR use the monitor script:"
    echo "   ./monitor_webhooks.sh"
    echo ""
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    🎉 SETUP COMPLETE!                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📱 Now open the Rork app on your device:"
echo "   1. Open Expo Go app"
echo "   2. Scan the QR code from Expo terminal"
echo "   3. Login to your test account"
echo "   4. Navigate to payment/subscription section"
echo ""
echo "💳 Test Cards:"
echo "   Success: 4111 1111 1111 1111 (Exp: 12/25, CVV: 123)"
echo "   Decline: 4000 0000 0000 0002 (Exp: 12/25, CVV: 123)"
echo ""
echo "📚 Full guide: MOBILE_WEBHOOK_TESTING.md"
echo ""
