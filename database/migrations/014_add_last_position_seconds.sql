-- Migration 014: Add last_position_seconds to lesson_progress
-- Created: 2025-10-31
-- Purpose: Add column to track last watched position for resume functionality
--
-- This column is the SOURCE OF TRUTH for calculating course study time
-- from lesson_progress table (as opposed to study_sessions which requires >= 1 min delta)

\c course_db;

DO $$ 
BEGIN
    -- Check if column doesn't exist before adding
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lesson_progress' 
        AND column_name = 'last_position_seconds'
    ) THEN
        ALTER TABLE lesson_progress 
        ADD COLUMN last_position_seconds INTEGER DEFAULT 0 NOT NULL;
        
        -- Initialize existing records with video_watched_seconds as fallback
        UPDATE lesson_progress
        SET last_position_seconds = video_watched_seconds
        WHERE last_position_seconds = 0 AND video_watched_seconds > 0;
        
        RAISE NOTICE '✅ Added last_position_seconds to lesson_progress';
        RAISE NOTICE '   SOURCE OF TRUTH: For calculating course-specific study time';
    ELSE
        RAISE NOTICE '⏭️  Column last_position_seconds already exists';
    END IF;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_lesson_progress_last_position 
ON lesson_progress(user_id, last_position_seconds) 
WHERE last_position_seconds > 0;

-- Verification
DO $$
DECLARE
    col_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lesson_progress' 
        AND column_name = 'last_position_seconds'
    ) INTO col_exists;
    
    IF col_exists THEN
        RAISE NOTICE '✅ Migration 014 verified: last_position_seconds column exists';
    ELSE
        RAISE EXCEPTION 'Migration 014 failed: last_position_seconds column not found';
    END IF;
END $$;

