-- ============================================
-- MIGRATION 010: RESEED WITH NEW STRUCTURE
-- ============================================
-- Purpose: Clean and reseed data with new Lesson/Exercise separation
-- Author: System
-- Date: 2024-10-21
--
-- This script:
-- 1. Cleans existing data
-- 2. Reseeds courses, modules, lessons (without exercises)
-- 3. Reseeds exercises (linked to modules)
-- ============================================

-- ============================================
-- STEP 1: CLEAN EXISTING DATA
-- ============================================

TRUNCATE TABLE user_answers CASCADE;
TRUNCATE TABLE user_exercise_attempts CASCADE;
TRUNCATE TABLE question_options CASCADE;
TRUNCATE TABLE question_answers CASCADE;
TRUNCATE TABLE questions CASCADE;
TRUNCATE TABLE exercise_sections CASCADE;
TRUNCATE TABLE exercises CASCADE;
TRUNCATE TABLE lesson_progress CASCADE;
TRUNCATE TABLE lesson_videos CASCADE;
TRUNCATE TABLE lessons CASCADE;
TRUNCATE TABLE modules CASCADE;
TRUNCATE TABLE course_enrollments CASCADE;
TRUNCATE TABLE courses CASCADE;

RAISE NOTICE 'STEP 1 COMPLETE: Cleaned existing data';

-- ============================================
-- STEP 2: RESEED COURSES
-- ============================================

-- Course 1: Listening
INSERT INTO courses (
    id, title, slug, description, short_description, skill_type, level, target_band_score,
    thumbnail_url, instructor_id, instructor_name, duration_hours, total_lessons, total_videos,
    enrollment_type, price, status, is_featured, is_recommended, created_at, published_at
) VALUES (
    'f1111111-1111-1111-1111-111111111111',
    'IELTS Listening Basics - FREE',
    'ielts-listening-basics-free',
    'Master IELTS Listening with comprehensive lessons and practice exercises',
    'Free course covering all IELTS Listening fundamentals',
    'listening',
    'beginner',
    6.5,
    'https://images.unsplash.com/photo-1589903308904-1010c2294adc',
    '00000000-0000-0000-0000-000000000001',
    'IELTS Master',
    3.5,
    6,
    5,
    'free',
    0,
    'published',
    true,
    true,
    NOW(),
    NOW()
);

-- Course 2: Reading
INSERT INTO courses (
    id, title, slug, description, short_description, skill_type, level, target_band_score,
    thumbnail_url, instructor_id, instructor_name, duration_hours, total_lessons, total_videos,
    enrollment_type, price, status, is_featured, is_recommended, created_at, published_at
) VALUES (
    'f2222222-2222-2222-2222-222222222222',
    'IELTS Reading Basics - FREE',
    'ielts-reading-basics-free',
    'Improve your IELTS Reading skills with proven strategies',
    'Free course for IELTS Reading preparation',
    'reading',
    'beginner',
    6.5,
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8',
    '00000000-0000-0000-0000-000000000001',
    'IELTS Master',
    2.5,
    4,
    2,
    'free',
    0,
    'published',
    true,
    true,
    NOW(),
    NOW()
);

RAISE NOTICE 'STEP 2 COMPLETE: Reseeded courses';

-- ============================================
-- STEP 3: RESEED MODULES
-- ============================================

-- Listening Course Modules
INSERT INTO modules (id, course_id, title, description, display_order, total_lessons, total_exercises, duration_hours, is_published) VALUES
('f1111111-1111-1111-1111-111111111101', 'f1111111-1111-1111-1111-111111111111', 'Module 1: Getting Started', 'Introduction to IELTS Listening', 1, 5, 0, 1.75, true),
('f1111111-1111-1111-1111-111111111102', 'f1111111-1111-1111-1111-111111111111', 'Module 2: Practice Exercises', 'Hands-on practice with real IELTS Listening exercises', 2, 1, 4, 1.75, true);

-- Reading Course Modules
INSERT INTO modules (id, course_id, title, description, display_order, total_lessons, total_exercises, duration_hours, is_published) VALUES
('f2222222-2222-2222-2222-222222222201', 'f2222222-2222-2222-2222-222222222222', 'Module 1: Reading Fundamentals', 'Essential reading skills and strategies', 1, 4, 0, 1.5, true),
('f2222222-2222-2222-2222-222222222202', 'f2222222-2222-2222-2222-222222222222', 'Module 2: Practice Exercises', 'Practice with real IELTS Reading passages', 2, 0, 4, 1.0, true);

RAISE NOTICE 'STEP 3 COMPLETE: Reseeded modules';

-- ============================================
-- STEP 4: RESEED LESSONS (NO EXERCISES)
-- ============================================

-- Listening Course Lessons
INSERT INTO lessons (id, module_id, course_id, title, description, content_type, duration_minutes, display_order, is_free, is_published) VALUES
('f1111111-1111-1111-1111-111111111001', 'f1111111-1111-1111-1111-111111111101', 'f1111111-1111-1111-1111-111111111111', 'Welcome to IELTS Listening', 'Course introduction and what to expect', 'video', 15, 1, true, true),
('f1111111-1111-1111-1111-111111111002', 'f1111111-1111-1111-1111-111111111101', 'f1111111-1111-1111-1111-111111111111', 'Test Format Overview', 'Understanding the 4 parts of IELTS Listening', 'video', 20, 2, true, true),
('f1111111-1111-1111-1111-111111111003', 'f1111111-1111-1111-1111-111111111101', 'f1111111-1111-1111-1111-111111111111', 'Note-Taking Strategies', 'Learn effective note-taking techniques', 'article', 25, 3, true, true),
('f1111111-1111-1111-1111-111111111004', 'f1111111-1111-1111-1111-111111111101', 'f1111111-1111-1111-1111-111111111111', 'Common Mistakes to Avoid', 'Top 10 mistakes students make', 'article', 20, 4, true, true),
('f1111111-1111-1111-1111-111111111005', 'f1111111-1111-1111-1111-111111111101', 'f1111111-1111-1111-1111-111111111111', 'Practice: Basic Listening', 'Introduction to practice exercises', 'article', 30, 5, true, true),
('f1111111-1111-1111-1111-111111111009', 'f1111111-1111-1111-1111-111111111102', 'f1111111-1111-1111-1111-111111111111', 'Review & Tips', 'Review what you learned', 'article', 15, 6, true, true);

-- Reading Course Lessons
INSERT INTO lessons (id, module_id, course_id, title, description, content_type, duration_minutes, display_order, is_free, is_published) VALUES
('f2222222-2222-2222-2222-222222222001', 'f2222222-2222-2222-2222-222222222201', 'f2222222-2222-2222-2222-222222222222', 'Introduction to IELTS Reading', 'Overview of the reading test', 'video', 15, 1, true, true),
('f2222222-2222-2222-2222-222222222002', 'f2222222-2222-2222-2222-222222222201', 'f2222222-2222-2222-2222-222222222222', 'Skimming & Scanning', 'Essential reading techniques', 'video', 25, 2, true, true),
('f2222222-2222-2222-2222-222222222003', 'f2222222-2222-2222-2222-222222222201', 'f2222222-2222-2222-2222-222222222222', 'Time Management', 'How to manage 60 minutes effectively', 'article', 20, 3, true, true),
('f2222222-2222-2222-2222-222222222004', 'f2222222-2222-2222-2222-222222222201', 'f2222222-2222-2222-2222-222222222222', 'Vocabulary Building', 'Essential academic vocabulary', 'article', 25, 4, true, true);

RAISE NOTICE 'STEP 4 COMPLETE: Reseeded lessons';

-- ============================================
-- STEP 5: RESEED EXERCISES (LINKED TO MODULES)
-- ============================================

-- NOTE: Exercise details (sections, questions, answers) will be seeded separately
-- This just creates the exercise records linked to modules

-- Listening Exercises (Module 2)
INSERT INTO exercises (
    id, title, slug, description, exercise_type, skill_type, difficulty, ielts_level,
    total_questions, total_sections, time_limit_minutes, passing_score, total_points,
    is_free, is_published, course_id, module_id, created_by, published_at, display_order
) VALUES
('e1111111-1111-1111-1111-111111111111', 'Exercise 1: Form Completion', 'listening-ex1-form-completion', 'Practice filling in forms with personal information', 'practice', 'listening', 'easy', 'band 5.0-6.0', 5, 1, 10, 60.00, 5.00, true, true, 'f1111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111102', '00000000-0000-0000-0000-000000000001', NOW(), 1),
('e1111111-1111-1111-1111-111111111112', 'Exercise 2: Multiple Choice', 'listening-ex2-multiple-choice', 'Practice answering multiple choice questions', 'practice', 'listening', 'easy', 'band 5.0-6.0', 5, 1, 10, 60.00, 5.00, true, true, 'f1111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111102', '00000000-0000-0000-0000-000000000001', NOW(), 2),
('e1111111-1111-1111-1111-111111111113', 'Exercise 3: Map Labeling', 'listening-ex3-map-labeling', 'Practice labeling maps and diagrams', 'practice', 'listening', 'medium', 'band 6.0-7.0', 5, 1, 15, 60.00, 5.00, true, true, 'f1111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111102', '00000000-0000-0000-0000-000000000001', NOW(), 3),
('e1111111-1111-1111-1111-111111111114', 'Final Practice Test', 'listening-final-practice-test', 'Complete practice test covering all question types', 'mock_test', 'listening', 'medium', 'band 6.0-7.0', 10, 2, 20, 70.00, 10.00, true, true, 'f1111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111102', '00000000-0000-0000-0000-000000000001', NOW(), 4);

-- Reading Exercises (Module 2)
INSERT INTO exercises (
    id, title, slug, description, exercise_type, skill_type, difficulty, ielts_level,
    total_questions, total_sections, time_limit_minutes, passing_score, total_points,
    is_free, is_published, course_id, module_id, created_by, published_at, display_order
) VALUES
('e2222222-2222-2222-2222-222222222221', 'Exercise 1: True/False/Not Given', 'reading-ex1-tfng', 'Master this tricky question type', 'practice', 'reading', 'easy', 'band 5.0-6.0', 5, 1, 15, 60.00, 5.00, true, true, 'f2222222-2222-2222-2222-222222222222', 'f2222222-2222-2222-2222-222222222202', '00000000-0000-0000-0000-000000000001', NOW(), 1),
('e2222222-2222-2222-2222-222222222222', 'Exercise 2: Matching Headings', 'reading-ex2-matching-headings', 'Practice matching paragraphs to headings', 'practice', 'reading', 'medium', 'band 6.0-7.0', 5, 1, 15, 60.00, 5.00, true, true, 'f2222222-2222-2222-2222-222222222222', 'f2222222-2222-2222-2222-222222222202', '00000000-0000-0000-0000-000000000001', NOW(), 2),
('e2222222-2222-2222-2222-222222222223', 'Exercise 3: Summary Completion', 'reading-ex3-summary-completion', 'Fill in the blanks practice', 'practice', 'reading', 'medium', 'band 6.0-7.0', 5, 1, 15, 60.00, 5.00, true, true, 'f2222222-2222-2222-2222-222222222222', 'f2222222-2222-2222-2222-222222222202', '00000000-0000-0000-0000-000000000001', NOW(), 3),
('e2222222-2222-2222-2222-222222222224', 'Full Practice Test', 'reading-full-practice-test', 'Complete reading test with 3 passages', 'mock_test', 'reading', 'medium', 'band 6.0-7.0', 15, 3, 60, 70.00, 15.00, true, true, 'f2222222-2222-2222-2222-222222222222', 'f2222222-2222-2222-2222-222222222202', '00000000-0000-0000-0000-000000000001', NOW(), 4);

RAISE NOTICE 'STEP 5 COMPLETE: Reseeded exercises';

-- ============================================
-- STEP 6: VERIFY
-- ============================================

DO $$
DECLARE
    course_count INT;
    module_count INT;
    lesson_count INT;
    exercise_count INT;
BEGIN
    SELECT COUNT(*) INTO course_count FROM courses;
    SELECT COUNT(*) INTO module_count FROM modules;
    SELECT COUNT(*) INTO lesson_count FROM lessons;
    SELECT COUNT(*) INTO exercise_count FROM exercises;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RESEED COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Data summary:';
    RAISE NOTICE '  - Courses: %', course_count;
    RAISE NOTICE '  - Modules: %', module_count;
    RAISE NOTICE '  - Lessons: %', lesson_count;
    RAISE NOTICE '  - Exercises: %', exercise_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Run seed_free_exercises.sql for exercise details';
    RAISE NOTICE '  2. Update backend APIs';
    RAISE NOTICE '  3. Update frontend UI';
    RAISE NOTICE '========================================';
END $$;

