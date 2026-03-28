#!/bin/bash
# ============================================================================
# ESCOLTA PRO - CRITICAL FIXES SCRIPT
# ============================================================================
# This script implements Priority 0 (CRITICAL) fixes from the audit report
# Run this BEFORE any production deployment
# ============================================================================

set -e  # Exit on error

echo "🚨 ESCOLTA PRO - CRITICAL SECURITY FIXES"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track if any fixes were made
FIXES_MADE=0

# ============================================================================
# FIX 1: Disable Email Verification Bypass
# ============================================================================
echo -e "${YELLOW}[1/5]${NC} Checking email verification setting..."

if grep -q "EXPO_PUBLIC_ALLOW_UNVERIFIED_LOGIN=1" .env; then
    echo -e "${RED}  ❌ CRITICAL: Unverified login is ENABLED${NC}"
    echo "  Fixing..."
    
    # Backup .env
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    
    # Fix the setting
    sed -i.bak 's/EXPO_PUBLIC_ALLOW_UNVERIFIED_LOGIN=1/EXPO_PUBLIC_ALLOW_UNVERIFIED_LOGIN=0/' .env
    rm .env.bak
    
    echo -e "${GREEN}  ✅ FIXED: Email verification now required${NC}"
    FIXES_MADE=$((FIXES_MADE + 1))
else
    echo -e "${GREEN}  ✅ OK: Email verification already enforced${NC}"
fi

echo ""

# ============================================================================
# FIX 2: Check Braintree Credentials Security
# ============================================================================
echo -e "${YELLOW}[2/5]${NC} Checking Braintree credentials configuration..."

cd functions

if firebase functions:config:get | grep -q "braintree"; then
    echo -e "${GREEN}  ✅ OK: Braintree credentials in Firebase secrets${NC}"
else
    echo -e "${RED}  ❌ WARNING: Braintree credentials NOT in Firebase secrets${NC}"
    echo ""
    echo "  📝 MANUAL ACTION REQUIRED:"
    echo "  Run the following commands to set Firebase secrets:"
    echo ""
    echo -e "${YELLOW}  cd functions${NC}"
    echo -e "${YELLOW}  firebase functions:config:set \\${NC}"
    echo -e "${YELLOW}    braintree.merchant_id=\"YOUR_MERCHANT_ID\" \\${NC}"
    echo -e "${YELLOW}    braintree.public_key=\"YOUR_PUBLIC_KEY\" \\${NC}"
    echo -e "${YELLOW}    braintree.private_key=\"YOUR_PRIVATE_KEY\" \\${NC}"
    echo -e "${YELLOW}    braintree.env=\"sandbox\"${NC}"
    echo ""
    echo -e "${YELLOW}  firebase deploy --only functions${NC}"
    echo ""
fi

cd ..
echo ""

# ============================================================================
# FIX 3: Check if .env is in Git
# ============================================================================
echo -e "${YELLOW}[3/5]${NC} Checking if .env is tracked by git..."

if git ls-files --error-unmatch .env > /dev/null 2>&1; then
    echo -e "${RED}  ❌ CRITICAL: .env is tracked by git!${NC}"
    echo "  This exposes your secrets in version control."
    echo ""
    echo "  📝 MANUAL ACTION REQUIRED:"
    echo "  1. Remove .env from git: ${YELLOW}git rm --cached .env${NC}"
    echo "  2. Commit the change: ${YELLOW}git commit -m \"Remove .env from version control\"${NC}"
    echo "  3. Push to remote: ${YELLOW}git push${NC}"
    echo ""
    echo "  ⚠️  WARNING: If .env was previously committed, it may exist in git history."
    echo "  To remove from history (DESTRUCTIVE - backup first!):"
    echo "  ${YELLOW}git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env' --prune-empty --tag-name-filter cat -- --all${NC}"
    echo ""
else
    echo -e "${GREEN}  ✅ OK: .env is not tracked by git${NC}"
fi

echo ""

# ============================================================================
# FIX 4: Verify .gitignore
# ============================================================================
echo -e "${YELLOW}[4/5]${NC} Checking .gitignore configuration..."

if grep -q "^\.env$" .gitignore || grep -q "^\.env\*" .gitignore; then
    echo -e "${GREEN}  ✅ OK: .env is in .gitignore${NC}"
else
    echo -e "${RED}  ❌ WARNING: .env not in .gitignore${NC}"
    echo "  Adding .env to .gitignore..."
    echo "" >> .gitignore
    echo "# Environment variables" >> .gitignore
    echo ".env" >> .gitignore
    echo ".env.local" >> .gitignore
    echo ".env.*.local" >> .gitignore
    echo -e "${GREEN}  ✅ FIXED: Added .env to .gitignore${NC}"
    FIXES_MADE=$((FIXES_MADE + 1))
fi

echo ""

# ============================================================================
# FIX 5: Create Missing Background Location Task File
# ============================================================================
echo -e "${YELLOW}[5/5]${NC} Checking background location task..."

if [ ! -f "services/backgroundLocationTask.ts" ]; then
    echo -e "${RED}  ❌ WARNING: Background location task not found${NC}"
    echo "  Creating template file..."
    
    mkdir -p services
    
    cat > services/backgroundLocationTask.ts << 'EOF'
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref, set } from 'firebase/database';
import { realtimeDb } from '@/lib/firebase';

export const BACKGROUND_LOCATION_TASK = 'background-location-task';

// ⚠️ IMPORTANT: This MUST be defined OUTSIDE any component or function
// TaskManager requires tasks to be defined at module scope
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('[BackgroundLocation] Task error:', error);
    return;
  }

  if (data) {
    const { locations } = data as any;
    const location = locations[0];
    
    if (!location) return;
    
    try {
      // Get user ID from AsyncStorage
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.warn('[BackgroundLocation] No user ID found');
        return;
      }

      // Update Firebase Realtime Database
      const locationRef = ref(realtimeDb(), `guardLocations/${userId}`);
      await set(locationRef, {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        heading: location.coords.heading,
        speed: location.coords.speed,
        accuracy: location.coords.accuracy,
        timestamp: Date.now(),
      });

      console.log('[BackgroundLocation] Location updated successfully');
    } catch (err) {
      console.error('[BackgroundLocation] Update failed:', err);
    }
  }
});

// Helper function to start background location updates
export async function startBackgroundLocationUpdates(): Promise<boolean> {
  try {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.error('[BackgroundLocation] Background permission denied');
      return false;
    }

    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.High,
      timeInterval: 10000, // 10 seconds
      distanceInterval: 10, // 10 meters
      foregroundService: {
        notificationTitle: 'Escolta Pro - Active Booking',
        notificationBody: 'Tracking your location for active booking',
        notificationColor: '#DAA520',
      },
    });

    console.log('[BackgroundLocation] Started successfully');
    return true;
  } catch (error) {
    console.error('[BackgroundLocation] Failed to start:', error);
    return false;
  }
}

// Helper function to stop background location updates
export async function stopBackgroundLocationUpdates(): Promise<void> {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
    
    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      console.log('[BackgroundLocation] Stopped successfully');
    }
  } catch (error) {
    console.error('[BackgroundLocation] Failed to stop:', error);
  }
}
EOF

    echo -e "${GREEN}  ✅ CREATED: services/backgroundLocationTask.ts${NC}"
    echo "  📝 TODO: Import and use in LocationTrackingContext.tsx"
    FIXES_MADE=$((FIXES_MADE + 1))
else
    echo -e "${GREEN}  ✅ OK: Background location task exists${NC}"
fi

echo ""
echo "========================================="
echo ""

# ============================================================================
# SUMMARY
# ============================================================================
if [ $FIXES_MADE -gt 0 ]; then
    echo -e "${GREEN}✅ Applied $FIXES_MADE critical fix(es)${NC}"
    echo ""
    echo "📝 NEXT STEPS:"
    echo "1. Review changes in .env file"
    echo "2. Configure Firebase Functions secrets (see instructions above)"
    echo "3. Review and integrate backgroundLocationTask.ts"
    echo "4. Test thoroughly before deploying"
    echo ""
    echo "⚠️  Backup created: .env.backup.<timestamp>"
else
    echo -e "${GREEN}✅ No critical issues found!${NC}"
    echo ""
    echo "📝 MANUAL VERIFICATION STILL REQUIRED:"
    echo "1. Verify Braintree credentials are in Firebase secrets"
    echo "2. Verify App Check is enabled in Firebase Console"
    echo "3. Test background location tracking on physical device"
fi

echo ""
echo "========================================="
echo "For complete audit results, see:"
echo "  📄 NASA_GRADE_AUDIT_REPORT.md"
echo "========================================="
