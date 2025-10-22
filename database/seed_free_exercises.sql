-- ============================================
-- EXERCISES FOR FREE COURSES
-- ============================================
-- Purpose: Create exercises linked to FREE course lessons
-- Usage: Run after seed_free_courses_complete.sql

-- ============================================
-- LISTENING EXERCISE 1: Form Completion
-- ============================================

INSERT INTO exercises (
    id, title, slug, description, exercise_type, skill_type, difficulty, ielts_level,
    total_questions, total_sections, time_limit_minutes, passing_score, total_points,
    is_free, is_published, course_id, module_id, created_by, published_at, display_order
) VALUES (
    'e1111111-1111-1111-1111-111111111111',
    'Exercise 1: Form Completion',
    'listening-ex1-form-completion',
    'Practice completing forms with personal information',
    'practice',
    'listening',
    'easy',
    'band 5.0-6.0',
    5,
    1,
    10,
    60.00,
    5.00,
    true,
    true,
    'f1111111-1111-1111-1111-111111111111',
    'f1111111-1111-1111-1111-111111111102',
    '00000000-0000-0000-0000-000000000001',
    NOW(),
    1
);

-- Section
INSERT INTO exercise_sections (
    id, exercise_id, title, description, section_number,
    audio_url, transcript, instructions, total_questions, display_order
) VALUES (
    '11111111-1111-1111-1111-111111111101',
    'e1111111-1111-1111-1111-111111111111',
    'Hotel Booking Form',
    'Listen and complete the booking form',
    1,
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'Receptionist: Good morning, City Hotel. Customer: Hi, I would like to book a room. My name is Sarah Johnson, phone 555-0123.',
    '<p>Complete the form. Write <strong>NO MORE THAN TWO WORDS</strong> for each answer.</p>',
    5,
    1
);

-- Questions
INSERT INTO questions (
    id, exercise_id, section_id, question_number, question_type, question_text,
    points, display_order
) VALUES
('11111111-1111-1111-1111-111111111201', 'e1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111101', 1, 'fill_in_blank', 'Name: Sarah ___________', 1.00, 1),
('11111111-1111-1111-1111-111111111202', 'e1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111101', 2, 'fill_in_blank', 'Phone: ___________', 1.00, 2),
('11111111-1111-1111-1111-111111111203', 'e1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111101', 3, 'fill_in_blank', 'Room type: ___________', 1.00, 3),
('11111111-1111-1111-1111-111111111204', 'e1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111101', 4, 'fill_in_blank', 'Number of nights: ___________', 1.00, 4),
('11111111-1111-1111-1111-111111111205', 'e1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111101', 5, 'fill_in_blank', 'Special request: ___________', 1.00, 5);

-- Answers
INSERT INTO question_answers (question_id, answer_text, answer_variations) VALUES
('11111111-1111-1111-1111-111111111201', 'Johnson', '{"JOHNSON", "johnson"}'),
('11111111-1111-1111-1111-111111111202', '555-0123', '{"5550123", "555 0123"}'),
('11111111-1111-1111-1111-111111111203', 'double', '{"Double", "DOUBLE", "double room"}'),
('11111111-1111-1111-1111-111111111204', '2', '{"two", "Two"}'),
('11111111-1111-1111-1111-111111111205', 'quiet room', '{"Quiet room", "quiet", "Quiet"}');

-- ============================================
-- LISTENING EXERCISE 2: Multiple Choice
-- ============================================

INSERT INTO exercises (
    id, title, slug, description, exercise_type, skill_type, difficulty, ielts_level,
    total_questions, total_sections, time_limit_minutes, passing_score, total_points,
    is_free, is_published, course_id, lesson_id, created_by, published_at
) VALUES (
    'e1111111-1111-1111-1111-111111111112',
    'Listening Exercise 2: Multiple Choice',
    'listening-ex2-multiple-choice',
    'Practice answering multiple choice questions',
    'practice',
    'listening',
    'easy',
    'band 5.0-6.0',
    3,
    1,
    10,
    60.00,
    3.00,
    true,
    true,
    'f1111111-1111-1111-1111-111111111111',
    'f1111111-1111-1111-1111-111111111007',
    '00000000-0000-0000-0000-000000000001',
    NOW()
);

-- Section
INSERT INTO exercise_sections (
    id, exercise_id, title, description, section_number,
    audio_url, transcript, instructions, total_questions, display_order
) VALUES (
    '11111111-1111-1111-1111-111111111102',
    'e1111111-1111-1111-1111-111111111112',
    'University Tour',
    'Listen to a university tour guide',
    1,
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    'Guide: Welcome to City University. The tour will take 30 minutes. We start at the library, the largest building with 500,000 books.',
    '<p>Choose the correct letter, <strong>A, B, or C</strong>.</p>',
    3,
    1
);

-- Questions
INSERT INTO questions (
    id, exercise_id, section_id, question_number, question_type, question_text,
    points, display_order
) VALUES
('11111111-1111-1111-1111-111111111206', 'e1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111102', 1, 'multiple_choice', 'How long is the tour?', 1.00, 1),
('11111111-1111-1111-1111-111111111207', 'e1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111102', 2, 'multiple_choice', 'Where does the tour start?', 1.00, 2),
('11111111-1111-1111-1111-111111111208', 'e1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111102', 3, 'multiple_choice', 'How many books are in the library?', 1.00, 3);

-- Options
INSERT INTO question_options (question_id, option_label, option_text, is_correct, display_order) VALUES
('11111111-1111-1111-1111-111111111206', 'A', '20 minutes', false, 1),
('11111111-1111-1111-1111-111111111206', 'B', '30 minutes', true, 2),
('11111111-1111-1111-1111-111111111206', 'C', '40 minutes', false, 3),

('11111111-1111-1111-1111-111111111207', 'A', 'The cafeteria', false, 1),
('11111111-1111-1111-1111-111111111207', 'B', 'The library', true, 2),
('11111111-1111-1111-1111-111111111207', 'C', 'The sports center', false, 3),

('11111111-1111-1111-1111-111111111208', 'A', '300,000', false, 1),
('11111111-1111-1111-1111-111111111208', 'B', '500,000', true, 2),
('11111111-1111-1111-1111-111111111208', 'C', '700,000', false, 3);

-- ============================================
-- LISTENING EXERCISE 3: Map Labeling
-- ============================================

INSERT INTO exercises (
    id, title, slug, description, exercise_type, skill_type, difficulty, ielts_level,
    total_questions, total_sections, time_limit_minutes, passing_score, total_points,
    is_free, is_published, course_id, lesson_id, created_by, published_at
) VALUES (
    'e1111111-1111-1111-1111-111111111113',
    'Listening Exercise 3: Map Labeling',
    'listening-ex3-map-labeling',
    'Practice labeling locations on a map',
    'practice',
    'listening',
    'medium',
    'band 5.0-6.0',
    3,
    1,
    10,
    60.00,
    3.00,
    true,
    true,
    'f1111111-1111-1111-1111-111111111111',
    'f1111111-1111-1111-1111-111111111008',
    '00000000-0000-0000-0000-000000000001',
    NOW()
);

-- Section
INSERT INTO exercise_sections (
    id, exercise_id, title, description, section_number,
    audio_url, transcript, instructions, total_questions, display_order
) VALUES (
    '11111111-1111-1111-1111-111111111103',
    'e1111111-1111-1111-1111-111111111113',
    'Campus Map',
    'Listen and label the campus map',
    1,
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    'The library is on the left. The cafeteria is on the right. The sports center is behind the cafeteria.',
    '<p>Label the map. Write the correct letter <strong>A-E</strong>.</p>',
    3,
    1
);

-- Questions
INSERT INTO questions (
    id, exercise_id, section_id, question_number, question_type, question_text,
    points, display_order
) VALUES
('11111111-1111-1111-1111-111111111209', 'e1111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111103', 1, 'fill_in_blank', 'Library: ___________', 1.00, 1),
('11111111-1111-1111-1111-111111111210', 'e1111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111103', 2, 'fill_in_blank', 'Cafeteria: ___________', 1.00, 2),
('11111111-1111-1111-1111-111111111211', 'e1111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111103', 3, 'fill_in_blank', 'Sports Center: ___________', 1.00, 3);

-- Answers
INSERT INTO question_answers (question_id, answer_text, answer_variations) VALUES
('11111111-1111-1111-1111-111111111209', 'A', '{"a"}'),
('11111111-1111-1111-1111-111111111210', 'B', '{"b"}'),
('11111111-1111-1111-1111-111111111211', 'C', '{"c"}');

-- ============================================
-- LISTENING EXERCISE 4: Final Practice Test
-- ============================================

INSERT INTO exercises (
    id, title, slug, description, exercise_type, skill_type, difficulty, ielts_level,
    total_questions, total_sections, time_limit_minutes, passing_score, total_points,
    is_free, is_published, course_id, lesson_id, created_by, published_at
) VALUES (
    'e1111111-1111-1111-1111-111111111114',
    'Listening Final Practice Test',
    'listening-final-practice-test',
    'Complete practice test with mixed question types',
    'practice',
    'listening',
    'medium',
    'band 5.0-6.0',
    5,
    1,
    20,
    70.00,
    5.00,
    true,
    true,
    'f1111111-1111-1111-1111-111111111111',
    'f1111111-1111-1111-1111-111111111010',
    '00000000-0000-0000-0000-000000000001',
    NOW()
);

-- Section
INSERT INTO exercise_sections (
    id, exercise_id, title, description, section_number,
    audio_url, transcript, instructions, total_questions, display_order
) VALUES (
    '11111111-1111-1111-1111-111111111104',
    'e1111111-1111-1111-1111-111111111114',
    'Course Booking',
    'Complete the booking form',
    1,
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    'Conversation about booking an IELTS course. Course: IELTS Preparation, Start: January 15, Duration: 8 weeks, Cost: $500, Payment: credit card.',
    '<p>Complete the form. Write NO MORE THAN TWO WORDS for each answer.</p>',
    5,
    1
);

-- Questions
INSERT INTO questions (
    id, exercise_id, section_id, question_number, question_type, question_text,
    points, display_order
) VALUES
('11111111-1111-1111-1111-111111111212', 'e1111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111104', 1, 'fill_in_blank', 'Course name: ___________', 1.00, 1),
('11111111-1111-1111-1111-111111111213', 'e1111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111104', 2, 'fill_in_blank', 'Start date: ___________', 1.00, 2),
('11111111-1111-1111-1111-111111111214', 'e1111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111104', 3, 'fill_in_blank', 'Duration: ___________ weeks', 1.00, 3),
('11111111-1111-1111-1111-111111111215', 'e1111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111104', 4, 'fill_in_blank', 'Cost: $ ___________', 1.00, 4),
('11111111-1111-1111-1111-111111111216', 'e1111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111104', 5, 'fill_in_blank', 'Payment method: ___________', 1.00, 5);

-- Answers
INSERT INTO question_answers (question_id, answer_text, answer_variations) VALUES
('11111111-1111-1111-1111-111111111212', 'IELTS Preparation', '{"ielts preparation", "IELTS preparation"}'),
('11111111-1111-1111-1111-111111111213', 'January 15', '{"15 January", "Jan 15"}'),
('11111111-1111-1111-1111-111111111214', '8', '{"eight", "Eight"}'),
('11111111-1111-1111-1111-111111111215', '500', '{"500.00"}'),
('11111111-1111-1111-1111-111111111216', 'credit card', '{"Credit card", "card"}');

-- ============================================
-- READING EXERCISE 1: True/False/Not Given
-- ============================================

INSERT INTO exercises (
    id, title, slug, description, exercise_type, skill_type, difficulty, ielts_level,
    total_questions, total_sections, time_limit_minutes, passing_score, total_points,
    is_free, is_published, course_id, lesson_id, created_by, published_at
) VALUES (
    'e2222222-2222-2222-2222-222222222221',
    'Reading Exercise 1: True/False/Not Given',
    'reading-ex1-true-false-not-given',
    'Practice identifying True, False, and Not Given statements',
    'practice',
    'reading',
    'easy',
    'band 5.0-6.0',
    5,
    1,
    15,
    60.00,
    5.00,
    true,
    true,
    'f2222222-2222-2222-2222-222222222222',
    'f2222222-2222-2222-2222-222222222005',
    '00000000-0000-0000-0000-000000000001',
    NOW()
);

-- Section
INSERT INTO exercise_sections (
    id, exercise_id, title, description, section_number,
    passage_title, passage_content, instructions, total_questions, display_order
) VALUES (
    '22222222-2222-2222-2222-222222222201',
    'e2222222-2222-2222-2222-222222222221',
    'The History of Coffee',
    'Read the passage and answer the questions',
    1,
    'The History of Coffee',
    '<p>Coffee is one of the most popular beverages in the world. It originated in Ethiopia over 1,000 years ago. According to legend, a goat herder named Kaldi discovered coffee when he noticed his goats became energetic after eating berries from a certain tree. Today, coffee is grown in over 70 countries, primarily in equatorial regions of the Americas, Southeast Asia, and Africa.</p>',
    '<p>Do the following statements agree with the information in the passage? Write <strong>TRUE, FALSE, or NOT GIVEN</strong>.</p>',
    5,
    1
);

-- Questions
INSERT INTO questions (
    id, exercise_id, section_id, question_number, question_type, question_text,
    points, display_order
) VALUES
('22222222-2222-2222-2222-222222222301', 'e2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222201', 1, 'true_false_not_given', 'Coffee was first discovered in Ethiopia.', 1.00, 1),
('22222222-2222-2222-2222-222222222302', 'e2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222201', 2, 'true_false_not_given', 'Kaldi was a farmer.', 1.00, 2),
('22222222-2222-2222-2222-222222222303', 'e2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222201', 3, 'true_false_not_given', 'Coffee is grown in more than 70 countries.', 1.00, 3),
('22222222-2222-2222-2222-222222222304', 'e2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222201', 4, 'true_false_not_given', 'Coffee plants grow best in cold climates.', 1.00, 4),
('22222222-2222-2222-2222-222222222305', 'e2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222201', 5, 'true_false_not_given', 'Coffee is the most expensive beverage in the world.', 1.00, 5);

-- Answers
INSERT INTO question_answers (question_id, answer_text, answer_variations) VALUES
('22222222-2222-2222-2222-222222222301', 'TRUE', '{"True", "true", "T"}'),
('22222222-2222-2222-2222-222222222302', 'NOT GIVEN', '{"Not Given", "not given", "NG", "N"}'),
('22222222-2222-2222-2222-222222222303', 'TRUE', '{"True", "true", "T"}'),
('22222222-2222-2222-2222-222222222304', 'FALSE', '{"False", "false", "F"}'),
('22222222-2222-2222-2222-222222222305', 'NOT GIVEN', '{"Not Given", "not given", "NG", "N"}');

-- Success message
SELECT
    '✅ Exercises created!' as status,
    (SELECT COUNT(*) FROM exercises WHERE course_id IN ('f1111111-1111-1111-1111-111111111111', 'f2222222-2222-2222-2222-222222222222')) as total_exercises,
    (SELECT COUNT(*) FROM exercises WHERE course_id = 'f1111111-1111-1111-1111-111111111111') as listening_exercises,
    (SELECT COUNT(*) FROM exercises WHERE course_id = 'f2222222-2222-2222-2222-222222222222') as reading_exercises;

