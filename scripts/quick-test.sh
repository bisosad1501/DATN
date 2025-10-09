#!/bin/bash

echo "=== Quick Test - Check if models match DB ==="

TOKEN=$(curl -s -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test_admin@ielts.com","password":"Test@123"}' | \
  grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

echo "✅ Token obtained"

echo -e "\n1. Test Preferences (simple GET)..."
curl -s http://localhost:8082/api/v1/user/preferences \
  -H "Authorization: Bearer $TOKEN" | jq '.success, .error.details' 2>/dev/null | head -2

echo -e "\n2. Test Achievements (already working)..."
curl -s http://localhost:8082/api/v1/user/achievements \
  -H "Authorization: Bearer $TOKEN" | jq '.success' 2>/dev/null

echo -e "\n3. Test Leaderboard..."
curl -s http://localhost:8082/api/v1/user/leaderboard \
  -H "Authorization: Bearer $TOKEN" | jq '.success, .error.details' 2>/dev/null | head -2

echo -e "\n=== Quick Test Done ==="
