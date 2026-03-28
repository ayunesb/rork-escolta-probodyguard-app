#!/bin/bash

echo "🛠️  COMPLETE APP STARTUP SCRIPT"
echo "==============================="

# Function to cleanup
cleanup() {
    echo "🧹 Cleaning up processes..."
    pkill -f firebase 2>/dev/null || true
    pkill -f expo 2>/dev/null || true
    pkill -f metro 2>/dev/null || true
    lsof -ti :8081 | xargs kill -9 2>/dev/null || true
    lsof -ti :9099 | xargs kill -9 2>/dev/null || true
    lsof -ti :8080 | xargs kill -9 2>/dev/null || true
    lsof -ti :5001 | xargs kill -9 2>/dev/null || true
    lsof -ti :4000 | xargs kill -9 2>/dev/null || true
    sleep 3
}

# Cleanup any existing processes
cleanup

cd /Users/abrahamyunes/blindado/rork-escolta-probodyguard-app

echo "🔥 Starting Firebase emulators (Auth + Firestore + Functions)..."
firebase emulators:start --only auth,firestore,functions > firebase-complete.log 2>&1 &
FIREBASE_PID=$!
echo "Firebase PID: $FIREBASE_PID"

echo "⏳ Waiting for Firebase emulators to initialize..."
sleep 15

echo "🧪 Testing Firebase services..."
if curl -f http://127.0.0.1:9099 > /dev/null 2>&1; then
    echo "✅ Auth emulator (port 9099) - Running"
else
    echo "❌ Auth emulator - Failed"
fi

if curl -f http://127.0.0.1:8080 > /dev/null 2>&1; then
    echo "✅ Firestore emulator (port 8080) - Running"
else
    echo "❌ Firestore emulator - Failed"
fi

if curl -f http://127.0.0.1:5001 > /dev/null 2>&1; then
    echo "✅ Functions emulator (port 5001) - Running"
else
    echo "❌ Functions emulator - Failed"
fi

# Test payment endpoint specifically
if curl -s http://127.0.0.1:5001/escolta-pro-fe90e/us-central1/api/payments/client-token | grep -q "clientToken\|token"; then
    echo "✅ Payment API - Working"
else
    echo "⚠️  Payment API - Check logs"
fi

echo ""
echo "🚀 Starting Expo development server..."
npm start > expo-complete.log 2>&1 &
EXPO_PID=$!
echo "Expo PID: $EXPO_PID"

echo "⏳ Waiting for Expo to start..."
sleep 10

echo "🧪 Testing Expo server..."
if curl -f http://127.0.0.1:8081 > /dev/null 2>&1; then
    echo "✅ Expo server (port 8081) - Running"
else
    echo "❌ Expo server - Failed"
fi

echo ""
echo "🎉 SERVICES STATUS"
echo "=================="
echo "🔥 Firebase Emulator UI: http://127.0.0.1:4000"
echo "🔐 Firebase Auth: http://127.0.0.1:9099"
echo "📄 Firebase Firestore: http://127.0.0.1:8080"  
echo "⚡ Firebase Functions: http://127.0.0.1:5001"
echo "💳 Payment API: http://127.0.0.1:5001/escolta-pro-fe90e/us-central1/api"
echo "📱 Expo Dev Server: http://127.0.0.1:8081"
echo ""
echo "📊 LIVE LOGS"
echo "============"
echo "Firebase: tail -f firebase-complete.log"
echo "Expo: tail -f expo-complete.log"
echo ""
echo "🛑 STOP SERVICES"
echo "==============="
echo "kill $FIREBASE_PID $EXPO_PID"
echo ""
echo "✨ Ready for testing! Both services are running in background."
echo "Open http://127.0.0.1:8081 to access your app!"