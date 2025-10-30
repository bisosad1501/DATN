-- Migration: Remove redundant video_watch_percentage field
-- Date: 2025-10-30
-- Description: 
--   video_watch_percentage was redundant with progress_percentage.
--   After syncing both fields to the same value, we can safely remove it.
--   progress_percentage is now the single source of truth.

-- ============================================
-- COURSE SERVICE DATABASE
-- ============================================
\c course_db;

-- Drop the redundant column from lesson_progress
ALTER TABLE lesson_progress 
DROP COLUMN IF EXISTS video_watch_percentage;

-- Verify column is removed
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'lesson_progress' 
        AND column_name = 'video_watch_percentage'
    ) THEN
        RAISE EXCEPTION 'Migration failed: video_watch_percentage column still exists';
    END IF;
    
    RAISE NOTICE '✅ Migration 011 completed: video_watch_percentage removed';
END $$;

