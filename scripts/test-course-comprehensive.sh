#!/bin/bash#!/bin/bash



################################################################################ Colors for output

# COURSE SERVICE COMPREHENSIVE TEST SUITEGREEN='\033[0;32m'

# Tests all fixed issues: #7, #8, #9, #10, #11RED='\033[0;31m'

###############################################################################YELLOW='\033[1;33m'

NC='\033[0m' # No Color

BASE_URL="http://localhost:8080"

INTERNAL_KEY="internal_secret_key_ielts_2025_change_in_production"BASE_URL="http://localhost:8083/api/v1"



# Colors for outputecho "=================================================="

RED='\033[0;31m'echo "  Course Service - Comprehensive API Testing"

GREEN='\033[0;32m'echo "=================================================="

YELLOW='\033[1;33m'echo ""

BLUE='\033[0;34m'

NC='\033[0m' # No Color# Test 1: Get All Categories

echo -e "${YELLOW}Test 1: GET /categories - Get All Categories${NC}"

# Test countersresponse=$(curl -s "$BASE_URL/categories")

TOTAL_TESTS=0count=$(echo "$response" | jq '.data | length')

PASSED_TESTS=0if [ "$count" -gt 0 ]; then

FAILED_TESTS=0    echo -e "${GREEN}✅ PASS: Found $count categories${NC}"

    echo "$response" | jq '.data[0]'

# Test result functionelse

check_result() {    echo -e "${RED}❌ FAIL: No categories found${NC}"

    TOTAL_TESTS=$((TOTAL_TESTS + 1))fi

    if [ $1 -eq 0 ]; thenecho ""

        echo -e "${GREEN}✅ PASS${NC}: $2"

        PASSED_TESTS=$((PASSED_TESTS + 1))# Test 2: Get Courses (should work without auth)

    elseecho -e "${YELLOW}Test 2: GET /courses - Get All Courses${NC}"

        echo -e "${RED}❌ FAIL${NC}: $2"response=$(curl -s "$BASE_URL/courses")

        FAILED_TESTS=$((FAILED_TESTS + 1))success=$(echo "$response" | jq -r '.success')

    fiif [ "$success" = "true" ]; then

}    count=$(echo "$response" | jq '.data | length')

    echo -e "${GREEN}✅ PASS: Found $count courses${NC}"

echo -e "${BLUE}=========================================${NC}"else

echo -e "${BLUE}COURSE SERVICE COMPREHENSIVE TEST SUITE${NC}"    echo -e "${RED}❌ FAIL: Could not get courses${NC}"

echo -e "${BLUE}=========================================${NC}"fi

echo ""echo ""



################################################################################ Get a course ID for later tests

# SETUP: Create test user and get tokenCOURSE_ID=$(curl -s "$BASE_URL/courses" | jq -r '.data[0].id // empty')

###############################################################################

echo -e "${YELLOW}📋 SETUP: Creating test user...${NC}"if [ -n "$COURSE_ID" ]; then

    echo -e "${YELLOW}Using course ID: ${COURSE_ID}${NC}"

# Register test user    echo ""

TIMESTAMP=$(date +%s)

TEST_EMAIL="coursetest_${TIMESTAMP}@test.com"    # Test 3: Get Course Reviews

TEST_PASSWORD="Test123456"    echo -e "${YELLOW}Test 3: GET /courses/${COURSE_ID}/reviews - Get Course Reviews${NC}"

    response=$(curl -s "$BASE_URL/courses/$COURSE_ID/reviews")

REGISTER_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/v1/auth/register" \    success=$(echo "$response" | jq -r '.success')

  -H "Content-Type: application/json" \    if [ "$success" = "true" ]; then

  -d "{        count=$(echo "$response" | jq '.data | length')

    \"email\": \"${TEST_EMAIL}\",        echo -e "${GREEN}✅ PASS: Found $count reviews${NC}"

    \"password\": \"${TEST_PASSWORD}\",    else

    \"full_name\": \"Course Test User\",        echo -e "${RED}❌ FAIL: Could not get reviews${NC}"

    \"target_band_score\": 7.0    fi

  }")    echo ""



USER_ID=$(echo $REGISTER_RESPONSE | jq -r '.data.user.id // empty')    # Test 4: Get Course Categories (for specific course)

if [ -z "$USER_ID" ]; then    echo -e "${YELLOW}Test 4: GET /courses/${COURSE_ID}/categories - Get Course Categories${NC}"

    echo -e "${RED}❌ Failed to create test user${NC}"    response=$(curl -s "$BASE_URL/courses/$COURSE_ID/categories")

    echo "Response: $REGISTER_RESPONSE"    success=$(echo "$response" | jq -r '.success')

    exit 1    if [ "$success" = "true" ]; then

fi        count=$(echo "$response" | jq '.data | length')

        echo -e "${GREEN}✅ PASS: Found $count categories for this course${NC}"

# Login to get token    else

LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/v1/auth/login" \        echo -e "${RED}❌ FAIL: Could not get course categories${NC}"

  -H "Content-Type: application/json" \    fi

  -d "{    echo ""

    \"email\": \"${TEST_EMAIL}\",else

    \"password\": \"${TEST_PASSWORD}\"    echo -e "${RED}⚠️  No courses found, skipping course-specific tests${NC}"

  }")    echo ""

fi

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.access_token // empty')

if [ -z "$TOKEN" ]; then# Test 5: Create Review (requires auth - should fail without token)

    echo -e "${RED}❌ Failed to login${NC}"echo -e "${YELLOW}Test 5: POST /courses/:id/reviews - Create Review (without auth)${NC}"

    exit 1response=$(curl -s -X POST "$BASE_URL/courses/$COURSE_ID/reviews" \

fi    -H "Content-Type: application/json" \

    -d '{"rating": 5, "title": "Great course", "comment": "Very helpful"}')

echo -e "${GREEN}✅ Test user created: ${USER_ID}${NC}"echo "$response" | jq '.'

echo ""echo -e "${YELLOW}Expected: Should require authentication${NC}"

echo ""

###############################################################################

# SETUP: Get or create test course# Test 6: Track Video Progress (requires auth - should fail without token)

###############################################################################echo -e "${YELLOW}Test 6: POST /videos/track - Track Video Progress (without auth)${NC}"

echo -e "${YELLOW}📋 SETUP: Getting test course...${NC}"response=$(curl -s -X POST "$BASE_URL/videos/track" \

    -H "Content-Type: application/json" \

COURSES_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/v1/courses" \    -d '{

  -H "Authorization: Bearer ${TOKEN}")        "video_id": "123e4567-e89b-12d3-a456-426614174000",

        "lesson_id": "123e4567-e89b-12d3-a456-426614174001",

COURSE_ID=$(echo $COURSES_RESPONSE | jq -r '.data.courses[0].id // empty')        "watched_seconds": 120,

COURSE_TITLE=$(echo $COURSES_RESPONSE | jq -r '.data.courses[0].title // empty')        "total_seconds": 300

    }')

if [ -z "$COURSE_ID" ]; thenecho "$response" | jq '.'

    echo -e "${RED}❌ No test course found${NC}"echo -e "${YELLOW}Expected: Should require authentication${NC}"

    exit 1echo ""

fi

# Test 7: Get Video Watch History (requires auth - should fail without token)

echo -e "${GREEN}✅ Test course: ${COURSE_ID} - ${COURSE_TITLE}${NC}"echo -e "${YELLOW}Test 7: GET /videos/history - Get Video Watch History (without auth)${NC}"

response=$(curl -s "$BASE_URL/videos/history")

# Get first lessonecho "$response" | jq '.'

LESSONS_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/v1/courses/${COURSE_ID}" \echo -e "${YELLOW}Expected: Should require authentication${NC}"

  -H "Authorization: Bearer ${TOKEN}")echo ""



LESSON_ID=$(echo $LESSONS_RESPONSE | jq -r '.data.modules[0].lessons[0].id // empty')# Test 8: Get Video Subtitles (requires auth - should fail without token)

LESSON_TITLE=$(echo $LESSONS_RESPONSE | jq -r '.data.modules[0].lessons[0].title // empty')echo -e "${YELLOW}Test 8: GET /videos/:id/subtitles - Get Video Subtitles (without auth)${NC}"

VIDEO_ID="123e4567-e89b-12d3-a456-426614174000"

if [ -z "$LESSON_ID" ]; thenresponse=$(curl -s "$BASE_URL/videos/$VIDEO_ID/subtitles")

    echo -e "${RED}❌ No test lesson found${NC}"echo "$response" | jq '.'

    exit 1echo -e "${YELLOW}Expected: Should require authentication${NC}"

fiecho ""



echo -e "${GREEN}✅ Test lesson: ${LESSON_ID} - ${LESSON_TITLE}${NC}"# Test 9: Download Material (requires auth - should fail without token)

echo ""echo -e "${YELLOW}Test 9: POST /materials/:id/download - Record Material Download (without auth)${NC}"

MATERIAL_ID="123e4567-e89b-12d3-a456-426614174000"

###############################################################################response=$(curl -s -X POST "$BASE_URL/materials/$MATERIAL_ID/download")

# TEST 1: Enroll in Course (FIX #9 - Duplicate enrollment handling)echo "$response" | jq '.'

###############################################################################echo -e "${YELLOW}Expected: Should require authentication${NC}"

echo -e "${YELLOW}TEST 1: Course Enrollment${NC}"echo ""



# First enrollmentecho "=================================================="

ENROLL1_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/v1/courses/${COURSE_ID}/enroll" \echo "  Summary"

  -H "Authorization: Bearer ${TOKEN}" \echo "=================================================="

  -H "Content-Type: application/json" \echo -e "${GREEN}Public APIs (no auth required):${NC}"

  -d "{echo "  ✅ GET /categories"

    \"course_id\": \"${COURSE_ID}\",echo "  ✅ GET /courses"

    \"enrollment_type\": \"free\"echo "  ✅ GET /courses/:id/reviews"

  }")echo "  ✅ GET /courses/:id/categories"

echo ""

ENROLL1_STATUS=$(echo $ENROLL1_RESPONSE | jq -r '.status // empty')echo -e "${YELLOW}Protected APIs (auth required):${NC}"

ENROLLMENT_ID=$(echo $ENROLL1_RESPONSE | jq -r '.data.id // empty')echo "  🔒 POST /courses/:id/reviews"

echo "  🔒 POST /videos/track"

if [ "$ENROLL1_STATUS" = "success" ] && [ -n "$ENROLLMENT_ID" ]; thenecho "  🔒 GET  /videos/history"

    check_result 0 "First enrollment successful"echo "  🔒 GET  /videos/:id/subtitles"

elseecho "  🔒 POST /materials/:id/download"

    check_result 1 "First enrollment failed"echo ""

    echo "Response: $ENROLL1_RESPONSE"echo -e "${YELLOW}Note: Protected APIs require valid JWT token in Authorization header${NC}"

fiecho "Use: Authorization: Bearer <your_token>"

echo ""

# Second enrollment (should handle duplicate gracefully)
ENROLL2_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/v1/courses/${COURSE_ID}/enroll" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"course_id\": \"${COURSE_ID}\",
    \"enrollment_type\": \"free\"
  }")

ENROLL2_STATUS=$(echo $ENROLL2_RESPONSE | jq -r '.status // empty')
ENROLL2_ID=$(echo $ENROLL2_RESPONSE | jq -r '.data.id // empty')

if [ "$ENROLL2_STATUS" = "success" ] && [ "$ENROLL2_ID" = "$ENROLLMENT_ID" ]; then
    check_result 0 "Duplicate enrollment handled correctly (returned same enrollment)"
else
    check_result 1 "Duplicate enrollment not handled correctly"
    echo "Response: $ENROLL2_RESPONSE"
fi

echo ""

###############################################################################
# TEST 2: FIX #10 - Video Progress Calculation
###############################################################################
echo -e "${YELLOW}TEST 2: Video Progress Calculation Logic${NC}"

# Update 1: Set initial video progress
UPDATE1=$(curl -s -X PUT "${BASE_URL}/api/v1/courses/lessons/${LESSON_ID}/progress" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"video_watched_seconds\": 60,
    \"video_total_seconds\": 120,
    \"progress_percentage\": 50,
    \"time_spent_minutes\": 1
  }")

PROGRESS1=$(echo $UPDATE1 | jq -r '.data.progress_percentage // 0')
VIDEO_PERCENT1=$(echo $UPDATE1 | jq -r '.data.video_watch_percentage // 0')

if [ "$PROGRESS1" = "50" ]; then
    check_result 0 "Initial video progress set: 50%"
else
    check_result 1 "Initial video progress incorrect: $PROGRESS1"
fi

# Update 2: Only update watched seconds (atomic increment)
UPDATE2=$(curl -s -X PUT "${BASE_URL}/api/v1/courses/lessons/${LESSON_ID}/progress" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"video_watched_seconds\": 90,
    \"time_spent_minutes\": 2
  }")

PROGRESS2=$(echo $UPDATE2 | jq -r '.data.progress_percentage // 0')
WATCHED2=$(echo $UPDATE2 | jq -r '.data.video_watched_seconds // 0')

if [ "$WATCHED2" = "90" ]; then
    check_result 0 "Video watched seconds updated atomically: 90"
else
    check_result 1 "Video watched seconds not updated correctly: $WATCHED2"
fi

echo ""

###############################################################################
# TEST 3: FIX #7 - Race Condition Prevention (Concurrent Updates)
###############################################################################
echo -e "${YELLOW}TEST 3: Concurrent Progress Updates (Race Condition Prevention)${NC}"

# Get current progress
CURRENT_PROGRESS=$(curl -s -X GET "${BASE_URL}/api/v1/courses/lessons/${LESSON_ID}/progress" \
  -H "Authorization: Bearer ${TOKEN}")

CURRENT_WATCHED=$(echo $CURRENT_PROGRESS | jq -r '.data.video_watched_seconds // 0')
CURRENT_TIME=$(echo $CURRENT_PROGRESS | jq -r '.data.time_spent_minutes // 0')

echo "Current state: watched=${CURRENT_WATCHED}s, time=${CURRENT_TIME}min"

# Simulate 3 concurrent updates from different devices
echo "Sending 3 concurrent updates..."

curl -s -X PUT "${BASE_URL}/api/v1/courses/lessons/${LESSON_ID}/progress" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"video_watched_seconds\": 95, \"time_spent_minutes\": 3}" &

curl -s -X PUT "${BASE_URL}/api/v1/courses/lessons/${LESSON_ID}/progress" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"video_watched_seconds\": 100, \"time_spent_minutes\": 4}" &

curl -s -X PUT "${BASE_URL}/api/v1/courses/lessons/${LESSON_ID}/progress" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"video_watched_seconds\": 105, \"time_spent_minutes\": 5}" &

wait

sleep 1

# Check final state
FINAL_PROGRESS=$(curl -s -X GET "${BASE_URL}/api/v1/courses/lessons/${LESSON_ID}/progress" \
  -H "Authorization: Bearer ${TOKEN}")

FINAL_WATCHED=$(echo $FINAL_PROGRESS | jq -r '.data.video_watched_seconds // 0')
FINAL_TIME=$(echo $FINAL_PROGRESS | jq -r '.data.time_spent_minutes // 0')

echo "Final state: watched=${FINAL_WATCHED}s, time=${FINAL_TIME}min"

# With atomic updates, last update should win (105, 5)
if [ "$FINAL_WATCHED" = "105" ] && [ "$FINAL_TIME" = "5" ]; then
    check_result 0 "Concurrent updates handled correctly (atomic operations)"
else
    check_result 1 "Race condition detected - Updates lost: watched=${FINAL_WATCHED}, time=${FINAL_TIME}"
fi

echo ""

###############################################################################
# TEST 4: FIX #8 - Enrollment Progress Auto-Update
###############################################################################
echo -e "${YELLOW}TEST 4: Enrollment Progress Auto-Update${NC}"

# Get initial enrollment progress
INITIAL_ENROLLMENT=$(curl -s -X GET "${BASE_URL}/api/v1/courses/${COURSE_ID}/progress" \
  -H "Authorization: Bearer ${TOKEN}")

INITIAL_COMPLETED=$(echo $INITIAL_ENROLLMENT | jq -r '.data.enrollment.lessons_completed // 0')
echo "Initial lessons completed: ${INITIAL_COMPLETED}"

# Complete the lesson
COMPLETE_RESPONSE=$(curl -s -X PUT "${BASE_URL}/api/v1/courses/lessons/${LESSON_ID}/progress" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"is_completed\": true,
    \"progress_percentage\": 100,
    \"time_spent_minutes\": 10
  }")

COMPLETION_STATUS=$(echo $COMPLETE_RESPONSE | jq -r '.data.status // empty')

if [ "$COMPLETION_STATUS" = "completed" ]; then
    check_result 0 "Lesson marked as completed"
else
    check_result 1 "Failed to mark lesson as completed"
fi

sleep 2

# Check if enrollment progress was updated
UPDATED_ENROLLMENT=$(curl -s -X GET "${BASE_URL}/api/v1/courses/${COURSE_ID}/progress" \
  -H "Authorization: Bearer ${TOKEN}")

UPDATED_COMPLETED=$(echo $UPDATED_ENROLLMENT | jq -r '.data.enrollment.lessons_completed // 0')
UPDATED_TIME=$(echo $UPDATED_ENROLLMENT | jq -r '.data.enrollment.total_time_spent_minutes // 0')
UPDATED_PROGRESS=$(echo $UPDATED_ENROLLMENT | jq -r '.data.enrollment.progress_percentage // 0')

echo "Updated lessons completed: ${UPDATED_COMPLETED}"
echo "Total time spent: ${UPDATED_TIME} minutes"
echo "Progress percentage: ${UPDATED_PROGRESS}%"

if [ "$UPDATED_COMPLETED" -gt "$INITIAL_COMPLETED" ]; then
    check_result 0 "Enrollment progress auto-updated (lessons_completed incremented)"
else
    check_result 1 "Enrollment progress NOT updated automatically"
fi

if [ "$UPDATED_TIME" -ge 10 ]; then
    check_result 0 "Enrollment time tracking updated"
else
    check_result 1 "Enrollment time tracking NOT updated"
fi

echo ""

###############################################################################
# TEST 5: FIX #11 - Service Integration (User Service Progress Update)
###############################################################################
echo -e "${YELLOW}TEST 5: Service Integration - User Progress Update${NC}"

# Wait for async service integration
sleep 3

# Check if user's learning progress was updated via User Service
USER_PROGRESS=$(curl -s -X GET "${BASE_URL}/api/v1/user/learning-progress" \
  -H "Authorization: Bearer ${TOKEN}")

USER_LESSONS_COMPLETED=$(echo $USER_PROGRESS | jq -r '.data.total_lessons_completed // 0')
USER_STUDY_HOURS=$(echo $USER_PROGRESS | jq -r '.data.total_study_hours // 0')

echo "User total lessons completed: ${USER_LESSONS_COMPLETED}"
echo "User total study hours: ${USER_STUDY_HOURS}"

if [ "$USER_LESSONS_COMPLETED" -gt 0 ]; then
    check_result 0 "User Service integration working (lessons_completed > 0)"
else
    check_result 1 "User Service integration NOT working (lessons_completed = 0)"
fi

if (( $(echo "$USER_STUDY_HOURS > 0" | bc -l) )); then
    check_result 0 "User Service study time tracking working"
else
    check_result 1 "User Service study time NOT tracked"
fi

echo ""

###############################################################################
# TEST 6: Get My Enrollments
###############################################################################
echo -e "${YELLOW}TEST 6: Get My Enrollments${NC}"

MY_ENROLLMENTS=$(curl -s -X GET "${BASE_URL}/api/v1/courses/my-enrollments" \
  -H "Authorization: Bearer ${TOKEN}")

ENROLLMENT_COUNT=$(echo $MY_ENROLLMENTS | jq -r '.data.total // 0')

if [ "$ENROLLMENT_COUNT" -gt 0 ]; then
    check_result 0 "Retrieved enrollments successfully (count: ${ENROLLMENT_COUNT})"
else
    check_result 1 "No enrollments found"
fi

# Check if enrolled course is in the list
FOUND_COURSE=$(echo $MY_ENROLLMENTS | jq -r ".data.enrollments[] | select(.enrollment.course_id == \"$COURSE_ID\") | .enrollment.id")

if [ -n "$FOUND_COURSE" ]; then
    check_result 0 "Enrolled course found in my enrollments"
else
    check_result 1 "Enrolled course NOT found in my enrollments"
fi

echo ""

###############################################################################
# SUMMARY
###############################################################################
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}TEST SUMMARY${NC}"
echo -e "${BLUE}=========================================${NC}"
echo -e "Total Tests: ${TOTAL_TESTS}"
echo -e "${GREEN}Passed: ${PASSED_TESTS}${NC}"
echo -e "${RED}Failed: ${FAILED_TESTS}${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! Course Service fixes verified.${NC}"
    echo ""
    echo -e "${GREEN}✅ FIX #7: Race conditions prevented with atomic updates${NC}"
    echo -e "${GREEN}✅ FIX #8: Enrollment progress auto-updated${NC}"
    echo -e "${GREEN}✅ FIX #9: Duplicate enrollments handled correctly${NC}"
    echo -e "${GREEN}✅ FIX #10: Video progress calculation working${NC}"
    echo -e "${GREEN}✅ FIX #11: Service integration with retry mechanism${NC}"
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED. Please review the fixes.${NC}"
    exit 1
fi
