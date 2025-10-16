#!/bin/bash

echo "🧹 Cleaning up any existing processes..."
pkill -9 -f "firebase emulators:start" 2>/dev/null
pkill -9 -f "expo start" 2>/dev/null
sleep 2

echo ""
echo "🔥 Starting Firebase Emulators in background..."
firebase emulators:start > firebase-emulator.log 2>&1 &
FIREBASE_PID=$!
echo "   Firebase emulators starting (PID: $FIREBASE_PID)"

echo ""
echo "⏳ Waiting for Firebase emulators to start..."
sleep 15

echo ""
echo "✅ Checking Firebase emulators status..."
lsof -i :9099,8080,9000,5001 | grep LISTEN | awk '{print "   ✓", $1, "on port", $9}'

echo ""
echo "👥 Creating demo users..."
node setup-demo-users-quick.cjs

echo ""
echo "📱 Starting Expo dev server..."
echo "   Server will be available at: http://192.168.0.42:8081"
echo ""
npx expo start --dev-client

echo ""
echo "❌ Shutting down..."
kill $FIREBASE_PID 2>/dev/null
