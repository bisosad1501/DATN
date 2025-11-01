#!/bin/bash

# Script to seed test data for user features (Achievements, Goals, Reminders, Sessions)
# Uses tai@gmail.com

set -e

API_URL="${API_URL:-http://localhost:8080/api/v1}"
EMAIL="tai@gmail.com"
PASSWORD="15012003"

echo "🌱 === SEEDING USER TEST DATA ==="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

success() { echo -e "${GREEN}✅ $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }
info() { echo -e "${YELLOW}ℹ️  $1${NC}"; }
section() { echo -e "${BLUE}📦 $1${NC}"; }

# Login
echo "🔐 Logging in as $EMAIL..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.access_token // .data.token // empty')
if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    error "Login failed"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

success "Login successful"
echo ""

# Function for authenticated requests
auth_req() {
    local method=$1
    local endpoint=$2
    local data=$3
    if [ -z "$data" ]; then
        curl -s -X $method "$API_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json"
    else
        curl -s -X $method "$API_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data"
    fi
}

# Calculate dates
TODAY=$(date +%Y-%m-%d)
TOMORROW=$(date -v+1d +%Y-%m-%d 2>/dev/null || date -d "+1 day" +%Y-%m-%d)
NEXT_WEEK=$(date -v+7d +%Y-%m-%d 2>/dev/null || date -d "+7 days" +%Y-%m-%d)
NEXT_MONTH=$(date -v+1m +%Y-%m-%d 2>/dev/null || date -d "+1 month" +%Y-%m-%d)

# ==========================================
# SEED GOALS
# ==========================================
section "Creating Study Goals..."

# Goal 1: Daily goal (in progress)
echo "1. Creating daily goal (in progress)..."
GOAL1=$(auth_req "POST" "/user/goals" "{
    \"goal_type\": \"daily\",
    \"title\": \"Học 30 phút Listening mỗi ngày\",
    \"description\": \"Mục tiêu luyện Listening 30 phút mỗi ngày trong tuần này\",
    \"target_value\": 30,
    \"target_unit\": \"minutes\",
    \"skill_type\": \"listening\",
    \"end_date\": \"$NEXT_WEEK\"
}")
GOAL1_ID=$(echo $GOAL1 | jq -r '.data.id // empty')
if [ -n "$GOAL1_ID" ] && [ "$GOAL1_ID" != "null" ]; then
    success "Created daily goal: $GOAL1_ID"
else
    info "Goal 1 might already exist"
fi

# Goal 2: Weekly goal (completed)
echo "2. Creating weekly goal..."
GOAL2=$(auth_req "POST" "/user/goals" "{
    \"goal_type\": \"weekly\",
    \"title\": \"Hoàn thành 10 bài tập Reading trong tuần\",
    \"description\": \"Làm 10 bài tập Reading để cải thiện kỹ năng\",
    \"target_value\": 10,
    \"target_unit\": \"exercises\",
    \"skill_type\": \"reading\",
    \"end_date\": \"$NEXT_WEEK\"
}")
GOAL2_ID=$(echo $GOAL2 | jq -r '.data.id // empty')
if [ -n "$GOAL2_ID" ] && [ "$GOAL2_ID" != "null" ]; then
    success "Created weekly goal: $GOAL2_ID"
    # Update current_value to simulate progress
    auth_req "PUT" "/user/goals/$GOAL2_ID" "{
        \"current_value\": 8
    }" > /dev/null
    info "  Set progress: 8/10"
fi

# Goal 3: Monthly goal (not started)
echo "3. Creating monthly goal..."
GOAL3=$(auth_req "POST" "/user/goals" "{
    \"goal_type\": \"monthly\",
    \"title\": \"Hoàn thành 50 bài học trong tháng\",
    \"description\": \"Mục tiêu lớn: hoàn thành 50 bài học để đạt cấp độ Intermediate\",
    \"target_value\": 50,
    \"target_unit\": \"lessons\",
    \"end_date\": \"$NEXT_MONTH\"
}")
GOAL3_ID=$(echo $GOAL3 | jq -r '.data.id // empty')
if [ -n "$GOAL3_ID" ] && [ "$GOAL3_ID" != "null" ]; then
    success "Created monthly goal: $GOAL3_ID"
fi

# Goal 4: Custom goal (almost completed)
echo "4. Creating custom goal (almost done)..."
GOAL4=$(auth_req "POST" "/user/goals" "{
    \"goal_type\": \"custom\",
    \"title\": \"Đạt band score 7.0 Writing\",
    \"description\": \"Luyện tập Writing để đạt band score 7.0 trong kỳ thi IELTS sắp tới\",
    \"target_value\": 7,
    \"target_unit\": \"score\",
    \"skill_type\": \"writing\",
    \"end_date\": \"$NEXT_MONTH\"
}")
GOAL4_ID=$(echo $GOAL4 | jq -r '.data.id // empty')
if [ -n "$GOAL4_ID" ] && [ "$GOAL4_ID" != "null" ]; then
    success "Created custom goal: $GOAL4_ID"
    # Update to almost complete
    auth_req "PUT" "/user/goals/$GOAL4_ID" "{
        \"current_value\": 6.5
    }" > /dev/null
    info "  Set progress: 6.5/7.0"
fi

echo ""

# ==========================================
# SEED REMINDERS
# ==========================================
section "Creating Study Reminders..."

# Reminder 1: Daily reminder (active)
echo "1. Creating daily reminder (active)..."
REM1=$(auth_req "POST" "/user/reminders" "{
    \"title\": \"Nhắc nhở học bài buổi sáng\",
    \"message\": \"Hãy bắt đầu ngày mới với 30 phút học IELTS!\",
    \"reminder_type\": \"daily\",
    \"reminder_time\": \"08:00:00\"
}")
REM1_ID=$(echo $REM1 | jq -r '.data.id // empty')
if [ -n "$REM1_ID" ] && [ "$REM1_ID" != "null" ]; then
    success "Created daily reminder: $REM1_ID"
fi

# Reminder 2: Weekly reminder (active)
echo "2. Creating weekly reminder (active)..."
REM2=$(auth_req "POST" "/user/reminders" "{
    \"title\": \"Nhắc nhở làm bài tập cuối tuần\",
    \"message\": \"Cuối tuần rồi, hãy làm bài tập để cải thiện kỹ năng!\",
    \"reminder_type\": \"weekly\",
    \"reminder_time\": \"18:00:00\",
    \"days_of_week\": \"[6,7]\"
}")
REM2_ID=$(echo $REM2 | jq -r '.data.id // empty')
if [ -n "$REM2_ID" ] && [ "$REM2_ID" != "null" ]; then
    success "Created weekly reminder: $REM2_ID"
fi

# Reminder 3: Custom reminder (inactive)
echo "3. Creating custom reminder (will be inactive)..."
REM3=$(auth_req "POST" "/user/reminders" "{
    \"title\": \"Nhắc nhở ôn tập trước kỳ thi\",
    \"message\": \"Chỉ còn 1 tuần nữa đến kỳ thi, hãy ôn tập thật kỹ!\",
    \"reminder_type\": \"daily\",
    \"reminder_time\": \"20:00:00\"
}")
REM3_ID=$(echo $REM3 | jq -r '.data.id // empty')
if [ -n "$REM3_ID" ] && [ "$REM3_ID" != "null" ]; then
    success "Created custom reminder: $REM3_ID"
    # Toggle to inactive
    curl -s -X PUT "$API_URL/user/reminders/$REM3_ID/toggle" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{}' > /dev/null 2>&1 || true
    info "  Set to inactive"
fi

# Reminder 4: Afternoon reminder (active)
echo "4. Creating afternoon reminder..."
REM4=$(auth_req "POST" "/user/reminders" "{
    \"title\": \"Nhắc nhở học buổi chiều\",
    \"message\": \"Giờ vàng để học IELTS - 14:00 chiều!\",
    \"reminder_type\": \"daily\",
    \"reminder_time\": \"14:00:00\"
}")
REM4_ID=$(echo $REM4 | jq -r '.data.id // empty')
if [ -n "$REM4_ID" ] && [ "$REM4_ID" != "null" ]; then
    success "Created afternoon reminder: $REM4_ID"
fi

echo ""

# ==========================================
# SEED SESSIONS (Historical data)
# ==========================================
section "Creating Study Sessions..."

# Session 1: Completed lesson session
echo "1. Creating completed lesson session..."
SESSION1=$(auth_req "POST" "/user/sessions" "{
    \"session_type\": \"lesson\",
    \"skill_type\": \"listening\",
    \"resource_id\": \"lesson-001\",
    \"resource_type\": \"lesson\",
    \"device_type\": \"desktop\"
}")
SESSION1_ID=$(echo $SESSION1 | jq -r '.data.id // empty')
if [ -n "$SESSION1_ID" ] && [ "$SESSION1_ID" != "null" ]; then
    sleep 1
    # End with completion
    auth_req "POST" "/user/sessions/$SESSION1_ID/end" "{
        \"completion_percentage\": 100.0,
        \"score\": null
    }" > /dev/null
    success "Created completed lesson session: $SESSION1_ID"
fi

# Session 2: Completed exercise session with score
echo "2. Creating completed exercise session..."
SESSION2=$(auth_req "POST" "/user/sessions" "{
    \"session_type\": \"exercise\",
    \"skill_type\": \"reading\",
    \"resource_id\": \"exercise-001\",
    \"resource_type\": \"exercise\",
    \"device_type\": \"mobile\"
}")
SESSION2_ID=$(echo $SESSION2 | jq -r '.data.id // empty')
if [ -n "$SESSION2_ID" ] && [ "$SESSION2_ID" != "null" ]; then
    sleep 2
    auth_req "POST" "/user/sessions/$SESSION2_ID/end" "{
        \"completion_percentage\": 85.5,
        \"score\": 7.5
    }" > /dev/null
    success "Created completed exercise session: $SESSION2_ID (Score: 7.5)"
fi

# Session 3: Practice test session (partial)
echo "3. Creating practice test session..."
SESSION3=$(auth_req "POST" "/user/sessions" "{
    \"session_type\": \"practice_test\",
    \"skill_type\": \"writing\",
    \"device_type\": \"desktop\"
}")
SESSION3_ID=$(echo $SESSION3 | jq -r '.data.id // empty')
if [ -n "$SESSION3_ID" ] && [ "$SESSION3_ID" != "null" ]; then
    sleep 1
    auth_req "POST" "/user/sessions/$SESSION3_ID/end" "{
        \"completion_percentage\": 60.0,
        \"score\": 6.5
    }" > /dev/null
    success "Created practice test session: $SESSION3_ID (Partial: 60%)"
fi

# Session 4: Active session (not ended)
echo "4. Creating active session (will remain active)..."
SESSION4=$(auth_req "POST" "/user/sessions" "{
    \"session_type\": \"lesson\",
    \"skill_type\": \"speaking\",
    \"resource_id\": \"lesson-002\",
    \"resource_type\": \"lesson\",
    \"device_type\": \"tablet\"
}")
SESSION4_ID=$(echo $SESSION4 | jq -r '.data.id // empty')
if [ -n "$SESSION4_ID" ] && [ "$SESSION4_ID" != "null" ]; then
    success "Created active session: $SESSION4_ID (still running)"
    info "  Note: This session will remain active for testing"
fi

echo ""

# ==========================================
# SUMMARY
# ==========================================
echo "📊 === SEEDING SUMMARY ==="
echo ""
success "Test data created successfully!"
echo ""
echo "Created:"
echo "  🎯 Goals: 4 (1 daily, 1 weekly, 1 monthly, 1 custom)"
echo "    - 1 in progress"
echo "    - 1 almost completed (8/10)"
echo "    - 1 almost completed (6.5/7.0)"
echo "    - 1 not started"
echo ""
echo "  🔔 Reminders: 4"
echo "    - 2 active daily reminders"
echo "    - 1 active weekly reminder"
echo "    - 1 inactive reminder"
echo ""
echo "  ⏱️  Sessions: 4"
echo "    - 2 completed sessions (lesson, exercise)"
echo "    - 1 partial practice test"
echo "    - 1 active session"
echo ""
info "You can now run test scenarios with: ./scripts/test-user-scenarios.sh"

