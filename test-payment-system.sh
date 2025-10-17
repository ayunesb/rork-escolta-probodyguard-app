#!/bin/bash
# Payment System Testing Script
# This script tests the complete payment flow

echo "🔍 Payment System Testing Suite"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test Results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=$3
    
    echo -n "Testing: $name... "
    
    response=$(curl -s -w "\n%{http_code}" "$url")
    status_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$status_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ PASSED${NC} (Status: $status_code)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC} (Expected: $expected_status, Got: $status_code)"
        echo "Response: $body"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Function to check if service is running
check_service() {
    local service=$1
    local port=$2
    
    echo -n "Checking $service on port $port... "
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✅ RUNNING${NC}"
        return 0
    else
        echo -e "${RED}❌ NOT RUNNING${NC}"
        return 1
    fi
}

echo "📋 Step 1: Checking Services"
echo "----------------------------"
check_service "Firebase Functions" 5001
check_service "Firestore" 8080
check_service "Auth" 9099
check_service "Storage" 9199
echo ""

echo "📋 Step 2: Testing API Endpoints"
echo "--------------------------------"

# Test client token generation
test_endpoint "Client Token Generation" \
    "http://127.0.0.1:5001/escolta-pro-fe90e/us-central1/api/payments/client-token" \
    200

# Test hosted payment form page
test_endpoint "Hosted Payment Form" \
    "http://127.0.0.1:5001/escolta-pro-fe90e/us-central1/api/payments/hosted-form?clientToken=test&amount=100" \
    200

echo ""

echo "📋 Step 3: Validating Client Token"
echo "----------------------------------"
echo "Generating client token..."

TOKEN_RESPONSE=$(curl -s "http://127.0.0.1:5001/escolta-pro-fe90e/us-central1/api/payments/client-token")
CLIENT_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.clientToken' 2>/dev/null)

if [ -n "$CLIENT_TOKEN" ] && [ "$CLIENT_TOKEN" != "null" ]; then
    echo -e "${GREEN}✅ Client token generated successfully${NC}"
    echo "Token length: ${#CLIENT_TOKEN} characters"
    echo "Token preview: ${CLIENT_TOKEN:0:50}..."
    TESTS_PASSED=$((TESTS_PASSED + 1))
    
    # Test the hosted form with real token
    echo ""
    echo "Testing hosted payment form with real token..."
    FORM_URL="http://127.0.0.1:5001/escolta-pro-fe90e/us-central1/api/payments/hosted-form?clientToken=${CLIENT_TOKEN}&amount=100&returnUrl=nobodyguard://payment/success"
    echo "Form URL: $FORM_URL"
    echo ""
    echo -e "${YELLOW}ℹ️  You can test the payment form in your browser:${NC}"
    echo "$FORM_URL"
else
    echo -e "${RED}❌ Failed to generate client token${NC}"
    echo "Response: $TOKEN_RESPONSE"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""
echo "📋 Step 4: Checking Environment Variables"
echo "----------------------------------------"

check_env_var() {
    local var_name=$1
    local var_value="${!var_name}"
    
    echo -n "Checking $var_name... "
    
    if [ -n "$var_value" ]; then
        echo -e "${GREEN}✅ SET${NC}"
        return 0
    else
        echo -e "${RED}❌ NOT SET${NC}"
        return 1
    fi
}

# Load environment variables from .env
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

check_env_var "BRAINTREE_MERCHANT_ID"
check_env_var "BRAINTREE_PUBLIC_KEY"
check_env_var "BRAINTREE_PRIVATE_KEY"
check_env_var "EXPO_PUBLIC_BRAINTREE_TOKENIZATION_KEY"
check_env_var "EXPO_PUBLIC_FIREBASE_API_KEY"
check_env_var "EXPO_PUBLIC_API_URL"

echo ""
echo "📋 Step 5: Firestore Connection Test"
echo "------------------------------------"
echo "Testing Firestore emulator connection..."

FIRESTORE_TEST=$(curl -s http://127.0.0.1:8080)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Firestore emulator is accessible${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ Firestore emulator is not accessible${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""
echo "================================"
echo "📊 Test Results Summary"
echo "================================"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! System is ready for manual testing.${NC}"
    echo ""
    echo "📱 Next Steps:"
    echo "1. Launch the app: bun run start"
    echo "2. Navigate to a guard's profile"
    echo "3. Create a booking"
    echo "4. Proceed to payment"
    echo "5. Use test card: 4111 1111 1111 1111"
    echo "   Expiry: 12/25, CVV: 123, Zip: 12345"
    echo ""
    echo "📖 See COMPREHENSIVE_AUDIT_OCTOBER_2025.md for full details"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Please check the output above.${NC}"
    echo ""
    echo "Common issues:"
    echo "- Firebase emulators not running: firebase emulators:start"
    echo "- Environment variables not set: check .env file"
    echo "- Port conflicts: check if ports 5001, 8080, etc. are available"
    exit 1
fi
