#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=== Adding YouTube Lessons to Free Course ===${NC}\n"

# Load admin credentials
if [ -f /tmp/admin_creds.sh ]; then
    source /tmp/admin_creds.sh
else
    echo -e "${RED}✗ Admin credentials not found. Run create-admin-for-test.sh first${NC}"
    exit 1
fi

# Get free course
COURSE_ID=$(docker exec ielts_postgres psql -U ielts_admin -d course_db -tAc "
    SELECT id FROM courses WHERE price = 0 ORDER BY created_at DESC LIMIT 1;
" | tr -d ' ')

if [ -z "$COURSE_ID" ]; then
    echo -e "${RED}✗ No free course found${NC}"
    exit 1
fi

echo "Course ID: $COURSE_ID"

# Get or create module
MODULE_ID=$(docker exec ielts_postgres psql -U ielts_admin -d course_db -tAc "
    SELECT id FROM modules WHERE course_id = '$COURSE_ID' ORDER BY created_at DESC LIMIT 1;
" | tr -d ' ')

if [ -z "$MODULE_ID" ]; then
    echo -e "${YELLOW}Creating new module...${NC}"
    MODULE_ID=$(docker exec ielts_postgres psql -U ielts_admin -d course_db -tAc "
        INSERT INTO modules (course_id, title, description, display_order)
        VALUES ('$COURSE_ID', 'Video Lessons', 'Practice with real IELTS videos', 1)
        RETURNING id;
    " | tr -d ' ')
fi

echo "Module ID: $MODULE_ID"

# Array of YouTube videos (verified to exist)
declare -a VIDEOS=(
    "Y59vZ_n-4Bk|Bùi Anh Tuấn - Nước Mắt|Music Video - 56 minutes"
    "OPBd86A1Rfo|IELTS Listening Practice|IELTS Practice Test - 6 minutes"
    "eW4AM1539-g|IELTS Full Test|Complete IELTS Listening Test - 80 minutes"
    "4PLLy9ca1rU|IELTS Speaking Tips|Learn speaking strategies - 10 minutes"
    "zGDzdps75ns|IELTS Writing Task 2|Essay writing guide - 15 minutes"
)

echo -e "\n${BLUE}Adding ${#VIDEOS[@]} lessons with YouTube videos...${NC}\n"

SUCCESS_COUNT=0
FAIL_COUNT=0

for VIDEO_DATA in "${VIDEOS[@]}"; do
    IFS='|' read -r VIDEO_ID TITLE DESC <<< "$VIDEO_DATA"
    
    echo -e "${BLUE}Processing: $TITLE${NC}"
    echo "  Video ID: $VIDEO_ID"
    
    # Create lesson
    LESSON_RESPONSE=$(curl -s -X POST http://localhost:8083/api/v1/admin/lessons \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -d @- <<EOF
{
  "module_id": "$MODULE_ID",
  "title": "$TITLE",
  "description": "$DESC",
  "content": "Watch this video to improve your IELTS skills",
  "content_type": "video",
  "lesson_type": "video",
  "display_order": $((SUCCESS_COUNT + 1)),
  "duration_minutes": 10
}
EOF
)
    
    LESSON_ID=$(echo $LESSON_RESPONSE | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null)
    
    if [ -z "$LESSON_ID" ]; then
        echo -e "  ${RED}✗ Failed to create lesson${NC}"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        continue
    fi
    
    echo "  Lesson ID: $LESSON_ID"
    
    # Add video to lesson
    VIDEO_RESPONSE=$(curl -s -X POST "http://localhost:8083/api/v1/admin/lessons/$LESSON_ID/videos" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -d @- <<EOF
{
  "video_url": "https://www.youtube.com/watch?v=$VIDEO_ID",
  "video_provider": "youtube",
  "video_id": "$VIDEO_ID",
  "title": "$TITLE",
  "display_order": 1
}
EOF
)
    
    VIDEO_DB_ID=$(echo $VIDEO_RESPONSE | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null)
    
    if [ -z "$VIDEO_DB_ID" ]; then
        echo -e "  ${RED}✗ Failed to add video${NC}"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        continue
    fi
    
    # Get duration from DB
    DB_DURATION=$(docker exec ielts_postgres psql -U ielts_admin -d course_db -tAc "
        SELECT duration_seconds FROM lesson_videos WHERE id = '$VIDEO_DB_ID';
    " | tr -d ' ')
    
    if [ "$DB_DURATION" -gt "0" ]; then
        echo -e "  ${GREEN}✓ Success! Duration: ${DB_DURATION}s${NC}"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
        echo -e "  ${YELLOW}⚠ Added but duration is 0 (will be synced later)${NC}"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    fi
    
    echo ""
    sleep 1
done

echo -e "\n${BLUE}=== Summary ===${NC}"
echo "Total videos: ${#VIDEOS[@]}"
echo -e "${GREEN}Success: $SUCCESS_COUNT${NC}"
echo -e "${RED}Failed: $FAIL_COUNT${NC}"

echo -e "\n${BLUE}=== Checking service logs for auto-fetch ===${NC}"
docker logs ielts_course_service --tail 100 | grep "Auto-fetched YouTube duration" | tail -5

echo -e "\n${GREEN}✅ Done! You can now test on the frontend${NC}"
echo "Course ID: $COURSE_ID"
echo "Module ID: $MODULE_ID"
