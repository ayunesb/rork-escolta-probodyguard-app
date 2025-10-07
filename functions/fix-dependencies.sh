#!/bin/bash

echo "Fixing Firebase Functions dependencies..."

# Remove all cached files
echo "Removing node_modules and lock files..."
rm -rf node_modules
rm -f package-lock.json
rm -f bun.lock
rm -rf lib

# Clear npm cache
echo "Clearing npm cache..."
npm cache clean --force

# Install dependencies
echo "Installing dependencies..."
npm install

# Install type definitions explicitly
echo "Installing type definitions..."
npm install --save-dev @types/node @types/express @types/cors

# Build
echo "Building TypeScript..."
npm run build

echo "Done! Now you can run: firebase deploy --only functions"
