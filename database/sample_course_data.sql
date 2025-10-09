-- Sample data for Course Service
-- Quick insert for testing

-- Insert sample instructor (using existing user from auth)
-- Insert 2 courses
INSERT INTO courses (id, title, slug, description, short_description, skill_type, level, target_band_score, 
    instructor_id, instructor_name, duration_hours, total_lessons, enrollment_type, price, status, is_featured, published_at)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'IELTS Listening Fundamentals', 'ielts-listening-fundamentals',
     'Master IELTS Listening with comprehensive practice and strategies', 
     'Complete guide to IELTS Listening section', 'listening', 'intermediate', 6.5,
     '00000000-0000-0000-0000-000000000000', 'IELTS Expert', 12.5, 15, 'free', 0, 'published', true, NOW()),
    ('22222222-2222-2222-2222-222222222222', 'IELTS Writing Task 2 Mastery', 'ielts-writing-task2',
     'Learn to write high-scoring IELTS Writing Task 2 essays', 
     'Advanced Writing Task 2 techniques', 'writing', 'advanced', 7.5,
     '00000000-0000-0000-0000-000000000000', 'Writing Coach', 20, 25, 'premium', 500000, 'published', false, NOW());

-- Insert modules for course 1
INSERT INTO modules (id, course_id, title, description, duration_hours, total_lessons, display_order)
VALUES 
    ('11111111-1111-1111-1111-111111111101', '11111111-1111-1111-1111-111111111111', 
     'Introduction to IELTS Listening', 'Understand the format and types', 2, 3, 1),
    ('11111111-1111-1111-1111-111111111102', '11111111-1111-1111-1111-111111111111',
     'Advanced Techniques', 'Master note-taking and prediction', 5, 7, 2);

-- Insert lessons for module 1
INSERT INTO lessons (id, module_id, course_id, title, description, content_type, duration_minutes, display_order, is_free)
VALUES 
    ('11111111-1111-1111-1111-111111111201', '11111111-1111-1111-1111-111111111101', 
     '11111111-1111-1111-1111-111111111111', 'Overview of IELTS Listening', 
     'Learn about the 4 sections', 'video', 30, 1, true),
    ('11111111-1111-1111-1111-111111111202', '11111111-1111-1111-1111-111111111101',
     '11111111-1111-1111-1111-111111111111', 'Question Types Explained',
     'Multiple choice, matching, completion', 'video', 45, 2, true),
    ('11111111-1111-1111-1111-111111111203', '11111111-1111-1111-1111-111111111101',
     '11111111-1111-1111-1111-111111111111', 'Practice Test 1',
     'Full practice test with answers', 'exercise', 60, 3, false);

-- Update course totals
UPDATE courses SET total_lessons = 3 WHERE id = '11111111-1111-1111-1111-111111111111';
UPDATE modules SET total_lessons = 3 WHERE id = '11111111-1111-1111-1111-111111111101';
