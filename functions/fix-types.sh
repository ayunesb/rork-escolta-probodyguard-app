#!/bin/bash

echo "Fixing TypeScript type declarations..."

cd "$(dirname "$0")"

echo "Removing node_modules and lock files..."
rm -rf node_modules package-lock.json

echo "Installing dependencies..."
npm install

echo "Installing type definitions..."
npm install --save-dev @types/node @types/express @types/cors

echo "Verifying installation..."
if [ -d "node_modules/firebase-functions" ] && [ -d "node_modules/firebase-admin" ]; then
  echo "✓ Dependencies installed successfully"
else
  echo "✗ Installation failed"
  exit 1
fi

echo "Building TypeScript..."
npm run build

if [ $? -eq 0 ]; then
  echo "✓ Build successful!"
  echo ""
  echo "Now you can deploy with: firebase deploy --only functions"
else
  echo "✗ Build failed"
  exit 1
fi
