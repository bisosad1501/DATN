#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=== Testing Auto-Fetch Video Duration ===${NC}\n"

# Load admin credentials
if [ -f /tmp/admin_creds.sh ]; then
    source /tmp/admin_creds.sh
else
    echo -e "${RED}✗ Admin credentials not found. Run create-admin-for-test.sh first${NC}"
    exit 1
fi

# Video to test
VIDEO_URL="https://www.youtube.com/watch?v=OPBd86A1Rfo"
VIDEO_ID="OPBd86A1Rfo"
EXPECTED_DURATION=379  # 6m19s = 379 seconds

echo -e "${BLUE}Step 1: Get existing course and module${NC}"
COURSE_ID="b2345678-2345-2345-2345-234567890123"
echo "Course ID: $COURSE_ID"

# Get or create module
MODULE_RESPONSE=$(docker exec ielts_postgres psql -U ielts_admin -d course_db -tAc "SELECT id FROM modules WHERE course_id = '$COURSE_ID' LIMIT 1;")

if [ -z "$MODULE_RESPONSE" ]; then
    echo -e "${YELLOW}No module found, creating one...${NC}"
    MODULE_ID=$(docker exec ielts_postgres psql -U ielts_admin -d course_db -tAc "
        INSERT INTO modules (course_id, title, description, display_order)
        VALUES ('$COURSE_ID', 'Test Module', 'Module for testing', 1)
        RETURNING id;
    ")
else
    MODULE_ID=$MODULE_RESPONSE
fi

echo "Module ID: $MODULE_ID"

echo -e "\n${BLUE}Step 2: Create new lesson via API${NC}"
LESSON_RESPONSE=$(curl -s -X POST http://localhost:8083/api/v1/admin/lessons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"module_id\": \"$MODULE_ID\",
    \"title\": \"Test Lesson - Auto Duration Fetch\",
    \"description\": \"Testing automatic YouTube duration fetch\",
    \"content\": \"This lesson tests if duration is automatically fetched from YouTube API\",
    \"content_type\": \"text\",
    \"lesson_type\": \"video\",
    \"display_order\": 999,
    \"duration_minutes\": 10
  }")

echo "Lesson Response: $LESSON_RESPONSE" | jq '.'

LESSON_ID=$(echo $LESSON_RESPONSE | jq -r '.data.id')

if [ "$LESSON_ID" == "null" ] || [ -z "$LESSON_ID" ]; then
    echo -e "${RED}✗ Failed to create lesson${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Lesson created: $LESSON_ID${NC}"

echo -e "\n${BLUE}Step 3: Add YouTube video to lesson (should auto-fetch duration)${NC}"
VIDEO_RESPONSE=$(curl -s -X POST "http://localhost:8083/api/v1/admin/lessons/$LESSON_ID/videos" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"video_url\": \"$VIDEO_URL\",
    \"video_provider\": \"youtube\",
    \"video_id\": \"$VIDEO_ID\",
    \"title\": \"Test Video - OPBd86A1Rfo\",
    \"display_order\": 1
  }")

echo "Video Response: $VIDEO_RESPONSE" | jq '.'

VIDEO_DB_ID=$(echo $VIDEO_RESPONSE | jq -r '.data.id')
FETCHED_DURATION=$(echo $VIDEO_RESPONSE | jq -r '.data.duration_seconds')

if [ "$VIDEO_DB_ID" == "null" ] || [ -z "$VIDEO_DB_ID" ]; then
    echo -e "${RED}✗ Failed to add video${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Video added to lesson${NC}"

echo -e "\n${BLUE}Step 4: Verify duration in database${NC}"
DB_DURATION=$(docker exec ielts_postgres psql -U ielts_admin -d course_db -tAc "
    SELECT duration_seconds FROM lesson_videos WHERE id = '$VIDEO_DB_ID';
")

echo "Expected Duration: ${EXPECTED_DURATION}s (6m 19s)"
echo "Fetched Duration:  ${FETCHED_DURATION}s"
echo "DB Duration:       ${DB_DURATION}s"

if [ "$DB_DURATION" == "$EXPECTED_DURATION" ]; then
    echo -e "\n${GREEN}✅ SUCCESS! Duration auto-fetched correctly!${NC}"
    echo -e "${GREEN}✓ Auto-fetch from YouTube API is working!${NC}"
else
    echo -e "\n${RED}❌ FAILED! Duration mismatch${NC}"
    echo -e "${RED}Expected: ${EXPECTED_DURATION}s, Got: ${DB_DURATION}s${NC}"
fi

echo -e "\n${BLUE}Step 5: Check service logs for auto-fetch message${NC}"
echo "Looking for '[Course-Service] ✅ Auto-fetched YouTube duration' in logs..."
docker logs ielts_course_service --tail 50 | grep -i "auto-fetch" || echo "No auto-fetch logs found"

echo -e "\n${BLUE}=== Test Complete ===${NC}"
echo "Lesson ID: $LESSON_ID"
echo "Video ID: $VIDEO_DB_ID"
echo "YouTube Video ID: $VIDEO_ID"
echo "Duration: ${DB_DURATION}s"
