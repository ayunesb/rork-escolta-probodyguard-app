#!/bin/bash
# ============================================================================
# ESCOLTA PRO - COMPREHENSIVE TESTING SCRIPT
# ============================================================================
# Tests all critical systems before development build
# ============================================================================

set -e

echo "🧪 ESCOLTA PRO - COMPREHENSIVE TESTING"
echo "======================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PASS=0
FAIL=0

# ============================================================================
# Test 1: Environment Configuration
# ============================================================================
echo -e "${YELLOW}[1/8]${NC} Testing environment configuration..."

if grep -q "EXPO_PUBLIC_ALLOW_UNVERIFIED_LOGIN=0" .env 2>/dev/null; then
    echo -e "${GREEN}  ✅ Email verification enforced${NC}"
    PASS=$((PASS + 1))
else
    echo -e "${RED}  ❌ Email verification bypass still enabled${NC}"
    FAIL=$((FAIL + 1))
fi

if ! git ls-files --error-unmatch .env > /dev/null 2>&1; then
    echo -e "${GREEN}  ✅ .env not tracked by git${NC}"
    PASS=$((PASS + 1))
else
    echo -e "${RED}  ❌ .env still tracked by git${NC}"
    FAIL=$((FAIL + 1))
fi

echo ""

# ============================================================================
# Test 2: TypeScript Compilation
# ============================================================================
echo -e "${YELLOW}[2/8]${NC} Testing TypeScript compilation..."

if npx tsc --noEmit > /dev/null 2>&1; then
    echo -e "${GREEN}  ✅ TypeScript compiles without errors${NC}"
    PASS=$((PASS + 1))
else
    echo -e "${RED}  ❌ TypeScript compilation errors found${NC}"
    npx tsc --noEmit 2>&1 | head -n 10
    FAIL=$((FAIL + 1))
fi

echo ""

# ============================================================================
# Test 3: Background Location Task
# ============================================================================
echo -e "${YELLOW}[3/8]${NC} Testing background location implementation..."

if [ -f "services/backgroundLocationTask.ts" ]; then
    echo -e "${GREEN}  ✅ Background location task file exists${NC}"
    PASS=$((PASS + 1))
else
    echo -e "${RED}  ❌ Background location task file missing${NC}"
    FAIL=$((FAIL + 1))
fi

if grep -q "startBackgroundLocationUpdates" contexts/LocationTrackingContext.tsx; then
    echo -e "${GREEN}  ✅ Background location integrated in context${NC}"
    PASS=$((PASS + 1))
else
    echo -e "${RED}  ❌ Background location not integrated${NC}"
    FAIL=$((FAIL + 1))
fi

echo ""

# ============================================================================
# Test 4: Notification Context
# ============================================================================
echo -e "${YELLOW}[4/8]${NC} Testing notification fixes..."

if grep -q "useMemo" contexts/NotificationContext.tsx; then
    echo -e "${GREEN}  ✅ Notification context uses useMemo${NC}"
    PASS=$((PASS + 1))
else
    echo -e "${RED}  ❌ Notification context missing useMemo${NC}"
    FAIL=$((FAIL + 1))
fi

if grep -q "Constants.appOwnership" contexts/NotificationContext.tsx; then
    echo -e "${GREEN}  ✅ Expo Go detection implemented${NC}"
    PASS=$((PASS + 1))
else
    echo -e "${RED}  ❌ Expo Go detection missing${NC}"
    FAIL=$((FAIL + 1))
fi

echo ""

# ============================================================================
# Test 5: Firebase Configuration
# ============================================================================
echo -e "${YELLOW}[5/8]${NC} Testing Firebase configuration..."

if [ -f "firestore.rules" ] && [ -f "database.rules.json" ]; then
    echo -e "${GREEN}  ✅ Security rules files present${NC}"
    PASS=$((PASS + 1))
else
    echo -e "${RED}  ❌ Security rules files missing${NC}"
    FAIL=$((FAIL + 1))
fi

if [ -f "firestore.indexes.json" ]; then
    INDEX_COUNT=$(grep -o '"collectionGroup"' firestore.indexes.json | wc -l)
    if [ "$INDEX_COUNT" -ge 3 ]; then
        echo -e "${GREEN}  ✅ Firestore indexes configured ($INDEX_COUNT indexes)${NC}"
        PASS=$((PASS + 1))
    else
        echo -e "${YELLOW}  ⚠️  Only $INDEX_COUNT Firestore indexes found${NC}"
        FAIL=$((FAIL + 1))
    fi
else
    echo -e "${RED}  ❌ firestore.indexes.json missing${NC}"
    FAIL=$((FAIL + 1))
fi

echo ""

# ============================================================================
# Test 6: Dependencies
# ============================================================================
echo -e "${YELLOW}[6/8]${NC} Testing dependencies..."

if [ -d "node_modules" ]; then
    echo -e "${GREEN}  ✅ node_modules exists${NC}"
    PASS=$((PASS + 1))
else
    echo -e "${RED}  ❌ node_modules missing - run npm install${NC}"
    FAIL=$((FAIL + 1))
fi

# Check critical packages
CRITICAL_PACKAGES=(
    "expo"
    "firebase"
    "expo-location"
    "expo-task-manager"
    "expo-notifications"
    "@react-native-async-storage/async-storage"
)

MISSING_PACKAGES=()
for package in "${CRITICAL_PACKAGES[@]}"; do
    if ! npm list "$package" > /dev/null 2>&1; then
        MISSING_PACKAGES+=("$package")
    fi
done

if [ ${#MISSING_PACKAGES[@]} -eq 0 ]; then
    echo -e "${GREEN}  ✅ All critical packages installed${NC}"
    PASS=$((PASS + 1))
else
    echo -e "${RED}  ❌ Missing packages: ${MISSING_PACKAGES[*]}${NC}"
    FAIL=$((FAIL + 1))
fi

echo ""

# ============================================================================
# Test 7: EAS Configuration
# ============================================================================
echo -e "${YELLOW}[7/8]${NC} Testing EAS build configuration..."

if [ -f "eas.json" ]; then
    echo -e "${GREEN}  ✅ eas.json exists${NC}"
    PASS=$((PASS + 1))
    
    if grep -q '"development"' eas.json; then
        echo -e "${GREEN}  ✅ Development build profile configured${NC}"
        PASS=$((PASS + 1))
    else
        echo -e "${RED}  ❌ Development build profile missing${NC}"
        FAIL=$((FAIL + 1))
    fi
else
    echo -e "${RED}  ❌ eas.json missing${NC}"
    FAIL=$((FAIL + 1))
fi

echo ""

# ============================================================================
# Test 8: Documentation
# ============================================================================
echo -e "${YELLOW}[8/8]${NC} Testing documentation..."

DOCS=(
    "NASA_GRADE_AUDIT_REPORT.md"
    "POST_AUDIT_CHECKLIST.md"
    "AUDIT_SUMMARY.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}  ✅ $doc exists${NC}"
        PASS=$((PASS + 1))
    else
        echo -e "${RED}  ❌ $doc missing${NC}"
        FAIL=$((FAIL + 1))
    fi
done

echo ""
echo "======================================="
echo ""

# ============================================================================
# Summary
# ============================================================================
TOTAL=$((PASS + FAIL))
PERCENTAGE=$((PASS * 100 / TOTAL))

echo "📊 TEST RESULTS"
echo "==============="
echo -e "Passed: ${GREEN}$PASS${NC} / $TOTAL"
echo -e "Failed: ${RED}$FAIL${NC} / $TOTAL"
echo -e "Score:  ${PERCENTAGE}%"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
    echo ""
    echo "🚀 READY FOR DEVELOPMENT BUILD"
    echo "Next steps:"
    echo "  1. eas build --profile development --platform android"
    echo "  2. eas build --profile development --platform ios"
    echo ""
    exit 0
else
    echo -e "${RED}❌ $FAIL TEST(S) FAILED${NC}"
    echo ""
    echo "⚠️  FIX ISSUES BEFORE BUILDING"
    echo "See NASA_GRADE_AUDIT_REPORT.md for details"
    echo ""
    exit 1
fi
