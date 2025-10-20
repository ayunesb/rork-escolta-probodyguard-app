#!/bin/bash

echo "🧹 Cleaning up existing processes..."
pkill -f firebase
pkill -f expo  
pkill -f metro
lsof -ti :8081 | xargs kill -9 2>/dev/null || true
lsof -ti :9099 | xargs kill -9 2>/dev/null || true
lsof -ti :8080 | xargs kill -9 2>/dev/null || true
sleep 3

echo "🔥 Starting Firebase emulators..."
cd /Users/abrahamyunes/blindado/rork-escolta-probodyguard-app
firebase emulators:start --only auth,firestore,database > firebase-emulator.log 2>&1 &
FIREBASE_PID=$!
echo "Firebase PID: $FIREBASE_PID"

echo "⏳ Waiting for Firebase emulators to start..."
sleep 10

echo "🧪 Testing Firebase emulators..."
if curl -f http://127.0.0.1:9099 > /dev/null 2>&1; then
    echo "✅ Auth emulator is running"
else
    echo "❌ Auth emulator failed"
fi

if curl -f http://127.0.0.1:8080 > /dev/null 2>&1; then
    echo "✅ Firestore emulator is running"
else
    echo "❌ Firestore emulator failed"
fi

echo "🚀 Starting Expo development server..."
npm start > expo-dev.log 2>&1 &
EXPO_PID=$!
echo "Expo PID: $EXPO_PID"

echo "⏳ Waiting for Expo to start..."
sleep 8

echo "🧪 Testing Expo server..."
if curl -f http://127.0.0.1:8081 > /dev/null 2>&1; then
    echo "✅ Expo server is running"
else
    echo "❌ Expo server failed"
fi

echo ""
echo "📱 Services started!"
echo "🔥 Firebase Emulator UI: http://127.0.0.1:4000"
echo "📱 Expo Dev Server: http://127.0.0.1:8081"
echo ""
echo "📄 Logs:"
echo "  Firebase: tail -f firebase-emulator.log"
echo "  Expo: tail -f expo-dev.log"
echo ""
echo "🛑 To stop all services:"
echo "  kill $FIREBASE_PID $EXPO_PID"
echo ""
echo "Both services are running in the background."
echo "You can now test your app!"