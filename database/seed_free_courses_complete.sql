-- ============================================
-- 4 FREE COURSES - COMPLETE WITH EXERCISES
-- ============================================
-- Purpose: Create 4 FREE courses (Listening, Reading, Writing, Speaking)
--          with complete modules, lessons, videos, and linked exercises
-- Usage: ./scripts/seed-free-courses.sh

-- ============================================
-- COURSE 1: FREE IELTS LISTENING BASICS
-- ============================================

INSERT INTO courses (
    id, title, slug, description, short_description, skill_type, level, target_band_score,
    thumbnail_url, instructor_id, instructor_name, duration_hours, total_lessons,
    enrollment_type, price, currency, is_featured, is_recommended, status, published_at
) VALUES (
    'f1111111-1111-1111-1111-111111111111',
    'IELTS Listening Basics - FREE Course',
    'ielts-listening-basics-free',
    'Start your IELTS Listening journey with this comprehensive FREE course. Learn essential strategies, practice with real audio, and build confidence for the IELTS Listening test.',
    'FREE complete guide to IELTS Listening fundamentals',
    'listening',
    'beginner',
    6.0,
    'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800',
    '00000000-0000-0000-0000-000000000001',
    'David Miller',
    6.0,
    10,
    'free',
    0.00,
    'VND',
    true,
    true,
    'published',
    NOW()
);

-- Module 1: Getting Started
INSERT INTO modules (
    id, course_id, title, description, display_order, total_lessons, duration_hours, is_published
) VALUES (
    'f1111111-1111-1111-1111-111111111101',
    'f1111111-1111-1111-1111-111111111111',
    'Module 1: Getting Started with IELTS Listening',
    'Introduction to IELTS Listening test format and basic strategies',
    1,
    5,
    3.0,
    true
);

-- Module 2: Practice & Exercises
INSERT INTO modules (
    id, course_id, title, description, display_order, total_lessons, total_exercises, duration_hours, is_published
) VALUES (
    'f1111111-1111-1111-1111-111111111102',
    'f1111111-1111-1111-1111-111111111111',
    'Module 2: Practice Exercises',
    'Hands-on practice with real IELTS Listening exercises',
    2,
    1,
    4,
    3.0,
    true
);

-- Lessons for Listening Course (Module 1 only - exercises moved to Module 2)
INSERT INTO lessons (id, module_id, course_id, title, description, content_type, duration_minutes, display_order, is_free, is_published) VALUES
('f1111111-1111-1111-1111-111111111001', 'f1111111-1111-1111-1111-111111111101', 'f1111111-1111-1111-1111-111111111111', 'Welcome to IELTS Listening', 'Course introduction and what to expect', 'video', 15, 1, true, true),
('f1111111-1111-1111-1111-111111111002', 'f1111111-1111-1111-1111-111111111101', 'f1111111-1111-1111-1111-111111111111', 'Test Format Overview', 'Understanding the 4 parts of IELTS Listening', 'video', 20, 2, true, true),
('f1111111-1111-1111-1111-111111111003', 'f1111111-1111-1111-1111-111111111101', 'f1111111-1111-1111-1111-111111111111', 'Note-Taking Strategies', 'Learn effective note-taking techniques', 'article', 25, 3, true, true),
('f1111111-1111-1111-1111-111111111004', 'f1111111-1111-1111-1111-111111111101', 'f1111111-1111-1111-1111-111111111111', 'Common Mistakes to Avoid', 'Top 10 mistakes students make', 'article', 20, 4, true, true),
('f1111111-1111-1111-1111-111111111005', 'f1111111-1111-1111-1111-111111111101', 'f1111111-1111-1111-1111-111111111111', 'Practice: Basic Listening', 'Introduction to practice exercises', 'article', 30, 5, true, true),
('f1111111-1111-1111-1111-111111111009', 'f1111111-1111-1111-1111-111111111102', 'f1111111-1111-1111-1111-111111111111', 'Review & Tips', 'Review what you learned', 'article', 15, 6, true, true);

-- NOTE: Exercise lessons removed - they are now in exercises table linked to Module 2

-- ============================================
-- COURSE 2: FREE IELTS READING BASICS
-- ============================================

INSERT INTO courses (
    id, title, slug, description, short_description, skill_type, level, target_band_score,
    thumbnail_url, instructor_id, instructor_name, duration_hours, total_lessons,
    enrollment_type, price, currency, is_featured, is_recommended, status, published_at
) VALUES (
    'f2222222-2222-2222-2222-222222222222',
    'IELTS Reading Basics - FREE Course',
    'ielts-reading-basics-free',
    'Master IELTS Reading fundamentals with this FREE course. Learn skimming, scanning, and tackle all question types with confidence.',
    'FREE complete guide to IELTS Reading fundamentals',
    'reading',
    'beginner',
    6.0,
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
    '00000000-0000-0000-0000-000000000001',
    'Emma Thompson',
    5.0,
    8,
    'free',
    0.00,
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
    'f2222222-2222-2222-2222-222222222201',
    'f2222222-2222-2222-2222-222222222222',
    'Module 1: Reading Fundamentals',
    'Essential reading skills for IELTS',
    1,
    4,
    2.5,
    true
);

-- Module 2: Practice Exercises
INSERT INTO modules (
    id, course_id, title, description, display_order, total_lessons, duration_hours, is_published
) VALUES (
    'f2222222-2222-2222-2222-222222222202',
    'f2222222-2222-2222-2222-222222222222',
    'Module 2: Practice Exercises',
    'Practice with real IELTS Reading passages',
    2,
    4,
    2.5,
    true
);

-- Lessons for Reading Course
INSERT INTO lessons (id, module_id, course_id, title, description, content_type, duration_minutes, display_order, is_free, is_published) VALUES
('f2222222-2222-2222-2222-222222222001', 'f2222222-2222-2222-2222-222222222201', 'f2222222-2222-2222-2222-222222222222', 'Introduction to IELTS Reading', 'Overview of the reading test', 'video', 15, 1, true, true),
('f2222222-2222-2222-2222-222222222002', 'f2222222-2222-2222-2222-222222222201', 'f2222222-2222-2222-2222-222222222222', 'Skimming & Scanning', 'Essential reading techniques', 'video', 25, 2, true, true),
('f2222222-2222-2222-2222-222222222003', 'f2222222-2222-2222-2222-222222222201', 'f2222222-2222-2222-2222-222222222222', 'Time Management', 'How to manage 60 minutes effectively', 'article', 20, 3, true, true),
('f2222222-2222-2222-2222-222222222004', 'f2222222-2222-2222-2222-222222222201', 'f2222222-2222-2222-2222-222222222222', 'Vocabulary Building', 'Essential academic vocabulary', 'article', 25, 4, true, true);

-- NOTE: Exercise lessons removed - they are now in exercises table linked to Module 2

-- ============================================
-- COURSE 3: FREE IELTS WRITING BASICS
-- ============================================

INSERT INTO courses (
    id, title, slug, description, short_description, skill_type, level, target_band_score,
    thumbnail_url, instructor_id, instructor_name, duration_hours, total_lessons,
    enrollment_type, price, currency, is_featured, is_recommended, status, published_at
) VALUES (
    'f3333333-3333-3333-3333-333333333333',
    'IELTS Writing Basics - FREE Course',
    'ielts-writing-basics-free',
    'Learn IELTS Writing fundamentals with this FREE course. Master Task 1 and Task 2 with clear structure, vocabulary, and grammar guidance.',
    'FREE complete guide to IELTS Writing fundamentals',
    'writing',
    'beginner',
    6.0,
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
    '00000000-0000-0000-0000-000000000001',
    'Robert Chen',
    4.5,
    7,
    'free',
    0.00,
    'VND',
    true,
    true,
    'published',
    NOW()
);

-- Module 1: Writing Fundamentals
INSERT INTO modules (
    id, course_id, title, description, display_order, total_lessons, duration_hours, is_published
) VALUES (
    'f3333333-3333-3333-3333-333333333301',
    'f3333333-3333-3333-3333-333333333333',
    'Module 1: Writing Fundamentals',
    'Essential writing skills for IELTS',
    1,
    7,
    4.5,
    true
);

-- Lessons for Writing Course
INSERT INTO lessons (id, module_id, course_id, title, description, content_type, duration_minutes, display_order, is_free, is_published) VALUES
('f3333333-3333-3333-3333-333333333001', 'f3333333-3333-3333-3333-333333333301', 'f3333333-3333-3333-3333-333333333333', 'Introduction to IELTS Writing', 'Overview of Task 1 and Task 2', 'video', 20, 1, true, true),
('f3333333-3333-3333-3333-333333333002', 'f3333333-3333-3333-3333-333333333301', 'f3333333-3333-3333-3333-333333333333', 'Task 1: Graph Description', 'How to describe graphs and charts', 'video', 30, 2, true, true),
('f3333333-3333-3333-3333-333333333003', 'f3333333-3333-3333-3333-333333333301', 'f3333333-3333-3333-3333-333333333333', 'Task 1: Model Answers', 'Study high-scoring Task 1 answers', 'article', 25, 3, true, true),
('f3333333-3333-3333-3333-333333333004', 'f3333333-3333-3333-3333-333333333301', 'f3333333-3333-3333-3333-333333333333', 'Task 2: Essay Structure', 'Learn the 4-paragraph structure', 'video', 30, 4, true, true),
('f3333333-3333-3333-3333-333333333005', 'f3333333-3333-3333-3333-333333333301', 'f3333333-3333-3333-3333-333333333333', 'Task 2: Thesis Statements', 'Writing strong thesis statements', 'article', 20, 5, true, true),
('f3333333-3333-3333-3333-333333333006', 'f3333333-3333-3333-3333-333333333301', 'f3333333-3333-3333-3333-333333333333', 'Task 2: Model Essays', 'Study high-scoring essays', 'article', 30, 6, true, true),
('f3333333-3333-3333-3333-333333333007', 'f3333333-3333-3333-3333-333333333301', 'f3333333-3333-3333-3333-333333333333', 'Common Grammar Mistakes', 'Avoid these common errors', 'article', 25, 7, true, true);

-- ============================================
-- COURSE 4: FREE IELTS SPEAKING BASICS
-- ============================================

INSERT INTO courses (
    id, title, slug, description, short_description, skill_type, level, target_band_score,
    thumbnail_url, instructor_id, instructor_name, duration_hours, total_lessons,
    enrollment_type, price, currency, is_featured, is_recommended, status, published_at
) VALUES (
    'f4444444-4444-4444-4444-444444444444',
    'IELTS Speaking Basics - FREE Course',
    'ielts-speaking-basics-free',
    'Build confidence in IELTS Speaking with this FREE course. Master all 3 parts with practice questions, model answers, and expert tips.',
    'FREE complete guide to IELTS Speaking fundamentals',
    'speaking',
    'beginner',
    6.0,
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
    '00000000-0000-0000-0000-000000000001',
    'Lisa Anderson',
    4.0,
    6,
    'free',
    0.00,
    'VND',
    true,
    true,
    'published',
    NOW()
);

-- Module 1: Speaking Fundamentals
INSERT INTO modules (
    id, course_id, title, description, display_order, total_lessons, duration_hours, is_published
) VALUES (
    'f4444444-4444-4444-4444-444444444401',
    'f4444444-4444-4444-4444-444444444444',
    'Module 1: Speaking Fundamentals',
    'Essential speaking skills for IELTS',
    1,
    6,
    4.0,
    true
);

-- Lessons for Speaking Course
INSERT INTO lessons (id, module_id, course_id, title, description, content_type, duration_minutes, display_order, is_free, is_published) VALUES
('f4444444-4444-4444-4444-444444444001', 'f4444444-4444-4444-4444-444444444401', 'f4444444-4444-4444-4444-444444444444', 'Introduction to IELTS Speaking', 'Overview of the 3 parts', 'video', 20, 1, true, true),
('f4444444-4444-4444-4444-444444444002', 'f4444444-4444-4444-4444-444444444401', 'f4444444-4444-4444-4444-444444444444', 'Part 1: Introduction Questions', 'How to answer Part 1 questions', 'video', 30, 2, true, true),
('f4444444-4444-4444-4444-444444444003', 'f4444444-4444-4444-4444-444444444401', 'f4444444-4444-4444-4444-444444444444', 'Part 1: Practice Questions', '50+ common Part 1 questions', 'article', 25, 3, true, true),
('f4444444-4444-4444-4444-444444444004', 'f4444444-4444-4444-4444-444444444401', 'f4444444-4444-4444-4444-444444444444', 'Part 2: Long Turn Strategy', 'How to speak for 2 minutes', 'video', 35, 4, true, true),
('f4444444-4444-4444-4444-444444444005', 'f4444444-4444-4444-4444-444444444401', 'f4444444-4444-4444-4444-444444444444', 'Part 3: Discussion Techniques', 'Advanced discussion strategies', 'video', 30, 5, true, true),
('f4444444-4444-4444-4444-444444444006', 'f4444444-4444-4444-4444-444444444401', 'f4444444-4444-4444-4444-444444444444', 'Pronunciation Tips', 'Improve your pronunciation', 'article', 20, 6, true, true);

-- Update counts
UPDATE courses SET total_lessons = (SELECT COUNT(*) FROM lessons WHERE course_id = courses.id) WHERE id IN ('f1111111-1111-1111-1111-111111111111', 'f2222222-2222-2222-2222-222222222222', 'f3333333-3333-3333-3333-333333333333', 'f4444444-4444-4444-4444-444444444444');
UPDATE modules SET total_lessons = (SELECT COUNT(*) FROM lessons WHERE module_id = modules.id) WHERE course_id IN ('f1111111-1111-1111-1111-111111111111', 'f2222222-2222-2222-2222-222222222222', 'f3333333-3333-3333-3333-333333333333', 'f4444444-4444-4444-4444-444444444444');

-- Success message
SELECT 
    '✅ 4 FREE courses created successfully!' as status,
    (SELECT COUNT(*) FROM courses WHERE id LIKE 'f%') as free_courses,
    (SELECT COUNT(*) FROM modules WHERE course_id LIKE 'f%') as modules,
    (SELECT COUNT(*) FROM lessons WHERE course_id LIKE 'f%') as lessons,
    (SELECT COUNT(*) FROM lessons WHERE course_id LIKE 'f%' AND content_type = 'exercise') as exercise_lessons;

