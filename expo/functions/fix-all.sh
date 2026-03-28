#!/bin/bash

echo "🔧 Comprehensive Firebase Functions Fix"
echo "========================================"

cd "$(dirname "$0")"

echo ""
echo "📦 Step 1: Cleaning up..."
rm -rf node_modules
rm -f package-lock.json
rm -rf lib

echo ""
echo "📦 Step 2: Installing dependencies..."
npm install

echo ""
echo "📦 Step 3: Verifying node_modules..."
if [ ! -d "node_modules/firebase-functions" ]; then
  echo "❌ firebase-functions not found, installing again..."
  npm install firebase-functions@^6.4.0 --save
fi

if [ ! -d "node_modules/firebase-admin" ]; then
  echo "❌ firebase-admin not found, installing again..."
  npm install firebase-admin@^12.7.0 --save
fi

if [ ! -d "node_modules/express" ]; then
  echo "❌ express not found, installing again..."
  npm install express@^4.21.2 --save
fi

if [ ! -d "node_modules/cors" ]; then
  echo "❌ cors not found, installing again..."
  npm install cors@^2.8.5 --save
fi

echo ""
echo "📦 Step 4: Installing type definitions..."
npm install --save-dev @types/express @types/cors @types/node

echo ""
echo "📦 Step 5: Verifying installation..."
if [ -d "node_modules/firebase-functions" ] && [ -d "node_modules/firebase-admin" ] && [ -d "node_modules/express" ] && [ -d "node_modules/cors" ]; then
  echo "✅ All dependencies installed successfully"
else
  echo "❌ Some dependencies are missing"
  exit 1
fi

echo ""
echo "🔨 Step 6: Building TypeScript..."
npm run build

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Build successful!"
  echo ""
  echo "📝 Next steps:"
  echo "   1. Deploy: firebase deploy --only functions"
  echo "   2. Test: curl https://us-central1-escolta-pro-fe90e.cloudfunctions.net/api"
else
  echo ""
  echo "❌ Build failed. Check errors above."
  exit 1
fi
