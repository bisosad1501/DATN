#!/bin/bash

# Simple Manual Test for User Service Business Logic

USER_ID="4c44ea9e-3915-4a4e-a96d-fdcc8a222ad0"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNGM0NGVhOWUtMzkxNS00YTRlLWE5NmQtZmRjYzhhMjIyYWQwIiwiZW1haWwiOiJkZWJ1Z190ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6InN0dWRlbnQiLCJleHAiOjE3NjA0MTU2MzUsIm5iZiI6MTc2MDMyOTIzNSwiaWF0IjoxNzYwMzI5MjM1fQ.qxNSkD--cYnPNhqiCjFkVQupD65SIwKk-TD1PfoKa0A"
INTERNAL_KEY="internal_secret_key_ielts_2025_change_in_production"

echo "======================================"
echo "USER SERVICE MANUAL TESTS"
echo "======================================"
echo ""

echo "📊 Test 1: Update Progress (1 lesson)"
curl -X PUT http://localhost:8082/api/v1/user/internal/progress/update \
  -H "Content-Type: application/json" \
  -H "X-Internal-API-Key: $INTERNAL_KEY" \
  -d '{"user_id":"'$USER_ID'","lessons_completed":1,"study_minutes":30}'

echo ""
sleep 2

echo "✓ Verify:"
curl -s http://localhost:8080/api/v1/user/progress -H "Authorization: Bearer $TOKEN" | \
  jq '.data.progress | {lessons: .total_lessons_completed, hours: .total_study_hours, streak: .current_streak_days}'

echo ""
echo ""
echo "📊 Test 2: Concurrent Updates (3x)"
for i in 1 2 3; do
  curl -s -X PUT http://localhost:8082/api/v1/user/internal/progress/update \
    -H "Content-Type: application/json" \
    -H "X-Internal-API-Key: $INTERNAL_KEY" \
    -d '{"user_id":"'$USER_ID'","exercises_completed":1,"study_minutes":15}' &
done
wait

sleep 2
echo "✓ Verify (should be 3 exercises):"
curl -s http://localhost:8080/api/v1/user/progress -H "Authorization: Bearer $TOKEN" | \
  jq '.data.progress | {lessons: .total_lessons_completed, exercises: .total_exercises_completed}'

echo ""
echo ""
echo "📊 Test 3: Skill Statistics (Listening)"
curl -X PUT http://localhost:8082/api/v1/user/internal/statistics/listening/update \
  -H "Content-Type: application/json" \
  -H "X-Internal-API-Key: $INTERNAL_KEY" \
  -d '{"user_id":"'$USER_ID'","score":7.0,"is_completed":true,"time_minutes":20}'

sleep 1
echo ""
echo "✓ Verify (avg=7, best=7, practices=1):"
curl -s http://localhost:8080/api/v1/user/statistics/listening -H "Authorization: Bearer $TOKEN" | \
  jq '.data | {avg: .average_score, best: .best_score, total: .total_practices}'

echo ""
echo ""
echo "📊 Test 4: Second Practice (score=8.0)"
curl -X PUT http://localhost:8082/api/v1/user/internal/statistics/listening/update \
  -H "Content-Type: application/json" \
  -H "X-Internal-API-Key: $INTERNAL_KEY" \
  -d '{"user_id":"'$USER_ID'","score":8.0,"is_completed":true,"time_minutes":25}'

sleep 1
echo ""
echo "✓ Verify (avg=7.5, best=8, practices=2):"
curl -s http://localhost:8080/api/v1/user/statistics/listening -H "Authorization: Bearer $TOKEN" | \
  jq '.data | {avg: .average_score, best: .best_score, total: .total_practices}'

echo ""
echo ""
echo "📊 Test 5: Third Practice (score=6.0)"
curl -X PUT http://localhost:8082/api/v1/user/internal/statistics/listening/update \
  -H "Content-Type: application/json" \
  -H "X-Internal-API-Key: $INTERNAL_KEY" \
  -d '{"user_id":"'$USER_ID'","score":6.0,"is_completed":true,"time_minutes":18}'

sleep 1
echo ""
echo "✓ Verify (avg=7.0, best=8, practices=3):"
curl -s http://localhost:8080/api/v1/user/statistics/listening -H "Authorization: Bearer $TOKEN" | \
  jq '.data | {avg: .average_score, best: .best_score, total: .total_practices}'

echo ""
echo ""
echo "======================================"
echo "ALL TESTS COMPLETED"
echo "======================================"
