#!/bin/bash

# Script to manually sync lesson durations from video durations
# This simulates what the auto-sync logic should do

echo "🔄 Manually syncing lesson durations from video durations..."
echo ""

# Update all lessons that have videos - set duration_minutes from video duration_seconds
docker exec -i ielts_postgres psql -U ielts_admin -d course_db <<EOF
-- Update lesson duration_minutes from video duration_seconds (first video of each lesson)
UPDATE lessons l
SET duration_minutes = CEIL(v.duration_seconds::float / 60),
    updated_at = NOW()
FROM (
    SELECT DISTINCT ON (lesson_id) lesson_id, duration_seconds
    FROM lesson_videos
    WHERE duration_seconds > 0
    ORDER BY lesson_id, display_order
) v
WHERE l.id = v.lesson_id;

-- Show results
SELECT COUNT(*) as lessons_updated FROM lessons WHERE updated_at > NOW() - INTERVAL '1 second';

-- Show sample of synced lessons
SELECT 
    l.title,
    l.duration_minutes as new_duration,
    v.duration_seconds,
    CEIL(v.duration_seconds::float / 60) as calculated
FROM lessons l
JOIN lesson_videos v ON l.id = v.lesson_id
WHERE v.video_id IN ('Y59vZ_n-4Bk', 'OPBd86A1Rfo', 'eW4AM1539-g', 'BWf-eARnf6U')
ORDER BY l.updated_at DESC
LIMIT 10;
EOF

echo ""
echo "✅ Done! Lesson durations have been synced from video durations."
