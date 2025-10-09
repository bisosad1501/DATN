#!/bin/bash

# Test Notification Service - Save results to file
RESULTS_FILE="/tmp/notification_test_results.txt"
echo "=== Notification Service Test Results ===" > $RESULTS_FILE
echo "Test Time: $(date)" >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

# Login tokens
STUDENT_TOKEN=$(curl -s -XPOST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student1@test.com","password":"Test@123"}' | jq -r '.data.access_token')

ADMIN_TOKEN=$(curl -s -XPOST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testadmin@ielts.com","password":"Test@123"}' | jq -r '.data.access_token')

STUDENT_ID="d5a842c9-fe90-457d-a279-bf68bee452e9"

echo "✓ Student Token: ${STUDENT_TOKEN:0:30}..." >> $RESULTS_FILE
echo "✓ Admin Token: ${ADMIN_TOKEN:0:30}..." >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

# Test 1: Get Preferences
echo "TEST 1: Get Notification Preferences" >> $RESULTS_FILE
curl -s http://localhost:8085/api/v1/notifications/preferences \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq -c >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

# Test 2: Update Preferences
echo "TEST 2: Update Preferences (quiet hours)" >> $RESULTS_FILE
curl -s -XPUT http://localhost:8085/api/v1/notifications/preferences \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quiet_hours_enabled":true,"quiet_hours_start":"23:00:00","quiet_hours_end":"07:00:00","max_notifications_per_day":15}' \
  | jq -c '{quiet_hours_enabled,quiet_hours_start,quiet_hours_end,max_notifications_per_day}' >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

# Test 3: Register Device
echo "TEST 3: Register Device Token" >> $RESULTS_FILE
DEVICE_RESP=$(curl -s -XPOST http://localhost:8085/api/v1/notifications/devices \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"device_token":"fcm_test_token_123","device_type":"android","device_name":"Test Phone"}')
echo $DEVICE_RESP | jq -c '{id,device_type,is_active}' >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

# Test 4: Create Notification (Admin)
echo "TEST 4: Create Notification (Admin)" >> $RESULTS_FILE
NOTIF_RESP=$(curl -s -XPOST http://localhost:8085/api/v1/admin/notifications \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"user_id\":\"$STUDENT_ID\",\"type\":\"achievement\",\"category\":\"success\",\"title\":\"Test Achievement\",\"message\":\"You completed the test\"}")
echo $NOTIF_RESP | jq -c '{id,type,category,title,is_read}' >> $RESULTS_FILE
NOTIF_ID=$(echo $NOTIF_RESP | jq -r '.id')
echo "" >> $RESULTS_FILE

# Test 5: Get Unread Count
echo "TEST 5: Get Unread Count" >> $RESULTS_FILE
curl -s http://localhost:8085/api/v1/notifications/unread-count \
  -H "Authorization: Bearer $STUDENT_TOKEN" >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

# Test 6: List Notifications
echo "TEST 6: List Notifications" >> $RESULTS_FILE
curl -s "http://localhost:8085/api/v1/notifications?page=1&limit=5" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  | jq -c '{total:.pagination.total_items,notifications:(.notifications|map({id,title,is_read}))}' >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

# Test 7: Mark as Read
echo "TEST 7: Mark Notification as Read" >> $RESULTS_FILE
curl -s -XPUT "http://localhost:8085/api/v1/notifications/${NOTIF_ID}/read" \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq -c >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

# Test 8: Unread Count After Read
echo "TEST 8: Unread Count After Mark Read" >> $RESULTS_FILE
curl -s http://localhost:8085/api/v1/notifications/unread-count \
  -H "Authorization: Bearer $STUDENT_TOKEN" >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

# Test 9: Create Multiple Notifications
echo "TEST 9: Create 3 More Notifications" >> $RESULTS_FILE
for i in {1..3}; do
  curl -s -XPOST http://localhost:8085/api/v1/admin/notifications \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"user_id\":\"$STUDENT_ID\",\"type\":\"reminder\",\"category\":\"info\",\"title\":\"Reminder $i\",\"message\":\"Daily study reminder\"}" \
    > /dev/null
done
echo "✓ Created 3 reminders" >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

# Test 10: List All Notifications
echo "TEST 10: List All Notifications (should have 4 total)" >> $RESULTS_FILE
curl -s "http://localhost:8085/api/v1/notifications?page=1&limit=10" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  | jq -c '{total:.pagination.total_items,unread:(.notifications|map(select(.is_read==false))|length)}' >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

# Test 11: Mark All as Read
echo "TEST 11: Mark All as Read" >> $RESULTS_FILE
curl -s -XPUT http://localhost:8085/api/v1/notifications/mark-all-read \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq -c >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

# Test 12: Final Unread Count
echo "TEST 12: Final Unread Count (should be 0)" >> $RESULTS_FILE
curl -s http://localhost:8085/api/v1/notifications/unread-count \
  -H "Authorization: Bearer $STUDENT_TOKEN" >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

# Test 13: Delete Notification
echo "TEST 13: Delete Notification" >> $RESULTS_FILE
curl -s -XDELETE "http://localhost:8085/api/v1/notifications/${NOTIF_ID}" \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq -c >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

# Test 14: Filter Unread Notifications
echo "TEST 14: Filter Only Read Notifications" >> $RESULTS_FILE
curl -s "http://localhost:8085/api/v1/notifications?is_read=true&limit=10" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  | jq -c '{total:.pagination.total_items}' >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

echo "=== All Tests Completed ===" >> $RESULTS_FILE

# Display results
cat $RESULTS_FILE
echo ""
echo "Results saved to: $RESULTS_FILE"
