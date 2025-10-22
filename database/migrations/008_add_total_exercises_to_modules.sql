-- ============================================
-- MIGRATION 008: ADD total_exercises TO MODULES
-- ============================================
-- Purpose: Thêm column total_exercises vào modules table
-- Database: course_db
-- Date: 2025-10-21
-- ============================================

-- Add total_exercises column to modules
ALTER TABLE modules ADD COLUMN IF NOT EXISTS total_exercises INT DEFAULT 0 NOT NULL;

-- Update total_exercises count for existing modules
UPDATE modules m
SET total_exercises = 0
WHERE total_exercises IS NULL;

-- Delete all lessons with content_type = 'exercise'
DELETE FROM lessons WHERE content_type = 'exercise';

-- Remove completion_criteria column from lessons (if exists)
ALTER TABLE lessons DROP COLUMN IF EXISTS completion_criteria;

-- Verify changes
DO $$
DECLARE
    module_count INT;
    lesson_count INT;
BEGIN
    SELECT COUNT(*) INTO module_count FROM modules WHERE total_exercises IS NOT NULL;
    SELECT COUNT(*) INTO lesson_count FROM lessons WHERE content_type = 'exercise';
    
    RAISE NOTICE '✅ MIGRATION 008 COMPLETE:';
    RAISE NOTICE '  - Modules with total_exercises: %', module_count;
    RAISE NOTICE '  - Exercise lessons remaining: %', lesson_count;
END $$;

