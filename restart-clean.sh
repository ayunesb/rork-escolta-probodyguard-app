#!/bin/bash

echo "🔄 Clean Restart Script"
echo "======================="

# Step 1: Kill all processes
echo ""
echo "Step 1: Stopping all processes..."
pkill -f firebase 2>/dev/null
pkill -f "node.*expo" 2>/dev/null
pkill -f "bun.*rork" 2>/dev/null
xcrun simctl shutdown all 2>/dev/null

# Step 2: Clear all ports
echo "Step 2: Clearing Firebase ports..."
for port in 9099 8080 9000 8085 9199 5001 4400 4500; do
  lsof -ti:$port | xargs kill -9 2>/dev/null
done

# Step 3: Clear Expo port
echo "Step 3: Clearing Expo port 8081..."
lsof -ti:8081 | xargs kill -9 2>/dev/null

echo "✅ All processes stopped and ports cleared!"
echo ""
echo "⏱️  Waiting 3 seconds..."
sleep 3

# Step 4: Start Firebase
echo ""
echo "Step 4: Starting Firebase Emulators..."
echo "📍 This will run in this terminal"
echo "📍 Open a NEW terminal and run: bun run start"
echo "📍 Then press 'i' to launch iOS simulator"
echo ""
echo "=================================="
firebase emulators:start
