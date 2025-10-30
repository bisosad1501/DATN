-- Migration 013: Remove deprecated study time fields
-- Created: 2025-10-30
-- Purpose: Clean up deprecated fields that are not source of truth
--
-- DEPRECATED FIELDS TO REMOVE:
-- 1. learning_progress.total_study_hours (user_db) - replaced by real-time calc from study_sessions
-- 2. lesson_progress.time_spent_minutes (course_db) - replaced by real-time calc from last_position_seconds

-- ============================================
-- USER_DB: Remove total_study_hours
-- ============================================
\c user_db;

DO $$ 
BEGIN
    -- Check if column exists before dropping
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'learning_progress' 
        AND column_name = 'total_study_hours'
    ) THEN
        ALTER TABLE learning_progress 
        DROP COLUMN total_study_hours;
        
        RAISE NOTICE '✅ Removed learning_progress.total_study_hours (user_db)';
        RAISE NOTICE '   SOURCE OF TRUTH: Calculate real-time from study_sessions';
    ELSE
        RAISE NOTICE '⏭️  Column learning_progress.total_study_hours already removed';
    END IF;
END $$;

-- ============================================
-- COURSE_DB: Remove time_spent_minutes
-- ============================================
\c course_db;

DO $$ 
BEGIN
    -- Check if column exists before dropping
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lesson_progress' 
        AND column_name = 'time_spent_minutes'
    ) THEN
        ALTER TABLE lesson_progress 
        DROP COLUMN time_spent_minutes;
        
        RAISE NOTICE '✅ Removed lesson_progress.time_spent_minutes (course_db)';
        RAISE NOTICE '   SOURCE OF TRUTH: Calculate from last_position_seconds';
    ELSE
        RAISE NOTICE '⏭️  Column lesson_progress.time_spent_minutes already removed';
    END IF;
END $$;

-- ============================================
-- VERIFICATION
-- ============================================
\c user_db;
DO $$ 
DECLARE
    col_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns 
    WHERE table_name = 'learning_progress' 
    AND column_name = 'total_study_hours';
    
    IF col_count = 0 THEN
        RAISE NOTICE '✅ Migration 013 verified: deprecated fields removed successfully';
    ELSE
        RAISE EXCEPTION 'Migration 013 failed: deprecated fields still exist';
    END IF;
END $$;

