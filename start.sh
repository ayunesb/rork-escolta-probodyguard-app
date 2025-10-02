#!/bin/bash

# Startup script for Escolta Pro app
# This script provides multiple ways to start the app

echo "🚀 Starting Escolta Pro..."
echo ""

# Check if bunx is available
if command -v bunx &> /dev/null; then
    echo "✅ Using bunx"
    bunx rork start -p hmr2gyljt3crd3naxg27q --tunnel
elif command -v npx &> /dev/null; then
    echo "✅ Using npx (bunx not found)"
    npx rork start -p hmr2gyljt3crd3naxg27q --tunnel
else
    echo "❌ Error: Neither bunx nor npx found"
    echo "Please install Node.js or Bun:"
    echo "  - Node.js: https://nodejs.org/"
    echo "  - Bun: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi
