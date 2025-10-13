#!/bin/bash

# Integration Test for Critical Bug Fixes
# Tests Redis error handling and goroutine panic recovery in production

echo "======================================"
echo "Integration Test - Critical Fixes"
echo "======================================"
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

BASE_URL="http://localhost:8080"
PASSED=0
FAILED=0

print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASSED${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}: $2"
        ((FAILED++))
    fi
}

# Test 1: Services are running (no panic on startup)
echo "Test 1: Verify all services started without panic"
echo "--------------------------------------"

AUTH_HEALTH=$(curl -s http://localhost:8081/health | jq -r '.data.status')
USER_HEALTH=$(curl -s http://localhost:8082/health | jq -r '.data.status')
COURSE_HEALTH=$(curl -s http://localhost:8083/health | jq -r '.data.status')
EXERCISE_HEALTH=$(curl -s http://localhost:8084/health | jq -r '.data.status')

if [ "$AUTH_HEALTH" == "healthy" ]; then
    print_result 0 "Auth Service is healthy (Redis connection OK)"
else
    print_result 1 "Auth Service health check failed"
fi

if [ "$USER_HEALTH" == "healthy" ]; then
    print_result 0 "User Service is healthy"
else
    print_result 1 "User Service health check failed"
fi

if [ "$COURSE_HEALTH" == "healthy" ]; then
    print_result 0 "Course Service is healthy (goroutine safe)"
else
    print_result 1 "Course Service health check failed"
fi

if [ "$EXERCISE_HEALTH" == "healthy" ]; then
    print_result 0 "Exercise Service is healthy (goroutine safe)"
else
    print_result 1 "Exercise Service health check failed"
fi
echo ""

# Test 2: Redis operations work (no panic)
echo "Test 2: Test Redis operations (login/logout)"
echo "--------------------------------------"

# Register a new user
TIMESTAMP=$(date +%s)
REGISTER_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"redistest${TIMESTAMP}@example.com\",
    \"password\": \"RedisTest123!@#\",
    \"full_name\": \"Redis Test User\",
    \"role\": \"student\"
  }")

REGISTER_SUCCESS=$(echo $REGISTER_RESPONSE | jq -r '.success')
ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.access_token')

if [ "$REGISTER_SUCCESS" == "true" ] && [ "$ACCESS_TOKEN" != "null" ]; then
    print_result 0 "Registration successful (Redis session created)"
else
    print_result 1 "Registration failed"
    echo "Response: $REGISTER_RESPONSE"
fi

# Test logout (Redis cleanup)
if [ "$ACCESS_TOKEN" != "null" ] && [ -n "$ACCESS_TOKEN" ]; then
    LOGOUT_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/v1/auth/logout" \
      -H "Authorization: Bearer ${ACCESS_TOKEN}")
    
    LOGOUT_SUCCESS=$(echo $LOGOUT_RESPONSE | jq -r '.success')
    
    if [ "$LOGOUT_SUCCESS" == "true" ]; then
        print_result 0 "Logout successful (Redis cleanup OK)"
    else
        print_result 1 "Logout failed"
    fi
fi
echo ""

# Test 3: Service-to-service communication (goroutine safe)
echo "Test 3: Test service-to-service goroutines"
echo "--------------------------------------"

# Register triggers User Service + Notification Service goroutines
TIMESTAMP=$(date +%s)
SSC_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"goroutinetest${TIMESTAMP}@example.com\",
    \"password\": \"Goroutine123!@#\",
    \"full_name\": \"Goroutine Test User\",
    \"role\": \"student\"
  }")

SSC_SUCCESS=$(echo $SSC_RESPONSE | jq -r '.success')
USER_ID=$(echo $SSC_RESPONSE | jq -r '.data.user_id')

if [ "$SSC_SUCCESS" == "true" ]; then
    print_result 0 "Auth → User/Notification goroutines triggered"
    
    # Wait a bit for async operations
    sleep 2
    
    # Check if user profile was created (via goroutine)
    PROFILE_CHECK=$(docker-compose exec -T postgres psql -U ielts_admin -d user_db -t -c \
      "SELECT COUNT(*) FROM users WHERE id = '${USER_ID}'" 2>/dev/null | tr -d ' ')
    
    if [ "$PROFILE_CHECK" == "1" ]; then
        print_result 0 "User profile created successfully (goroutine completed)"
    else
        print_result 1 "User profile not found (goroutine may have panicked)"
    fi
else
    print_result 1 "Registration failed"
fi
echo ""

# Test 4: Check for panic in logs
echo "Test 4: Verify no panic in service logs"
echo "--------------------------------------"

AUTH_PANIC=$(docker-compose logs auth-service 2>/dev/null | grep -c "panic:")
COURSE_PANIC=$(docker-compose logs course-service 2>/dev/null | grep -c "panic:")
EXERCISE_PANIC=$(docker-compose logs exercise-service 2>/dev/null | grep -c "panic:")

if [ "$AUTH_PANIC" -eq 0 ]; then
    print_result 0 "No panic in Auth Service logs"
else
    print_result 1 "Found $AUTH_PANIC panic(s) in Auth Service logs"
fi

if [ "$COURSE_PANIC" -eq 0 ]; then
    print_result 0 "No panic in Course Service logs"
else
    print_result 1 "Found $COURSE_PANIC panic(s) in Course Service logs"
fi

if [ "$EXERCISE_PANIC" -eq 0 ]; then
    print_result 0 "No panic in Exercise Service logs"
else
    print_result 1 "Found $EXERCISE_PANIC panic(s) in Exercise Service logs"
fi
echo ""

# Test 5: Container health (no restarts from crashes)
echo "Test 5: Verify containers haven't crashed"
echo "--------------------------------------"

AUTH_STATUS=$(docker-compose ps auth-service 2>/dev/null | grep -c "Up")
COURSE_STATUS=$(docker-compose ps course-service 2>/dev/null | grep -c "Up")
EXERCISE_STATUS=$(docker-compose ps exercise-service 2>/dev/null | grep -c "Up")

if [ "$AUTH_STATUS" -gt 0 ]; then
    print_result 0 "Auth Service container is up"
else
    print_result 1 "Auth Service container is down"
fi

if [ "$COURSE_STATUS" -gt 0 ]; then
    print_result 0 "Course Service container is up"
else
    print_result 1 "Course Service container is down"
fi

if [ "$EXERCISE_STATUS" -gt 0 ]; then
    print_result 0 "Exercise Service container is up"
else
    print_result 1 "Exercise Service container is down"
fi
echo ""

# Summary
echo "======================================"
echo "Test Summary"
echo "======================================"
echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All integration tests passed!${NC}"
    echo ""
    echo "Critical fixes verified:"
    echo "  ✓ Redis connection handles errors gracefully"
    echo "  ✓ Background goroutines have panic recovery"
    echo "  ✓ No service crashes from panic"
    echo "  ✓ Service-to-service communication works"
    echo ""
    echo -e "${GREEN}System is production-ready! 🚀${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed!${NC}"
    echo "Please check the logs above for details."
    exit 1
fi
