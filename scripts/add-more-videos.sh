#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=== Adding More Valid YouTube Videos ===${NC}\n"

# Load admin credentials
if [ -f /tmp/admin_creds.sh ]; then
    source /tmp/admin_creds.sh
else
    echo -e "${RED}✗ Admin credentials not found${NC}"
    exit 1
fi

MODULE_ID="5cfff642-2e3a-482e-8332-fba71ec6792a"

# Valid YouTube IELTS videos (verified to exist)
declare -a videos=(
    "BWf-eARnf6U|IELTS Listening Actual Test 2024|6"
    "yVkeX5LLqHg|IELTS Listening Practice Test 2024|7"
    "r3BKw91qKBY|IELTS Speaking Band 9 Sample|8"
)

echo -e "${BLUE}Adding more lessons...${NC}\n"

for video_data in "${videos[@]}"; do
    IFS='|' read -r VIDEO_ID VIDEO_TITLE ORDER <<< "$video_data"
    
    echo -e "${YELLOW}[$ORDER] $VIDEO_TITLE${NC}"
    
    # Create lesson
    LESSON_RESPONSE=$(curl -s -X POST http://localhost:8083/api/v1/admin/lessons \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -d @- <<EOF
{
  "module_id": "$MODULE_ID",
  "title": "$VIDEO_TITLE",
  "description": "IELTS practice and preparation",
  "content": "Watch the video and practice",
  "content_type": "text",
  "lesson_type": "video",
  "display_order": $ORDER,
  "duration_minutes": 30
}
EOF
    )
    
    LESSON_ID=$(echo $LESSON_RESPONSE | jq -r '.data.id')
    
    if [ "$LESSON_ID" == "null" ]; then
        echo -e "${RED}  ✗ Failed${NC}"
        continue
    fi
    
    # Add video
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
    
    DURATION=$(echo $VIDEO_RESPONSE | jq -r '.data.duration_seconds')
    MINUTES=$((DURATION / 60))
    SECONDS=$((DURATION % 60))
    
    echo -e "${GREEN}  ✓ Added (${MINUTES}m ${SECONDS}s)${NC}\n"
done

echo -e "\n${GREEN}✅ Done!${NC}"
