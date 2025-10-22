#!/bin/bash

# ============================================
# Seed Exercise Data Script
# ============================================
# Purpose: Insert sample data for testing Listening and Reading exercises
# Usage: ./scripts/seed-exercise-data.sh

set -e

echo "🌱 Seeding Exercise Data..."
echo "================================"

# Check if docker-compose is running
if ! docker-compose ps | grep -q "postgres.*Up"; then
    echo "❌ Error: PostgreSQL container is not running"
    echo "Please start the containers first: docker-compose up -d"
    exit 1
fi

# Run the seed SQL file
echo "📝 Inserting sample data into exercise_db..."
docker-compose exec -T postgres psql -U ielts_admin -d exercise_db < database/seed_exercise_data.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Sample data inserted successfully!"
    echo ""
    echo "📊 Summary:"
    echo "  - 1 Listening Exercise (with audio URLs)"
    echo "  - 1 Reading Exercise (with passages)"
    echo "  - Multiple sections with instructions"
    echo "  - Various question types (fill_in_blank, multiple_choice, true_false_not_given)"
    echo ""
    echo "🧪 You can now test:"
    echo "  1. Listening exercise with audio player"
    echo "  2. Reading exercise with passage content"
    echo "  3. Section instructions display"
    echo ""
    echo "🔗 Access the exercises at:"
    echo "  http://localhost:3000/exercises/list"
else
    echo ""
    echo "❌ Error: Failed to insert sample data"
    exit 1
fi

