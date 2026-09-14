#!/bin/bash

echo "🔧 Deploying Firestore Rules Fixes..."
echo ""

# Deploy Firestore rules
echo "📋 Deploying Firestore rules..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo "✅ Firestore rules deployed successfully!"
    echo ""
    echo "⏳ Waiting for rules to propagate (30 seconds)..."
    sleep 30
    echo ""
    echo "✅ Rules should now be active!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Clear your app cache"
    echo "2. Reload the app"
    echo "3. Try logging in with: client@demo.com / <contrasena en tu .env local, no en el repositorio>"
    echo ""
    echo "🔍 Monitor console logs for [Auth] messages"
else
    echo "❌ Failed to deploy Firestore rules"
    echo "Please check your Firebase configuration and try again"
    exit 1
fi
