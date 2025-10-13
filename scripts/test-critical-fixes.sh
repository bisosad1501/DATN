#!/bin/bash

# Test Script for Critical Bug Fixes
# Tests Redis error handling and goroutine panic recovery

echo "======================================"
echo "Testing Critical Bug Fixes"
echo "======================================"
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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

# Test 1: Verify Auth Service builds without panic()
echo "Test 1: Verify Auth Service builds correctly"
echo "--------------------------------------"
cd ~/DATN/services/auth-service
go build -o auth-test ./cmd/main.go 2>&1 | tee /tmp/auth-build.log
if [ $? -eq 0 ]; then
    print_result 0 "Auth Service builds successfully"
    rm -f auth-test
else
    print_result 1 "Auth Service build failed"
fi
echo ""

# Test 2: Verify Course Service builds with panic recovery
echo "Test 2: Verify Course Service builds correctly"
echo "--------------------------------------"
cd ~/DATN/services/course-service
go build -o course-test ./cmd/main.go 2>&1 | tee /tmp/course-build.log
if [ $? -eq 0 ]; then
    print_result 0 "Course Service builds successfully"
    rm -f course-test
else
    print_result 1 "Course Service build failed"
fi
echo ""

# Test 3: Verify Exercise Service builds with panic recovery
echo "Test 3: Verify Exercise Service builds correctly"
echo "--------------------------------------"
cd ~/DATN/services/exercise-service
go build -o exercise-test ./cmd/main.go 2>&1 | tee /tmp/exercise-build.log
if [ $? -eq 0 ]; then
    print_result 0 "Exercise Service builds successfully"
    rm -f exercise-test
else
    print_result 1 "Exercise Service build failed"
fi
echo ""

# Test 4: Check for panic() usage in database code
echo "Test 4: Verify no panic() in Redis connection"
echo "--------------------------------------"
cd ~/DATN
if grep -r "panic.*Redis" services/auth-service/internal/database/ >/dev/null 2>&1; then
    print_result 1 "Found panic() in Redis connection code"
else
    print_result 0 "No panic() found in Redis connection"
fi
echo ""

# Test 5: Check for defer recover() in goroutines
echo "Test 5: Verify panic recovery in goroutines"
echo "--------------------------------------"
EXERCISE_HAS_RECOVERY=$(grep -A 3 "go func()" services/exercise-service/internal/service/exercise_service.go | grep -c "defer.*recover")
COURSE_HAS_RECOVERY=$(grep -A 3 "go func()" services/course-service/internal/service/course_service.go | grep -c "defer.*recover")

if [ "$EXERCISE_HAS_RECOVERY" -gt 0 ] && [ "$COURSE_HAS_RECOVERY" -gt 0 ]; then
    print_result 0 "Panic recovery found in Exercise and Course services"
else
    print_result 1 "Missing panic recovery in goroutines"
fi
echo ""

# Test 6: Verify NewRedisClient returns error
echo "Test 6: Verify NewRedisClient error handling"
echo "--------------------------------------"
if grep "func NewRedisClient.*error" services/auth-service/internal/database/database.go >/dev/null 2>&1; then
    print_result 0 "NewRedisClient returns error correctly"
else
    print_result 1 "NewRedisClient doesn't return error"
fi
echo ""

# Summary
echo "======================================"
echo "Test Summary"
echo "======================================"
echo "Passed: $PASSED"
echo "Failed: $FAILED"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✅${NC}"
    echo "Critical bugs have been fixed successfully."
    exit 0
else
    echo -e "${RED}Some tests failed! ❌${NC}"
    exit 1
fi
