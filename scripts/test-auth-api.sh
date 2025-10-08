#!/bin/bash

# Script test tự động Auth Service APIs

set -e

BASE_URL="http://localhost:8081"
TIMESTAMP=$(date +%s)
TEST_EMAIL="test${TIMESTAMP}@example.com"
TEST_PASSWORD="Test@123456"
NEW_PASSWORD="NewTest@123456"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Starting Auth Service API Tests..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test counter
PASS=0
FAIL=0

# Function to test API
test_api() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_success="$5"
    local token="$6"
    
    echo -n "Testing: $name... "
    
    local headers="Content-Type: application/json"
    if [ ! -z "$token" ]; then
        headers="$headers -H Authorization: Bearer $token"
    fi
    
    if [ "$method" == "GET" ]; then
        response=$(curl -s -H "$headers" "$BASE_URL$endpoint")
    else
        response=$(curl -s -X "$method" -H "$headers" -d "$data" "$BASE_URL$endpoint")
    fi
    
    success=$(echo "$response" | python3 -c "import sys, json; print(json.load(sys.stdin).get('success', False))" 2>/dev/null || echo "false")
    
    if [ "$success" == "$expected_success" ]; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASS++))
        echo "$response"
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((FAIL++))
        echo "Response: $response"
    fi
    echo ""
}

# 1. Health Check
test_api "Health Check" "GET" "/health" "" "True" ""

# 2. Register Student
echo "📝 Registering new user: $TEST_EMAIL"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"phone\": \"+84987654321\",
    \"role\": \"student\"
  }")

echo "$REGISTER_RESPONSE" | python3 -m json.tool
echo ""

# Extract tokens
ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['access_token'])" 2>/dev/null || echo "")
REFRESH_TOKEN=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['refresh_token'])" 2>/dev/null || echo "")

if [ -z "$ACCESS_TOKEN" ]; then
    echo -e "${RED}Failed to register user${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Registration successful${NC}"
echo "Access Token: ${ACCESS_TOKEN:0:50}..."
echo "Refresh Token: $REFRESH_TOKEN"
echo ""

# 3. Validate Token
test_api "Validate Token" "GET" "/api/v1/auth/validate" "" "True" "$ACCESS_TOKEN"

# 4. Login
test_api "Login" "POST" "/api/v1/auth/login" "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" "True" ""

# 5. Login with wrong password (should fail)
echo "Testing: Login with wrong password (should fail)... "
WRONG_LOGIN=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"WrongPassword123\"}")
  
wrong_success=$(echo "$WRONG_LOGIN" | python3 -c "import sys, json; print(json.load(sys.stdin).get('success', True))" 2>/dev/null || echo "true")

if [ "$wrong_success" == "False" ]; then
    echo -e "${GREEN}✓ PASS (correctly rejected)${NC}"
    ((PASS++))
else
    echo -e "${RED}✗ FAIL (should have failed)${NC}"
    ((FAIL++))
fi
echo ""

# 6. Refresh Token
test_api "Refresh Token" "POST" "/api/v1/auth/refresh" "{\"refresh_token\":\"$REFRESH_TOKEN\"}" "True" ""

# 7. Change Password
test_api "Change Password" "POST" "/api/v1/auth/change-password" "{\"old_password\":\"$TEST_PASSWORD\",\"new_password\":\"$NEW_PASSWORD\"}" "True" "$ACCESS_TOKEN"

# 8. Login with new password
test_api "Login with new password" "POST" "/api/v1/auth/login" "{\"email\":\"$TEST_EMAIL\",\"password\":\"$NEW_PASSWORD\"}" "True" ""

# 9. Logout
test_api "Logout" "POST" "/api/v1/auth/logout" "{\"refresh_token\":\"$REFRESH_TOKEN\"}" "True" "$ACCESS_TOKEN"

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Test Results:"
echo -e "  ${GREEN}Passed: $PASS${NC}"
echo -e "  ${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
