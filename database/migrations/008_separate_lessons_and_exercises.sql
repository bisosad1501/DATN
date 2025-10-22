-- ============================================
-- MIGRATION 008: SEPARATE LESSONS AND EXERCISES
-- ============================================
-- Purpose: Tách riêng Lesson (học) và Exercise (luyện tập)
-- Author: System
-- Date: 2024-10-21
-- 
-- CHANGES:
-- 1. Remove lesson_id from exercises table
-- 2. Add module_id to exercises table
-- 3. Remove content_type='exercise' from lessons
-- 4. Remove completion_criteria from lessons
-- 5. Update modules.total_exercises counter
--
-- ROLLBACK: See rollback section at the end
-- ============================================

-- ============================================
-- STEP 1: BACKUP EXISTING DATA
-- ============================================

-- Create backup tables
CREATE TABLE IF NOT EXISTS _backup_lessons_008 AS SELECT * FROM lessons;
CREATE TABLE IF NOT EXISTS _backup_exercises_008 AS SELECT * FROM exercises;
CREATE TABLE IF NOT EXISTS _backup_modules_008 AS SELECT * FROM modules;

-- Verify backup
DO $$
DECLARE
    lesson_count INT;
    exercise_count INT;
    module_count INT;
BEGIN
    SELECT COUNT(*) INTO lesson_count FROM _backup_lessons_008;
    SELECT COUNT(*) INTO exercise_count FROM _backup_exercises_008;
    SELECT COUNT(*) INTO module_count FROM _backup_modules_008;
    
    RAISE NOTICE 'BACKUP CREATED:';
    RAISE NOTICE '  - Lessons: % rows', lesson_count;
    RAISE NOTICE '  - Exercises: % rows', exercise_count;
    RAISE NOTICE '  - Modules: % rows', module_count;
END $$;

-- ============================================
-- STEP 2: ADD module_id TO EXERCISES
-- ============================================

-- Add column (nullable first)
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS module_id UUID;

-- Create index
CREATE INDEX IF NOT EXISTS idx_exercises_module_id ON exercises(module_id);

-- Add foreign key constraint (will be enforced after data migration)
-- ALTER TABLE exercises ADD CONSTRAINT fk_exercises_module_id 
--   FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE;

RAISE NOTICE 'STEP 2 COMPLETE: Added module_id to exercises';

-- ============================================
-- STEP 3: MIGRATE EXERCISE DATA
-- ============================================

-- Update exercises.module_id from lessons
UPDATE exercises e
SET module_id = l.module_id
FROM lessons l
WHERE l.content_type = 'exercise'
  AND l.completion_criteria IS NOT NULL
  AND l.completion_criteria->>'exercise_id' = e.id::text;

-- Verify migration
DO $$
DECLARE
    migrated_count INT;
    total_exercise_lessons INT;
BEGIN
    SELECT COUNT(*) INTO migrated_count 
    FROM exercises 
    WHERE module_id IS NOT NULL;
    
    SELECT COUNT(*) INTO total_exercise_lessons 
    FROM lessons 
    WHERE content_type = 'exercise';
    
    RAISE NOTICE 'STEP 3 COMPLETE: Migrated % exercises (from % exercise lessons)', 
                 migrated_count, total_exercise_lessons;
    
    IF migrated_count < total_exercise_lessons THEN
        RAISE WARNING 'Some exercise lessons may not have matching exercises!';
    END IF;
END $$;

-- ============================================
-- STEP 4: UPDATE MODULES.total_exercises
-- ============================================

-- Add column if not exists
ALTER TABLE modules ADD COLUMN IF NOT EXISTS total_exercises INT DEFAULT 0;

-- Update counts
UPDATE modules m
SET total_exercises = (
    SELECT COUNT(*)
    FROM exercises e
    WHERE e.module_id = m.id
);

-- Verify
DO $$
DECLARE
    modules_with_exercises INT;
BEGIN
    SELECT COUNT(*) INTO modules_with_exercises 
    FROM modules 
    WHERE total_exercises > 0;
    
    RAISE NOTICE 'STEP 4 COMPLETE: % modules have exercises', modules_with_exercises;
END $$;

-- ============================================
-- STEP 5: DELETE EXERCISE LESSONS
-- ============================================

-- Count before delete
DO $$
DECLARE
    exercise_lesson_count INT;
BEGIN
    SELECT COUNT(*) INTO exercise_lesson_count 
    FROM lessons 
    WHERE content_type = 'exercise';
    
    RAISE NOTICE 'STEP 5: Deleting % exercise lessons...', exercise_lesson_count;
END $$;

-- Delete exercise lessons
DELETE FROM lessons WHERE content_type = 'exercise';

-- Verify
DO $$
DECLARE
    remaining_exercise_lessons INT;
BEGIN
    SELECT COUNT(*) INTO remaining_exercise_lessons 
    FROM lessons 
    WHERE content_type = 'exercise';
    
    IF remaining_exercise_lessons > 0 THEN
        RAISE WARNING 'Still have % exercise lessons remaining!', remaining_exercise_lessons;
    ELSE
        RAISE NOTICE 'STEP 5 COMPLETE: All exercise lessons deleted';
    END IF;
END $$;

-- ============================================
-- STEP 6: UPDATE MODULES.total_lessons
-- ============================================

-- Recalculate total_lessons (excluding deleted exercise lessons)
UPDATE modules m
SET total_lessons = (
    SELECT COUNT(*)
    FROM lessons l
    WHERE l.module_id = m.id
);

RAISE NOTICE 'STEP 6 COMPLETE: Updated modules.total_lessons';

-- ============================================
-- STEP 7: REMOVE lesson_id FROM EXERCISES
-- ============================================

-- Drop foreign key constraint if exists
ALTER TABLE exercises DROP CONSTRAINT IF EXISTS fk_exercises_lesson_id;

-- Drop column
ALTER TABLE exercises DROP COLUMN IF EXISTS lesson_id;

RAISE NOTICE 'STEP 7 COMPLETE: Removed lesson_id from exercises';

-- ============================================
-- STEP 8: REMOVE completion_criteria FROM LESSONS
-- ============================================

-- Drop column (no longer needed)
ALTER TABLE lessons DROP COLUMN IF EXISTS completion_criteria;

RAISE NOTICE 'STEP 8 COMPLETE: Removed completion_criteria from lessons';

-- ============================================
-- STEP 9: UPDATE CONSTRAINTS
-- ============================================

-- Add foreign key constraint for exercises.module_id
ALTER TABLE exercises 
ADD CONSTRAINT fk_exercises_module_id 
FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE;

RAISE NOTICE 'STEP 9 COMPLETE: Added foreign key constraint';

-- ============================================
-- STEP 10: VERIFY FINAL STATE
-- ============================================

DO $$
DECLARE
    total_lessons INT;
    total_exercises INT;
    exercises_with_module INT;
    exercises_without_module INT;
BEGIN
    SELECT COUNT(*) INTO total_lessons FROM lessons;
    SELECT COUNT(*) INTO total_exercises FROM exercises;
    SELECT COUNT(*) INTO exercises_with_module FROM exercises WHERE module_id IS NOT NULL;
    SELECT COUNT(*) INTO exercises_without_module FROM exercises WHERE module_id IS NULL;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'MIGRATION COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Final state:';
    RAISE NOTICE '  - Total lessons: %', total_lessons;
    RAISE NOTICE '  - Total exercises: %', total_exercises;
    RAISE NOTICE '  - Exercises with module: %', exercises_with_module;
    RAISE NOTICE '  - Exercises without module (standalone): %', exercises_without_module;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Backup tables created:';
    RAISE NOTICE '  - _backup_lessons_008';
    RAISE NOTICE '  - _backup_exercises_008';
    RAISE NOTICE '  - _backup_modules_008';
    RAISE NOTICE '========================================';
END $$;

-- ============================================
-- ROLLBACK SCRIPT (IF NEEDED)
-- ============================================
-- To rollback this migration, run:
--
-- BEGIN;
-- 
-- -- Restore from backup
-- TRUNCATE lessons CASCADE;
-- TRUNCATE exercises CASCADE;
-- TRUNCATE modules CASCADE;
-- 
-- INSERT INTO lessons SELECT * FROM _backup_lessons_008;
-- INSERT INTO exercises SELECT * FROM _backup_exercises_008;
-- INSERT INTO modules SELECT * FROM _backup_modules_008;
-- 
-- -- Drop new columns
-- ALTER TABLE exercises DROP COLUMN IF EXISTS module_id;
-- ALTER TABLE modules DROP COLUMN IF EXISTS total_exercises;
-- 
-- COMMIT;
-- 
-- -- Drop backup tables
-- DROP TABLE IF EXISTS _backup_lessons_008;
-- DROP TABLE IF EXISTS _backup_exercises_008;
-- DROP TABLE IF EXISTS _backup_modules_008;
-- ============================================

