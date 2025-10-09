#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:8085"
AUTH_URL="http://localhost:8081"

echo -e "${BLUE}=== Testing Notification Service ===${NC}\n"

# Register users
echo -e "${BLUE}1. Registering users...${NC}"
STUDENT_RESPONSE=$(curl -s -X POST ${AUTH_URL}/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"notif_student@test.com",
    "password":"Test@123",
    "full_name":"Notification Student",
    "role":"student"
  }')

STUDENT_TOKEN=$(echo $STUDENT_RESPONSE | jq -r '.data.access_token')
STUDENT_ID=$(echo $STUDENT_RESPONSE | jq -r '.data.user_id')

ADMIN_RESPONSE=$(curl -s -X POST ${AUTH_URL}/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"notif_admin@test.com",
    "password":"Admin@123",
    "full_name":"Notification Admin",
    "role":"admin"
  }')

ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | jq -r '.data.access_token')

echo -e "${GREEN}✓ Student ID: $STUDENT_ID${NC}"
echo -e "${GREEN}✓ Student Token: ${STUDENT_TOKEN:0:50}...${NC}"
echo -e "${GREEN}✓ Admin Token: ${ADMIN_TOKEN:0:50}...${NC}\n"

# Test 1: Get preferences (auto-create default)
echo -e "${BLUE}2. Getting notification preferences...${NC}"
curl -s -X GET ${BASE_URL}/api/v1/notifications/preferences \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq .
echo ""

# Test 2: Create notification (admin)
echo -e "${BLUE}3. Creating notification for student...${NC}"
NOTIF_RESPONSE=$(curl -s -X POST ${BASE_URL}/api/v1/admin/notifications \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\":\"$STUDENT_ID\",
    \"type\":\"achievement\",
    \"category\":\"success\",
    \"title\":\"🎉 Congratulations!\",
    \"message\":\"You have completed your first lesson\",
    \"action_type\":\"navigate_to_course\",
    \"action_data\":{\"course_id\":\"123\",\"lesson_id\":\"1\"}
  }")

echo $NOTIF_RESPONSE | jq .
NOTIF_ID=$(echo $NOTIF_RESPONSE | jq -r '.id')
echo -e "${GREEN}✓ Notification ID: $NOTIF_ID${NC}\n"

# Test 3: Get unread count
echo -e "${BLUE}4. Getting unread count...${NC}"
curl -s -X GET ${BASE_URL}/api/v1/notifications/unread-count \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq .
echo ""

# Test 4: List notifications
echo -e "${BLUE}5. Listing notifications...${NC}"
curl -s -X GET "${BASE_URL}/api/v1/notifications?page=1&limit=10" \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq .
echo ""

# Test 5: Mark as read
echo -e "${BLUE}6. Marking notification as read...${NC}"
curl -s -X PUT ${BASE_URL}/api/v1/notifications/${NOTIF_ID}/read \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq .
echo ""

# Test 6: Get unread count again (should be 0)
echo -e "${BLUE}7. Getting unread count after marking read...${NC}"
curl -s -X GET ${BASE_URL}/api/v1/notifications/unread-count \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq .
echo ""

# Test 7: Register device token
echo -e "${BLUE}8. Registering device token...${NC}"
curl -s -X POST ${BASE_URL}/api/v1/notifications/devices \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "device_token":"fcm_token_123456789",
    "device_type":"android",
    "device_name":"Samsung Galaxy S21",
    "app_version":"1.0.0",
    "os_version":"Android 12"
  }' | jq .
echo ""

# Test 8: Update preferences
echo -e "${BLUE}9. Updating notification preferences...${NC}"
curl -s -X PUT ${BASE_URL}/api/v1/notifications/preferences \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "push_reminders":false,
    "quiet_hours_enabled":true,
    "quiet_hours_start":"22:00:00",
    "quiet_hours_end":"08:00:00",
    "max_notifications_per_day":10
  }' | jq .
echo ""

# Test 9: Create multiple notifications
echo -e "${BLUE}10. Creating multiple notifications...${NC}"
for i in {1..3}; do
  curl -s -X POST ${BASE_URL}/api/v1/admin/notifications \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"user_id\":\"$STUDENT_ID\",
      \"type\":\"reminder\",
      \"category\":\"info\",
      \"title\":\"Daily Reminder $i\",
      \"message\":\"Don't forget to practice your English today!\"
    }" > /dev/null
done
echo -e "${GREEN}✓ Created 3 reminder notifications${NC}\n"

# Test 10: List all notifications with pagination
echo -e "${BLUE}11. Listing all notifications with pagination...${NC}"
curl -s -X GET "${BASE_URL}/api/v1/notifications?page=1&limit=5" \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq .
echo ""

# Test 11: Mark all as read
echo -e "${BLUE}12. Marking all notifications as read...${NC}"
curl -s -X PUT ${BASE_URL}/api/v1/notifications/mark-all-read \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq .
echo ""

# Test 12: Get unread count (should be 0)
echo -e "${BLUE}13. Final unread count...${NC}"
curl -s -X GET ${BASE_URL}/api/v1/notifications/unread-count \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq .
echo ""

# Test 13: Delete notification
echo -e "${BLUE}14. Deleting notification...${NC}"
curl -s -X DELETE ${BASE_URL}/api/v1/notifications/${NOTIF_ID} \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq .
echo ""

echo -e "${GREEN}=== All Tests Completed! ===${NC}"
