#!/bin/bash

set -e

echo "🌱 Seeding 4 FREE Courses with Exercises..."
echo "============================================"

if ! docker-compose ps | grep -q "postgres.*Up"; then
    echo "❌ Error: PostgreSQL container is not running"
    exit 1
fi

echo ""
echo "📝 Step 1: Creating 4 FREE courses in course_db..."
docker-compose exec -T postgres psql -U ielts_admin -d course_db < database/seed_free_courses_complete.sql

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to create courses"
    exit 1
fi

echo ""
echo "📝 Step 2: Creating exercises in exercise_db..."
docker-compose exec -T postgres psql -U ielts_admin -d exercise_db < database/seed_free_exercises.sql

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to create exercises"
    exit 1
fi

echo ""
echo "✅ SUCCESS! 4 FREE courses created with linked exercises!"
echo ""
echo "📊 Summary:"
echo "  🎧 IELTS Listening Basics (10 lessons, 4 exercises)"
echo "  📖 IELTS Reading Basics (8 lessons, 4 exercises)"
echo "  ✍️ IELTS Writing Basics (7 lessons)"
echo "  🗣️ IELTS Speaking Basics (6 lessons)"
echo ""
echo "🌐 Access at:"
echo "  Courses: http://localhost:3000/courses"
echo "  Exercises: http://localhost:3000/exercises/list"
echo ""
echo "🧪 Test Flow:"
echo "  1. Browse courses → Filter by 'Free'"
echo "  2. Enroll in 'IELTS Listening Basics'"
echo "  3. Go to Module 2 → Click 'Exercise 1: Form Completion'"
echo "  4. Click 'Start Exercise' → Do exercise → Submit"
echo "  5. View results → Back to lesson"
echo ""

