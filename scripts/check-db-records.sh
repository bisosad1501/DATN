#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DB_USER="ielts_admin"
DB_PASSWORD="ielts_password_2025"
DB_HOST="localhost"
DB_PORT="5432"

export PGPASSWORD="${DB_PASSWORD}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Checking Database Records${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if test user exists
if [ -n "$1" ]; then
    TEST_EMAIL="$1"
else
    echo -e "${YELLOW}Usage: $0 <email>${NC}"
    echo "Showing latest records..."
    TEST_EMAIL=""
fi

echo -e "${BLUE}1. Checking AUTH_DB${NC}"
echo -e "${YELLOW}Latest registered users:${NC}"
psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d auth_db -c "
    SELECT id, email, created_at, is_verified 
    FROM users 
    ORDER BY created_at DESC 
    LIMIT 5;
"
echo ""

echo -e "${BLUE}2. Checking USER_DB${NC}"
echo -e "${YELLOW}Latest user profiles:${NC}"
psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d user_db -c "
    SELECT user_id, email, full_name, created_at 
    FROM user_profiles 
    ORDER BY created_at DESC 
    LIMIT 5;
"
echo ""

echo -e "${YELLOW}Latest learning progress:${NC}"
psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d user_db -c "
    SELECT user_id, total_lessons_completed, total_exercises_completed, 
           total_study_hours, current_streak_days, updated_at 
    FROM learning_progress 
    ORDER BY updated_at DESC 
    LIMIT 5;
"
echo ""

echo -e "${YELLOW}Latest skill statistics:${NC}"
psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d user_db -c "
    SELECT user_id, skill_type, average_score, best_score, 
           total_practice_count, updated_at 
    FROM skill_statistics 
    ORDER BY updated_at DESC 
    LIMIT 5;
"
echo ""

echo -e "${BLUE}3. Checking NOTIFICATION_DB${NC}"
echo -e "${YELLOW}Latest notifications:${NC}"
psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d notification_db -c "
    SELECT user_id, type, category, title, 
           LEFT(message, 50) as message_preview, created_at 
    FROM notifications 
    ORDER BY created_at DESC 
    LIMIT 5;
"
echo ""

# If email provided, show specific user data
if [ -n "$TEST_EMAIL" ]; then
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}   User Details: ${TEST_EMAIL}${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    
    # Get user ID from auth_db
    USER_ID=$(psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d auth_db -t -c "
        SELECT id FROM users WHERE email = '${TEST_EMAIL}';
    " | xargs)
    
    if [ -n "$USER_ID" ]; then
        echo -e "${GREEN}User ID: ${USER_ID}${NC}"
        echo ""
        
        echo -e "${YELLOW}User Profile:${NC}"
        psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d user_db -c "
            SELECT * FROM user_profiles WHERE user_id = '${USER_ID}';
        "
        echo ""
        
        echo -e "${YELLOW}Learning Progress:${NC}"
        psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d user_db -c "
            SELECT * FROM learning_progress WHERE user_id = '${USER_ID}';
        "
        echo ""
        
        echo -e "${YELLOW}Skill Statistics:${NC}"
        psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d user_db -c "
            SELECT * FROM skill_statistics WHERE user_id = '${USER_ID}';
        "
        echo ""
        
        echo -e "${YELLOW}Notifications:${NC}"
        psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d notification_db -c "
            SELECT type, category, title, message, created_at 
            FROM notifications 
            WHERE user_id = '${USER_ID}'
            ORDER BY created_at DESC;
        "
    else
        echo -e "${YELLOW}User not found in auth_db${NC}"
    fi
fi

echo ""
echo -e "${GREEN}Done!${NC}"
