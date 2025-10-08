#!/bin/bash

# Comprehensive Auth Service API Testing Script
# Tests all endpoints with various scenarios including error cases

set -e

BASE_URL="http://localhost:8081"
TIMESTAMP=$(date +%s)

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
PASS=0
FAIL=0
TOTAL=0

# Test function
test_endpoint() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_code="$5"
    local token="$6"
    
    ((TOTAL++))
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Test #${TOTAL}: $test_name${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if [ "$method" == "GET" ]; then
        if [ ! -z "$token" ]; then
            response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $token" "$BASE_URL$endpoint")
        else
            response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
        fi
    else
        if [ ! -z "$token" ]; then
            response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d "$data" "$BASE_URL$endpoint")
        else
            response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
        fi
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    echo "Request: $method $endpoint"
    if [ ! -z "$data" ]; then
        echo "Body: $data"
    fi
    echo ""
    echo "Response (HTTP $http_code):"
    echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
    echo ""
    
    if [ "$http_code" == "$expected_code" ]; then
        echo -e "${GREEN}✓ PASS - Expected HTTP $expected_code${NC}"
        ((PASS++))
    else
        echo -e "${RED}✗ FAIL - Expected HTTP $expected_code, got $http_code${NC}"
        ((FAIL++))
    fi
    
    echo "$body"
}

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║        AUTH SERVICE COMPREHENSIVE API TESTING              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Wait for service to be ready
echo "⏳ Waiting for service to be ready..."
sleep 3

# Test 1: Health Check
test_endpoint "Health Check" "GET" "/health" "" "200" ""

# Test 2: Register with valid data
EMAIL1="student${TIMESTAMP}@test.com"
test_endpoint "Register - Valid Student" "POST" "/api/v1/auth/register" \
  "{\"email\":\"$EMAIL1\",\"password\":\"Test@123456\",\"phone\":\"+84987654321\",\"role\":\"student\"}" \
  "201" ""

# Save tokens from response
ACCESS_TOKEN=$(echo "$body" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['access_token'])" 2>/dev/null || echo "")
REFRESH_TOKEN=$(echo "$body" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['refresh_token'])" 2>/dev/null || echo "")

echo ""
echo -e "${YELLOW}📝 Saved tokens for later tests${NC}"
echo "Access Token: ${ACCESS_TOKEN:0:50}..."
echo "Refresh Token: $REFRESH_TOKEN"

# Test 3: Register with duplicate email
test_endpoint "Register - Duplicate Email (should fail)" "POST" "/api/v1/auth/register" \
  "{\"email\":\"$EMAIL1\",\"password\":\"Test@123456\",\"phone\":\"+84999999999\",\"role\":\"student\"}" \
  "400" ""

# Test 4: Register with invalid email
test_endpoint "Register - Invalid Email (should fail)" "POST" "/api/v1/auth/register" \
  "{\"email\":\"not-an-email\",\"password\":\"Test@123456\",\"role\":\"student\"}" \
  "400" ""

# Test 5: Register with weak password
test_endpoint "Register - Weak Password (should fail)" "POST" "/api/v1/auth/register" \
  "{\"email\":\"test${TIMESTAMP}@test.com\",\"password\":\"123\",\"role\":\"student\"}" \
  "400" ""

# Test 6: Register with duplicate phone
test_endpoint "Register - Duplicate Phone (should fail)" "POST" "/api/v1/auth/register" \
  "{\"email\":\"another${TIMESTAMP}@test.com\",\"password\":\"Test@123456\",\"phone\":\"+84987654321\",\"role\":\"student\"}" \
  "400" ""

# Test 7: Register instructor
EMAIL2="instructor${TIMESTAMP}@test.com"
test_endpoint "Register - Valid Instructor" "POST" "/api/v1/auth/register" \
  "{\"email\":\"$EMAIL2\",\"password\":\"Instructor@123\",\"phone\":\"+84912345678\",\"role\":\"instructor\"}" \
  "201" ""

# Test 8: Register without phone (should work)
EMAIL3="nophone${TIMESTAMP}@test.com"
test_endpoint "Register - No Phone Number" "POST" "/api/v1/auth/register" \
  "{\"email\":\"$EMAIL3\",\"password\":\"Test@123456\",\"role\":\"student\"}" \
  "201" ""

# Test 9: Login with correct credentials
test_endpoint "Login - Valid Credentials" "POST" "/api/v1/auth/login" \
  "{\"email\":\"$EMAIL1\",\"password\":\"Test@123456\"}" \
  "200" ""

# Update tokens
NEW_ACCESS_TOKEN=$(echo "$body" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['access_token'])" 2>/dev/null || echo "$ACCESS_TOKEN")
NEW_REFRESH_TOKEN=$(echo "$body" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['refresh_token'])" 2>/dev/null || echo "$REFRESH_TOKEN")
ACCESS_TOKEN=$NEW_ACCESS_TOKEN
REFRESH_TOKEN=$NEW_REFRESH_TOKEN

# Test 10: Login with wrong password
test_endpoint "Login - Wrong Password (should fail)" "POST" "/api/v1/auth/login" \
  "{\"email\":\"$EMAIL1\",\"password\":\"WrongPassword123\"}" \
  "401" ""

# Test 11: Login with non-existent email
test_endpoint "Login - Non-existent Email (should fail)" "POST" "/api/v1/auth/login" \
  "{\"email\":\"doesnotexist@test.com\",\"password\":\"Test@123456\"}" \
  "401" ""

# Test 12: Login with empty credentials
test_endpoint "Login - Empty Credentials (should fail)" "POST" "/api/v1/auth/login" \
  "{\"email\":\"\",\"password\":\"\"}" \
  "400" ""

# Test 13: Validate token with valid token
test_endpoint "Validate Token - Valid Token" "GET" "/api/v1/auth/validate" "" "200" "$ACCESS_TOKEN"

# Test 14: Validate token without token
test_endpoint "Validate Token - No Token (should fail)" "GET" "/api/v1/auth/validate" "" "401" ""

# Test 15: Validate token with invalid token
test_endpoint "Validate Token - Invalid Token (should fail)" "GET" "/api/v1/auth/validate" "" "401" "invalid.token.here"

# Test 16: Refresh token with valid refresh token
test_endpoint "Refresh Token - Valid Token" "POST" "/api/v1/auth/refresh" \
  "{\"refresh_token\":\"$REFRESH_TOKEN\"}" \
  "200" ""

# Update access token
NEW_ACCESS_TOKEN=$(echo "$body" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['access_token'])" 2>/dev/null || echo "$ACCESS_TOKEN")
ACCESS_TOKEN=$NEW_ACCESS_TOKEN

# Test 17: Refresh token with invalid token
test_endpoint "Refresh Token - Invalid Token (should fail)" "POST" "/api/v1/auth/refresh" \
  "{\"refresh_token\":\"invalid-token\"}" \
  "401" ""

# Test 18: Change password with correct old password
test_endpoint "Change Password - Valid Old Password" "POST" "/api/v1/auth/change-password" \
  "{\"old_password\":\"Test@123456\",\"new_password\":\"NewTest@123456\"}" \
  "200" "$ACCESS_TOKEN"

# Test 19: Login with new password
test_endpoint "Login - After Password Change" "POST" "/api/v1/auth/login" \
  "{\"email\":\"$EMAIL1\",\"password\":\"NewTest@123456\"}" \
  "200" ""

# Update tokens
NEW_ACCESS_TOKEN=$(echo "$body" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['access_token'])" 2>/dev/null || echo "$ACCESS_TOKEN")
NEW_REFRESH_TOKEN=$(echo "$body" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['refresh_token'])" 2>/dev/null || echo "$REFRESH_TOKEN")
ACCESS_TOKEN=$NEW_ACCESS_TOKEN
REFRESH_TOKEN=$NEW_REFRESH_TOKEN

# Test 20: Change password with wrong old password
test_endpoint "Change Password - Wrong Old Password (should fail)" "POST" "/api/v1/auth/change-password" \
  "{\"old_password\":\"WrongPassword123\",\"new_password\":\"AnotherNew@123\"}" \
  "401" "$ACCESS_TOKEN"

# Test 21: Change password without token
test_endpoint "Change Password - No Token (should fail)" "POST" "/api/v1/auth/change-password" \
  "{\"old_password\":\"NewTest@123456\",\"new_password\":\"Another@123\"}" \
  "401" ""

# Test 22: Logout with valid token
test_endpoint "Logout - Valid Token" "POST" "/api/v1/auth/logout" \
  "{\"refresh_token\":\"$REFRESH_TOKEN\"}" \
  "200" "$ACCESS_TOKEN"

# Test 23: Use token after logout (should fail)
test_endpoint "Validate Token - After Logout (should fail)" "GET" "/api/v1/auth/validate" "" "401" "$ACCESS_TOKEN"

# Test 24: Refresh token after logout (should fail)
test_endpoint "Refresh Token - After Logout (should fail)" "POST" "/api/v1/auth/refresh" \
  "{\"refresh_token\":\"$REFRESH_TOKEN\"}" \
  "401" ""

# Summary
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}                    TEST SUMMARY                    ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Total Tests: $TOTAL"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo ""

PASS_RATE=$((PASS * 100 / TOTAL))
echo "Pass Rate: ${PASS_RATE}%"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║    ✅ ALL TESTS PASSED! ✅            ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════╗${NC}"
    echo -e "${RED}║    ❌ SOME TESTS FAILED ❌            ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════╝${NC}"
    exit 1
fi
