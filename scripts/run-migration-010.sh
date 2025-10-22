#!/bin/bash

# ============================================
# RUN MIGRATION 010: RESEED WITH NEW STRUCTURE
# ============================================
# Purpose: Reseed database with new Lesson/Exercise separation
# Usage: ./scripts/run-migration-010.sh
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Database connection
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_NAME_COURSE="${DB_NAME_COURSE:-course_db}"
DB_NAME_EXERCISE="${DB_NAME_EXERCISE:-exercise_db}"

echo "========================================="
echo "MIGRATION 010: RESEED WITH NEW STRUCTURE"
echo "========================================="
echo ""

# Function to run SQL file
run_sql_file() {
    local db=$1
    local file=$2
    echo -e "${YELLOW}Running: $file on $db${NC}"
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $db -f $file
}

# Warning
echo -e "${RED}WARNING: This will DELETE ALL existing data!${NC}"
echo ""
read -p "Are you sure you want to continue? (yes/no) " -r
echo ""
if [[ ! $REPLY =~ ^yes$ ]]
then
    echo -e "${RED}Migration cancelled${NC}"
    exit 1
fi

# Step 1: Reseed courses, modules, lessons, exercises
echo ""
echo -e "${YELLOW}Step 1: Reseeding core data...${NC}"
run_sql_file $DB_NAME_COURSE "database/migrations/010_reseed_with_new_structure.sql"

# Step 2: Seed exercise details (sections, questions, answers)
echo ""
echo -e "${YELLOW}Step 2: Seeding exercise details...${NC}"
run_sql_file $DB_NAME_EXERCISE "database/seed_free_exercises.sql"

# Step 3: Verify
echo ""
echo -e "${YELLOW}Step 3: Verifying data...${NC}"

echo "Courses:"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME_COURSE -c "SELECT id, title, total_lessons FROM courses;"

echo ""
echo "Modules:"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME_COURSE -c "SELECT m.title, m.total_lessons, m.total_exercises, c.title as course FROM modules m JOIN courses c ON m.course_id = c.id ORDER BY c.id, m.display_order;"

echo ""
echo "Lessons:"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME_COURSE -c "SELECT COUNT(*) as total, content_type, COUNT(*) FROM lessons GROUP BY content_type;"

echo ""
echo "Exercises:"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME_EXERCISE -c "SELECT COUNT(*) as total, COUNT(module_id) as with_module, COUNT(course_id) as with_course FROM exercises;"

# Success
echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}✓ MIGRATION 010 COMPLETE!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Update backend APIs"
echo "  2. Update frontend UI"
echo "  3. Test the application"
echo "========================================="

