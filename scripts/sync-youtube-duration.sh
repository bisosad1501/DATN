#!/bin/bash

# Script to sync YouTube video durations from YouTube API
# This ensures all video lessons show accurate duration

set -e

echo "🎬 Syncing YouTube video durations..."

# Check if YOUTUBE_API_KEY is set
if [ -z "$YOUTUBE_API_KEY" ]; then
    echo "❌ Error: YOUTUBE_API_KEY environment variable is not set"
    echo "Please set it: export YOUTUBE_API_KEY='your-api-key'"
    exit 1
fi

echo "✅ YouTube API Key found"

# Get all YouTube videos from database
VIDEOS=$(docker exec -it ielts_postgres psql -U ielts_admin -d course_db -t -c "
    SELECT video_id 
    FROM lesson_videos 
    WHERE video_provider = 'youtube' 
    AND video_id IS NOT NULL 
    AND video_id != ''
    ORDER BY created_at DESC;
" | tr -d '\r' | xargs)

if [ -z "$VIDEOS" ]; then
    echo "⚠️  No YouTube videos found in database"
    exit 0
fi

echo "📝 Found $(echo $VIDEOS | wc -w | xargs) YouTube videos"

# Function to get duration from YouTube API
get_youtube_duration() {
    local VIDEO_ID=$1
    
    # Call YouTube Data API v3
    RESPONSE=$(curl -s "https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${VIDEO_ID}&key=${YOUTUBE_API_KEY}")
    
    # Extract duration (ISO 8601 format: PT1H20M23S)
    DURATION=$(echo "$RESPONSE" | jq -r '.items[0].contentDetails.duration // empty')
    
    if [ -z "$DURATION" ]; then
        echo "  ⚠️  Could not fetch duration for video: $VIDEO_ID"
        return 1
    fi
    
    # Convert ISO 8601 duration to seconds
    # PT1H20M23S -> 4823 seconds
    SECONDS=$(echo "$DURATION" | sed 's/PT//g' | \
        awk -F'[HMS]' '{
            hours = 0; minutes = 0; seconds = 0;
            if (NF == 4) { hours = $1; minutes = $2; seconds = $3; }
            else if (NF == 3) { 
                if (index($0, "H")) { hours = $1; minutes = $2; }
                else { minutes = $1; seconds = $2; }
            }
            else if (NF == 2) { seconds = $1; }
            print hours*3600 + minutes*60 + seconds;
        }')
    
    echo "$SECONDS"
}

# Update each video
UPDATED=0
FAILED=0

for VIDEO_ID in $VIDEOS; do
    echo "🔄 Processing: $VIDEO_ID"
    
    DURATION_SECONDS=$(get_youtube_duration "$VIDEO_ID")
    
    if [ $? -eq 0 ] && [ ! -z "$DURATION_SECONDS" ] && [ "$DURATION_SECONDS" -gt 0 ]; then
        # Update database
        docker exec -it ielts_postgres psql -U ielts_admin -d course_db -c "
            UPDATE lesson_videos 
            SET duration_seconds = $DURATION_SECONDS,
                updated_at = NOW()
            WHERE video_id = '$VIDEO_ID';
        " > /dev/null 2>&1
        
        DURATION_MINS=$((DURATION_SECONDS / 60))
        echo "  ✅ Updated: $DURATION_SECONDS seconds ($DURATION_MINS minutes)"
        ((UPDATED++))
    else
        echo "  ❌ Failed to update"
        ((FAILED++))
    fi
    
    # Rate limit: wait 0.5s between requests
    sleep 0.5
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary:"
echo "   ✅ Updated: $UPDATED videos"
echo "   ❌ Failed:  $FAILED videos"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 YouTube duration sync complete!"
