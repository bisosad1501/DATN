#!/usr/bin/env bash
# scripts/sync_youtube_durations.sh
# Finds lesson_videos with missing or zero duration_seconds and updates them using YouTube Data API v3

set -euo pipefail

# Load env
ENV_FILE="$(pwd)/.env"
if [ -f "$ENV_FILE" ]; then
  export $(grep -v '^#' "$ENV_FILE" | xargs)
fi

if [ -z "${YOUTUBE_API_KEY:-}" ]; then
  echo "YOUTUBE_API_KEY not set in .env"
  exit 1
fi

# DB connection (using docker container credentials)
PGHOST=${POSTGRES_HOST:-localhost}
PGPORT=${POSTGRES_PORT:-5432}
PGUSER=${POSTGRES_USER:-postgres}
PGDB=${POSTGRES_DB:-course_db}
PGPASSWORD=${POSTGRES_PASSWORD:-}

export PGPASSWORD="$PGPASSWORD"

# Query videos with missing duration_seconds
VIDEO_ROWS=$(psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDB" -Atc "SELECT id, video_id, video_url FROM lesson_videos WHERE duration_seconds IS NULL OR duration_seconds = 0;")

if [ -z "$VIDEO_ROWS" ]; then
  echo "No videos to update."
  exit 0
fi

IFS=$'\n'
for row in $VIDEO_ROWS; do
  IFS='|' read -r vid_id video_id video_url <<< "$row"
  echo "Processing video row id=$vid_id video_id=$video_id"

  # Call YouTube Data API to get contentDetails.duration
  if [ -n "$video_id" ]; then
    api_url="https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${video_id}&key=${YOUTUBE_API_KEY}"
  else
    # try extract video id from url
    # naive regex to extract v= param
    video_id_from_url=$(echo "$video_url" | sed -n 's/.*v=\([^&]*\).*/\1/p')
    api_url="https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${video_id_from_url}&key=${YOUTUBE_API_KEY}"
  fi

  resp=$(curl -s "$api_url")
  duration_iso=$(echo "$resp" | jq -r '.items[0].contentDetails.duration // empty')

  if [ -z "$duration_iso" ]; then
    echo "Could not get duration for video_id=${video_id} (url=${video_url})"
    continue
  fi

  # Parse ISO 8601 duration PT#H#M#S -> seconds
  # Use python for robust parsing
  seconds=$(python3 - <<PY
import isodate, sys
s='''${duration_iso}'''
try:
    d=isodate.parse_duration(s)
    print(int(d.total_seconds()))
except Exception as e:
    print(0)
PY
)

  if [ "$seconds" -le 0 ]; then
    echo "Parsed duration is 0 for ${video_id}"
    continue
  fi

  echo "Updating lesson_videos.id=$vid_id duration_seconds=$seconds"
  psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDB" -c "UPDATE lesson_videos SET duration_seconds = ${seconds} WHERE id = '${vid_id}';"
done

echo "Done."
