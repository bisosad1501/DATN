#!/bin/bash

# Script to sync lesson duration_minutes from video duration_seconds
# This ensures lessons show accurate video length

echo "🔄 Syncing lesson durations from videos..."

# Update lessons.duration_minutes based on first video's duration_seconds
docker exec -it ielts_postgres psql -U ielts_admin -d course_db << EOF

-- Update lesson duration from video duration (convert seconds to minutes)
UPDATE lessons l
SET duration_minutes = CEIL(
  (SELECT v.duration_seconds / 60.0 
   FROM lesson_videos v 
   WHERE v.lesson_id = l.id 
   ORDER BY v.display_order 
   LIMIT 1)
)
WHERE l.content_type = 'video'
AND EXISTS (
  SELECT 1 FROM lesson_videos v 
  WHERE v.lesson_id = l.id 
  AND v.duration_seconds IS NOT NULL
);

-- Show updated lessons
SELECT 
  l.id,
  l.title,
  l.duration_minutes as lesson_duration_mins,
  v.duration_seconds as video_duration_secs,
  ROUND(v.duration_seconds / 60.0, 1) as video_duration_mins
FROM lessons l
JOIN lesson_videos v ON v.lesson_id = l.id
WHERE l.content_type = 'video'
ORDER BY l.created_at DESC
LIMIT 10;

EOF

echo "✅ Duration sync complete!"
