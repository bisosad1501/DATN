#!/bin/bash

# ============================================
# RUN MIGRATION 008: SEPARATE LESSONS AND EXERCISES
# ============================================
# Purpose: Safely run migration to separate Lesson and Exercise
# Usage: ./scripts/run-migration-008.sh
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
echo "MIGRATION 008: SEPARATE LESSONS AND EXERCISES"
echo "========================================="
echo ""

# Function to run SQL and check result
run_sql() {
    local db=$1
    local sql=$2
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $db -c "$sql"
}

# Function to run SQL file
run_sql_file() {
    local db=$1
    local file=$2
    echo -e "${YELLOW}Running: $file on $db${NC}"
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $db -f $file
}

# Step 1: Check current state
echo -e "${YELLOW}Step 1: Checking current state...${NC}"
echo "Lessons with content_type='exercise':"
run_sql $DB_NAME_COURSE "SELECT COUNT(*) FROM lessons WHERE content_type = 'exercise';"

echo ""
echo "Exercises with lesson_id:"
run_sql $DB_NAME_EXERCISE "SELECT COUNT(*) FROM exercises WHERE lesson_id IS NOT NULL;"

echo ""
read -p "Continue with migration? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo -e "${RED}Migration cancelled${NC}"
    exit 1
fi

# Step 2: Run migration on course_db
echo ""
echo -e "${YELLOW}Step 2: Running migration on course_db...${NC}"
run_sql_file $DB_NAME_COURSE "database/migrations/008_separate_lessons_and_exercises.sql"

# Step 3: Verify migration
echo ""
echo -e "${YELLOW}Step 3: Verifying migration...${NC}"

echo "Checking lessons (should have NO exercise content_type):"
EXERCISE_LESSONS=$(run_sql $DB_NAME_COURSE "SELECT COUNT(*) FROM lessons WHERE content_type = 'exercise';" | grep -oP '\d+' | head -1)

if [ "$EXERCISE_LESSONS" = "0" ]; then
    echo -e "${GREEN}✓ PASS: No exercise lessons found${NC}"
else
    echo -e "${RED}✗ FAIL: Still have $EXERCISE_LESSONS exercise lessons!${NC}"
    exit 1
fi

echo ""
echo "Checking exercises (should have module_id):"
run_sql $DB_NAME_EXERCISE "SELECT COUNT(*) as total, COUNT(module_id) as with_module FROM exercises;"

echo ""
echo "Checking modules (should have total_exercises column):"
run_sql $DB_NAME_COURSE "SELECT id, title, total_lessons, total_exercises FROM modules ORDER BY course_id, display_order;"

# Step 4: Success
echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}✓ MIGRATION 008 COMPLETE!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Backup tables created:"
echo "  - _backup_lessons_008"
echo "  - _backup_exercises_008"
echo "  - _backup_modules_008"
echo ""
echo "To rollback, run:"
echo "  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME_COURSE -c 'BEGIN; TRUNCATE lessons CASCADE; INSERT INTO lessons SELECT * FROM _backup_lessons_008; COMMIT;'"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Run migration 010 to reseed data: ./scripts/run-migration-010.sh"
echo "  2. Update backend APIs"
echo "  3. Update frontend UI"
echo "========================================="

