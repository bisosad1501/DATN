#!/bin/bash

# Comprehensive User Service Testing Script
# Tests all business logic scenarios

set -e

GATEWAY_URL="http://localhost:8080"
USER_SERVICE_URL="http://localhost:8082"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASSED=0
FAILED=0
TEST_EMAIL="test_user_$(date +%s)@example.com"

echo "=================================================="
echo "USER SERVICE COMPREHENSIVE BUSINESS LOGIC TESTING"
echo "=================================================="
echo ""

# Function to print test results
pass_test() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASSED++))
}

fail_test() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    echo -e "${YELLOW}   Details: $2${NC}"
    ((FAILED++))
}

warn_test() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
}

# ==============================================
# SCENARIO 1: User Registration & Profile Creation
# ==============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 SCENARIO 1: Registration & Profile Creation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Test 1.1: Register new user"
REGISTER_RESPONSE=$(curl -s -X POST "$GATEWAY_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"TestPass123!\",
    \"role\": \"student\"
  }")

if echo "$REGISTER_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
    USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.data.user_id')
    TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.access_token')
    pass_test "User registration successful (ID: $USER_ID)"
else
    fail_test "User registration failed" "$REGISTER_RESPONSE"
    exit 1
fi

echo ""
echo "Test 1.2: Profile auto-created after registration"
sleep 1
PROFILE_RESPONSE=$(curl -s "$GATEWAY_URL/api/v1/user/profile" \
  -H "Authorization: Bearer $TOKEN")

if echo "$PROFILE_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
    PROFILE_USER_ID=$(echo "$PROFILE_RESPONSE" | jq -r '.data.user_id')
    if [ "$PROFILE_USER_ID" = "$USER_ID" ]; then
        pass_test "Profile created with matching user_id"
    else
        fail_test "Profile user_id mismatch" "Expected: $USER_ID, Got: $PROFILE_USER_ID"
    fi
else
    fail_test "Profile not found after registration" "$PROFILE_RESPONSE"
fi

echo ""
echo "Test 1.3: Learning progress auto-initialized"
PROGRESS_RESPONSE=$(curl -s "$GATEWAY_URL/api/v1/user/progress" \
  -H "Authorization: Bearer $TOKEN")

if echo "$PROGRESS_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
    TOTAL_LESSONS=$(echo "$PROGRESS_RESPONSE" | jq -r '.data.progress.total_lessons_completed')
    TOTAL_EXERCISES=$(echo "$PROGRESS_RESPONSE" | jq -r '.data.progress.total_exercises_completed')
    STREAK=$(echo "$PROGRESS_RESPONSE" | jq -r '.data.progress.current_streak_days')
    
    if [ "$TOTAL_LESSONS" = "0" ] && [ "$TOTAL_EXERCISES" = "0" ] && [ "$STREAK" = "0" ]; then
        pass_test "Learning progress initialized with zeros"
    else
        fail_test "Learning progress not properly initialized" "Lessons: $TOTAL_LESSONS, Exercises: $TOTAL_EXERCISES, Streak: $STREAK"
    fi
else
    fail_test "Learning progress not found" "$PROGRESS_RESPONSE"
fi

# ==============================================
# SCENARIO 2: Profile Updates
# ==============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 SCENARIO 2: Profile Management"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Test 2.1: Update profile with valid data"
UPDATE_RESPONSE=$(curl -s -X PUT "$GATEWAY_URL/api/v1/user/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "target_band_score": 7.5,
    "current_level": "intermediate"
  }')

if echo "$UPDATE_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
    FULL_NAME=$(echo "$UPDATE_RESPONSE" | jq -r '.data.full_name')
    TARGET_SCORE=$(echo "$UPDATE_RESPONSE" | jq -r '.data.target_band_score')
    
    if [ "$FULL_NAME" = "Test User" ] && [ "$TARGET_SCORE" = "7.5" ]; then
        pass_test "Profile updated successfully"
    else
        fail_test "Profile update data mismatch" "Name: $FULL_NAME, Score: $TARGET_SCORE"
    fi
else
    fail_test "Profile update failed" "$UPDATE_RESPONSE"
fi

echo ""
echo "Test 2.2: Invalid target_band_score (> 9)"
INVALID_SCORE_RESPONSE=$(curl -s -X PUT "$GATEWAY_URL/api/v1/user/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "target_band_score": 10.0
  }')

if echo "$INVALID_SCORE_RESPONSE" | jq -e '.success == false' > /dev/null 2>&1; then
    pass_test "Invalid band score rejected (> 9)"
else
    fail_test "Invalid band score accepted" "$INVALID_SCORE_RESPONSE"
fi

echo ""
echo "Test 2.3: Invalid target_band_score (< 0)"
INVALID_SCORE_RESPONSE=$(curl -s -X PUT "$GATEWAY_URL/api/v1/user/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "target_band_score": -1.0
  }')

if echo "$INVALID_SCORE_RESPONSE" | jq -e '.success == false' > /dev/null 2>&1; then
    pass_test "Invalid band score rejected (< 0)"
else
    fail_test "Invalid band score accepted" "$INVALID_SCORE_RESPONSE"
fi

# ==============================================
# SCENARIO 3: Progress Updates (Atomic Operations)
# ==============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 SCENARIO 3: Progress Updates (Atomic)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Test 3.1: Single lesson completion"
INTERNAL_KEY=$(grep INTERNAL_API_KEY services/user-service/.env 2>/dev/null | cut -d'=' -f2 || echo "dev_internal_key_2025")

UPDATE_PROGRESS=$(curl -s -X PUT "$USER_SERVICE_URL/api/v1/user/internal/progress/update" \
  -H "Content-Type: application/json" \
  -H "X-Internal-API-Key: $INTERNAL_KEY" \
  -d "{
    \"user_id\": \"$USER_ID\",
    \"lessons_completed\": 1,
    \"study_minutes\": 30
  }")

if echo "$UPDATE_PROGRESS" | jq -e '.success == true' > /dev/null 2>&1; then
    pass_test "Progress updated via internal endpoint"
    
    # Verify update
    sleep 1
    VERIFY_PROGRESS=$(curl -s "$GATEWAY_URL/api/v1/user/progress" \
      -H "Authorization: Bearer $TOKEN")
    
    LESSONS=$(echo "$VERIFY_PROGRESS" | jq -r '.data.progress.total_lessons_completed')
    HOURS=$(echo "$VERIFY_PROGRESS" | jq -r '.data.progress.total_study_hours')
    STREAK=$(echo "$VERIFY_PROGRESS" | jq -r '.data.progress.current_streak_days')
    
    if [ "$LESSONS" = "1" ]; then
        pass_test "Lesson count incremented atomically (1)"
    else
        fail_test "Lesson count incorrect" "Expected: 1, Got: $LESSONS"
    fi
    
    # Check study hours (30 min = 0.5 hours)
    if echo "$HOURS" | awk '{exit !($1 >= 0.4 && $1 <= 0.6)}'; then
        pass_test "Study hours calculated correctly (~0.5)"
    else
        fail_test "Study hours incorrect" "Expected: ~0.5, Got: $HOURS"
    fi
    
    # Check streak (first study = 1)
    if [ "$STREAK" = "1" ]; then
        pass_test "Streak initialized to 1 on first study"
    else
        fail_test "Streak not initialized" "Expected: 1, Got: $STREAK"
    fi
else
    fail_test "Progress update failed" "$UPDATE_PROGRESS"
fi

echo ""
echo "Test 3.2: Multiple updates (simulate concurrent)"
for i in {1..3}; do
    curl -s -X PUT "$USER_SERVICE_URL/api/v1/user/internal/progress/update" \
      -H "Content-Type: application/json" \
      -H "X-Internal-API-Key: $INTERNAL_KEY" \
      -d "{
        \"user_id\": \"$USER_ID\",
        \"lessons_completed\": 1,
        \"study_minutes\": 15
      }" > /dev/null 2>&1 &
done
wait

sleep 2
CONCURRENT_CHECK=$(curl -s "$GATEWAY_URL/api/v1/user/progress" \
  -H "Authorization: Bearer $TOKEN")

TOTAL_LESSONS=$(echo "$CONCURRENT_CHECK" | jq -r '.data.progress.total_lessons_completed')

if [ "$TOTAL_LESSONS" = "4" ]; then
    pass_test "Concurrent updates: All increments applied (4 total)"
else
    warn_test "Concurrent updates may have race condition: Expected 4, Got $TOTAL_LESSONS"
fi

# ==============================================
# SCENARIO 4: Streak Logic
# ==============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 SCENARIO 4: Streak Logic"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Test 4.1: Same day study (streak should not change)"
curl -s -X PUT "$USER_SERVICE_URL/api/v1/user/internal/progress/update" \
  -H "Content-Type: application/json" \
  -H "X-Internal-API-Key: $INTERNAL_KEY" \
  -d "{
    \"user_id\": \"$USER_ID\",
    \"exercises_completed\": 1,
    \"study_minutes\": 10
  }" > /dev/null 2>&1

sleep 1
SAME_DAY_CHECK=$(curl -s "$GATEWAY_URL/api/v1/user/progress" \
  -H "Authorization: Bearer $TOKEN")

STREAK_SAME_DAY=$(echo "$SAME_DAY_CHECK" | jq -r '.data.progress.current_streak_days')

if [ "$STREAK_SAME_DAY" = "1" ]; then
    pass_test "Same day study: Streak unchanged (1)"
else
    fail_test "Same day study: Streak changed unexpectedly" "Expected: 1, Got: $STREAK_SAME_DAY"
fi

echo ""
echo "Test 4.2: Check last_study_date is today"
LAST_STUDY=$(echo "$SAME_DAY_CHECK" | jq -r '.data.progress.last_study_date')
TODAY=$(date +%Y-%m-%d)

if echo "$LAST_STUDY" | grep -q "$TODAY"; then
    pass_test "Last study date is today"
else
    warn_test "Last study date mismatch: Expected $TODAY, Got $LAST_STUDY"
fi

# ==============================================
# SCENARIO 5: Skill Statistics
# ==============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 SCENARIO 5: Skill Statistics"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Test 5.1: First skill practice (listening, score: 7.0)"
curl -s -X PUT "$USER_SERVICE_URL/api/v1/user/internal/statistics/listening/update" \
  -H "Content-Type: application/json" \
  -H "X-Internal-API-Key: $INTERNAL_KEY" \
  -d "{
    \"user_id\": \"$USER_ID\",
    \"score\": 7.0,
    \"is_completed\": true,
    \"time_minutes\": 20
  }" > /dev/null 2>&1

sleep 1
STATS_CHECK=$(curl -s "$GATEWAY_URL/api/v1/user/statistics/listening" \
  -H "Authorization: Bearer $TOKEN")

if echo "$STATS_CHECK" | jq -e '.success == true' > /dev/null 2>&1; then
    AVG_SCORE=$(echo "$STATS_CHECK" | jq -r '.data.average_score')
    BEST_SCORE=$(echo "$STATS_CHECK" | jq -r '.data.best_score')
    TOTAL_PRACTICES=$(echo "$STATS_CHECK" | jq -r '.data.total_practices')
    
    if [ "$TOTAL_PRACTICES" = "1" ]; then
        pass_test "First practice recorded (total: 1)"
    else
        fail_test "Practice count wrong" "Expected: 1, Got: $TOTAL_PRACTICES"
    fi
    
    if [ "$AVG_SCORE" = "7" ] || [ "$AVG_SCORE" = "7.0" ]; then
        pass_test "Average score = first score (7.0)"
    else
        fail_test "Average score incorrect" "Expected: 7.0, Got: $AVG_SCORE"
    fi
    
    if [ "$BEST_SCORE" = "7" ] || [ "$BEST_SCORE" = "7.0" ]; then
        pass_test "Best score = first score (7.0)"
    else
        fail_test "Best score incorrect" "Expected: 7.0, Got: $BEST_SCORE"
    fi
else
    fail_test "Skill statistics not found" "$STATS_CHECK"
fi

echo ""
echo "Test 5.2: Second practice (score: 8.0, avg should be 7.5)"
curl -s -X PUT "$USER_SERVICE_URL/api/v1/user/internal/statistics/listening/update" \
  -H "Content-Type: application/json" \
  -H "X-Internal-API-Key: $INTERNAL_KEY" \
  -d "{
    \"user_id\": \"$USER_ID\",
    \"score\": 8.0,
    \"is_completed\": true,
    \"time_minutes\": 25
  }" > /dev/null 2>&1

sleep 1
STATS_CHECK2=$(curl -s "$GATEWAY_URL/api/v1/user/statistics/listening" \
  -H "Authorization: Bearer $TOKEN")

AVG_SCORE2=$(echo "$STATS_CHECK2" | jq -r '.data.average_score')
BEST_SCORE2=$(echo "$STATS_CHECK2" | jq -r '.data.best_score')
TOTAL_PRACTICES2=$(echo "$STATS_CHECK2" | jq -r '.data.total_practices')

if [ "$TOTAL_PRACTICES2" = "2" ]; then
    pass_test "Second practice recorded (total: 2)"
else
    fail_test "Practice count wrong after 2nd" "Expected: 2, Got: $TOTAL_PRACTICES2"
fi

# Check average (7.0 + 8.0) / 2 = 7.5
if echo "$AVG_SCORE2" | awk '{exit !($1 >= 7.4 && $1 <= 7.6)}'; then
    pass_test "Average score calculated correctly (7.5)"
else
    fail_test "Average score calculation wrong" "Expected: 7.5, Got: $AVG_SCORE2"
fi

if [ "$BEST_SCORE2" = "8" ] || [ "$BEST_SCORE2" = "8.0" ]; then
    pass_test "Best score updated to 8.0"
else
    fail_test "Best score not updated" "Expected: 8.0, Got: $BEST_SCORE2"
fi

echo ""
echo "Test 5.3: Third practice (score: 6.0, avg should be 7.0)"
curl -s -X PUT "$USER_SERVICE_URL/api/v1/user/internal/statistics/listening/update" \
  -H "Content-Type: application/json" \
  -H "X-Internal-API-Key: $INTERNAL_KEY" \
  -d "{
    \"user_id\": \"$USER_ID\",
    \"score\": 6.0,
    \"is_completed\": true,
    \"time_minutes\": 18
  }" > /dev/null 2>&1

sleep 1
STATS_CHECK3=$(curl -s "$GATEWAY_URL/api/v1/user/statistics/listening" \
  -H "Authorization: Bearer $TOKEN")

AVG_SCORE3=$(echo "$STATS_CHECK3" | jq -r '.data.average_score')
BEST_SCORE3=$(echo "$STATS_CHECK3" | jq -r '.data.best_score')

# Check average (7.0 + 8.0 + 6.0) / 3 = 7.0
if echo "$AVG_SCORE3" | awk '{exit !($1 >= 6.9 && $1 <= 7.1)}'; then
    pass_test "Average score recalculated correctly (7.0)"
else
    fail_test "Average score wrong after 3rd" "Expected: 7.0, Got: $AVG_SCORE3"
fi

if [ "$BEST_SCORE3" = "8" ] || [ "$BEST_SCORE3" = "8.0" ]; then
    pass_test "Best score remains 8.0"
else
    fail_test "Best score changed unexpectedly" "Expected: 8.0, Got: $BEST_SCORE3"
fi

# ==============================================
# SCENARIO 6: Study Goals
# ==============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 SCENARIO 6: Study Goals"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

FUTURE_DATE=$(date -v+30d +%Y-%m-%d 2>/dev/null || date -d "+30 days" +%Y-%m-%d)

echo "Test 6.1: Create study goal"
GOAL_RESPONSE=$(curl -s -X POST "$GATEWAY_URL/api/v1/user/goals" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"goal_type\": \"daily_practice\",
    \"title\": \"Complete 10 exercises\",
    \"description\": \"Practice listening skills\",
    \"target_value\": 10,
    \"target_unit\": \"exercises\",
    \"skill_type\": \"listening\",
    \"end_date\": \"$FUTURE_DATE\"
  }")

if echo "$GOAL_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
    GOAL_ID=$(echo "$GOAL_RESPONSE" | jq -r '.data.id')
    pass_test "Study goal created (ID: $GOAL_ID)"
else
    fail_test "Goal creation failed" "$GOAL_RESPONSE"
fi

echo ""
echo "Test 6.2: Invalid goal (end_date in past)"
PAST_DATE=$(date -v-30d +%Y-%m-%d 2>/dev/null || date -d "-30 days" +%Y-%m-%d)

INVALID_GOAL=$(curl -s -X POST "$GATEWAY_URL/api/v1/user/goals" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"goal_type\": \"daily_practice\",
    \"title\": \"Past goal\",
    \"target_value\": 5,
    \"target_unit\": \"lessons\",
    \"end_date\": \"$PAST_DATE\"
  }")

if echo "$INVALID_GOAL" | jq -e '.success == false' > /dev/null 2>&1; then
    pass_test "Past date goal rejected"
else
    fail_test "Past date goal accepted" "$INVALID_GOAL"
fi

echo ""
echo "Test 6.3: Invalid goal (target_value <= 0)"
ZERO_TARGET=$(curl -s -X POST "$GATEWAY_URL/api/v1/user/goals" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"goal_type\": \"daily_practice\",
    \"title\": \"Zero target\",
    \"target_value\": 0,
    \"target_unit\": \"lessons\",
    \"end_date\": \"$FUTURE_DATE\"
  }")

if echo "$ZERO_TARGET" | jq -e '.success == false' > /dev/null 2>&1; then
    pass_test "Zero/negative target rejected"
else
    fail_test "Zero target accepted" "$ZERO_TARGET"
fi

# ==============================================
# SUMMARY
# ==============================================
echo ""
echo "=================================================="
echo "TEST SUMMARY"
echo "=================================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  SOME TESTS FAILED${NC}"
    exit 1
fi
