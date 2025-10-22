#!/bin/bash

# ============================================
# Seed Complete Relationships Data
# ============================================
# Purpose: Insert complete sample data showing Course → Module → Lesson → Exercise relationships
# Usage: ./scripts/seed-complete-relationships.sh

set -e

echo "🌱 Seeding Complete Relationship Data..."
echo "========================================"

# Check if docker-compose is running
if ! docker-compose ps | grep -q "postgres.*Up"; then
    echo "❌ Error: PostgreSQL container is not running"
    echo "Please start the containers first: docker-compose up -d"
    exit 1
fi

# Run the seed SQL file for course_db
echo "📝 Inserting Course, Module, Lesson, Video data into course_db..."
docker-compose exec -T postgres psql -U ielts_admin -d course_db < database/seed_complete_relationships.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Complete relationship data inserted successfully!"
    echo ""
    echo "📊 Summary:"
    echo "  - 1 Complete Course: 'IELTS Listening Mastery'"
    echo "  - 3 Modules (Introduction, Advanced, Mock Tests)"
    echo "  - 12 Lessons (Video, Article, Exercise types)"
    echo "  - 2 YouTube Videos (with auto-synced duration)"
    echo "  - Links to existing Exercises"
    echo ""
    echo "🔗 Relationships:"
    echo "  Course → Modules → Lessons → Videos"
    echo "  Lessons → Exercises (linked)"
    echo ""
    echo "🧪 You can now test:"
    echo "  1. View course detail with full structure"
    echo "  2. Navigate through modules and lessons"
    echo "  3. Watch video lessons"
    echo "  4. Do linked exercises from lessons"
    echo ""
    echo "🌐 Access at:"
    echo "  http://localhost:3000/courses/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
    echo ""
else
    echo ""
    echo "❌ Error: Failed to insert relationship data"
    exit 1
fi

