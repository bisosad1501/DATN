#!/bin/bash
set -e

BASE="http://localhost:8085"
AUTH="http://localhost:8081"

echo "=== Login ==="
ST=$(curl -s ${AUTH}/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"student1@test.com","password":"Test@123"}' | jq -r '.data.access_token')
echo "Token: ${ST:0:40}..."

echo -e "\n=== TEST 1: Preferences ==="
curl -s ${BASE}/api/v1/notifications/preferences -H "Authorization: Bearer $ST" | jq -c '{push_enabled,email_enabled,max_per_day:.max_notifications_per_day}'

echo -e "\n=== TEST 2: Unread Count ==="
curl -s ${BASE}/api/v1/notifications/unread-count -H "Authorization: Bearer $ST"

echo -e "\n=== TEST 3: List ==="
curl -s "${BASE}/api/v1/notifications?limit=3" -H "Authorization: Bearer $ST" | jq -c '{total:.pagination.total_items}'

echo -e "\n=== TEST 4: Register Device ==="
curl -s -XPOST ${BASE}/api/v1/notifications/devices -H "Authorization: Bearer $ST" -H "Content-Type: application/json" -d '{"device_token":"test_token","device_type":"ios"}' | jq -c '{id,device_type}'

echo -e "\n=== DONE ==="
