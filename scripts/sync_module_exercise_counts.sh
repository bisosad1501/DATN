#!/bin/bash

# ============================================
# SYNC MODULE EXERCISE COUNTS
# ============================================
# Purpose: Update total_exercises in modules table based on actual exercises
# Database: course_db (modules) + exercise_db (exercises)
# ============================================

echo "🔄 Syncing module exercise counts..."

# Get all module IDs and their exercise counts from exercise_db
EXERCISE_COUNTS=$(docker exec -i ielts_postgres psql -U ielts_admin -d exercise_db -t -A -F'|' << 'EOF'
SELECT 
    module_id,
    COUNT(*) as exercise_count
FROM exercises
WHERE module_id IS NOT NULL
  AND is_published = true
GROUP BY module_id;
EOF
)

# Update each module in course_db
echo "$EXERCISE_COUNTS" | while IFS='|' read -r module_id count; do
    if [ -n "$module_id" ] && [ -n "$count" ]; then
        echo "  Updating module $module_id: $count exercises"
        docker exec -i ielts_postgres psql -U ielts_admin -d course_db -c \
            "UPDATE modules SET total_exercises = $count WHERE id = '$module_id';"
    fi
done

# Reset modules with no exercises
docker exec -i ielts_postgres psql -U ielts_admin -d course_db << 'EOF'
UPDATE modules
SET total_exercises = 0
WHERE id NOT IN (
    SELECT DISTINCT module_id
    FROM dblink('dbname=exercise_db user=ielts_admin password=ielts_password_2025',
                'SELECT module_id FROM exercises WHERE module_id IS NOT NULL AND is_published = true')
    AS t(module_id UUID)
)
AND total_exercises > 0;
EOF

echo ""
echo "✅ Sync completed!"
echo ""

# Verify
echo "📊 Verification:"
docker exec -i ielts_postgres psql -U ielts_admin -d course_db << 'EOF'
SELECT 
    c.title as course,
    m.title as module,
    m.total_lessons,
    m.total_exercises
FROM modules m
JOIN courses c ON c.id = m.course_id
WHERE c.id IN (
    'f1111111-1111-1111-1111-111111111111',
    'f2222222-2222-2222-2222-222222222222'
)
ORDER BY c.title, m.display_order;
EOF

