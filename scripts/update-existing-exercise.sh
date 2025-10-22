#!/bin/bash

# ============================================
# Update Existing Exercise with Audio
# ============================================
# Purpose: Add audio URL to existing exercise for testing
# Usage: ./scripts/update-existing-exercise.sh

set -e

echo "🔧 Updating Existing Exercise..."
echo "================================"

# Check if docker-compose is running
if ! docker-compose ps | grep -q "postgres.*Up"; then
    echo "❌ Error: PostgreSQL container is not running"
    echo "Please start the containers first: docker-compose up -d"
    exit 1
fi

# Update the existing exercise section with audio
echo "📝 Adding audio URL to existing exercise section..."
docker-compose exec -T postgres psql -U ielts_admin -d exercise_db <<EOF
-- Update the existing section with audio URL
UPDATE exercise_sections 
SET 
    audio_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    transcript = 'This is a sample audio transcript for testing purposes. In a real IELTS test, this would contain the full transcript of the listening audio.',
    instructions = '<p><strong>Listen to the audio and answer the questions.</strong></p><p>You will hear a conversation. Answer questions 1-2 based on what you hear.</p>'
WHERE exercise_id = '2302ea81-7843-4023-93e7-56c0d639cab8';

-- Check the update
SELECT 
    id,
    title,
    audio_url IS NOT NULL as has_audio,
    instructions IS NOT NULL as has_instructions
FROM exercise_sections 
WHERE exercise_id = '2302ea81-7843-4023-93e7-56c0d639cab8';
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Exercise updated successfully!"
    echo ""
    echo "🧪 You can now test:"
    echo "  1. Go to http://localhost:3000/exercises/2302ea81-7843-4023-93e7-56c0d639cab8"
    echo "  2. Start the exercise"
    echo "  3. You should see:"
    echo "     - 📋 Instructions section"
    echo "     - 🎧 Audio player"
    echo "     - 👁️ Show/Hide toggle button"
    echo ""
else
    echo ""
    echo "❌ Error: Failed to update exercise"
    exit 1
fi

