#!/bin/bash

# ============================================
# COMPLETE SYSTEM TEST
# Tests all services through API Gateway
# ============================================

set +e  # Continue on errors

API_BASE="http://localhost:8080/api/v1"
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo ""
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================${NC}"
}

print_test() {
    echo -e "${YELLOW}TEST: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    ((PASSED_TESTS++))
    ((TOTAL_TESTS++))
}

print_fail() {
    echo -e "${RED}✗ $1${NC}"
    ((FAILED_TESTS++))
    ((TOTAL_TESTS++))
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# ============================================
# TEST 1: AUTH SERVICE
# ============================================
print_header "TEST 1: AUTH SERVICE"

# Test 1.1: Register new user
print_test "1.1 - Register new user"
TIMESTAMP=$(date +%s)
TEST_EMAIL="test_${TIMESTAMP}@test.com"
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"Test@123456\",
        \"full_name\": \"Test User $TIMESTAMP\",
        \"role\": \"student\"
    }")

ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.access_token // .token // .access_token // empty')

if [ ! -z "$ACCESS_TOKEN" ] && [ "$ACCESS_TOKEN" != "null" ]; then
    print_success "User registered successfully"
    USER_ID=$(echo $REGISTER_RESPONSE | jq -r '.data.user.id // .user.id // empty')
    print_info "User ID: $USER_ID"
    print_info "Email: $TEST_EMAIL"
else
    print_fail "Failed to register user"
    echo "Response: $REGISTER_RESPONSE"
fi

# Test 1.2: Login
print_test "1.2 - Login with credentials"
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"Test@123456\"
    }")

LOGIN_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.access_token // .token // .access_token // empty')

if [ ! -z "$LOGIN_TOKEN" ] && [ "$LOGIN_TOKEN" != "null" ]; then
    print_success "Login successful"
    ACCESS_TOKEN="$LOGIN_TOKEN"  # Update token
else
    print_fail "Login failed"
    echo "Response: $LOGIN_RESPONSE"
fi

# Test 1.3: Validate token
print_test "1.3 - Validate JWT token"
VALIDATE_RESPONSE=$(curl -s -X GET "$API_BASE/auth/validate" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

VALIDATE_STATUS=$(echo $VALIDATE_RESPONSE | jq -r '.success // empty')
if [ "$VALIDATE_STATUS" = "true" ]; then
    print_success "Token validation successful"
else
    print_fail "Token validation failed"
    echo "Response: $VALIDATE_RESPONSE"
fi

# Test 1.4: Get Google OAuth URL
print_test "1.4 - Get Google OAuth URL"
GOOGLE_URL_RESPONSE=$(curl -s -X GET "$API_BASE/auth/google/url")
GOOGLE_URL=$(echo $GOOGLE_URL_RESPONSE | jq -r '.data.url // .url // empty')

if [ ! -z "$GOOGLE_URL" ] && [[ "$GOOGLE_URL" == *"accounts.google.com"* ]]; then
    print_success "Google OAuth URL retrieved"
else
    print_fail "Failed to get Google OAuth URL"
fi

# ============================================
# TEST 2: USER SERVICE
# ============================================
print_header "TEST 2: USER SERVICE"

# Test 2.1: Get user profile
print_test "2.1 - Get user profile"
PROFILE_RESPONSE=$(curl -s -X GET "$API_BASE/user/profile" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

PROFILE_EMAIL=$(echo $PROFILE_RESPONSE | jq -r '.data.email // .email // empty')
if [ "$PROFILE_EMAIL" = "$TEST_EMAIL" ]; then
    print_success "Profile retrieved successfully"
else
    print_fail "Failed to retrieve profile"
    echo "Response: $PROFILE_RESPONSE"
fi

# Test 2.2: Update profile
print_test "2.2 - Update user profile"
UPDATE_RESPONSE=$(curl -s -X PUT "$API_BASE/user/profile" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"full_name\": \"Updated Test User\",
        \"bio\": \"Testing profile update\"
    }")

UPDATE_SUCCESS=$(echo $UPDATE_RESPONSE | jq -r '.success // empty')
if [ "$UPDATE_SUCCESS" = "true" ]; then
    print_success "Profile updated successfully"
else
    print_fail "Failed to update profile"
    echo "Response: $UPDATE_RESPONSE"
fi

# Test 2.3: Get user preferences
print_test "2.3 - Get user preferences"
PREFS_RESPONSE=$(curl -s -X GET "$API_BASE/user/preferences" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

PREFS_LANGUAGE=$(echo $PREFS_RESPONSE | jq -r '.data.language // .language // empty')
if [ ! -z "$PREFS_LANGUAGE" ]; then
    print_success "Preferences retrieved successfully"
else
    print_fail "Failed to retrieve preferences"
    echo "Response: $PREFS_RESPONSE"
fi

# Test 2.4: Get user statistics
print_test "2.4 - Get user statistics"
STATS_RESPONSE=$(curl -s -X GET "$API_BASE/user/statistics" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

STATS_SUCCESS=$(echo $STATS_RESPONSE | jq -r '.success // empty')
if [ "$STATS_SUCCESS" = "true" ] || [ ! -z "$(echo $STATS_RESPONSE | jq -r '.data // empty')" ]; then
    print_success "Statistics retrieved successfully"
else
    print_fail "Failed to retrieve statistics"
    echo "Response: $STATS_RESPONSE"
fi

# Test 2.5: Get leaderboard
print_test "2.5 - Get leaderboard"
LEADERBOARD_RESPONSE=$(curl -s -X GET "$API_BASE/user/leaderboard" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

LEADERBOARD_DATA=$(echo $LEADERBOARD_RESPONSE | jq -r '.data // .users // empty')
if [ ! -z "$LEADERBOARD_DATA" ] && [ "$LEADERBOARD_DATA" != "null" ]; then
    print_success "Leaderboard retrieved successfully"
else
    print_fail "Failed to retrieve leaderboard"
    echo "Response: $LEADERBOARD_RESPONSE"
fi

# ============================================
# TEST 3: COURSE SERVICE
# ============================================
print_header "TEST 3: COURSE SERVICE"

# Test 3.1: Get all courses
print_test "3.1 - Get all courses"
COURSES_RESPONSE=$(curl -s -X GET "$API_BASE/courses")

COURSES=$(echo $COURSES_RESPONSE | jq -r '.data.courses // .courses // empty')
if [ ! -z "$COURSES" ] && [ "$COURSES" != "null" ]; then
    print_success "Courses retrieved successfully"
    COURSE_ID=$(echo $COURSES_RESPONSE | jq -r '.data.courses[0].id // .courses[0].id // empty')
    print_info "First course ID: $COURSE_ID"
else
    print_fail "Failed to retrieve courses"
    echo "Response: $COURSES_RESPONSE"
    COURSE_ID=""
fi

# Test 3.2: Get course detail
if [ ! -z "$COURSE_ID" ] && [ "$COURSE_ID" != "null" ]; then
    print_test "3.2 - Get course detail"
    COURSE_DETAIL_RESPONSE=$(curl -s -X GET "$API_BASE/courses/$COURSE_ID")
    
    COURSE_TITLE=$(echo $COURSE_DETAIL_RESPONSE | jq -r '.data.title // .title // empty')
    if [ ! -z "$COURSE_TITLE" ]; then
        print_success "Course detail retrieved successfully"
        print_info "Course title: $COURSE_TITLE"
    else
        print_fail "Failed to retrieve course detail"
        echo "Response: $COURSE_DETAIL_RESPONSE"
    fi
else
    print_info "Skipping course detail test - no course ID available"
    ((TOTAL_TESTS++))
fi

# Test 3.3: Get course reviews
if [ ! -z "$COURSE_ID" ] && [ "$COURSE_ID" != "null" ]; then
    print_test "3.3 - Get course reviews"
    REVIEWS_RESPONSE=$(curl -s -X GET "$API_BASE/courses/$COURSE_ID/reviews")
    
    REVIEWS_DATA=$(echo $REVIEWS_RESPONSE | jq -r '.data // empty')
    if [ ! -z "$REVIEWS_DATA" ]; then
        print_success "Course reviews retrieved successfully"
    else
        print_fail "Failed to retrieve course reviews"
        echo "Response: $REVIEWS_RESPONSE"
    fi
else
    print_info "Skipping reviews test - no course ID available"
    ((TOTAL_TESTS++))
fi

# Test 3.4: Get categories
print_test "3.4 - Get categories"
CATEGORIES_RESPONSE=$(curl -s -X GET "$API_BASE/categories")

CATEGORIES=$(echo $CATEGORIES_RESPONSE | jq -r '.data // .categories // empty')
if [ ! -z "$CATEGORIES" ] && [ "$CATEGORIES" != "null" ]; then
    print_success "Categories retrieved successfully"
else
    print_fail "Failed to retrieve categories"
    echo "Response: $CATEGORIES_RESPONSE"
fi

# Test 3.5: Enroll in course
if [ ! -z "$COURSE_ID" ] && [ "$COURSE_ID" != "null" ]; then
    print_test "3.5 - Enroll in course"
    ENROLL_RESPONSE=$(curl -s -X POST "$API_BASE/enrollments" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"course_id\": \"$COURSE_ID\"
        }")
    
    ENROLL_SUCCESS=$(echo $ENROLL_RESPONSE | jq -r '.success // empty')
    if [ "$ENROLL_SUCCESS" = "true" ] || [[ "$ENROLL_RESPONSE" == *"already enrolled"* ]]; then
        print_success "Course enrollment successful (or already enrolled)"
    else
        print_fail "Failed to enroll in course"
        echo "Response: $ENROLL_RESPONSE"
    fi
else
    print_info "Skipping enrollment test - no course ID available"
    ((TOTAL_TESTS++))
fi

# Test 3.6: Get my enrollments
print_test "3.6 - Get my enrollments"
MY_ENROLLMENTS_RESPONSE=$(curl -s -X GET "$API_BASE/enrollments/my" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

MY_ENROLLMENTS=$(echo $MY_ENROLLMENTS_RESPONSE | jq -r '.data // .enrollments // empty')
if [ ! -z "$MY_ENROLLMENTS" ]; then
    print_success "My enrollments retrieved successfully"
else
    print_fail "Failed to retrieve my enrollments"
    echo "Response: $MY_ENROLLMENTS_RESPONSE"
fi

# Test 3.7: Get video watch history
print_test "3.7 - Get video watch history"
VIDEO_HISTORY_RESPONSE=$(curl -s -X GET "$API_BASE/videos/history" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

VIDEO_HISTORY=$(echo $VIDEO_HISTORY_RESPONSE | jq -r '.data // .history // empty')
if [ ! -z "$VIDEO_HISTORY" ]; then
    print_success "Video watch history retrieved successfully"
else
    print_fail "Failed to retrieve video watch history"
    echo "Response: $VIDEO_HISTORY_RESPONSE"
fi

# ============================================
# TEST 4: EXERCISE SERVICE
# ============================================
print_header "TEST 4: EXERCISE SERVICE"

# Test 4.1: Get all exercises
print_test "4.1 - Get all exercises"
EXERCISES_RESPONSE=$(curl -s -X GET "$API_BASE/exercises")

EXERCISES=$(echo $EXERCISES_RESPONSE | jq -r '.data.exercises // .exercises // empty')
if [ ! -z "$EXERCISES" ] && [ "$EXERCISES" != "null" ]; then
    print_success "Exercises retrieved successfully"
    EXERCISE_ID=$(echo $EXERCISES_RESPONSE | jq -r '.data.exercises[0].id // .exercises[0].id // empty')
    print_info "First exercise ID: $EXERCISE_ID"
else
    print_fail "Failed to retrieve exercises"
    echo "Response: $EXERCISES_RESPONSE"
    EXERCISE_ID=""
fi

# Test 4.2: Get exercise detail
if [ ! -z "$EXERCISE_ID" ] && [ "$EXERCISE_ID" != "null" ]; then
    print_test "4.2 - Get exercise detail"
    EXERCISE_DETAIL_RESPONSE=$(curl -s -X GET "$API_BASE/exercises/$EXERCISE_ID")
    
    EXERCISE_TITLE=$(echo $EXERCISE_DETAIL_RESPONSE | jq -r '.data.title // .title // empty')
    if [ ! -z "$EXERCISE_TITLE" ]; then
        print_success "Exercise detail retrieved successfully"
        print_info "Exercise title: $EXERCISE_TITLE"
    else
        print_fail "Failed to retrieve exercise detail"
        echo "Response: $EXERCISE_DETAIL_RESPONSE"
    fi
else
    print_info "Skipping exercise detail test - no exercise ID available"
    ((TOTAL_TESTS++))
fi

# Test 4.3: Get all tags
print_test "4.3 - Get all tags"
TAGS_RESPONSE=$(curl -s -X GET "$API_BASE/tags")

TAGS=$(echo $TAGS_RESPONSE | jq -r '.data // .tags // empty')
if [ ! -z "$TAGS" ]; then
    print_success "Tags retrieved successfully"
else
    print_fail "Failed to retrieve tags"
    echo "Response: $TAGS_RESPONSE"
fi

# Test 4.4: Start exercise (create submission)
if [ ! -z "$EXERCISE_ID" ] && [ "$EXERCISE_ID" != "null" ]; then
    print_test "4.4 - Start exercise (create submission)"
    SUBMISSION_RESPONSE=$(curl -s -X POST "$API_BASE/submissions" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"exercise_id\": \"$EXERCISE_ID\"
        }")
    
    SUBMISSION_ID=$(echo $SUBMISSION_RESPONSE | jq -r '.data.submission_id // .data.id // .submission_id // .id // empty')
    if [ ! -z "$SUBMISSION_ID" ] && [ "$SUBMISSION_ID" != "null" ]; then
        print_success "Exercise started successfully (submission created)"
        print_info "Submission ID: $SUBMISSION_ID"
    else
        print_fail "Failed to start exercise"
        echo "Response: $SUBMISSION_RESPONSE"
        SUBMISSION_ID=""
    fi
else
    print_info "Skipping start exercise test - no exercise ID available"
    ((TOTAL_TESTS++))
    SUBMISSION_ID=""
fi

# Test 4.5: Get my submissions
print_test "4.5 - Get my submissions"
MY_SUBMISSIONS_RESPONSE=$(curl -s -X GET "$API_BASE/submissions/my" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

MY_SUBMISSIONS=$(echo $MY_SUBMISSIONS_RESPONSE | jq -r '.data // .submissions // empty')
if [ ! -z "$MY_SUBMISSIONS" ]; then
    print_success "My submissions retrieved successfully"
else
    print_fail "Failed to retrieve my submissions"
    echo "Response: $MY_SUBMISSIONS_RESPONSE"
fi

# ============================================
# TEST 5: NOTIFICATION SERVICE
# ============================================
print_header "TEST 5: NOTIFICATION SERVICE"

# Test 5.1: Get notifications
print_test "5.1 - Get notifications"
NOTIFICATIONS_RESPONSE=$(curl -s -X GET "$API_BASE/notifications" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

NOTIFICATIONS=$(echo $NOTIFICATIONS_RESPONSE | jq -r '.data // .notifications // empty')
if [ ! -z "$NOTIFICATIONS" ]; then
    print_success "Notifications retrieved successfully"
else
    print_fail "Failed to retrieve notifications"
    echo "Response: $NOTIFICATIONS_RESPONSE"
fi

# Test 5.2: Get unread count
print_test "5.2 - Get unread notification count"
UNREAD_RESPONSE=$(curl -s -X GET "$API_BASE/notifications/unread-count" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

UNREAD_COUNT=$(echo $UNREAD_RESPONSE | jq -r '.data.unread_count // .unread_count // empty')
if [ ! -z "$UNREAD_COUNT" ] && [ "$UNREAD_COUNT" != "null" ]; then
    print_success "Unread count retrieved successfully"
    print_info "Unread notifications: $UNREAD_COUNT"
else
    print_fail "Failed to retrieve unread count"
    echo "Response: $UNREAD_RESPONSE"
fi

# Test 5.3: Get notification preferences
print_test "5.3 - Get notification preferences"
NOTIF_PREFS_RESPONSE=$(curl -s -X GET "$API_BASE/notifications/preferences" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

NOTIF_PREFS=$(echo $NOTIF_PREFS_RESPONSE | jq -r '.data // empty')
if [ ! -z "$NOTIF_PREFS" ]; then
    print_success "Notification preferences retrieved successfully"
else
    print_fail "Failed to retrieve notification preferences"
    echo "Response: $NOTIF_PREFS_RESPONSE"
fi

# Test 5.4: Update notification preferences
print_test "5.4 - Update notification preferences"
UPDATE_PREFS_RESPONSE=$(curl -s -X PUT "$API_BASE/notifications/preferences" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"push_enabled\": true,
        \"email_enabled\": true
    }")

UPDATE_PREFS_SUCCESS=$(echo $UPDATE_PREFS_RESPONSE | jq -r '.success // empty')
if [ "$UPDATE_PREFS_SUCCESS" = "true" ] || [ ! -z "$(echo $UPDATE_PREFS_RESPONSE | jq -r '.data // empty')" ]; then
    print_success "Notification preferences updated successfully"
else
    print_fail "Failed to update notification preferences"
    echo "Response: $UPDATE_PREFS_RESPONSE"
fi

# Test 5.5: Get timezone
print_test "5.5 - Get user timezone"
TIMEZONE_RESPONSE=$(curl -s -X GET "$API_BASE/notifications/preferences/timezone" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

TIMEZONE=$(echo $TIMEZONE_RESPONSE | jq -r '.data.timezone // .timezone // empty')
if [ ! -z "$TIMEZONE" ] && [ "$TIMEZONE" != "null" ]; then
    print_success "Timezone retrieved successfully"
    print_info "Current timezone: $TIMEZONE"
else
    print_fail "Failed to retrieve timezone"
    echo "Response: $TIMEZONE_RESPONSE"
fi

# Test 5.6: Update timezone
print_test "5.6 - Update user timezone"
UPDATE_TIMEZONE_RESPONSE=$(curl -s -X PUT "$API_BASE/notifications/preferences/timezone" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"timezone\": \"America/New_York\"
    }")

UPDATE_TIMEZONE_SUCCESS=$(echo $UPDATE_TIMEZONE_RESPONSE | jq -r '.success // empty')
if [ "$UPDATE_TIMEZONE_SUCCESS" = "true" ]; then
    print_success "Timezone updated successfully"
else
    print_fail "Failed to update timezone"
    echo "Response: $UPDATE_TIMEZONE_RESPONSE"
fi

# Test 5.7: Get scheduled notifications
print_test "5.7 - Get scheduled notifications"
SCHEDULED_RESPONSE=$(curl -s -X GET "$API_BASE/notifications/scheduled" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

SCHEDULED=$(echo $SCHEDULED_RESPONSE | jq -r '.data // .scheduled // empty')
if [ ! -z "$SCHEDULED" ]; then
    print_success "Scheduled notifications retrieved successfully"
else
    print_fail "Failed to retrieve scheduled notifications"
    echo "Response: $SCHEDULED_RESPONSE"
fi

# ============================================
# FINAL SUMMARY
# ============================================
print_header "FINAL TEST SUMMARY"

echo ""
echo "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! System is fully functional!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Please review the errors above.${NC}"
    exit 1
fi
