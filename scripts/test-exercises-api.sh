#!/bin/bash

echo "🧪 Testing Exercises API Integration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📊 Test 1: Get all exercises (default pagination)"
curl -s 'http://localhost:8080/api/v1/exercises?page=1&limit=5' | \
  jq '{
    success: .success,
    total_exercises: .data.total,
    page: .data.page,
    limit: .data.limit,
    exercises: .data.exercises | map({
      id, 
      title, 
      skill_type, 
      difficulty, 
      total_questions,
      is_free
    })
  }'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test 2: Filter by skill_type=listening"
curl -s 'http://localhost:8080/api/v1/exercises?skill_type=listening&page=1&limit=5' | \
  jq '{
    total: .data.total,
    exercises: .data.exercises | map(.skill_type) | unique
  }'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test 3: Filter by difficulty=medium"
curl -s 'http://localhost:8080/api/v1/exercises?difficulty=medium&page=1&limit=5' | \
  jq '{
    total: .data.total,
    exercises: .data.exercises | map(.difficulty) | unique
  }'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test 4: Search by title"
curl -s 'http://localhost:8080/api/v1/exercises?search=listening&page=1&limit=5' | \
  jq '{
    total: .data.total,
    titles: .data.exercises | map(.title)
  }'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ API Integration Tests Complete!"
echo ""
echo "Frontend URL: http://localhost:3000/exercises"
echo "API Endpoint: http://localhost:8080/api/v1/exercises"
echo ""
