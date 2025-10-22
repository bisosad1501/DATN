#!/bin/bash

# ============================================
# UPDATE SEED EXERCISES SCRIPT
# ============================================
# Purpose: Update seed_free_exercises.sql to use module_id instead of lesson_id
# Usage: ./scripts/update-seed-exercises.sh
# ============================================

set -e

SEED_FILE="database/seed_free_exercises.sql"
BACKUP_FILE="database/seed_free_exercises.sql.backup"

echo "========================================="
echo "UPDATE SEED EXERCISES"
echo "========================================="

# Backup original file
echo "Creating backup..."
cp "$SEED_FILE" "$BACKUP_FILE"
echo "✓ Backup created: $BACKUP_FILE"

# Replace lesson_id with module_id in column definitions
echo "Updating column definitions..."
sed -i.tmp 's/course_id, lesson_id, created_by/course_id, module_id, created_by, display_order/g' "$SEED_FILE"

# Update specific lesson_id values to module_id values
echo "Updating exercise 1 (Listening)..."
sed -i.tmp "s/'f1111111-1111-1111-1111-111111111006'/'f1111111-1111-1111-1111-111111111102', 1/g" "$SEED_FILE"

echo "Updating exercise 2 (Listening)..."
sed -i.tmp "s/'f1111111-1111-1111-1111-111111111007'/'f1111111-1111-1111-1111-111111111102', 2/g" "$SEED_FILE"

echo "Updating exercise 3 (Listening)..."
sed -i.tmp "s/'f1111111-1111-1111-1111-111111111008'/'f1111111-1111-1111-1111-111111111102', 3/g" "$SEED_FILE"

echo "Updating exercise 4 (Listening - Final Test)..."
sed -i.tmp "s/'f1111111-1111-1111-1111-111111111010'/'f1111111-1111-1111-1111-111111111102', 4/g" "$SEED_FILE"

echo "Updating exercise 1 (Reading)..."
sed -i.tmp "s/'f2222222-2222-2222-2222-222222222005'/'f2222222-2222-2222-2222-222222222202', 1/g" "$SEED_FILE"

echo "Updating exercise 2 (Reading)..."
sed -i.tmp "s/'f2222222-2222-2222-2222-222222222006'/'f2222222-2222-2222-2222-222222222202', 2/g" "$SEED_FILE"

echo "Updating exercise 3 (Reading)..."
sed -i.tmp "s/'f2222222-2222-2222-2222-222222222007'/'f2222222-2222-2222-2222-222222222202', 3/g" "$SEED_FILE"

echo "Updating exercise 4 (Reading - Full Test)..."
sed -i.tmp "s/'f2222222-2222-2222-2222-222222222008'/'f2222222-2222-2222-2222-222222222202', 4/g" "$SEED_FILE"

# Clean up temp files
rm -f "$SEED_FILE.tmp"

echo "========================================="
echo "✓ UPDATE COMPLETE!"
echo "========================================="
echo "Changes made:"
echo "  - Replaced lesson_id with module_id"
echo "  - Added display_order column"
echo "  - Updated all exercise references"
echo ""
echo "Backup saved to: $BACKUP_FILE"
echo "========================================="

