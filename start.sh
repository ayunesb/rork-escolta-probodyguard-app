#!/bin/bash

# Startup script for Escolta Pro app
# This script provides multiple ways to start the app

echo "🚀 Starting Escolta Pro..."
echo ""

# Check if npx is available (Node.js)
if command -v npx &> /dev/null; then
    echo "✅ Using npx"
    npx rork start -p hmr2gyljt3crd3naxg27q --tunnel
elif command -v bunx &> /dev/null; then
    echo "✅ Using bunx"
    bunx rork start -p hmr2gyljt3crd3naxg27q --tunnel
else
    echo "❌ Error: Neither npx nor bunx found"
    echo "Please install Node.js:"
    echo "  - Node.js: https://nodejs.org/"
    exit 1
fi
