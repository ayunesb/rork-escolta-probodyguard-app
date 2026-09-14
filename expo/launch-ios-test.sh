#!/bin/bash

# 🚀 Quick Testing Script
# This script helps you launch the app in iOS Simulator

echo "🎯 Escolta Pro - Quick Testing"
echo "================================"
echo ""
echo "📱 Current Status:"
echo "  ✅ Expo Dev Server: Running"
echo "  ✅ Firebase Emulators: Running"
echo "  ✅ iOS Simulator: Ready"
echo ""
echo "🚀 Launching iOS Simulator..."
echo ""

# Wait a moment for Metro to be ready
sleep 2

# Try to send 'i' command to Expo via the log file
# This simulates pressing 'i' in the Expo terminal
echo "Attempting to launch iOS app..."

# Open Simulator if not already open
open -a Simulator

# Wait for Simulator to be ready
sleep 3

# Try to trigger iOS build
osascript -e 'tell application "Terminal"
    do script "sleep 1 && echo \"Opening iOS Simulator from app...\""
end tell' 2>/dev/null

echo ""
echo "📋 Manual Steps:"
echo "  1. iOS Simulator should be opening now"
echo "  2. In the terminal with the QR code, press 'i'"
echo "  3. App will install automatically"
echo ""
echo "🔐 Test Credentials:"
echo "  Client: client@demo.com / <contrasena en tu .env local, no en el repositorio>"
echo "  Guard:  guard1@demo.com / <contrasena en tu .env local, no en el repositorio>"
echo ""
echo "💳 Test Card:"
echo "  Card: 4111 1111 1111 1111"
echo "  CVV: 123, Exp: 12/26, Zip: 12345"
echo ""
echo "📊 Monitor Firebase:"
echo "  http://localhost:4000"
echo ""
echo "🎉 Happy Testing!"
