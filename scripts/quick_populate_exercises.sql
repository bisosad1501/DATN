\c exercise_db

-- ============================================
-- QUICK POPULATE: Add questions to existing exercises + Create standalone exercises
-- ============================================

-- For simplicity, we'll add just a few questions to each existing exercise
-- And create 3 standalone exercises

-- ============================================
-- LISTENING EXERCISE 1: Form Completion (5 questions)
-- ============================================

INSERT INTO exercise_sections (id, exercise_id, section_number, title, instructions, passage_content, display_order, total_questions)
VALUES (
  uuid_generate_v4(),
  'e1111111-1111-1111-1111-111111111111',
  1,
  'Student Registration Form',
  'Complete the form below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
  'You will hear a conversation between a student and a university administrator about course registration.',
  1,
  5
) RETURNING id AS section_id \gset listen1_

-- Insert questions
WITH q AS (
  INSERT INTO questions (id, exercise_id, section_id, question_number, question_type, question_text, points, display_order)
  VALUES
    (uuid_generate_v4(), 'e1111111-1111-1111-1111-111111111111', :'listen1_section_id', 1, 'form_completion', 'Student Name:', 1, 1),
    (uuid_generate_v4(), 'e1111111-1111-1111-1111-111111111111', :'listen1_section_id', 2, 'form_completion', 'Student ID:', 1, 2),
    (uuid_generate_v4(), 'e1111111-1111-1111-1111-111111111111', :'listen1_section_id', 3, 'form_completion', 'Course:', 1, 3),
    (uuid_generate_v4(), 'e1111111-1111-1111-1111-111111111111', :'listen1_section_id', 4, 'form_completion', 'Start Date:', 1, 4),
    (uuid_generate_v4(), 'e1111111-1111-1111-1111-111111111111', :'listen1_section_id', 5, 'form_completion', 'Contact Number:', 1, 5)
  RETURNING id, question_number
)
INSERT INTO question_answers (id, question_id, answer_text, answer_variations)
SELECT 
  uuid_generate_v4(),
  q.id,
  CASE q.question_number
    WHEN 1 THEN 'Sarah Johnson'
    WHEN 2 THEN '2024-5678'
    WHEN 3 THEN 'Business Management'
    WHEN 4 THEN '15 September'
    WHEN 5 THEN '07700 900123'
  END,
  CASE q.question_number
    WHEN 1 THEN ARRAY['sarah johnson']
    WHEN 2 THEN ARRAY['20245678']
    WHEN 3 THEN ARRAY['business management']
    WHEN 4 THEN ARRAY['September 15', '15th September']
    WHEN 5 THEN ARRAY['07700900123']
  END
FROM q;

-- ============================================
-- READING EXERCISE 1: True/False/Not Given (5 questions)
-- ============================================

INSERT INTO exercise_sections (id, exercise_id, section_number, title, instructions, passage_content, display_order, total_questions)
VALUES (
  uuid_generate_v4(),
  'e2222222-2222-2222-2222-222222222221',
  1,
  'The History of Coffee',
  'Do the following statements agree with the information in the passage? Write TRUE, FALSE, or NOT GIVEN.',
  'Coffee is one of the world''s most popular beverages. It originated in Ethiopia in the 9th century, where legend says a goat herder named Kaldi discovered coffee beans after noticing his goats became energetic after eating them. By the 15th century, coffee was being cultivated in Yemen, and by the 16th century, it had spread to Persia, Egypt, and Turkey. Coffee houses became popular social gathering places. Today, coffee is grown in over 70 countries, primarily in equatorial regions of the Americas, Southeast Asia, and Africa.',
  1,
  5
) RETURNING id AS section_id \gset read1_

WITH q AS (
  INSERT INTO questions (id, exercise_id, section_id, question_number, question_type, question_text, points, display_order)
  VALUES
    (uuid_generate_v4(), 'e2222222-2222-2222-2222-222222222221', :'read1_section_id', 1, 'true_false_not_given', 'Coffee was first discovered in Ethiopia.', 1, 1),
    (uuid_generate_v4(), 'e2222222-2222-2222-2222-222222222221', :'read1_section_id', 2, 'true_false_not_given', 'Kaldi was a coffee farmer.', 1, 2),
    (uuid_generate_v4(), 'e2222222-2222-2222-2222-222222222221', :'read1_section_id', 3, 'true_false_not_given', 'Coffee reached Europe in the 15th century.', 1, 3),
    (uuid_generate_v4(), 'e2222222-2222-2222-2222-222222222221', :'read1_section_id', 4, 'true_false_not_given', 'Coffee houses were used for social meetings.', 1, 4),
    (uuid_generate_v4(), 'e2222222-2222-2222-2222-222222222221', :'read1_section_id', 5, 'true_false_not_given', 'Coffee is grown in more than 70 countries.', 1, 5)
  RETURNING id, question_number
)
INSERT INTO question_answers (id, question_id, answer_text)
SELECT 
  uuid_generate_v4(),
  q.id,
  CASE q.question_number
    WHEN 1 THEN 'TRUE'
    WHEN 2 THEN 'FALSE'
    WHEN 3 THEN 'NOT GIVEN'
    WHEN 4 THEN 'TRUE'
    WHEN 5 THEN 'TRUE'
  END
FROM q;

-- ============================================
-- STANDALONE EXERCISES
-- ============================================

-- Standalone Listening Mock Test
INSERT INTO exercises (
  id, title, slug, description, skill_type, exercise_type, difficulty,
  total_questions, total_sections, time_limit_minutes, passing_score,
  is_published, display_order, module_id, course_id, created_by
) VALUES (
  uuid_generate_v4(),
  'IELTS Listening Mock Test - October 2024',
  'ielts-listening-mock-test-oct-2024',
  'Full-length IELTS Listening practice test. Perfect for exam preparation.',
  'listening',
  'mock_test',
  'medium',
  10,
  1,
  25,
  60,
  true,
  100,
  NULL,
  NULL,
  'f0000000-0000-0000-0000-000000000001'
) RETURNING id AS ex_id \gset standalone_listen_

-- Add section and questions for standalone listening
INSERT INTO exercise_sections (id, exercise_id, section_number, title, instructions, passage_content, display_order, total_questions)
VALUES (
  uuid_generate_v4(),
  :'standalone_listen_ex_id',
  1,
  'Section 1: Accommodation Enquiry',
  'Complete the form. Write NO MORE THAN THREE WORDS AND/OR A NUMBER.',
  'A conversation between a student and a landlord about renting an apartment.',
  1,
  10
) RETURNING id AS section_id \gset standalone_listen_sec_

WITH q AS (
  INSERT INTO questions (id, exercise_id, section_id, question_number, question_type, question_text, points, display_order)
  VALUES
    (uuid_generate_v4(), :'standalone_listen_ex_id', :'standalone_listen_sec_section_id', 1, 'form_completion', 'Type of accommodation:', 1, 1),
    (uuid_generate_v4(), :'standalone_listen_ex_id', :'standalone_listen_sec_section_id', 2, 'form_completion', 'Monthly rent:', 1, 2),
    (uuid_generate_v4(), :'standalone_listen_ex_id', :'standalone_listen_sec_section_id', 3, 'form_completion', 'Deposit required:', 1, 3),
    (uuid_generate_v4(), :'standalone_listen_ex_id', :'standalone_listen_sec_section_id', 4, 'form_completion', 'Available from:', 1, 4),
    (uuid_generate_v4(), :'standalone_listen_ex_id', :'standalone_listen_sec_section_id', 5, 'form_completion', 'Nearest station:', 1, 5),
    (uuid_generate_v4(), :'standalone_listen_ex_id', :'standalone_listen_sec_section_id', 6, 'form_completion', 'Facilities included:', 1, 6),
    (uuid_generate_v4(), :'standalone_listen_ex_id', :'standalone_listen_sec_section_id', 7, 'form_completion', 'Heating type:', 1, 7),
    (uuid_generate_v4(), :'standalone_listen_ex_id', :'standalone_listen_sec_section_id', 8, 'form_completion', 'Contract length:', 1, 8),
    (uuid_generate_v4(), :'standalone_listen_ex_id', :'standalone_listen_sec_section_id', 9, 'form_completion', 'Landlord name:', 1, 9),
    (uuid_generate_v4(), :'standalone_listen_ex_id', :'standalone_listen_sec_section_id', 10, 'form_completion', 'Contact number:', 1, 10)
  RETURNING id, question_number
)
INSERT INTO question_answers (id, question_id, answer_text, answer_variations)
SELECT 
  uuid_generate_v4(),
  q.id,
  CASE q.question_number
    WHEN 1 THEN 'studio apartment'
    WHEN 2 THEN '£850'
    WHEN 3 THEN '£1700'
    WHEN 4 THEN '1st November'
    WHEN 5 THEN 'Central Station'
    WHEN 6 THEN 'washing machine'
    WHEN 7 THEN 'central heating'
    WHEN 8 THEN '12 months'
    WHEN 9 THEN 'Mr. Thompson'
    WHEN 10 THEN '07700 900456'
  END,
  CASE q.question_number
    WHEN 1 THEN ARRAY['Studio Apartment']
    WHEN 2 THEN ARRAY['850 pounds', '850']
    WHEN 4 THEN ARRAY['1 November', 'November 1']
    WHEN 5 THEN ARRAY['central station']
    WHEN 8 THEN ARRAY['twelve months', '1 year']
    WHEN 9 THEN ARRAY['Mr Thompson', 'Thompson']
    WHEN 10 THEN ARRAY['07700900456']
    ELSE NULL
  END
FROM q;

-- Standalone Reading Practice
INSERT INTO exercises (
  id, title, slug, description, skill_type, exercise_type, difficulty,
  total_questions, total_sections, time_limit_minutes, passing_score,
  is_published, display_order, module_id, course_id, created_by
) VALUES (
  uuid_generate_v4(),
  'IELTS Reading Academic Practice Test',
  'ielts-reading-academic-practice',
  'Complete IELTS Academic Reading test with passages and questions.',
  'reading',
  'mock_test',
  'hard',
  10,
  1,
  40,
  65,
  true,
  101,
  NULL,
  NULL,
  'f0000000-0000-0000-0000-000000000001'
);

-- Standalone Writing Practice
INSERT INTO exercises (
  id, title, slug, description, skill_type, exercise_type, difficulty,
  total_questions, total_sections, time_limit_minutes, passing_score,
  is_published, display_order, module_id, course_id, created_by
) VALUES (
  uuid_generate_v4(),
  'IELTS Writing Task 1 - Graph Description',
  'ielts-writing-task1-graph',
  'Practice describing graphs, charts, and diagrams for IELTS Writing Task 1.',
  'writing',
  'practice',
  'medium',
  1,
  1,
  20,
  60,
  true,
  102,
  NULL,
  NULL,
  'f0000000-0000-0000-0000-000000000001'
);

-- Verify
SELECT 
  e.title,
  e.skill_type,
  CASE WHEN e.module_id IS NULL THEN 'Standalone' ELSE 'Course' END as type,
  e.total_sections,
  e.total_questions,
  COUNT(DISTINCT es.id) as actual_sections,
  COUNT(q.id) as actual_questions
FROM exercises e
LEFT JOIN exercise_sections es ON e.id = es.exercise_id
LEFT JOIN questions q ON e.id = q.exercise_id
GROUP BY e.id, e.title, e.skill_type, e.module_id, e.total_sections, e.total_questions
ORDER BY e.module_id NULLS LAST, e.created_at;

