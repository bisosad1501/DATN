-- ============================================
-- COMPLETE SAMPLE DATA - COURSE & EXERCISE RELATIONSHIPS
-- ============================================
-- Purpose: Demonstrate full relationships between Course, Module, Lesson, Video, and Exercise
-- Usage: ./scripts/seed-complete-relationships.sh

-- ============================================
-- 1. CREATE COMPLETE COURSE WITH MODULES & LESSONS
-- ============================================

-- Course: IELTS Listening Mastery
INSERT INTO courses (
    id, title, slug, description, skill_type, level,
    price, enrollment_type, instructor_id, instructor_name,
    total_lessons, duration_hours, is_featured, is_recommended, status, published_at
) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'IELTS Listening Mastery - Complete Course',
    'ielts-listening-mastery-complete',
    'Master IELTS Listening with comprehensive lessons, practice exercises, and mock tests. This course covers all 4 parts of IELTS Listening with detailed strategies and real practice materials.',
    'listening',
    'intermediate',
    99.99,
    'premium',
    '00000000-0000-0000-0000-000000000001', -- Replace with actual instructor ID
    'John Smith',
    12,
    8.5,
    true,
    true,
    'published',
    NOW()
);

-- Module 1: Introduction & Basic Skills
INSERT INTO modules (
    id, course_id, title, description, display_order, total_lessons, duration_hours
) VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Module 1: Introduction & Basic Skills',
    'Learn the fundamentals of IELTS Listening and develop essential skills',
    1,
    4,
    2.5
);

-- Module 2: Advanced Techniques
INSERT INTO modules (
    id, course_id, title, description, display_order, total_lessons, duration_hours
) VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Module 2: Advanced Techniques & Practice',
    'Master advanced listening strategies and practice with real IELTS exercises',
    2,
    4,
    3.0
);

-- Module 3: Mock Tests
INSERT INTO modules (
    id, course_id, title, description, display_order, total_lessons, duration_hours
) VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Module 3: Full Mock Tests',
    'Complete IELTS Listening mock tests with detailed explanations',
    3,
    4,
    3.0
);

-- ============================================
-- 2. LESSONS - Module 1 (Introduction)
-- ============================================

-- Lesson 1: Video Introduction
INSERT INTO lessons (
    id, module_id, course_id, title, description, content_type,
    duration_minutes, display_order, is_free, is_published
) VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccc01',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Welcome to IELTS Listening',
    'Introduction to the course structure and what you will learn',
    'video',
    15,
    1,
    true,
    true
);

-- Lesson 2: Article - Understanding IELTS Format
INSERT INTO lessons (
    id, module_id, course_id, title, description, content_type,
    duration_minutes, display_order, is_free, is_published
) VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccc02',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Understanding IELTS Listening Format',
    '<h2>IELTS Listening Test Format</h2><p>The IELTS Listening test consists of 4 sections with 10 questions each, totaling 40 questions.</p><h3>Section 1: Social Conversation</h3><p>A conversation between two people in a social context (e.g., booking a hotel, asking for directions).</p><h3>Section 2: Monologue</h3><p>A monologue in a social context (e.g., a speech about local facilities, tour guide).</p><h3>Section 3: Academic Discussion</h3><p>A conversation between up to 4 people in an educational context (e.g., university tutorial).</p><h3>Section 4: Academic Lecture</h3><p>A monologue on an academic subject (e.g., university lecture).</p>',
    'article',
    20,
    2,
    true,
    true
);

-- Lesson 3: Video - Key Strategies
INSERT INTO lessons (
    id, module_id, course_id, title, description, content_type,
    duration_minutes, display_order, is_free, is_published
) VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccc03',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Essential Listening Strategies',
    'Learn proven strategies to improve your IELTS Listening score',
    'video',
    25,
    3,
    false,
    true
);

-- Lesson 4: Practice Exercise (LINKED TO EXERCISE)
-- Note: exercise_id stored in completion_criteria JSONB
INSERT INTO lessons (
    id, module_id, course_id, title, description, content_type,
    completion_criteria, duration_minutes, display_order, is_free, is_published
) VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccc04',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Practice Exercise: Basic Listening',
    'Apply what you learned with this practice exercise. Exercise ID: 11111111-1111-1111-1111-111111111111',
    'exercise',
    '{"exercise_id": "11111111-1111-1111-1111-111111111111", "min_score": 60}'::jsonb,
    30,
    4,
    false,
    true
);

-- ============================================
-- 3. LESSONS - Module 2 (Advanced)
-- ============================================

-- Lesson 5: Video - Note-taking Skills
INSERT INTO lessons (
    id, module_id, course_id, title, description, content_type,
    duration_minutes, display_order, is_free, is_published
) VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccc05',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Advanced Note-taking Techniques',
    'Master the art of taking effective notes while listening',
    'video',
    30,
    5,
    false,
    true
);

-- Lesson 6: Article - Common Traps
INSERT INTO lessons (
    id, module_id, course_id, title, description, content_type,
    duration_minutes, display_order, is_free, is_published
) VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccc06',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Common Traps and How to Avoid Them',
    '<h2>Common IELTS Listening Traps</h2><h3>1. Distractors</h3><p>The speaker may mention multiple options, but only one is correct. Listen carefully for corrections or clarifications.</p><h3>2. Paraphrasing</h3><p>The answer in the audio is often paraphrased in the question. Learn to recognize synonyms and different expressions.</p><h3>3. Spelling</h3><p>Make sure you spell words correctly. Practice common IELTS vocabulary spelling.</p>',
    'article',
    15,
    6,
    false,
    true
);

-- Lesson 7: Video - Different Accents
INSERT INTO lessons (
    id, module_id, course_id, title, description, content_type,
    duration_minutes, display_order, is_free, is_published
) VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccc07',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Understanding Different English Accents',
    'Practice listening to British, American, Australian, and other accents',
    'video',
    35,
    7,
    false,
    true
);

-- Lesson 8: Practice Exercise (STANDALONE - can be done independently)
INSERT INTO lessons (
    id, module_id, course_id, title, description, content_type,
    duration_minutes, display_order, is_free, is_published
) VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccc08',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Advanced Practice Exercise',
    'Challenge yourself with this advanced listening exercise',
    'exercise',
    30,
    8,
    false,
    true
);

-- ============================================
-- 4. LESSONS - Module 3 (Mock Tests)
-- ============================================

-- Lesson 9: Video - Test Day Tips
INSERT INTO lessons (
    id, module_id, course_id, title, description, content_type,
    duration_minutes, display_order, is_free, is_published
) VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccc09',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Test Day Preparation & Tips',
    'Everything you need to know for test day success',
    'video',
    20,
    9,
    false,
    true
);

-- Lesson 10: Mock Test 1
INSERT INTO lessons (
    id, module_id, course_id, title, description, content_type,
    duration_minutes, display_order, is_free, is_published
) VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccc10',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Full Mock Test 1',
    'Complete IELTS Listening mock test under timed conditions',
    'exercise',
    40,
    10,
    false,
    true
);

-- Lesson 11: Video - Mock Test 1 Review
INSERT INTO lessons (
    id, module_id, course_id, title, description, content_type,
    duration_minutes, display_order, is_free, is_published
) VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccc11',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Mock Test 1 - Detailed Review',
    'Detailed explanation of all answers from Mock Test 1',
    'video',
    45,
    11,
    false,
    true
);

-- Lesson 12: Mock Test 2
INSERT INTO lessons (
    id, module_id, course_id, title, description, content_type,
    duration_minutes, display_order, is_free, is_published
) VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccc12',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Full Mock Test 2',
    'Second complete IELTS Listening mock test',
    'exercise',
    40,
    12,
    false,
    true
);

-- ============================================
-- 5. LESSON VIDEOS (YouTube Integration)
-- ============================================

-- Video for Lesson 1
INSERT INTO lesson_videos (
    id, lesson_id, title, video_url, video_provider, video_id,
    duration_seconds, thumbnail_url, display_order
) VALUES (
    'dddddddd-dddd-dddd-dddd-dddddddddd01',
    'cccccccc-cccc-cccc-cccc-cccccccccc01',
    'Welcome to IELTS Listening - Introduction',
    'https://www.youtube.com/watch?v=OPBd86A1Rfo',
    'youtube',
    'OPBd86A1Rfo',
    379, -- Auto-synced from YouTube API
    'https://i.ytimg.com/vi/OPBd86A1Rfo/maxresdefault.jpg',
    1
);

-- Video for Lesson 3
INSERT INTO lesson_videos (
    id, lesson_id, title, video_url, video_provider, video_id,
    duration_seconds, thumbnail_url, display_order
) VALUES (
    'dddddddd-dddd-dddd-dddd-dddddddddd03',
    'cccccccc-cccc-cccc-cccc-cccccccccc03',
    'Essential IELTS Listening Strategies',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'youtube',
    'dQw4w9WgXcQ',
    212,
    'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    1
);

-- ============================================
-- 6. UPDATE COUNTS
-- ============================================

-- Update course total_lessons
UPDATE courses SET total_lessons = (
    SELECT COUNT(*) FROM lessons WHERE course_id = courses.id
) WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- Update module total_lessons
UPDATE modules SET total_lessons = (
    SELECT COUNT(*) FROM lessons WHERE module_id = modules.id
) WHERE course_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- Success message
SELECT 
    'Complete relationship data inserted successfully!' as status,
    (SELECT COUNT(*) FROM courses WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') as courses_count,
    (SELECT COUNT(*) FROM modules WHERE course_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') as modules_count,
    (SELECT COUNT(*) FROM lessons WHERE course_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') as lessons_count,
    (SELECT COUNT(*) FROM lesson_videos WHERE lesson_id IN (
        SELECT id FROM lessons WHERE course_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
    )) as videos_count;

