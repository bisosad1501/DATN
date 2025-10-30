-- Rollback Migration 013: Restore deprecated study time fields
-- Created: 2025-10-30
-- Purpose: Restore deprecated fields if rollback is needed

-- ============================================
-- USER_DB: Restore total_study_hours
-- ============================================
\c user_db;

DO $$ 
BEGIN
    -- Check if column doesn't exist before adding
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'learning_progress' 
        AND column_name = 'total_study_hours'
    ) THEN
        ALTER TABLE learning_progress 
        ADD COLUMN total_study_hours DECIMAL(10,2) DEFAULT 0 NOT NULL;
        
        -- Recalculate from study_sessions
        UPDATE learning_progress lp
        SET total_study_hours = COALESCE((
            SELECT ROUND((SUM(duration_minutes) / 60.0)::numeric, 2)
            FROM study_sessions 
            WHERE user_id = lp.user_id
        ), 0);
        
        RAISE NOTICE '↩️  Restored learning_progress.total_study_hours (user_db)';
    ELSE
        RAISE NOTICE '⏭️  Column learning_progress.total_study_hours already exists';
    END IF;
END $$;

-- ============================================
-- COURSE_DB: Restore time_spent_minutes
-- ============================================
\c course_db;

DO $$ 
BEGIN
    -- Check if column doesn't exist before adding
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lesson_progress' 
        AND column_name = 'time_spent_minutes'
    ) THEN
        ALTER TABLE lesson_progress 
        ADD COLUMN time_spent_minutes INTEGER DEFAULT 0 NOT NULL;
        
        -- Recalculate from last_position_seconds
        UPDATE lesson_progress
        SET time_spent_minutes = ROUND(last_position_seconds / 60.0);
        
        RAISE NOTICE '↩️  Restored lesson_progress.time_spent_minutes (course_db)';
    ELSE
        RAISE NOTICE '⏭️  Column lesson_progress.time_spent_minutes already exists';
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
    
    IF col_count > 0 THEN
        RAISE NOTICE '✅ Rollback 013 verified: deprecated fields restored';
    ELSE
        RAISE EXCEPTION 'Rollback 013 failed: deprecated fields not restored';
    END IF;
END $$;

