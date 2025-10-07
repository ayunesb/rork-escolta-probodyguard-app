#!/bin/bash
# Clear all Metro and Expo caches

echo "Clearing Metro bundler cache..."
rm -rf .expo
rm -rf node_modules/.cache
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*
rm -rf $TMPDIR/react-*

echo "Cache cleared. Now run: bun expo start --clear"
