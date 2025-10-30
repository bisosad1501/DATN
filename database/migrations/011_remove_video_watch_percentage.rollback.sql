-- Rollback Migration 011: Re-add video_watch_percentage
-- Use this only if you need to rollback the migration

\c course_db;

-- Re-add the column
ALTER TABLE lesson_progress 
ADD COLUMN IF NOT EXISTS video_watch_percentage DECIMAL(5,2) DEFAULT 0;

-- Sync with progress_percentage (if data exists)
UPDATE lesson_progress
SET video_watch_percentage = progress_percentage
WHERE video_watch_percentage = 0 OR video_watch_percentage IS NULL;

RAISE NOTICE '⏮️  Rollback 011 completed: video_watch_percentage restored';

