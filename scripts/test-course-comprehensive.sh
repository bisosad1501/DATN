#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:8083/api/v1"

echo "=================================================="
echo "  Course Service - Comprehensive API Testing"
echo "=================================================="
echo ""

# Test 1: Get All Categories
echo -e "${YELLOW}Test 1: GET /categories - Get All Categories${NC}"
response=$(curl -s "$BASE_URL/categories")
count=$(echo "$response" | jq '.data | length')
if [ "$count" -gt 0 ]; then
    echo -e "${GREEN}✅ PASS: Found $count categories${NC}"
    echo "$response" | jq '.data[0]'
else
    echo -e "${RED}❌ FAIL: No categories found${NC}"
fi
echo ""

# Test 2: Get Courses (should work without auth)
echo -e "${YELLOW}Test 2: GET /courses - Get All Courses${NC}"
response=$(curl -s "$BASE_URL/courses")
success=$(echo "$response" | jq -r '.success')
if [ "$success" = "true" ]; then
    count=$(echo "$response" | jq '.data | length')
    echo -e "${GREEN}✅ PASS: Found $count courses${NC}"
else
    echo -e "${RED}❌ FAIL: Could not get courses${NC}"
fi
echo ""

# Get a course ID for later tests
COURSE_ID=$(curl -s "$BASE_URL/courses" | jq -r '.data[0].id // empty')

if [ -n "$COURSE_ID" ]; then
    echo -e "${YELLOW}Using course ID: ${COURSE_ID}${NC}"
    echo ""

    # Test 3: Get Course Reviews
    echo -e "${YELLOW}Test 3: GET /courses/${COURSE_ID}/reviews - Get Course Reviews${NC}"
    response=$(curl -s "$BASE_URL/courses/$COURSE_ID/reviews")
    success=$(echo "$response" | jq -r '.success')
    if [ "$success" = "true" ]; then
        count=$(echo "$response" | jq '.data | length')
        echo -e "${GREEN}✅ PASS: Found $count reviews${NC}"
    else
        echo -e "${RED}❌ FAIL: Could not get reviews${NC}"
    fi
    echo ""

    # Test 4: Get Course Categories (for specific course)
    echo -e "${YELLOW}Test 4: GET /courses/${COURSE_ID}/categories - Get Course Categories${NC}"
    response=$(curl -s "$BASE_URL/courses/$COURSE_ID/categories")
    success=$(echo "$response" | jq -r '.success')
    if [ "$success" = "true" ]; then
        count=$(echo "$response" | jq '.data | length')
        echo -e "${GREEN}✅ PASS: Found $count categories for this course${NC}"
    else
        echo -e "${RED}❌ FAIL: Could not get course categories${NC}"
    fi
    echo ""
else
    echo -e "${RED}⚠️  No courses found, skipping course-specific tests${NC}"
    echo ""
fi

# Test 5: Create Review (requires auth - should fail without token)
echo -e "${YELLOW}Test 5: POST /courses/:id/reviews - Create Review (without auth)${NC}"
response=$(curl -s -X POST "$BASE_URL/courses/$COURSE_ID/reviews" \
    -H "Content-Type: application/json" \
    -d '{"rating": 5, "title": "Great course", "comment": "Very helpful"}')
echo "$response" | jq '.'
echo -e "${YELLOW}Expected: Should require authentication${NC}"
echo ""

# Test 6: Track Video Progress (requires auth - should fail without token)
echo -e "${YELLOW}Test 6: POST /videos/track - Track Video Progress (without auth)${NC}"
response=$(curl -s -X POST "$BASE_URL/videos/track" \
    -H "Content-Type: application/json" \
    -d '{
        "video_id": "123e4567-e89b-12d3-a456-426614174000",
        "lesson_id": "123e4567-e89b-12d3-a456-426614174001",
        "watched_seconds": 120,
        "total_seconds": 300
    }')
echo "$response" | jq '.'
echo -e "${YELLOW}Expected: Should require authentication${NC}"
echo ""

# Test 7: Get Video Watch History (requires auth - should fail without token)
echo -e "${YELLOW}Test 7: GET /videos/history - Get Video Watch History (without auth)${NC}"
response=$(curl -s "$BASE_URL/videos/history")
echo "$response" | jq '.'
echo -e "${YELLOW}Expected: Should require authentication${NC}"
echo ""

# Test 8: Get Video Subtitles (requires auth - should fail without token)
echo -e "${YELLOW}Test 8: GET /videos/:id/subtitles - Get Video Subtitles (without auth)${NC}"
VIDEO_ID="123e4567-e89b-12d3-a456-426614174000"
response=$(curl -s "$BASE_URL/videos/$VIDEO_ID/subtitles")
echo "$response" | jq '.'
echo -e "${YELLOW}Expected: Should require authentication${NC}"
echo ""

# Test 9: Download Material (requires auth - should fail without token)
echo -e "${YELLOW}Test 9: POST /materials/:id/download - Record Material Download (without auth)${NC}"
MATERIAL_ID="123e4567-e89b-12d3-a456-426614174000"
response=$(curl -s -X POST "$BASE_URL/materials/$MATERIAL_ID/download")
echo "$response" | jq '.'
echo -e "${YELLOW}Expected: Should require authentication${NC}"
echo ""

echo "=================================================="
echo "  Summary"
echo "=================================================="
echo -e "${GREEN}Public APIs (no auth required):${NC}"
echo "  ✅ GET /categories"
echo "  ✅ GET /courses"
echo "  ✅ GET /courses/:id/reviews"
echo "  ✅ GET /courses/:id/categories"
echo ""
echo -e "${YELLOW}Protected APIs (auth required):${NC}"
echo "  🔒 POST /courses/:id/reviews"
echo "  🔒 POST /videos/track"
echo "  🔒 GET  /videos/history"
echo "  🔒 GET  /videos/:id/subtitles"
echo "  🔒 POST /materials/:id/download"
echo ""
echo -e "${YELLOW}Note: Protected APIs require valid JWT token in Authorization header${NC}"
echo "Use: Authorization: Bearer <your_token>"
echo ""
