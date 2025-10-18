#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=== Adding Sample Lessons & Videos to Free Course ===${NC}\n"

# Load admin credentials
if [ -f /tmp/admin_creds.sh ]; then
    source /tmp/admin_creds.sh
else
    echo -e "${RED}✗ Admin credentials not found. Run create-admin-for-test.sh first${NC}"
    exit 1
fi

# Target free course
COURSE_ID="a1234567-1234-1234-1234-123456789012"  # IELTS Listening for Beginners
echo -e "${BLUE}Target Course: IELTS Listening for Beginners${NC}"
echo "Course ID: $COURSE_ID"

# Get or create module
echo -e "\n${BLUE}Getting module...${NC}"
MODULE_ID=$(docker exec ielts_postgres psql -U ielts_admin -d course_db -tAc "SELECT id FROM modules WHERE course_id = '$COURSE_ID' LIMIT 1;")

if [ -z "$MODULE_ID" ]; then
    echo -e "${YELLOW}Creating new module...${NC}"
    MODULE_ID=$(docker exec ielts_postgres psql -U ielts_admin -d course_db -tAc "
        INSERT INTO modules (course_id, title, description, display_order)
        VALUES ('$COURSE_ID', 'Listening Practice Tests', 'Full IELTS Listening practice tests with answers', 1)
        RETURNING id;
    " | head -n 1 | tr -d '[:space:]')
fi

echo "Module ID: $MODULE_ID"

# Array of YouTube videos to add (real IELTS listening tests)
declare -a videos=(
    "OPBd86A1Rfo|IELTS Listening Test - Part 1|1"
    "eW4AM1539-g|IELTS Listening Full Test with Answers|2"
    "jss3kHbOXvE|IELTS Listening Practice Test|3"
    "q3rXDXmWO6s|IELTS Listening Tips and Strategies|4"
    "2ZpFZnTdQdE|IELTS Listening - Common Mistakes|5"
)

echo -e "\n${BLUE}Adding lessons with videos...${NC}\n"

for video_data in "${videos[@]}"; do
    IFS='|' read -r VIDEO_ID VIDEO_TITLE ORDER <<< "$video_data"
    
    echo -e "${YELLOW}[$ORDER/5] Creating lesson: $VIDEO_TITLE${NC}"
    
    # Create lesson
    LESSON_RESPONSE=$(curl -s -X POST http://localhost:8083/api/v1/admin/lessons \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -d @- <<EOF
{
  "module_id": "$MODULE_ID",
  "title": "$VIDEO_TITLE",
  "description": "Watch and practice IELTS Listening skills",
  "content": "Complete this listening exercise and check your answers",
  "content_type": "text",
  "lesson_type": "video",
  "display_order": $ORDER,
  "duration_minutes": 30
}
EOF
    )
    
    LESSON_ID=$(echo $LESSON_RESPONSE | jq -r '.data.id')
    
    if [ "$LESSON_ID" == "null" ] || [ -z "$LESSON_ID" ]; then
        echo -e "${RED}  ✗ Failed to create lesson${NC}"
        echo "  Response: $LESSON_RESPONSE"
        continue
    fi
    
    echo -e "${GREEN}  ✓ Lesson created: $LESSON_ID${NC}"
    
    # Add video to lesson
    VIDEO_RESPONSE=$(curl -s -X POST "http://localhost:8083/api/v1/admin/lessons/$LESSON_ID/videos" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -d @- <<EOF
{
  "video_url": "https://www.youtube.com/watch?v=$VIDEO_ID",
  "video_provider": "youtube",
  "video_id": "$VIDEO_ID",
  "title": "$VIDEO_TITLE",
  "display_order": 1
}
EOF
    )
    
    VIDEO_DB_ID=$(echo $VIDEO_RESPONSE | jq -r '.data.id')
    DURATION=$(echo $VIDEO_RESPONSE | jq -r '.data.duration_seconds')
    
    if [ "$VIDEO_DB_ID" == "null" ] || [ -z "$VIDEO_DB_ID" ]; then
        echo -e "${RED}  ✗ Failed to add video${NC}"
        echo "  Response: $VIDEO_RESPONSE"
        continue
    fi
    
    # Format duration
    MINUTES=$((DURATION / 60))
    SECONDS=$((DURATION % 60))
    
    echo -e "${GREEN}  ✓ Video added (${MINUTES}m ${SECONDS}s)${NC}"
    echo ""
done

echo -e "\n${BLUE}=== Summary ===${NC}"
echo "Course ID: $COURSE_ID"
echo "Module ID: $MODULE_ID"

# Count lessons added
LESSON_COUNT=$(docker exec ielts_postgres psql -U ielts_admin -d course_db -tAc "
    SELECT COUNT(*) FROM lessons WHERE module_id = '$MODULE_ID';
")

echo "Total Lessons: $LESSON_COUNT"

# Show all lessons with videos
echo -e "\n${BLUE}Lessons in course:${NC}"
docker exec ielts_postgres psql -U ielts_admin -d course_db -c "
    SELECT 
        l.id,
        l.title,
        lv.video_id,
        lv.duration_seconds
    FROM lessons l
    LEFT JOIN lesson_videos lv ON l.id = lv.lesson_id
    WHERE l.module_id = '$MODULE_ID'
    ORDER BY l.display_order;
"

echo -e "\n${GREEN}✅ Done! You can now test these lessons on Frontend${NC}"
echo -e "${BLUE}Course: IELTS Listening for Beginners (Free)${NC}\n"
