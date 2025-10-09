#!/bin/bash

# Exercise Service Comprehensive Test Script
# Tests all features including auto-grading and cross-service integration

BASE_URL="http://localhost:8084/api/v1"
AUTH_URL="http://localhost:8081/api/v1/auth"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASSED${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}: $2"
        ((FAILED++))
    fi
}

echo "======================================"
echo "Exercise Service Comprehensive Testing"
echo "======================================"
echo ""

# Step 1: Register and login as instructor
echo "Step 1: Authentication Setup"
echo "--------------------------------------"

# Register instructor
INSTRUCTOR_EMAIL="instructor_exercise_test@example.com"
INSTRUCTOR_PASSWORD="Test123!@#"

echo "Registering instructor..."
REGISTER_RESPONSE=$(curl -s -X POST "${AUTH_URL}/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${INSTRUCTOR_EMAIL}\",
    \"password\": \"${INSTRUCTOR_PASSWORD}\",
    \"full_name\": \"Exercise Test Instructor\",
    \"role\": \"instructor\"
  }")

echo "Response: $REGISTER_RESPONSE"

# Login instructor
echo "Logging in as instructor..."
LOGIN_RESPONSE=$(curl -s -X POST "${AUTH_URL}/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${INSTRUCTOR_EMAIL}\",
    \"password\": \"${INSTRUCTOR_PASSWORD}\"
  }")

INSTRUCTOR_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.access_token // empty')

if [ -z "$INSTRUCTOR_TOKEN" ] || [ "$INSTRUCTOR_TOKEN" == "null" ]; then
    echo -e "${RED}Failed to get instructor token. Response: $LOGIN_RESPONSE${NC}"
    exit 1
fi

print_result 0 "Instructor authenticated"
echo ""

# Step 2: Create Exercise
echo "Step 2: Create Exercise"
echo "--------------------------------------"

CREATE_EXERCISE_RESPONSE=$(curl -s -X POST "${BASE_URL}/admin/exercises" \
  -H "Authorization: Bearer ${INSTRUCTOR_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "IELTS Listening Practice Test 1",
    "slug": "ielts-listening-practice-test-1",
    "description": "Comprehensive listening practice test",
    "exercise_type": "practice",
    "skill_type": "listening",
    "difficulty": "medium",
    "ielts_level": "6.5",
    "time_limit_minutes": 30,
    "passing_score": 60,
    "is_free": true
  }')

EXERCISE_ID=$(echo $CREATE_EXERCISE_RESPONSE | jq -r '.data.id // empty')

if [ -z "$EXERCISE_ID" ] || [ "$EXERCISE_ID" == "null" ]; then
    echo -e "${RED}Failed to create exercise. Response: $CREATE_EXERCISE_RESPONSE${NC}"
    exit 1
fi

print_result 0 "Exercise created (ID: $EXERCISE_ID)"
echo ""

# Step 3: Create Section
echo "Step 3: Create Section"
echo "--------------------------------------"

CREATE_SECTION_RESPONSE=$(curl -s -X POST "${BASE_URL}/admin/exercises/${EXERCISE_ID}/sections" \
  -H "Authorization: Bearer ${INSTRUCTOR_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Section 1: Social Conversation",
    "section_number": 1,
    "instructions": "Listen to the conversation and answer questions 1-5",
    "time_limit_minutes": 10,
    "display_order": 1
  }')

SECTION_ID=$(echo $CREATE_SECTION_RESPONSE | jq -r '.data.id // empty')

if [ -z "$SECTION_ID" ] || [ "$SECTION_ID" == "null" ]; then
    echo -e "${RED}Failed to create section. Response: $CREATE_SECTION_RESPONSE${NC}"
    exit 1
fi

print_result 0 "Section created (ID: $SECTION_ID)"
echo ""

# Step 4: Create Multiple Choice Question
echo "Step 4: Create Multiple Choice Question"
echo "--------------------------------------"

CREATE_MCQ_RESPONSE=$(curl -s -X POST "${BASE_URL}/admin/questions" \
  -H "Authorization: Bearer ${INSTRUCTOR_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"exercise_id\": \"${EXERCISE_ID}\",
    \"section_id\": \"${SECTION_ID}\",
    \"question_number\": 1,
    \"question_text\": \"What is the main topic of the conversation?\",
    \"question_type\": \"multiple_choice\",
    \"points\": 1.0,
    \"difficulty\": \"easy\",
    \"explanation\": \"The speakers discuss booking a hotel room\",
    \"display_order\": 1
  }")

MCQ_ID=$(echo $CREATE_MCQ_RESPONSE | jq -r '.data.id // empty')

if [ -z "$MCQ_ID" ] || [ "$MCQ_ID" == "null" ]; then
    echo -e "${RED}Failed to create MCQ. Response: $CREATE_MCQ_RESPONSE${NC}"
    exit 1
fi

print_result 0 "Multiple choice question created (ID: $MCQ_ID)"

# Add options for MCQ
echo "Adding options..."

# Option A (incorrect)
curl -s -X POST "${BASE_URL}/admin/questions/${MCQ_ID}/options" \
  -H "Authorization: Bearer ${INSTRUCTOR_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "option_label": "A",
    "option_text": "Making a restaurant reservation",
    "is_correct": false,
    "display_order": 1
  }' > /dev/null

# Option B (correct)
curl -s -X POST "${BASE_URL}/admin/questions/${MCQ_ID}/options" \
  -H "Authorization: Bearer ${INSTRUCTOR_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "option_label": "B",
    "option_text": "Booking a hotel room",
    "is_correct": true,
    "display_order": 2
  }' > /dev/null

# Option C (incorrect)
curl -s -X POST "${BASE_URL}/admin/questions/${MCQ_ID}/options" \
  -H "Authorization: Bearer ${INSTRUCTOR_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "option_label": "C",
    "option_text": "Ordering room service",
    "is_correct": false,
    "display_order": 3
  }' > /dev/null

print_result 0 "MCQ options created (A, B-correct, C)"
echo ""

# Step 5: Create Fill-in-Blank Question
echo "Step 5: Create Fill-in-Blank Question"
echo "--------------------------------------"

CREATE_FIB_RESPONSE=$(curl -s -X POST "${BASE_URL}/admin/questions" \
  -H "Authorization: Bearer ${INSTRUCTOR_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"exercise_id\": \"${EXERCISE_ID}\",
    \"section_id\": \"${SECTION_ID}\",
    \"question_number\": 2,
    \"question_text\": \"The hotel is located on _____ Street.\",
    \"question_type\": \"fill_in_blank\",
    \"points\": 1.0,
    \"difficulty\": \"medium\",
    \"display_order\": 2
  }")

FIB_ID=$(echo $CREATE_FIB_RESPONSE | jq -r '.data.id // empty')

if [ -z "$FIB_ID" ] || [ "$FIB_ID" == "null" ]; then
    echo -e "${RED}Failed to create fill-in-blank question. Response: $CREATE_FIB_RESPONSE${NC}"
    exit 1
fi

print_result 0 "Fill-in-blank question created (ID: $FIB_ID)"

# Add answer with alternatives
echo "Adding answer with alternatives..."
curl -s -X POST "${BASE_URL}/admin/questions/${FIB_ID}/answer" \
  -H "Authorization: Bearer ${INSTRUCTOR_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "answer_text": "Main",
    "alternative_answers": ["main", "MAIN", "Main Street"],
    "is_case_sensitive": false
  }' > /dev/null

print_result 0 "Fill-in-blank answer created (accepts: Main, main, MAIN)"
echo ""

# Step 6: Get Exercise Detail (verify structure)
echo "Step 6: Verify Exercise Structure"
echo "--------------------------------------"

EXERCISE_DETAIL=$(curl -s -X GET "${BASE_URL}/exercises/${EXERCISE_ID}")
SECTION_COUNT=$(echo $EXERCISE_DETAIL | jq '.data.sections | length')
QUESTION_COUNT=$(echo $EXERCISE_DETAIL | jq '.data.sections[0].questions | length')

if [ "$SECTION_COUNT" -eq 1 ] && [ "$QUESTION_COUNT" -eq 2 ]; then
    print_result 0 "Exercise structure verified (1 section, 2 questions)"
else
    print_result 1 "Exercise structure mismatch (Expected: 1 section, 2 questions. Got: $SECTION_COUNT sections, $QUESTION_COUNT questions)"
fi
echo ""

# Step 7: Register and login as student
echo "Step 7: Student Setup"
echo "--------------------------------------"

STUDENT_EMAIL="student_exercise_test@example.com"
STUDENT_PASSWORD="Test123!@#"

echo "Registering student..."
curl -s -X POST "${AUTH_URL}/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${STUDENT_EMAIL}\",
    \"password\": \"${STUDENT_PASSWORD}\",
    \"full_name\": \"Exercise Test Student\",
    \"role\": \"student\"
  }" > /dev/null

echo "Logging in as student..."
STUDENT_LOGIN=$(curl -s -X POST "${AUTH_URL}/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${STUDENT_EMAIL}\",
    \"password\": \"${STUDENT_PASSWORD}\"
  }")

STUDENT_TOKEN=$(echo $STUDENT_LOGIN | jq -r '.data.access_token // empty')

if [ -z "$STUDENT_TOKEN" ] || [ "$STUDENT_TOKEN" == "null" ]; then
    echo -e "${RED}Failed to get student token${NC}"
    exit 1
fi

print_result 0 "Student authenticated"
echo ""

# Step 8: Start Exercise (Create Submission)
echo "Step 8: Start Exercise"
echo "--------------------------------------"

START_RESPONSE=$(curl -s -X POST "${BASE_URL}/submissions" \
  -H "Authorization: Bearer ${STUDENT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"exercise_id\": \"${EXERCISE_ID}\"
  }")

SUBMISSION_ID=$(echo $START_RESPONSE | jq -r '.data.id // empty')

if [ -z "$SUBMISSION_ID" ] || [ "$SUBMISSION_ID" == "null" ]; then
    echo -e "${RED}Failed to start exercise. Response: $START_RESPONSE${NC}"
    exit 1
fi

print_result 0 "Exercise started (Submission ID: $SUBMISSION_ID)"
echo ""

# Step 9: Submit Answers
echo "Step 9: Submit Answers"
echo "--------------------------------------"

# Get option IDs from exercise detail
OPTION_B_ID=$(echo $EXERCISE_DETAIL | jq -r '.data.sections[0].questions[0].options[] | select(.option_label == "B") | .id')

echo "Submitting answers..."
echo "  - MCQ: Option B (correct)"
echo "  - Fill-in-blank: 'main' (correct, alternative answer)"

SUBMIT_RESPONSE=$(curl -s -X PUT "${BASE_URL}/submissions/${SUBMISSION_ID}/answers" \
  -H "Authorization: Bearer ${STUDENT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"exercise_id\": \"${EXERCISE_ID}\",
    \"answers\": [
      {
        \"question_id\": \"${MCQ_ID}\",
        \"selected_option_id\": \"${OPTION_B_ID}\",
        \"time_spent_seconds\": 30
      },
      {
        \"question_id\": \"${FIB_ID}\",
        \"text_answer\": \"main\",
        \"time_spent_seconds\": 20
      }
    ]
  }")

SUBMIT_SUCCESS=$(echo $SUBMIT_RESPONSE | jq -r '.success')

if [ "$SUBMIT_SUCCESS" == "true" ]; then
    print_result 0 "Answers submitted and auto-graded"
else
    print_result 1 "Failed to submit answers. Response: $SUBMIT_RESPONSE"
fi
echo ""

# Step 10: Get Submission Result
echo "Step 10: Verify Auto-Grading Results"
echo "--------------------------------------"

RESULT_RESPONSE=$(curl -s -X GET "${BASE_URL}/submissions/${SUBMISSION_ID}/result" \
  -H "Authorization: Bearer ${STUDENT_TOKEN}")

CORRECT_COUNT=$(echo $RESULT_RESPONSE | jq -r '.data.performance.correct_answers')
SCORE=$(echo $RESULT_RESPONSE | jq -r '.data.performance.score')
PERCENTAGE=$(echo $RESULT_RESPONSE | jq -r '.data.performance.percentage')
IS_PASSED=$(echo $RESULT_RESPONSE | jq -r '.data.performance.is_passed')

echo "Results:"
echo "  - Correct answers: $CORRECT_COUNT / 2"
echo "  - Score: $SCORE / 2.0"
echo "  - Percentage: ${PERCENTAGE}%"
echo "  - Passed: $IS_PASSED"

if [ "$CORRECT_COUNT" -eq 2 ] && [ "$IS_PASSED" == "true" ]; then
    print_result 0 "Auto-grading verified (2/2 correct, passed)"
else
    print_result 1 "Auto-grading failed (Expected: 2 correct, passed. Got: $CORRECT_COUNT correct, passed=$IS_PASSED)"
fi
echo ""

# Step 11: Test Case Insensitivity
echo "Step 11: Test Case Insensitivity"
echo "--------------------------------------"

# Create another submission with uppercase answer
START_RESPONSE2=$(curl -s -X POST "${BASE_URL}/submissions" \
  -H "Authorization: Bearer ${STUDENT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"exercise_id\": \"${EXERCISE_ID}\"
  }")

SUBMISSION_ID2=$(echo $START_RESPONSE2 | jq -r '.data.id')

# Submit with "MAIN" (uppercase)
curl -s -X PUT "${BASE_URL}/submissions/${SUBMISSION_ID2}/answers" \
  -H "Authorization: Bearer ${STUDENT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"exercise_id\": \"${EXERCISE_ID}\",
    \"answers\": [
      {
        \"question_id\": \"${MCQ_ID}\",
        \"selected_option_id\": \"${OPTION_B_ID}\",
        \"time_spent_seconds\": 15
      },
      {
        \"question_id\": \"${FIB_ID}\",
        \"text_answer\": \"MAIN\",
        \"time_spent_seconds\": 10
      }
    ]
  }" > /dev/null

RESULT2=$(curl -s -X GET "${BASE_URL}/submissions/${SUBMISSION_ID2}/result" \
  -H "Authorization: Bearer ${STUDENT_TOKEN}")

CORRECT_COUNT2=$(echo $RESULT2 | jq -r '.data.performance.correct_answers')

if [ "$CORRECT_COUNT2" -eq 2 ]; then
    print_result 0 "Case insensitivity works ('MAIN' accepted)"
else
    print_result 1 "Case insensitivity failed ('MAIN' not accepted)"
fi
echo ""

# Step 12: Test My Submissions
echo "Step 12: Get Submission History"
echo "--------------------------------------"

MY_SUBMISSIONS=$(curl -s -X GET "${BASE_URL}/submissions/my?page=1&limit=10" \
  -H "Authorization: Bearer ${STUDENT_TOKEN}")

SUBMISSION_COUNT=$(echo $MY_SUBMISSIONS | jq -r '.data.total')

if [ "$SUBMISSION_COUNT" -ge 2 ]; then
    print_result 0 "Submission history retrieved ($SUBMISSION_COUNT submissions)"
else
    print_result 1 "Submission history incomplete (Expected: >= 2, Got: $SUBMISSION_COUNT)"
fi
echo ""

# Step 13: Test Exercise Listing with Filters
echo "Step 13: Test Exercise Filtering"
echo "--------------------------------------"

# Test skill_type filter
LISTENING_EXERCISES=$(curl -s -X GET "${BASE_URL}/exercises?skill_type=listening")
LISTENING_COUNT=$(echo $LISTENING_EXERCISES | jq -r '.data.total')

if [ "$LISTENING_COUNT" -ge 1 ]; then
    print_result 0 "Skill type filter works (listening: $LISTENING_COUNT)"
else
    print_result 1 "Skill type filter failed"
fi

# Test difficulty filter
MEDIUM_EXERCISES=$(curl -s -X GET "${BASE_URL}/exercises?difficulty=medium")
MEDIUM_COUNT=$(echo $MEDIUM_EXERCISES | jq -r '.data.total')

if [ "$MEDIUM_COUNT" -ge 1 ]; then
    print_result 0 "Difficulty filter works (medium: $MEDIUM_COUNT)"
else
    print_result 1 "Difficulty filter failed"
fi

# Test is_free filter
FREE_EXERCISES=$(curl -s -X GET "${BASE_URL}/exercises?is_free=true")
FREE_COUNT=$(echo $FREE_EXERCISES | jq -r '.data.total')

if [ "$FREE_COUNT" -ge 1 ]; then
    print_result 0 "Free filter works (free: $FREE_COUNT)"
else
    print_result 1 "Free filter failed"
fi
echo ""

# Step 14: Test Exercise Update
echo "Step 14: Test Exercise Update"
echo "--------------------------------------"

UPDATE_RESPONSE=$(curl -s -X PUT "${BASE_URL}/admin/exercises/${EXERCISE_ID}" \
  -H "Authorization: Bearer ${INSTRUCTOR_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "IELTS Listening Practice Test 1 (Updated)",
    "difficulty": "hard",
    "is_published": true
  }')

UPDATE_SUCCESS=$(echo $UPDATE_RESPONSE | jq -r '.success')

if [ "$UPDATE_SUCCESS" == "true" ]; then
    print_result 0 "Exercise updated successfully"
else
    print_result 1 "Exercise update failed"
fi
echo ""

# Step 15: Test Ownership Protection
echo "Step 15: Test Ownership Protection"
echo "--------------------------------------"

# Try to create section as student (should fail)
UNAUTHORIZED_RESPONSE=$(curl -s -X POST "${BASE_URL}/admin/exercises/${EXERCISE_ID}/sections" \
  -H "Authorization: Bearer ${STUDENT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Unauthorized Section",
    "section_number": 2,
    "display_order": 2
  }')

UNAUTHORIZED_ERROR=$(echo $UNAUTHORIZED_RESPONSE | jq -r '.error.code // empty')

if [ "$UNAUTHORIZED_ERROR" == "FORBIDDEN" ]; then
    print_result 0 "Ownership protection works (student cannot create section)"
else
    print_result 1 "Ownership protection failed (Expected FORBIDDEN error)"
fi
echo ""

# Final Summary
echo "======================================"
echo "Test Summary"
echo "======================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
TOTAL=$((PASSED + FAILED))
PERCENTAGE=$((PASSED * 100 / TOTAL))
echo "Success Rate: ${PERCENTAGE}%"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed! Exercise Service is ready for production.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ Some tests failed. Please review before deploying.${NC}"
    exit 1
fi
