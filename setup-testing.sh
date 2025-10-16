#!/bin/bash

# 🚀 Quick Testing Setup - Escolta Pro
# This script prepares your app for testing with real devices

set -e  # Exit on error

echo "🔍 Pre-Testing Setup Checklist"
echo "================================"
echo ""

# Check if EAS CLI is installed
echo "📦 Checking EAS CLI..."
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g eas-cli
    echo "✅ EAS CLI installed"
else
    echo "✅ EAS CLI already installed ($(eas --version))"
fi

# Check Expo login status
echo ""
echo "🔐 Checking Expo authentication..."
if eas whoami &> /dev/null; then
    EXPO_USER=$(eas whoami)
    echo "✅ Logged in as: $EXPO_USER"
else
    echo "⚠️  Not logged in to Expo"
    echo "   Run: npx expo login"
    echo ""
    read -p "Would you like to login now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npx expo login
    else
        echo "⏭️  Skipping login. You'll need to login before building."
    fi
fi

# Check Firebase emulators status
echo ""
echo "🔥 Checking Firebase emulators..."
if lsof -i :9099 &> /dev/null; then
    echo "✅ Firebase emulators already running"
else
    echo "⚠️  Firebase emulators not running"
    echo "   Starting emulators in background..."
    firebase emulators:start > firebase-emulator.log 2>&1 &
    echo "   Waiting for emulators to start..."
    sleep 5
    
    if lsof -i :9099 &> /dev/null; then
        echo "✅ Firebase emulators started"
    else
        echo "❌ Failed to start emulators. Check firebase-emulator.log"
        exit 1
    fi
fi

# Check demo users
echo ""
echo "👥 Checking demo users..."
if [ -f "setup-demo-users-quick.cjs" ]; then
    echo "   Creating demo users..."
    node setup-demo-users-quick.cjs
    echo "✅ Demo users ready"
else
    echo "⚠️  Demo user setup script not found"
fi

# Check .env configuration
echo ""
echo "⚙️  Checking environment configuration..."
if [ -f ".env" ]; then
    if grep -q "EXPO_PUBLIC_API_URL" .env && grep -q "BRAINTREE_MERCHANT_ID" .env; then
        echo "✅ Environment variables configured"
        echo ""
        echo "   Current API URL: $(grep EXPO_PUBLIC_API_URL .env | cut -d '=' -f2)"
        echo "   Braintree Merchant: $(grep BRAINTREE_MERCHANT_ID .env | cut -d '=' -f2)"
        echo "   Braintree Environment: $(grep BRAINTREE_ENVIRONMENT .env | cut -d '=' -f2)"
    else
        echo "⚠️  Missing required environment variables in .env"
    fi
else
    echo "❌ .env file not found"
    exit 1
fi

# Get local IP for remote testing
echo ""
echo "🌐 Network Configuration"
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || echo "Not found")
if [ "$LOCAL_IP" != "Not found" ]; then
    echo "   Your local IP: $LOCAL_IP"
    echo "   For remote device testing, update .env:"
    echo "   EXPO_PUBLIC_API_URL=http://$LOCAL_IP:5001/escolta-pro-fe90e/us-central1/api"
else
    echo "⚠️  Could not determine local IP address"
fi

echo ""
echo "================================"
echo "✅ Pre-Testing Setup Complete!"
echo "================================"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1️⃣  For LOCAL testing (iOS Simulator):"
echo "    npx expo start --dev-client"
echo "    Press 'i' to open iOS simulator"
echo ""
echo "2️⃣  For REMOTE testing (Real devices via EAS):"
echo "    iOS:     eas build -p ios --profile development"
echo "    Android: eas build -p android --profile development"
echo "    (Build takes ~15-20 minutes, you'll get a download link)"
echo ""
echo "3️⃣  For TUNNEL testing (Expo Go - limited features):"
echo "    npx expo start --tunnel"
echo "    Share QR code with testers"
echo "    ⚠️  NOTE: Payment WebView won't work in Expo Go!"
echo ""
echo "🧪 Test Accounts:"
echo "    Client: client@demo.com / demo123"
echo "    Guard:  guard1@demo.com / demo123"
echo ""
echo "💳 Test Credit Card:"
echo "    Card: 4111 1111 1111 1111"
echo "    CVV: 123, Exp: 12/26, Zip: 12345"
echo ""
echo "📊 Monitor at: http://localhost:4000 (Firebase UI)"
echo "📝 Logs: tail -f firebase-emulator.log"
echo ""
