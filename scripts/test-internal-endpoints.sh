#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
INTERNAL_API_KEY="internal_secret_key_ielts_2025_change_in_production"
USER_SERVICE_URL="http://localhost:8082"
NOTIFICATION_SERVICE_URL="http://localhost:8085"
AUTH_SERVICE_URL="http://localhost:8081"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Testing Internal Endpoints${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to test endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local url=$3
    local data=$4
    
    echo -e "${YELLOW}Testing: ${name}${NC}"
    echo -e "URL: ${method} ${url}"
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X ${method} \
            -H "X-Internal-API-Key: ${INTERNAL_API_KEY}" \
            -H "Content-Type: application/json" \
            "${url}")
    else
        echo -e "Data: ${data}"
        response=$(curl -s -w "\n%{http_code}" -X ${method} \
            -H "X-Internal-API-Key: ${INTERNAL_API_KEY}" \
            -H "Content-Type: application/json" \
            -d "${data}" \
            "${url}")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✅ SUCCESS (HTTP ${http_code})${NC}"
        echo -e "Response: ${body}"
    else
        echo -e "${RED}❌ FAILED (HTTP ${http_code})${NC}"
        echo -e "Response: ${body}"
    fi
    echo ""
}

# Test without API key (should fail)
test_auth_protection() {
    echo -e "${YELLOW}Testing: Auth Protection (No API Key)${NC}"
    local url="$1"
    
    response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d '{}' \
        "${url}")
    
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" -eq 403 ]; then
        echo -e "${GREEN}✅ Auth protection working (HTTP 403)${NC}"
    else
        echo -e "${RED}❌ Auth protection failed (HTTP ${http_code})${NC}"
    fi
    echo ""
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   1. USER SERVICE INTERNAL ENDPOINTS${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Generate random UUID for testing
TEST_USER_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')
TEST_SESSION_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')

echo -e "${YELLOW}Test User ID: ${TEST_USER_ID}${NC}"
echo ""

# Test 1: Create Profile
test_endpoint \
    "Create User Profile" \
    "POST" \
    "${USER_SERVICE_URL}/api/v1/user/internal/profile/create" \
    "{\"user_id\":\"${TEST_USER_ID}\",\"email\":\"test@example.com\",\"role\":\"student\",\"full_name\":\"Test User\"}"

# Test 2: Update Progress
test_endpoint \
    "Update Learning Progress" \
    "PUT" \
    "${USER_SERVICE_URL}/api/v1/user/internal/progress/update" \
    "{\"user_id\":\"${TEST_USER_ID}\",\"lessons_completed\":1,\"study_minutes\":30,\"skill_type\":\"reading\",\"session_type\":\"lesson\"}"

# Test 3: Update Skill Statistics
test_endpoint \
    "Update Skill Statistics (Reading)" \
    "PUT" \
    "${USER_SERVICE_URL}/api/v1/user/internal/statistics/reading/update" \
    "{\"user_id\":\"${TEST_USER_ID}\",\"score\":85.5,\"time_minutes\":25,\"is_completed\":true}"

# Test 4: Start Study Session
test_endpoint \
    "Start Study Session" \
    "POST" \
    "${USER_SERVICE_URL}/api/v1/user/internal/session/start" \
    "{\"user_id\":\"${TEST_USER_ID}\",\"session_type\":\"practice\",\"resource_type\":\"exercise\",\"resource_id\":\"ex123\"}"

# Test 5: End Study Session
test_endpoint \
    "End Study Session" \
    "PUT" \
    "${USER_SERVICE_URL}/api/v1/user/internal/session/${TEST_SESSION_ID}/end" \
    "{\"is_completed\":true,\"score\":90}"

# Test Auth Protection
test_auth_protection "${USER_SERVICE_URL}/api/v1/user/internal/profile/create"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   2. NOTIFICATION SERVICE INTERNAL${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Test 6: Send Single Notification
test_endpoint \
    "Send Single Notification" \
    "POST" \
    "${NOTIFICATION_SERVICE_URL}/api/v1/notifications/internal/send" \
    "{\"user_id\":\"${TEST_USER_ID}\",\"title\":\"Test Notification\",\"message\":\"This is a test message\",\"type\":\"system\",\"category\":\"info\"}"

# Test 7: Send Bulk Notifications
TEST_USER_ID_2=$(uuidgen | tr '[:upper:]' '[:lower:]')
test_endpoint \
    "Send Bulk Notifications" \
    "POST" \
    "${NOTIFICATION_SERVICE_URL}/api/v1/notifications/internal/bulk" \
    "{\"user_ids\":[\"${TEST_USER_ID}\",\"${TEST_USER_ID_2}\"],\"title\":\"Bulk Test\",\"message\":\"Bulk notification test\",\"type\":\"system\",\"category\":\"info\"}"

# Test Auth Protection
test_auth_protection "${NOTIFICATION_SERVICE_URL}/api/v1/notifications/internal/send"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   3. AUTH SERVICE INTEGRATION TEST${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Test 8: Register User (should trigger User Service + Notification Service)
RANDOM_EMAIL="testuser$(date +%s)@example.com"
echo -e "${YELLOW}Testing: User Registration (End-to-End)${NC}"
echo -e "This should create user in auth_db, profile in user_db, and send welcome notification"
echo ""

test_endpoint \
    "Register New User" \
    "POST" \
    "${AUTH_SERVICE_URL}/api/v1/auth/register" \
    "{\"email\":\"${RANDOM_EMAIL}\",\"password\":\"Test123456\",\"role\":\"student\"}"

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}   Testing Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "1. Check user-service logs for profile creation"
echo -e "2. Check notification-service logs for welcome notification"
echo -e "3. Query user_db to verify profile exists"
echo -e "4. Query notification_db to verify notification created"
echo ""
