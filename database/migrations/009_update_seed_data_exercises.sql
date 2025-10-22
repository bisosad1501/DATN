-- ============================================
-- MIGRATION 009: UPDATE SEED DATA FOR EXERCISES
-- ============================================
-- Purpose: Update seed data to reflect new Lesson/Exercise separation
-- Author: System
-- Date: 2024-10-21
-- 
-- This migration updates the seed data files to:
-- 1. Remove exercise lessons from courses
-- 2. Link exercises to modules instead of lessons
-- 3. Update module metadata
-- ============================================

-- This file documents the changes needed in seed files
-- Actual seed file updates are done separately

-- ============================================
-- CHANGES NEEDED IN seed_free_courses_complete.sql
-- ============================================

-- BEFORE (lines 75-80):
-- INSERT INTO lessons (..., content_type, ..., completion_criteria) VALUES
-- ('...006', '...102', '...111', 'Exercise 1: Form Completion', ..., 'exercise', 20, 6, true, true, '{"exercise_id": "e...111", "min_score": 60}'::jsonb),
-- ('...007', '...102', '...111', 'Exercise 2: Multiple Choice', ..., 'exercise', 20, 7, true, true, '{"exercise_id": "e...112", "min_score": 60}'::jsonb),
-- ...

-- AFTER:
-- DELETE these exercise lessons - they are now standalone exercises

-- ============================================
-- CHANGES NEEDED IN seed_free_exercises.sql
-- ============================================

-- BEFORE (lines 11-14):
-- INSERT INTO exercises (
--     ..., course_id, lesson_id, ...
-- ) VALUES (
--     ..., 'f1111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111006', ...

-- AFTER:
-- INSERT INTO exercises (
--     ..., course_id, module_id, ...
-- ) VALUES (
--     ..., 'f1111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111102', ...

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check lessons (should NOT have content_type='exercise')
SELECT 
    'Lessons with exercise content_type' as check_name,
    COUNT(*) as count,
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END as status
FROM lessons 
WHERE content_type = 'exercise';

-- Check exercises (should have module_id)
SELECT 
    'Exercises without module_id' as check_name,
    COUNT(*) as count,
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'WARNING (standalone exercises OK)' END as status
FROM exercises 
WHERE module_id IS NULL AND course_id IS NOT NULL;

-- Check modules (should have correct counts)
SELECT 
    m.title,
    m.total_lessons,
    (SELECT COUNT(*) FROM lessons WHERE module_id = m.id) as actual_lessons,
    m.total_exercises,
    (SELECT COUNT(*) FROM exercises WHERE module_id = m.id) as actual_exercises
FROM modules m
ORDER BY m.course_id, m.display_order;

-- ============================================
-- SUMMARY
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'MIGRATION 009: SEED DATA UPDATE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'This migration requires manual updates to:';
    RAISE NOTICE '  1. database/seed_free_courses_complete.sql';
    RAISE NOTICE '  2. database/seed_free_exercises.sql';
    RAISE NOTICE '';
    RAISE NOTICE 'See migration file for details.';
    RAISE NOTICE '========================================';
END $$;

