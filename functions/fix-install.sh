#!/bin/bash

echo "Fixing Firebase Functions installation..."

cd "$(dirname "$0")"

echo "Removing node_modules and lock files..."
rm -rf node_modules package-lock.json lib

echo "Installing dependencies..."
npm install

echo "Installing missing type definitions..."
npm install --save-dev @types/braintree @types/node

echo "Building TypeScript..."
npm run build

echo "Done! Now you can run: firebase deploy --only functions"
