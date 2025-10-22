-- ============================================
-- MORE SAMPLE COURSES FOR BETTER DEMO
-- ============================================
-- Purpose: Add diverse courses for all skills (Reading, Writing, Speaking)
-- Usage: ./scripts/seed-more-courses.sh

-- ============================================
-- COURSE 2: IELTS Reading Mastery
-- ============================================

INSERT INTO courses (
    id, title, slug, description, short_description, skill_type, level, target_band_score,
    thumbnail_url, instructor_id, instructor_name, duration_hours, total_lessons,
    enrollment_type, price, currency, is_featured, is_recommended, status, published_at
) VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'IELTS Reading Mastery - Academic Module',
    'ielts-reading-mastery-academic',
    'Master IELTS Academic Reading with proven strategies, practice passages, and expert tips. Learn to tackle all question types including True/False/Not Given, Matching Headings, and Summary Completion.',
    'Complete guide to IELTS Academic Reading with 40+ practice passages',
    'reading',
    'intermediate',
    7.0,
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
    '00000000-0000-0000-0000-000000000001',
    'Sarah Johnson',
    10.0,
    15,
    'premium',
    89.99,
    'VND',
    true,
    true,
    'published',
    NOW()
);

-- Module 1: Reading Fundamentals
INSERT INTO modules (
    id, course_id, title, description, display_order, total_lessons, duration_hours, is_published
) VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Module 1: Reading Fundamentals',
    'Build strong foundation in IELTS Reading skills',
    1,
    5,
    3.0,
    true
);

-- Module 2: Question Types Mastery
INSERT INTO modules (
    id, course_id, title, description, display_order, total_lessons, duration_hours, is_published
) VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Module 2: Question Types Mastery',
    'Master all IELTS Reading question types',
    2,
    6,
    4.0,
    true
);

-- Module 3: Practice Tests
INSERT INTO modules (
    id, course_id, title, description, display_order, total_lessons, duration_hours, is_published
) VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Module 3: Full Practice Tests',
    'Complete IELTS Reading practice tests',
    3,
    4,
    3.0,
    true
);

-- Lessons for Reading Course
INSERT INTO lessons (id, module_id, course_id, title, description, content_type, duration_minutes, display_order, is_free, is_published) VALUES
('bbbbbbbb-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Introduction to IELTS Reading', 'Overview of IELTS Reading test format and scoring', 'video', 20, 1, true, true),
('bbbbbbbb-1111-1111-1111-111111111112', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Skimming and Scanning Techniques', 'Learn essential reading strategies', 'video', 25, 2, true, true),
('bbbbbbbb-1111-1111-1111-111111111113', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Time Management Tips', 'How to manage your 60 minutes effectively', 'article', 15, 3, false, true),
('bbbbbbbb-1111-1111-1111-111111111114', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Vocabulary Building', 'Essential academic vocabulary for IELTS', 'article', 30, 4, false, true),
('bbbbbbbb-1111-1111-1111-111111111115', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Practice: Basic Reading', 'Apply what you learned', 'exercise', 30, 5, false, true);

INSERT INTO lessons (id, module_id, course_id, title, description, content_type, duration_minutes, display_order, is_free, is_published) VALUES
('bbbbbbbb-2222-2222-2222-222222222221', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'True/False/Not Given Questions', 'Master this tricky question type', 'video', 30, 6, false, true),
('bbbbbbbb-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Matching Headings', 'Learn to match paragraphs with headings', 'video', 25, 7, false, true),
('bbbbbbbb-2222-2222-2222-222222222223', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Summary Completion', 'Fill in the blanks effectively', 'video', 20, 8, false, true),
('bbbbbbbb-2222-2222-2222-222222222224', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Multiple Choice Strategies', 'Choose the right answer confidently', 'article', 20, 9, false, true),
('bbbbbbbb-2222-2222-2222-222222222225', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Practice: Question Types', 'Mixed question types practice', 'exercise', 40, 10, false, true),
('bbbbbbbb-2222-2222-2222-222222222226', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Common Mistakes to Avoid', 'Learn from others mistakes', 'article', 15, 11, false, true);

INSERT INTO lessons (id, module_id, course_id, title, description, content_type, duration_minutes, display_order, is_free, is_published) VALUES
('bbbbbbbb-3333-3333-3333-333333333331', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Full Practice Test 1', 'Complete reading test under timed conditions', 'exercise', 60, 12, false, true),
('bbbbbbbb-3333-3333-3333-333333333332', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Test 1 Review and Analysis', 'Detailed explanation of all answers', 'video', 45, 13, false, true),
('bbbbbbbb-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Full Practice Test 2', 'Second complete reading test', 'exercise', 60, 14, false, true),
('bbbbbbbb-3333-3333-3333-333333333334', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Test 2 Review and Final Tips', 'Final review and exam day strategies', 'video', 40, 15, false, true);

-- Videos for Reading Course
INSERT INTO lesson_videos (id, lesson_id, title, video_url, video_provider, video_id, duration_seconds, thumbnail_url, display_order) VALUES
('bbbbbbbb-v111-v111-v111-v11111111111', 'bbbbbbbb-1111-1111-1111-111111111111', 'IELTS Reading Introduction', 'https://www.youtube.com/watch?v=OPBd86A1Rfo', 'youtube', 'OPBd86A1Rfo', 379, 'https://i.ytimg.com/vi/OPBd86A1Rfo/maxresdefault.jpg', 1);

-- ============================================
-- COURSE 3: IELTS Writing Task 2 Mastery
-- ============================================

INSERT INTO courses (
    id, title, slug, description, short_description, skill_type, level, target_band_score,
    thumbnail_url, instructor_id, instructor_name, duration_hours, total_lessons,
    enrollment_type, price, currency, is_featured, is_recommended, status, published_at
) VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'IELTS Writing Task 2 Mastery',
    'ielts-writing-task-2-mastery',
    'Master IELTS Writing Task 2 with expert guidance on essay structure, vocabulary, grammar, and coherence. Learn to write high-scoring essays on any topic.',
    'Complete guide to IELTS Writing Task 2 with 50+ model essays',
    'writing',
    'advanced',
    7.5,
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
    '00000000-0000-0000-0000-000000000001',
    'Michael Chen',
    12.0,
    18,
    'premium',
    99.99,
    'VND',
    true,
    false,
    'published',
    NOW()
);

-- Module 1: Essay Structure
INSERT INTO modules (
    id, course_id, title, description, display_order, total_lessons, duration_hours, is_published
) VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccc01',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Module 1: Essay Structure & Planning',
    'Learn how to structure and plan your essays',
    1,
    6,
    4.0,
    true
);

-- Lessons for Writing Course (simplified)
INSERT INTO lessons (id, module_id, course_id, title, description, content_type, duration_minutes, display_order, is_free, is_published) VALUES
('cccccccc-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccc01', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Introduction to Task 2', 'Understanding the task requirements', 'video', 25, 1, true, true),
('cccccccc-1111-1111-1111-111111111112', 'cccccccc-cccc-cccc-cccc-cccccccccc01', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Essay Structure Basics', 'Introduction, body, conclusion', 'video', 30, 2, true, true),
('cccccccc-1111-1111-1111-111111111113', 'cccccccc-cccc-cccc-cccc-cccccccccc01', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Planning Your Essay', 'How to plan in 5 minutes', 'article', 20, 3, false, true),
('cccccccc-1111-1111-1111-111111111114', 'cccccccc-cccc-cccc-cccc-cccccccccc01', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Thesis Statements', 'Writing strong thesis statements', 'video', 25, 4, false, true),
('cccccccc-1111-1111-1111-111111111115', 'cccccccc-cccc-cccc-cccc-cccccccccc01', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Topic Sentences', 'Crafting effective topic sentences', 'article', 20, 5, false, true),
('cccccccc-1111-1111-1111-111111111116', 'cccccccc-cccc-cccc-cccc-cccccccccc01', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Practice: Structure Analysis', 'Analyze model essays', 'article', 30, 6, false, true);

-- ============================================
-- COURSE 4: IELTS Speaking Confidence
-- ============================================

INSERT INTO courses (
    id, title, slug, description, short_description, skill_type, level, target_band_score,
    thumbnail_url, instructor_id, instructor_name, duration_hours, total_lessons,
    enrollment_type, price, currency, is_featured, is_recommended, status, published_at
) VALUES (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'IELTS Speaking Confidence Builder',
    'ielts-speaking-confidence-builder',
    'Build confidence and fluency in IELTS Speaking. Master all 3 parts with practice questions, model answers, and expert feedback.',
    'Boost your speaking confidence with 100+ practice questions',
    'speaking',
    'beginner',
    6.5,
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
    '00000000-0000-0000-0000-000000000001',
    'Emma Wilson',
    8.0,
    12,
    'free',
    0.00,
    'VND',
    true,
    true,
    'published',
    NOW()
);

-- Module 1: Speaking Basics
INSERT INTO modules (
    id, course_id, title, description, display_order, total_lessons, duration_hours, is_published
) VALUES (
    'dddddddd-dddd-dddd-dddd-dddddddddd01',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'Module 1: Speaking Fundamentals',
    'Build your speaking foundation',
    1,
    4,
    2.5,
    true
);

-- Lessons for Speaking Course
INSERT INTO lessons (id, module_id, course_id, title, description, content_type, duration_minutes, display_order, is_free, is_published) VALUES
('dddddddd-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddd01', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Welcome to Speaking Course', 'Course overview and expectations', 'video', 15, 1, true, true),
('dddddddd-1111-1111-1111-111111111112', 'dddddddd-dddd-dddd-dddd-dddddddddd01', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Part 1: Introduction Questions', 'Master Part 1 questions', 'video', 30, 2, true, true),
('dddddddd-1111-1111-1111-111111111113', 'dddddddd-dddd-dddd-dddd-dddddddddd01', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Part 2: Long Turn', 'How to speak for 2 minutes', 'video', 35, 3, true, true),
('dddddddd-1111-1111-1111-111111111114', 'dddddddd-dddd-dddd-dddd-dddddddddd01', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Part 3: Discussion', 'Advanced discussion techniques', 'video', 30, 4, true, true);

-- Update counts
UPDATE courses SET total_lessons = (SELECT COUNT(*) FROM lessons WHERE course_id = courses.id) WHERE id IN ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'dddddddd-dddd-dddd-dddd-dddddddddddd');
UPDATE modules SET total_lessons = (SELECT COUNT(*) FROM lessons WHERE module_id = modules.id) WHERE course_id IN ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'dddddddd-dddd-dddd-dddd-dddddddddddd');

-- Success message
SELECT 
    'More courses inserted successfully!' as status,
    (SELECT COUNT(*) FROM courses WHERE id IN ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'dddddddd-dddd-dddd-dddd-dddddddddddd')) as new_courses,
    (SELECT COUNT(*) FROM modules WHERE course_id IN ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'dddddddd-dddd-dddd-dddd-dddddddddddd')) as new_modules,
    (SELECT COUNT(*) FROM lessons WHERE course_id IN ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'dddddddd-dddd-dddd-dddd-dddddddddddd')) as new_lessons;

