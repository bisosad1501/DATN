#!/bin/bash

# Script để test force resync videos
# Cần admin token từ Postman hoặc login

echo "=== Force Resync All YouTube Videos ==="
echo ""
echo "Endpoint: POST /api/v1/admin/videos/force-resync-all"
echo "Auth: Requires admin role"
echo ""

# Kiểm tra current durations
echo "📊 Current video durations in database:"
docker exec ielts_postgres psql -U ielts_admin -d course_db -c \
  "SELECT video_id, title, duration_seconds, 
          CASE 
            WHEN duration_seconds >= 3600 THEN 
              (duration_seconds / 3600) || 'h ' || 
              ((duration_seconds % 3600) / 60) || 'm ' || 
              (duration_seconds % 60) || 's'
            WHEN duration_seconds >= 60 THEN 
              (duration_seconds / 60) || 'm ' || 
              (duration_seconds % 60) || 's'
            ELSE duration_seconds || 's'
          END as formatted_duration
   FROM lesson_videos 
   WHERE video_provider = 'youtube' 
   ORDER BY created_at DESC;"

echo ""
echo "🔧 To manually trigger force resync, you need to:"
echo "1. Get admin token (login as admin)"
echo "2. Call API:"
echo ""
echo "   curl -X POST http://localhost:8080/api/v1/admin/videos/force-resync-all \\"
echo "        -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \\"
echo "        -H 'Content-Type: application/json'"
echo ""
echo "Or use internal service call:"
docker exec ielts_course_service wget -q -O- --post-data='{}' \
  --header='Content-Type: application/json' \
  http://localhost:8083/api/v1/admin/videos/force-resync-all 2>/dev/null || \
  echo "⚠️  Cannot call endpoint directly (needs auth)"

echo ""
echo "💡 Alternative: Call the sync service directly from Go code or wait 24h for automatic sync"
