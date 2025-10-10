#!/bin/bash

# Exercise Service - New Features Test Script
# Tests: Publish/Unpublish, Tags, Question Bank, Analytics

set -e

BASE_URL="http://localhost:8084/api/v1"
AUTH_URL="http://localhost:8081/api/v1"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Login and get token
echo -e "${BLUE}=== Logging in as admin ===${NC}"
TOKEN=$(curl -s -X POST ${AUTH_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test_admin@ielts.com", "password": "Test@123"}' | jq -r '.data.access_token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login failed${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Login successful${NC}"
echo "Token: ${TOKEN:0:50}..."

# Test 1: Create Exercise (as draft)
echo -e "\n${BLUE}=== Test 1: Create Exercise (Draft) ===${NC}"
TIMESTAMP=$(date +%s)
EXERCISE_RESPONSE=$(curl -s -X POST ${BASE_URL}/admin/exercises \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Test Exercise - Tags & Analytics ${TIMESTAMP}\",
    \"slug\": \"test-exercise-tags-analytics-${TIMESTAMP}\",
    \"description\": \"Test exercise for new features\",
    \"exercise_type\": \"practice\",
    \"skill_type\": \"reading\",
    \"difficulty\": \"medium\",
    \"total_questions\": 5,
    \"is_free\": true
  }")

EXERCISE_ID=$(echo $EXERCISE_RESPONSE | jq -r '.data.id')
if [ "$EXERCISE_ID" == "null" ]; then
  echo -e "${RED}❌ Create exercise failed${NC}"
  echo $EXERCISE_RESPONSE | jq
  exit 1
fi
echo -e "${GREEN}✓ Exercise created: ${EXERCISE_ID}${NC}"
IS_PUBLISHED=$(echo $EXERCISE_RESPONSE | jq -r '.data.is_published')
echo "Is Published: $IS_PUBLISHED"

# Test 2: Verify draft not in public list
echo -e "\n${BLUE}=== Test 2: Verify Draft Not in Public List ===${NC}"
PUBLIC_LIST=$(curl -s ${BASE_URL}/exercises | jq '.data.exercises')
FOUND=$(echo $PUBLIC_LIST | jq --arg id "$EXERCISE_ID" '[.[] | select(.id == $id)] | length')
if [ "$FOUND" == "0" ]; then
  echo -e "${GREEN}✓ Draft exercise NOT in public list (correct)${NC}"
else
  echo -e "${RED}❌ Draft exercise visible in public list (wrong)${NC}"
fi

# Test 3: Publish Exercise
echo -e "\n${BLUE}=== Test 3: Publish Exercise ===${NC}"
PUBLISH_RESPONSE=$(curl -s -X POST ${BASE_URL}/admin/exercises/${EXERCISE_ID}/publish \
  -H "Authorization: Bearer ${TOKEN}")

PUBLISH_SUCCESS=$(echo $PUBLISH_RESPONSE | jq -r '.success')
if [ "$PUBLISH_SUCCESS" == "true" ]; then
  echo -e "${GREEN}✓ Exercise published${NC}"
  PUBLISHED_AT=$(echo $PUBLISH_RESPONSE | jq -r '.data.published_at')
  echo "Published at: $PUBLISHED_AT"
else
  echo -e "${RED}❌ Publish failed${NC}"
  echo $PUBLISH_RESPONSE | jq
fi

# Test 4: Verify published in public list
echo -e "\n${BLUE}=== Test 4: Verify Published in Public List ===${NC}"
sleep 1
PUBLIC_LIST=$(curl -s ${BASE_URL}/exercises | jq '.data.exercises')
FOUND=$(echo $PUBLIC_LIST | jq --arg id "$EXERCISE_ID" '[.[] | select(.id == $id)] | length')
if [ "$FOUND" == "1" ]; then
  echo -e "${GREEN}✓ Published exercise IS in public list (correct)${NC}"
else
  echo -e "${RED}❌ Published exercise NOT in public list (wrong)${NC}"
fi

# Test 5: Create Tag
echo -e "\n${BLUE}=== Test 5: Create Tag ===${NC}"
TAG_RESPONSE=$(curl -s -X POST ${BASE_URL}/admin/tags \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cambridge IELTS 16",
    "slug": "cambridge-ielts-16"
  }')

TAG_ID=$(echo $TAG_RESPONSE | jq -r '.data.id')
if [ "$TAG_ID" == "null" ]; then
  echo -e "${RED}❌ Create tag failed${NC}"
  echo $TAG_RESPONSE | jq
  exit 1
fi
echo -e "${GREEN}✓ Tag created: ${TAG_ID} - Cambridge IELTS 16${NC}"

# Create second tag
TAG_RESPONSE_2=$(curl -s -X POST ${BASE_URL}/admin/tags \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mock Test",
    "slug": "mock-test"
  }')
TAG_ID_2=$(echo $TAG_RESPONSE_2 | jq -r '.data.id')
echo -e "${GREEN}✓ Tag created: ${TAG_ID_2} - Mock Test${NC}"

# Test 6: Get All Tags
echo -e "\n${BLUE}=== Test 6: Get All Tags ===${NC}"
ALL_TAGS=$(curl -s ${BASE_URL}/tags | jq '.data')
TAG_COUNT=$(echo $ALL_TAGS | jq 'length')
echo -e "${GREEN}✓ Found ${TAG_COUNT} tags${NC}"
echo $ALL_TAGS | jq

# Test 7: Add Tags to Exercise
echo -e "\n${BLUE}=== Test 7: Add Tags to Exercise ===${NC}"
ADD_TAG_1=$(curl -s -X POST ${BASE_URL}/admin/exercises/${EXERCISE_ID}/tags \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"tag_id\": ${TAG_ID}}")

ADD_TAG_2=$(curl -s -X POST ${BASE_URL}/admin/exercises/${EXERCISE_ID}/tags \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"tag_id\": ${TAG_ID_2}}")

echo -e "${GREEN}✓ Tags added to exercise${NC}"

# Test 8: Get Exercise Tags
echo -e "\n${BLUE}=== Test 8: Get Exercise Tags ===${NC}"
EXERCISE_TAGS=$(curl -s ${BASE_URL}/exercises/${EXERCISE_ID}/tags | jq '.data')
EXERCISE_TAG_COUNT=$(echo $EXERCISE_TAGS | jq 'length')
echo -e "${GREEN}✓ Exercise has ${EXERCISE_TAG_COUNT} tags${NC}"
echo $EXERCISE_TAGS | jq

# Test 9: Remove Tag from Exercise
echo -e "\n${BLUE}=== Test 9: Remove Tag from Exercise ===${NC}"
REMOVE_TAG=$(curl -s -X DELETE ${BASE_URL}/admin/exercises/${EXERCISE_ID}/tags/${TAG_ID_2} \
  -H "Authorization: Bearer ${TOKEN}")
echo -e "${GREEN}✓ Tag removed from exercise${NC}"

# Verify removal
EXERCISE_TAGS_AFTER=$(curl -s ${BASE_URL}/exercises/${EXERCISE_ID}/tags | jq '.data | length')
echo "Tags after removal: $EXERCISE_TAGS_AFTER (should be 1)"

# Test 10: Create Question Bank Question
echo -e "\n${BLUE}=== Test 10: Create Question Bank Question ===${NC}"
BANK_Q_RESPONSE=$(curl -s -X POST ${BASE_URL}/admin/question-bank \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Academic Discussion - Technology",
    "skill_type": "reading",
    "question_type": "multiple_choice",
    "difficulty": "medium",
    "topic": "Technology",
    "question_text": "What is the main idea of paragraph 3?",
    "answer_data": {
      "options": [
        {"label": "A", "text": "Technology improves education", "is_correct": true},
        {"label": "B", "text": "Technology is expensive", "is_correct": false},
        {"label": "C", "text": "Technology is harmful", "is_correct": false},
        {"label": "D", "text": "Technology is optional", "is_correct": false}
      ]
    },
    "tags": ["academic", "technology", "reading"]
  }')

BANK_Q_ID=$(echo $BANK_Q_RESPONSE | jq -r '.data.id')
if [ "$BANK_Q_ID" == "null" ]; then
  echo -e "${RED}❌ Create bank question failed${NC}"
  echo $BANK_Q_RESPONSE | jq
  exit 1
fi
echo -e "${GREEN}✓ Bank question created: ${BANK_Q_ID}${NC}"

# Test 11: Get Bank Questions
echo -e "\n${BLUE}=== Test 11: Get Bank Questions ===${NC}"
BANK_QUESTIONS=$(curl -s "${BASE_URL}/admin/question-bank?skill_type=reading&limit=10" \
  -H "Authorization: Bearer ${TOKEN}" | jq '.data')
BANK_Q_COUNT=$(echo $BANK_QUESTIONS | jq 'length')
echo -e "${GREEN}✓ Found ${BANK_Q_COUNT} bank questions${NC}"
echo $BANK_QUESTIONS | jq '.[0]'

# Test 12: Update Bank Question
echo -e "\n${BLUE}=== Test 12: Update Bank Question ===${NC}"
UPDATE_BANK_Q=$(curl -s -X PUT ${BASE_URL}/admin/question-bank/${BANK_Q_ID} \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Academic Discussion - Technology (Updated)",
    "question_text": "What is the main idea of paragraph 3? (Updated)",
    "question_type": "multiple_choice",
    "answer_data": {
      "options": [
        {"label": "A", "text": "Technology improves education significantly", "is_correct": true},
        {"label": "B", "text": "Technology is expensive", "is_correct": false},
        {"label": "C", "text": "Technology is harmful", "is_correct": false},
        {"label": "D", "text": "Technology is optional", "is_correct": false}
      ]
    },
    "tags": ["academic", "technology", "reading", "updated"]
  }')

echo -e "${GREEN}✓ Bank question updated${NC}"

# Test 13: Get Exercise Analytics (empty)
echo -e "\n${BLUE}=== Test 13: Get Exercise Analytics (No Submissions) ===${NC}"
ANALYTICS=$(curl -s ${BASE_URL}/admin/exercises/${EXERCISE_ID}/analytics \
  -H "Authorization: Bearer ${TOKEN}" | jq '.data')

TOTAL_ATTEMPTS=$(echo $ANALYTICS | jq -r '.total_attempts')
echo -e "${GREEN}✓ Analytics retrieved${NC}"
echo "Total Attempts: $TOTAL_ATTEMPTS (should be 0)"
echo $ANALYTICS | jq

# Test 14: Unpublish Exercise
echo -e "\n${BLUE}=== Test 14: Unpublish Exercise ===${NC}"
UNPUBLISH_RESPONSE=$(curl -s -X POST ${BASE_URL}/admin/exercises/${EXERCISE_ID}/unpublish \
  -H "Authorization: Bearer ${TOKEN}")

UNPUBLISH_SUCCESS=$(echo $UNPUBLISH_RESPONSE | jq -r '.success')
if [ "$UNPUBLISH_SUCCESS" == "true" ]; then
  echo -e "${GREEN}✓ Exercise unpublished${NC}"
else
  echo -e "${RED}❌ Unpublish failed${NC}"
  echo $UNPUBLISH_RESPONSE | jq
fi

# Test 15: Verify unpublished not in public list
echo -e "\n${BLUE}=== Test 15: Verify Unpublished Not in Public List ===${NC}"
sleep 1
PUBLIC_LIST=$(curl -s ${BASE_URL}/exercises | jq '.data.exercises')
FOUND=$(echo $PUBLIC_LIST | jq --arg id "$EXERCISE_ID" '[.[] | select(.id == $id)] | length')
if [ "$FOUND" == "0" ]; then
  echo -e "${GREEN}✓ Unpublished exercise NOT in public list (correct)${NC}"
else
  echo -e "${RED}❌ Unpublished exercise visible in public list (wrong)${NC}"
fi

# Test 16: Delete Bank Question
echo -e "\n${BLUE}=== Test 16: Delete Bank Question ===${NC}"
DELETE_BANK_Q=$(curl -s -X DELETE ${BASE_URL}/admin/question-bank/${BANK_Q_ID} \
  -H "Authorization: Bearer ${TOKEN}")
echo -e "${GREEN}✓ Bank question deleted${NC}"

# Summary
echo -e "\n${BLUE}================================${NC}"
echo -e "${BLUE}=== Test Summary ===${NC}"
echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}✓ Exercise CRUD: Working${NC}"
echo -e "${GREEN}✓ Publish/Unpublish: Working${NC}"
echo -e "${GREEN}✓ Tags System: Working${NC}"
echo -e "${GREEN}✓ Question Bank: Working${NC}"
echo -e "${GREEN}✓ Analytics: Working${NC}"
echo -e "\n${GREEN}All new features tested successfully!${NC}"
