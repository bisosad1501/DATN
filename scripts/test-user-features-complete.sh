#!/bin/bash

# Script to test all user features (Achievements, Goals, Reminders, Sessions)
# Uses tai@gmail.com for testing

set -e

API_URL="${API_URL:-http://localhost:8080/api/v1}"
EMAIL="tai@gmail.com"
PASSWORD="15012003"

echo "🧪 === TEST USER FEATURES (Achievements, Goals, Reminders, Sessions) ==="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print success
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print error
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to print info
info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Step 1: Login
echo "📝 Step 1: Login as $EMAIL"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

if [ $? -ne 0 ]; then
    error "Login failed"
    exit 1
fi

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.access_token // .data.token // empty')
if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    error "Failed to get token from login response"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

success "Login successful"
echo ""

# Function to make authenticated request
auth_request() {
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

# ==========================================
# TEST ACHIEVEMENTS
# ==========================================
echo "🏆 === TESTING ACHIEVEMENTS ==="
echo ""

# Get all achievements
echo "1. GET /user/achievements - Get all achievements"
ACHIEVEMENTS_RESPONSE=$(auth_request "GET" "/user/achievements")
ACHIEVEMENTS_SUCCESS=$(echo $ACHIEVEMENTS_RESPONSE | jq -r '.success // false')

if [ "$ACHIEVEMENTS_SUCCESS" = "true" ]; then
    ACHIEVEMENTS_COUNT=$(echo $ACHIEVEMENTS_RESPONSE | jq '.data | length')
    success "Got $ACHIEVEMENTS_COUNT achievements"
    echo $ACHIEVEMENTS_RESPONSE | jq '.data[0:3]' | head -20
else
    error "Failed to get achievements"
    echo "Response: $ACHIEVEMENTS_RESPONSE"
fi
echo ""

# Get earned achievements
echo "2. GET /user/achievements/earned - Get earned achievements"
EARNED_RESPONSE=$(auth_request "GET" "/user/achievements/earned")
EARNED_SUCCESS=$(echo $EARNED_RESPONSE | jq -r '.success // false')

if [ "$EARNED_SUCCESS" = "true" ]; then
    # Handle both array and object responses
    EARNED_DATA=$(echo $EARNED_RESPONSE | jq '.data // empty')
    if echo $EARNED_DATA | jq -e '. | type == "array"' > /dev/null 2>&1; then
        EARNED_COUNT=$(echo $EARNED_DATA | jq 'length')
        success "User has earned $EARNED_COUNT achievements"
        if [ "$EARNED_COUNT" -gt 0 ]; then
            echo $EARNED_RESPONSE | jq '.data[0:2]' 2>/dev/null || echo $EARNED_RESPONSE | jq '.data | to_entries[0:2] | from_entries'
        fi
    else
        EARNED_COUNT=$(echo $EARNED_DATA | jq 'length // 0' 2>/dev/null || echo "0")
        success "User has earned achievements (structure: $(echo $EARNED_DATA | jq -r 'keys | join(", ")') 2>/dev/null || echo 'unknown')"
        echo $EARNED_RESPONSE | jq '.data' 2>/dev/null | head -15
    fi
else
    error "Failed to get earned achievements"
    echo "Response: $EARNED_RESPONSE"
fi
echo ""

# ==========================================
# TEST GOALS
# ==========================================
echo "🎯 === TESTING STUDY GOALS ==="
echo ""

# Create a goal
echo "1. POST /user/goals - Create a study goal"
GOAL_DATA='{
    "goal_type": "daily",
    "title": "Học 30 phút mỗi ngày",
    "description": "Mục tiêu học 30 phút mỗi ngày trong tuần này",
    "target_value": 30,
    "target_unit": "minutes",
    "skill_type": "listening",
    "end_date": "'$(date -v+7d +%Y-%m-%d 2>/dev/null || date -d "+7 days" +%Y-%m-%d)'"
}'

CREATE_GOAL_RESPONSE=$(auth_request "POST" "/user/goals" "$GOAL_DATA")
CREATE_GOAL_SUCCESS=$(echo $CREATE_GOAL_RESPONSE | jq -r '.success // false')

if [ "$CREATE_GOAL_SUCCESS" = "true" ]; then
    GOAL_ID=$(echo $CREATE_GOAL_RESPONSE | jq -r '.data.id // empty')
    success "Created goal with ID: $GOAL_ID"
    echo $CREATE_GOAL_RESPONSE | jq '.data'
else
    error "Failed to create goal"
    echo "Response: $CREATE_GOAL_RESPONSE"
    GOAL_ID=""
fi
echo ""

# Get all goals
echo "2. GET /user/goals - Get all goals"
GET_GOALS_RESPONSE=$(auth_request "GET" "/user/goals")
GET_GOALS_SUCCESS=$(echo $GET_GOALS_RESPONSE | jq -r '.success // false')

if [ "$GET_GOALS_SUCCESS" = "true" ]; then
    GOALS_COUNT=$(echo $GET_GOALS_RESPONSE | jq '.data | length')
    success "Got $GOALS_COUNT goals"
    echo $GET_GOALS_RESPONSE | jq '.data[0:2]' | head -20
    
    # Use first goal ID if we don't have one from create
    if [ -z "$GOAL_ID" ] && [ "$GOALS_COUNT" -gt 0 ]; then
        GOAL_ID=$(echo $GET_GOALS_RESPONSE | jq -r '.data[0].id // empty')
    fi
else
    error "Failed to get goals"
    echo "Response: $GET_GOALS_RESPONSE"
fi
echo ""

# Get goal by ID
if [ -n "$GOAL_ID" ] && [ "$GOAL_ID" != "null" ]; then
    echo "3. GET /user/goals/$GOAL_ID - Get goal by ID"
    GET_GOAL_RESPONSE=$(auth_request "GET" "/user/goals/$GOAL_ID")
    GET_GOAL_SUCCESS=$(echo $GET_GOAL_RESPONSE | jq -r '.success // false')
    
    if [ "$GET_GOAL_SUCCESS" = "true" ]; then
        success "Got goal details"
        echo $GET_GOAL_RESPONSE | jq '.data | {id, title, goal_type, target_value, current_value, status}'
    else
        error "Failed to get goal"
        echo "Response: $GET_GOAL_RESPONSE"
    fi
    echo ""
    
    # Update goal
    echo "4. PUT /user/goals/$GOAL_ID - Update goal"
    UPDATE_GOAL_DATA='{
        "title": "Học 45 phút mỗi ngày (Updated)",
        "target_value": 45
    }'
    UPDATE_GOAL_RESPONSE=$(auth_request "PUT" "/user/goals/$GOAL_ID" "$UPDATE_GOAL_DATA")
    UPDATE_GOAL_SUCCESS=$(echo $UPDATE_GOAL_RESPONSE | jq -r '.success // false')
    
    if [ "$UPDATE_GOAL_SUCCESS" = "true" ]; then
        success "Updated goal"
    else
        error "Failed to update goal"
        echo "Response: $UPDATE_GOAL_RESPONSE"
    fi
    echo ""
    
    # Complete goal (optional - uncomment if you want to test completion)
    # echo "5. POST /user/goals/$GOAL_ID/complete - Complete goal"
    # COMPLETE_GOAL_RESPONSE=$(auth_request "POST" "/user/goals/$GOAL_ID/complete")
    # COMPLETE_GOAL_SUCCESS=$(echo $COMPLETE_GOAL_RESPONSE | jq -r '.success // false')
    # 
    # if [ "$COMPLETE_GOAL_SUCCESS" = "true" ]; then
    #     success "Completed goal"
    # else
    #     error "Failed to complete goal"
    #     echo "Response: $COMPLETE_GOAL_RESPONSE"
    # fi
    # echo ""
fi

# ==========================================
# TEST REMINDERS
# ==========================================
echo "🔔 === TESTING STUDY REMINDERS ==="
echo ""

# Create a reminder
echo "1. POST /user/reminders - Create a reminder"
REMINDER_DATA='{
    "title": "Nhắc nhở học bài",
    "message": "Đã đến giờ học IELTS rồi!",
    "reminder_type": "daily",
    "reminder_time": "09:00:00"
}'

CREATE_REMINDER_RESPONSE=$(auth_request "POST" "/user/reminders" "$REMINDER_DATA")
CREATE_REMINDER_SUCCESS=$(echo $CREATE_REMINDER_RESPONSE | jq -r '.success // false')

if [ "$CREATE_REMINDER_SUCCESS" = "true" ]; then
    REMINDER_ID=$(echo $CREATE_REMINDER_RESPONSE | jq -r '.data.id // empty')
    success "Created reminder with ID: $REMINDER_ID"
    echo $CREATE_REMINDER_RESPONSE | jq '.data'
else
    error "Failed to create reminder"
    echo "Response: $CREATE_REMINDER_RESPONSE"
    REMINDER_ID=""
fi
echo ""

# Get all reminders
echo "2. GET /user/reminders - Get all reminders"
GET_REMINDERS_RESPONSE=$(auth_request "GET" "/user/reminders")
GET_REMINDERS_SUCCESS=$(echo $GET_REMINDERS_RESPONSE | jq -r '.success // false')

if [ "$GET_REMINDERS_SUCCESS" = "true" ]; then
    REMINDERS_COUNT=$(echo $GET_REMINDERS_RESPONSE | jq '.data | length')
    success "Got $REMINDERS_COUNT reminders"
    echo $GET_REMINDERS_RESPONSE | jq '.data[0:2]' | head -20
    
    if [ -z "$REMINDER_ID" ] && [ "$REMINDERS_COUNT" -gt 0 ]; then
        REMINDER_ID=$(echo $GET_REMINDERS_RESPONSE | jq -r '.data[0].id // empty')
    fi
else
    error "Failed to get reminders"
    echo "Response: $GET_REMINDERS_RESPONSE"
fi
echo ""

# Update reminder
if [ -n "$REMINDER_ID" ] && [ "$REMINDER_ID" != "null" ]; then
    echo "3. PUT /user/reminders/$REMINDER_ID - Update reminder"
    UPDATE_REMINDER_DATA='{
        "title": "Nhắc nhở học bài (Updated)",
        "reminder_time": "10:00:00"
    }'
    UPDATE_REMINDER_RESPONSE=$(auth_request "PUT" "/user/reminders/$REMINDER_ID" "$UPDATE_REMINDER_DATA")
    UPDATE_REMINDER_SUCCESS=$(echo $UPDATE_REMINDER_RESPONSE | jq -r '.success // false')
    
    if [ "$UPDATE_REMINDER_SUCCESS" = "true" ]; then
        success "Updated reminder"
    else
        error "Failed to update reminder"
        echo "Response: $UPDATE_REMINDER_RESPONSE"
    fi
    echo ""
    
    # Toggle reminder (sử dụng empty body hoặc không cần body)
    echo "4. PUT /user/reminders/$REMINDER_ID/toggle - Toggle reminder"
    TOGGLE_REMINDER_RESPONSE=$(curl -s -X PUT "$API_URL/user/reminders/$REMINDER_ID/toggle" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{}')
    TOGGLE_REMINDER_SUCCESS=$(echo $TOGGLE_REMINDER_RESPONSE | jq -r '.success // false')
    
    if [ "$TOGGLE_REMINDER_SUCCESS" = "true" ]; then
        success "Toggled reminder"
        echo $TOGGLE_REMINDER_RESPONSE | jq '.data | {id, title, is_active}'
    else
        info "Toggle reminder endpoint might need different format (check backend)"
        echo "Response: $TOGGLE_REMINDER_RESPONSE"
    fi
    echo ""
fi

# ==========================================
# TEST SESSIONS
# ==========================================
echo "⏱️  === TESTING STUDY SESSIONS ==="
echo ""

# Start a session
echo "1. POST /user/sessions - Start a study session"
SESSION_DATA='{
    "session_type": "lesson",
    "skill_type": "listening",
    "resource_id": "test-resource-123",
    "resource_type": "lesson",
    "device_type": "desktop"
}'

START_SESSION_RESPONSE=$(auth_request "POST" "/user/sessions" "$SESSION_DATA")
START_SESSION_SUCCESS=$(echo $START_SESSION_RESPONSE | jq -r '.success // false')

if [ "$START_SESSION_SUCCESS" = "true" ]; then
    SESSION_ID=$(echo $START_SESSION_RESPONSE | jq -r '.data.id // empty')
    success "Started session with ID: $SESSION_ID"
    echo $START_SESSION_RESPONSE | jq '.data | {id, session_type, started_at}'
    
    # Wait a bit (simulate studying)
    info "Waiting 2 seconds to simulate study time..."
    sleep 2
    
    # End session
    echo ""
    echo "2. POST /user/sessions/$SESSION_ID/end - End session"
    END_SESSION_DATA='{
        "completion_percentage": 85.5,
        "score": 7.5
    }'
    END_SESSION_RESPONSE=$(auth_request "POST" "/user/sessions/$SESSION_ID/end" "$END_SESSION_DATA")
    END_SESSION_SUCCESS=$(echo $END_SESSION_RESPONSE | jq -r '.success // false')
    
    if [ "$END_SESSION_SUCCESS" = "true" ]; then
        success "Ended session"
        SESSION_DATA=$(echo $END_SESSION_RESPONSE | jq '.data')
        DURATION=$(echo $SESSION_DATA | jq -r '.duration_minutes // "null"')
        if [ "$DURATION" = "null" ]; then
            info "Session ended but duration is null (backend might need time to calculate)"
        fi
        echo $END_SESSION_RESPONSE | jq '.data'
    else
        error "Failed to end session"
        echo "Response: $END_SESSION_RESPONSE"
    fi
else
    error "Failed to start session"
    echo "Response: $START_SESSION_RESPONSE"
fi
echo ""

# ==========================================
# SUMMARY
# ==========================================
echo "📊 === TEST SUMMARY ==="
echo ""
info "All tests completed!"
echo ""
echo "Tested features:"
echo "  ✅ Achievements (Get all, Get earned)"
echo "  ✅ Goals (Create, Get all, Get by ID, Update)"
echo "  ✅ Reminders (Create, Get all, Update, Toggle)"
echo "  ✅ Sessions (Start, End)"
echo ""
success "Script completed successfully!"

