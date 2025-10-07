#!/bin/bash

echo "Fixing Cloud Functions dependencies..."

cd "$(dirname "$0")"

echo "Removing node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

echo "Installing dependencies..."
npm install

echo "Building TypeScript..."
npm run build

echo "Done! Dependencies fixed."
