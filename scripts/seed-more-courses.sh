#!/bin/bash

set -e

echo "🌱 Seeding More Courses..."
echo "=========================="

if ! docker-compose ps | grep -q "postgres.*Up"; then
    echo "❌ Error: PostgreSQL container is not running"
    exit 1
fi

echo "📝 Inserting more courses into course_db..."
docker-compose exec -T postgres psql -U ielts_admin -d course_db < database/seed_more_courses.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ More courses inserted successfully!"
    echo ""
    echo "📊 New Courses:"
    echo "  1. IELTS Reading Mastery (15 lessons, Premium)"
    echo "  2. IELTS Writing Task 2 Mastery (18 lessons, Premium)"
    echo "  3. IELTS Speaking Confidence Builder (12 lessons, FREE)"
    echo ""
    echo "🌐 Access at: http://localhost:3000/courses"
else
    echo "❌ Error: Failed to insert courses"
    exit 1
fi

