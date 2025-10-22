-- ============================================
-- POPULATE EXERCISES WITH REAL DATA
-- Includes: Sections, Questions, Answers, Options
-- Plus: Standalone Exercises
-- ============================================

\c exercise_db

-- Clear existing data
DELETE FROM user_answers;
DELETE FROM question_options;
DELETE FROM question_answers;
DELETE FROM questions;
DELETE FROM exercise_sections;

-- ============================================
-- LISTENING EXERCISE 1: Form Completion
-- ============================================

-- Section
INSERT INTO exercise_sections (id, exercise_id, section_number, title, instructions, audio_url, passage_content, display_order, total_questions)
VALUES (
  'sec-listen-1-1',
  'e1111111-1111-1111-1111-111111111111',
  1,
  'Student Registration Form',
  'Complete the form below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
  'https://example.com/audio/listening-form-completion.mp3',
  'You will hear a conversation between a student and a university administrator about course registration.',
  1,
  5
);

-- Questions
INSERT INTO questions (id, exercise_id, section_id, question_number, question_type, question_text, points, display_order)
VALUES
  ('q-listen-1-1', 'e1111111-1111-1111-1111-111111111111', 'sec-listen-1-1', 1, 'form_completion', 'Student Name:', 1, 1),
  ('q-listen-1-2', 'e1111111-1111-1111-1111-111111111111', 'sec-listen-1-1', 2, 'form_completion', 'Student ID:', 1, 2),
  ('q-listen-1-3', 'e1111111-1111-1111-1111-111111111111', 'sec-listen-1-1', 3, 'form_completion', 'Course:', 1, 3),
  ('q-listen-1-4', 'e1111111-1111-1111-1111-111111111111', 'sec-listen-1-1', 4, 'form_completion', 'Start Date:', 1, 4),
  ('q-listen-1-5', 'e1111111-1111-1111-1111-111111111111', 'sec-listen-1-1', 5, 'form_completion', 'Contact Number:', 1, 5);

-- Answers
INSERT INTO question_answers (id, question_id, answer_text, answer_variations)
VALUES
  (uuid_generate_v4(), 'q-listen-1-1', 'Sarah Johnson', ARRAY['sarah johnson', 'SARAH JOHNSON']),
  (uuid_generate_v4(), 'q-listen-1-2', '2024-5678', ARRAY['20245678']),
  (uuid_generate_v4(), 'q-listen-1-3', 'Business Management', ARRAY['business management', 'BUSINESS MANAGEMENT']),
  (uuid_generate_v4(), 'q-listen-1-4', '15 September', ARRAY['15th September', 'September 15']),
  (uuid_generate_v4(), 'q-listen-1-5', '07700 900123', ARRAY['07700900123', '0770 0900 123']);

-- ============================================
-- LISTENING EXERCISE 2: Multiple Choice
-- ============================================

INSERT INTO exercise_sections (id, exercise_id, section_number, title, instructions, audio_url, passage_content, display_order, total_questions)
VALUES (
  'sec-listen-2-1',
  'e1111111-1111-1111-1111-111111111112',
  1,
  'Campus Tour',
  'Choose the correct letter, A, B, or C.',
  'https://example.com/audio/listening-multiple-choice.mp3',
  'You will hear a guide giving a tour of a university campus.',
  1,
  5
);

INSERT INTO questions (id, exercise_id, section_id, question_number, question_type, question_text, points, display_order)
VALUES
  ('q-listen-2-1', 'e1111111-1111-1111-1111-111111111112', 'sec-listen-2-1', 1, 'multiple_choice', 'What is the main purpose of the library?', 1, 1),
  ('q-listen-2-2', 'e1111111-1111-1111-1111-111111111112', 'sec-listen-2-1', 2, 'multiple_choice', 'When does the cafeteria close?', 1, 2),
  ('q-listen-2-3', 'e1111111-1111-1111-1111-111111111112', 'sec-listen-2-1', 3, 'multiple_choice', 'Where is the student support office located?', 1, 3),
  ('q-listen-2-4', 'e1111111-1111-1111-1111-111111111112', 'sec-listen-2-1', 4, 'multiple_choice', 'What sports facilities are available?', 1, 4),
  ('q-listen-2-5', 'e1111111-1111-1111-1111-111111111112', 'sec-listen-2-1', 5, 'multiple_choice', 'How often do campus buses run?', 1, 5);

-- Options for Q1
INSERT INTO question_options (id, question_id, option_label, option_text, is_correct, display_order)
VALUES
  (uuid_generate_v4(), 'q-listen-2-1', 'A', 'Study and research', true, 1),
  (uuid_generate_v4(), 'q-listen-2-1', 'B', 'Social activities', false, 2),
  (uuid_generate_v4(), 'q-listen-2-1', 'C', 'Computer labs', false, 3);

-- Options for Q2
INSERT INTO question_options (id, question_id, option_label, option_text, is_correct, display_order)
VALUES
  (uuid_generate_v4(), 'q-listen-2-2', 'A', '6 PM', false, 1),
  (uuid_generate_v4(), 'q-listen-2-2', 'B', '8 PM', false, 2),
  (uuid_generate_v4(), 'q-listen-2-2', 'C', '10 PM', true, 3);

-- Options for Q3
INSERT INTO question_options (id, question_id, option_label, option_text, is_correct, display_order)
VALUES
  (uuid_generate_v4(), 'q-listen-2-3', 'A', 'Building A', false, 1),
  (uuid_generate_v4(), 'q-listen-2-3', 'B', 'Building B', true, 2),
  (uuid_generate_v4(), 'q-listen-2-3', 'C', 'Building C', false, 3);

-- Options for Q4
INSERT INTO question_options (id, question_id, option_label, option_text, is_correct, display_order)
VALUES
  (uuid_generate_v4(), 'q-listen-2-4', 'A', 'Swimming pool only', false, 1),
  (uuid_generate_v4(), 'q-listen-2-4', 'B', 'Gym and tennis courts', true, 2),
  (uuid_generate_v4(), 'q-listen-2-4', 'C', 'Football field only', false, 3);

-- Options for Q5
INSERT INTO question_options (id, question_id, option_label, option_text, is_correct, display_order)
VALUES
  (uuid_generate_v4(), 'q-listen-2-5', 'A', 'Every 10 minutes', false, 1),
  (uuid_generate_v4(), 'q-listen-2-5', 'B', 'Every 15 minutes', true, 2),
  (uuid_generate_v4(), 'q-listen-2-5', 'C', 'Every 30 minutes', false, 3);

-- ============================================
-- LISTENING EXERCISE 3: Map Labeling
-- ============================================

INSERT INTO exercise_sections (id, exercise_id, section_number, title, instructions, audio_url, passage_content, display_order, total_questions)
VALUES (
  'sec-listen-3-1',
  'e1111111-1111-1111-1111-111111111113',
  1,
  'City Map',
  'Label the map below. Write the correct letter, A-H, next to questions 1-5.',
  'https://example.com/audio/listening-map-labeling.mp3',
  'You will hear directions to various locations in a city center.',
  1,
  5
);

INSERT INTO questions (id, exercise_id, section_id, question_number, question_type, question_text, points, display_order)
VALUES
  ('q-listen-3-1', 'e1111111-1111-1111-1111-111111111113', 'sec-listen-3-1', 1, 'map_labeling', 'Post Office', 1, 1),
  ('q-listen-3-2', 'e1111111-1111-1111-1111-111111111113', 'sec-listen-3-1', 2, 'map_labeling', 'Bank', 1, 2),
  ('q-listen-3-3', 'e1111111-1111-1111-1111-111111111113', 'sec-listen-3-1', 3, 'map_labeling', 'Library', 1, 3),
  ('q-listen-3-4', 'e1111111-1111-1111-1111-111111111113', 'sec-listen-3-1', 4, 'map_labeling', 'Museum', 1, 4),
  ('q-listen-3-5', 'e1111111-1111-1111-1111-111111111113', 'sec-listen-3-1', 5, 'map_labeling', 'Park', 1, 5);

INSERT INTO question_answers (id, question_id, answer_text)
VALUES
  (uuid_generate_v4(), 'q-listen-3-1', 'C'),
  (uuid_generate_v4(), 'q-listen-3-2', 'F'),
  (uuid_generate_v4(), 'q-listen-3-3', 'A'),
  (uuid_generate_v4(), 'q-listen-3-4', 'E'),
  (uuid_generate_v4(), 'q-listen-3-5', 'H');

-- ============================================
-- LISTENING EXERCISE 4: Final Practice Test (2 sections)
-- ============================================

INSERT INTO exercise_sections (id, exercise_id, section_number, title, instructions, audio_url, passage_content, display_order, total_questions)
VALUES 
  ('sec-listen-4-1', 'e1111111-1111-1111-1111-111111111114', 1, 'Section 1: Conversation',
   'Complete the notes below. Write NO MORE THAN TWO WORDS for each answer.',
   'https://example.com/audio/listening-test-section1.mp3',
   'You will hear a conversation between two students discussing their project.',
   1, 5),
  ('sec-listen-4-2', 'e1111111-1111-1111-1111-111111111114', 2, 'Section 2: Monologue',
   'Choose the correct letter, A, B, or C.',
   'https://example.com/audio/listening-test-section2.mp3',
   'You will hear a professor giving a lecture about climate change.',
   2, 5);

-- Section 1 questions
INSERT INTO questions (id, exercise_id, section_id, question_number, question_type, question_text, points, display_order)
VALUES
  ('q-listen-4-1', 'e1111111-1111-1111-1111-111111111114', 'sec-listen-4-1', 1, 'form_completion', 'Project topic:', 1, 1),
  ('q-listen-4-2', 'e1111111-1111-1111-1111-111111111114', 'sec-listen-4-1', 2, 'form_completion', 'Deadline:', 1, 2),
  ('q-listen-4-3', 'e1111111-1111-1111-1111-111111111114', 'sec-listen-4-1', 3, 'form_completion', 'Team members:', 1, 3),
  ('q-listen-4-4', 'e1111111-1111-1111-1111-111111111114', 'sec-listen-4-1', 4, 'form_completion', 'Meeting location:', 1, 4),
  ('q-listen-4-5', 'e1111111-1111-1111-1111-111111111114', 'sec-listen-4-1', 5, 'form_completion', 'Resources needed:', 1, 5);

INSERT INTO question_answers (id, question_id, answer_text, answer_variations)
VALUES
  (uuid_generate_v4(), 'q-listen-4-1', 'renewable energy', ARRAY['Renewable Energy']),
  (uuid_generate_v4(), 'q-listen-4-2', '20 October', ARRAY['October 20', '20th October']),
  (uuid_generate_v4(), 'q-listen-4-3', 'four students', ARRAY['4 students']),
  (uuid_generate_v4(), 'q-listen-4-4', 'library room 3', ARRAY['Library Room 3', 'room 3']),
  (uuid_generate_v4(), 'q-listen-4-5', 'research papers', ARRAY['Research Papers']);

-- Section 2 questions
INSERT INTO questions (id, exercise_id, section_id, question_number, question_type, question_text, points, display_order)
VALUES
  ('q-listen-4-6', 'e1111111-1111-1111-1111-111111111114', 'sec-listen-4-2', 6, 'multiple_choice', 'What is the main cause of climate change?', 1, 6),
  ('q-listen-4-7', 'e1111111-1111-1111-1111-111111111114', 'sec-listen-4-2', 7, 'multiple_choice', 'When did global warming accelerate?', 1, 7),
  ('q-listen-4-8', 'e1111111-1111-1111-1111-111111111114', 'sec-listen-4-2', 8, 'multiple_choice', 'What percentage of CO2 comes from transport?', 1, 8),
  ('q-listen-4-9', 'e1111111-1111-1111-1111-111111111114', 'sec-listen-4-2', 9, 'multiple_choice', 'Which solution is most effective?', 1, 9),
  ('q-listen-4-10', 'e1111111-1111-1111-1111-111111111114', 'sec-listen-4-2', 10, 'multiple_choice', 'What is the predicted temperature rise by 2100?', 1, 10);

-- Options for Section 2
INSERT INTO question_options (id, question_id, option_label, option_text, is_correct, display_order)
VALUES
  -- Q6
  (uuid_generate_v4(), 'q-listen-4-6', 'A', 'Natural cycles', false, 1),
  (uuid_generate_v4(), 'q-listen-4-6', 'B', 'Human activities', true, 2),
  (uuid_generate_v4(), 'q-listen-4-6', 'C', 'Solar radiation', false, 3),
  -- Q7
  (uuid_generate_v4(), 'q-listen-4-7', 'A', '1850s', false, 1),
  (uuid_generate_v4(), 'q-listen-4-7', 'B', '1950s', true, 2),
  (uuid_generate_v4(), 'q-listen-4-7', 'C', '2000s', false, 3),
  -- Q8
  (uuid_generate_v4(), 'q-listen-4-8', 'A', '15%', false, 1),
  (uuid_generate_v4(), 'q-listen-4-8', 'B', '25%', true, 2),
  (uuid_generate_v4(), 'q-listen-4-8', 'C', '35%', false, 3),
  -- Q9
  (uuid_generate_v4(), 'q-listen-4-9', 'A', 'Recycling', false, 1),
  (uuid_generate_v4(), 'q-listen-4-9', 'B', 'Renewable energy', true, 2),
  (uuid_generate_v4(), 'q-listen-4-9', 'C', 'Planting trees', false, 3),
  -- Q10
  (uuid_generate_v4(), 'q-listen-4-10', 'A', '1.5°C', false, 1),
  (uuid_generate_v4(), 'q-listen-4-10', 'B', '2.5°C', true, 2),
  (uuid_generate_v4(), 'q-listen-4-10', 'C', '3.5°C', false, 3);

-- ============================================
-- READING EXERCISE 1: True/False/Not Given
-- ============================================

INSERT INTO exercise_sections (id, exercise_id, section_number, title, instructions, passage_content, display_order, total_questions)
VALUES (
  'sec-read-1-1',
  'e2222222-2222-2222-2222-222222222221',
  1,
  'The History of Coffee',
  'Do the following statements agree with the information in the passage? Write TRUE, FALSE, or NOT GIVEN.',
  'Coffee is one of the world''s most popular beverages. It originated in Ethiopia in the 9th century, where legend says a goat herder named Kaldi discovered coffee beans after noticing his goats became energetic after eating them. By the 15th century, coffee was being cultivated in Yemen, and by the 16th century, it had spread to Persia, Egypt, and Turkey. Coffee houses became popular social gathering places. Today, coffee is grown in over 70 countries, primarily in equatorial regions of the Americas, Southeast Asia, and Africa.',
  1,
  5
);

INSERT INTO questions (id, exercise_id, section_id, question_number, question_type, question_text, points, display_order)
VALUES
  ('q-read-1-1', 'e2222222-2222-2222-2222-222222222221', 'sec-read-1-1', 1, 'true_false_not_given', 'Coffee was first discovered in Ethiopia.', 1, 1),
  ('q-read-1-2', 'e2222222-2222-2222-2222-222222222221', 'sec-read-1-1', 2, 'true_false_not_given', 'Kaldi was a coffee farmer.', 1, 2),
  ('q-read-1-3', 'e2222222-2222-2222-2222-222222222221', 'sec-read-1-1', 3, 'true_false_not_given', 'Coffee reached Europe in the 15th century.', 1, 3),
  ('q-read-1-4', 'e2222222-2222-2222-2222-222222222221', 'sec-read-1-1', 4, 'true_false_not_given', 'Coffee houses were used for social meetings.', 1, 4),
  ('q-read-1-5', 'e2222222-2222-2222-2222-222222222221', 'sec-read-1-1', 5, 'true_false_not_given', 'Coffee is grown in more than 70 countries.', 1, 5);

INSERT INTO question_answers (id, question_id, answer_text)
VALUES
  (uuid_generate_v4(), 'q-read-1-1', 'TRUE'),
  (uuid_generate_v4(), 'q-read-1-2', 'FALSE'),
  (uuid_generate_v4(), 'q-read-1-3', 'NOT GIVEN'),
  (uuid_generate_v4(), 'q-read-1-4', 'TRUE'),
  (uuid_generate_v4(), 'q-read-1-5', 'TRUE');

-- ============================================
-- READING EXERCISE 2: Matching Headings
-- ============================================

INSERT INTO exercise_sections (id, exercise_id, section_number, title, instructions, passage_content, display_order, total_questions)
VALUES (
  'sec-read-2-1',
  'e2222222-2222-2222-2222-222222222222',
  1,
  'Renewable Energy',
  'Choose the correct heading for each paragraph from the list of headings below.',
  'Paragraph A: Solar power has become increasingly affordable in recent years. The cost of solar panels has dropped by 90% since 2010, making it accessible to more households and businesses worldwide.

Paragraph B: Wind energy is another rapidly growing renewable source. Modern wind turbines can generate electricity even in low wind conditions, and offshore wind farms are particularly efficient.

Paragraph C: Hydroelectric power remains the largest source of renewable electricity globally. Dams and water turbines convert the energy of flowing water into electricity with minimal environmental impact.

Paragraph D: Geothermal energy harnesses heat from beneath the Earth''s surface. Countries like Iceland use geothermal power for both electricity generation and heating buildings.

Paragraph E: The future of renewable energy looks promising. Experts predict that by 2050, renewable sources could provide 80% of global electricity needs.',
  1,
  5
);

INSERT INTO questions (id, exercise_id, section_id, question_number, question_type, question_text, points, display_order)
VALUES
  ('q-read-2-1', 'e2222222-2222-2222-2222-222222222222', 'sec-read-2-1', 1, 'matching_headings', 'Paragraph A', 1, 1),
  ('q-read-2-2', 'e2222222-2222-2222-2222-222222222222', 'sec-read-2-1', 2, 'matching_headings', 'Paragraph B', 1, 2),
  ('q-read-2-3', 'e2222222-2222-2222-2222-222222222222', 'sec-read-2-1', 3, 'matching_headings', 'Paragraph C', 1, 3),
  ('q-read-2-4', 'e2222222-2222-2222-2222-222222222222', 'sec-read-2-1', 4, 'matching_headings', 'Paragraph D', 1, 4),
  ('q-read-2-5', 'e2222222-2222-2222-2222-222222222222', 'sec-read-2-1', 5, 'matching_headings', 'Paragraph E', 1, 5);

-- For matching headings, we use options
INSERT INTO question_options (id, question_id, option_label, option_text, is_correct, display_order)
VALUES
  -- Q1 options
  (uuid_generate_v4(), 'q-read-2-1', 'i', 'The declining cost of solar technology', true, 1),
  (uuid_generate_v4(), 'q-read-2-1', 'ii', 'Wind power advantages', false, 2),
  (uuid_generate_v4(), 'q-read-2-1', 'iii', 'Traditional energy sources', false, 3),
  -- Q2 options
  (uuid_generate_v4(), 'q-read-2-2', 'i', 'Solar innovations', false, 1),
  (uuid_generate_v4(), 'q-read-2-2', 'ii', 'Advances in wind energy', true, 2),
  (uuid_generate_v4(), 'q-read-2-2', 'iii', 'Water power', false, 3),
  -- Q3 options
  (uuid_generate_v4(), 'q-read-2-3', 'i', 'Solar power', false, 1),
  (uuid_generate_v4(), 'q-read-2-3', 'ii', 'Wind turbines', false, 2),
  (uuid_generate_v4(), 'q-read-2-3', 'iii', 'Hydroelectric dominance', true, 3),
  -- Q4 options
  (uuid_generate_v4(), 'q-read-2-4', 'i', 'Solar panels', false, 1),
  (uuid_generate_v4(), 'q-read-2-4', 'ii', 'Wind farms', false, 2),
  (uuid_generate_v4(), 'q-read-2-4', 'iv', 'Geothermal energy uses', true, 4),
  -- Q5 options
  (uuid_generate_v4(), 'q-read-2-5', 'i', 'Current challenges', false, 1),
  (uuid_generate_v4(), 'q-read-2-5', 'ii', 'Renewable energy outlook', true, 2),
  (uuid_generate_v4(), 'q-read-2-5', 'iii', 'Fossil fuel comparison', false, 3);

-- ============================================
-- READING EXERCISES 3 & 4: Add remaining data
-- ============================================

-- Reading Exercise 3: Summary Completion
INSERT INTO exercise_sections (id, exercise_id, section_number, title, instructions, passage_content, display_order, total_questions)
VALUES (
  'sec-read-3-1',
  'e2222222-2222-2222-2222-222222222223',
  1,
  'The Internet Revolution',
  'Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
  'The Internet has transformed modern society in unprecedented ways. It began as a military project in the 1960s called ARPANET, designed to create a decentralized communication network. By the 1990s, the World Wide Web made the Internet accessible to the general public. Today, over 5 billion people use the Internet daily for communication, education, entertainment, and commerce.',
  1,
  5
);

INSERT INTO questions (id, exercise_id, section_id, question_number, question_type, question_text, points, display_order)
VALUES
  ('q-read-3-1', 'e2222222-2222-2222-2222-222222222223', 'sec-read-3-1', 1, 'summary_completion', 'The Internet started as a (1)___ project.', 1, 1),
  ('q-read-3-2', 'e2222222-2222-2222-2222-222222222223', 'sec-read-3-1', 2, 'summary_completion', 'The original network was called (2)___.', 1, 2),
  ('q-read-3-3', 'e2222222-2222-2222-2222-222222222223', 'sec-read-3-1', 3, 'summary_completion', 'The (3)___ made the Internet public in the 1990s.', 1, 3),
  ('q-read-3-4', 'e2222222-2222-2222-2222-222222222223', 'sec-read-3-1', 4, 'summary_completion', 'More than (4)___ people use the Internet daily.', 1, 4),
  ('q-read-3-5', 'e2222222-2222-2222-2222-222222222223', 'sec-read-3-1', 5, 'summary_completion', 'People use it for communication, education, entertainment, and (5)___.', 1, 5);

INSERT INTO question_answers (id, question_id, answer_text, answer_variations)
VALUES
  (uuid_generate_v4(), 'q-read-3-1', 'military', ARRAY['Military']),
  (uuid_generate_v4(), 'q-read-3-2', 'ARPANET', ARRAY['Arpanet']),
  (uuid_generate_v4(), 'q-read-3-3', 'World Wide Web', ARRAY['world wide web', 'WWW']),
  (uuid_generate_v4(), 'q-read-3-4', '5 billion', ARRAY['five billion']),
  (uuid_generate_v4(), 'q-read-3-5', 'commerce', ARRAY['Commerce']);

-- Reading Exercise 4: Full Practice Test (simplified - 15 questions total)
INSERT INTO exercise_sections (id, exercise_id, section_number, title, instructions, passage_content, display_order, total_questions)
VALUES
  ('sec-read-4-1', 'e2222222-2222-2222-2222-222222222224', 1, 'Passage 1: Urban Gardening',
   'Answer questions 1-5. Choose TRUE, FALSE, or NOT GIVEN.',
   'Urban gardening has gained popularity in cities worldwide. People grow vegetables, herbs, and flowers on rooftops, balconies, and community plots. This trend helps reduce food costs, provides fresh produce, and creates green spaces in concrete jungles. Studies show that urban gardens can reduce city temperatures by up to 5 degrees Celsius.',
   1, 5),
  ('sec-read-4-2', 'e2222222-2222-2222-2222-222222222224', 2, 'Passage 2: Space Exploration',
   'Answer questions 6-10. Complete the sentences below with words from the passage.',
   'Space exploration has advanced dramatically since the first satellite launch in 1957. The Apollo 11 mission in 1969 achieved the historic first moon landing. Today, space agencies focus on Mars exploration, with rovers collecting valuable data about the red planet. Private companies like SpaceX have revolutionized space travel with reusable rockets.',
   2, 5),
  ('sec-read-4-3', 'e2222222-2222-2222-2222-222222222224', 3, 'Passage 3: Artificial Intelligence',
   'Answer questions 11-15. Choose the correct answer A, B, C, or D.',
   'Artificial Intelligence (AI) is transforming industries from healthcare to finance. Machine learning algorithms can now diagnose diseases, predict market trends, and even create art. However, AI also raises ethical concerns about privacy, job displacement, and decision-making transparency.',
   3, 5);

-- Passage 1 questions
INSERT INTO questions (id, exercise_id, section_id, question_number, question_type, question_text, points, display_order)
VALUES
  ('q-read-4-1', 'e2222222-2222-2222-2222-222222222224', 'sec-read-4-1', 1, 'true_false_not_given', 'Urban gardening is popular in cities.', 1, 1),
  ('q-read-4-2', 'e2222222-2222-2222-2222-222222222224', 'sec-read-4-1', 2, 'true_false_not_given', 'Gardens can lower city temperatures.', 1, 2),
  ('q-read-4-3', 'e2222222-2222-2222-2222-222222222224', 'sec-read-4-1', 3, 'true_false_not_given', 'All cities provide free gardening tools.', 1, 3),
  ('q-read-4-4', 'e2222222-2222-2222-2222-222222222224', 'sec-read-4-1', 4, 'true_false_not_given', 'Urban gardens reduce food costs.', 1, 4),
  ('q-read-4-5', 'e2222222-2222-2222-2222-222222222224', 'sec-read-4-1', 5, 'true_false_not_given', 'Community gardens are illegal in some areas.', 1, 5);

INSERT INTO question_answers (id, question_id, answer_text)
VALUES
  (uuid_generate_v4(), 'q-read-4-1', 'TRUE'),
  (uuid_generate_v4(), 'q-read-4-2', 'TRUE'),
  (uuid_generate_v4(), 'q-read-4-3', 'NOT GIVEN'),
  (uuid_generate_v4(), 'q-read-4-4', 'TRUE'),
  (uuid_generate_v4(), 'q-read-4-5', 'NOT GIVEN');

-- Passage 2 questions
INSERT INTO questions (id, exercise_id, section_id, question_number, question_type, question_text, points, display_order)
VALUES
  ('q-read-4-6', 'e2222222-2222-2222-2222-222222222224', 'sec-read-4-2', 6, 'sentence_completion', 'The first satellite was launched in ___.', 1, 6),
  ('q-read-4-7', 'e2222222-2222-2222-2222-222222222224', 'sec-read-4-2', 7, 'sentence_completion', 'The first moon landing was achieved by ___.', 1, 7),
  ('q-read-4-8', 'e2222222-2222-2222-2222-222222222224', 'sec-read-4-2', 8, 'sentence_completion', 'Mars rovers collect ___ about the planet.', 1, 8),
  ('q-read-4-9', 'e2222222-2222-2222-2222-222222222224', 'sec-read-4-2', 9, 'sentence_completion', '___ has developed reusable rockets.', 1, 9),
  ('q-read-4-10', 'e2222222-2222-2222-2222-222222222224', 'sec-read-4-2', 10, 'sentence_completion', 'Space agencies focus on ___ exploration.', 1, 10);

INSERT INTO question_answers (id, question_id, answer_text, answer_variations)
VALUES
  (uuid_generate_v4(), 'q-read-4-6', '1957', NULL),
  (uuid_generate_v4(), 'q-read-4-7', 'Apollo 11', ARRAY['apollo 11']),
  (uuid_generate_v4(), 'q-read-4-8', 'data', ARRAY['valuable data']),
  (uuid_generate_v4(), 'q-read-4-9', 'SpaceX', ARRAY['spacex', 'Space X']),
  (uuid_generate_v4(), 'q-read-4-10', 'Mars', ARRAY['mars']);

-- Passage 3 questions (multiple choice)
INSERT INTO questions (id, exercise_id, section_id, question_number, question_type, question_text, points, display_order)
VALUES
  ('q-read-4-11', 'e2222222-2222-2222-2222-222222222224', 'sec-read-4-3', 11, 'multiple_choice', 'What industries does AI transform?', 1, 11),
  ('q-read-4-12', 'e2222222-2222-2222-2222-222222222224', 'sec-read-4-3', 12, 'multiple_choice', 'What can AI algorithms do?', 1, 12),
  ('q-read-4-13', 'e2222222-2222-2222-2222-222222222224', 'sec-read-4-3', 13, 'multiple_choice', 'What concerns does AI raise?', 1, 13),
  ('q-read-4-14', 'e2222222-2222-2222-2222-222222222224', 'sec-read-4-3', 14, 'multiple_choice', 'AI can create:', 1, 14),
  ('q-read-4-15', 'e2222222-2222-2222-2222-222222222224', 'sec-read-4-3', 15, 'multiple_choice', 'The passage discusses AI''s impact on:', 1, 15);

INSERT INTO question_options (id, question_id, option_label, option_text, is_correct, display_order)
VALUES
  -- Q11
  (uuid_generate_v4(), 'q-read-4-11', 'A', 'Only healthcare', false, 1),
  (uuid_generate_v4(), 'q-read-4-11', 'B', 'Healthcare and finance', true, 2),
  (uuid_generate_v4(), 'q-read-4-11', 'C', 'Only technology', false, 3),
  -- Q12
  (uuid_generate_v4(), 'q-read-4-12', 'A', 'Only diagnose diseases', false, 1),
  (uuid_generate_v4(), 'q-read-4-12', 'B', 'Diagnose diseases and predict markets', true, 2),
  (uuid_generate_v4(), 'q-read-4-12', 'C', 'Replace all human jobs', false, 3),
  -- Q13
  (uuid_generate_v4(), 'q-read-4-13', 'A', 'Only privacy', false, 1),
  (uuid_generate_v4(), 'q-read-4-13', 'B', 'Privacy and job loss', true, 2),
  (uuid_generate_v4(), 'q-read-4-13', 'C', 'Only ethics', false, 3),
  -- Q14
  (uuid_generate_v4(), 'q-read-4-14', 'A', 'Art', true, 1),
  (uuid_generate_v4(), 'q-read-4-14', 'B', 'Buildings', false, 2),
  (uuid_generate_v4(), 'q-read-4-14', 'C', 'Food', false, 3),
  -- Q15
  (uuid_generate_v4(), 'q-read-4-15', 'A', 'Entertainment only', false, 1),
  (uuid_generate_v4(), 'q-read-4-15', 'B', 'Multiple industries', true, 2),
  (uuid_generate_v4(), 'q-read-4-15', 'C', 'Education only', false, 3);

-- ============================================
-- STANDALONE EXERCISES
-- ============================================

-- Standalone Listening Mock Test
INSERT INTO exercises (
  id, title, slug, description, skill_type, exercise_type, difficulty,
  total_questions, total_sections, time_limit_minutes, passing_score,
  is_published, display_order, module_id, course_id, created_by
) VALUES (
  'standalone-listen-1',
  'IELTS Listening Mock Test - October 2024',
  'ielts-listening-mock-test-oct-2024',
  'Full-length IELTS Listening practice test with 2 sections. Perfect for exam preparation.',
  'listening',
  'mock_test',
  'medium',
  20,
  2,
  25,
  60,
  true,
  100,
  NULL,
  NULL,
  'f0000000-0000-0000-0000-000000000001'
);

-- Standalone Reading Practice
INSERT INTO exercises (
  id, title, slug, description, skill_type, exercise_type, difficulty,
  total_questions, total_sections, time_limit_minutes, passing_score,
  is_published, display_order, module_id, course_id, created_by
) VALUES (
  'standalone-read-1',
  'IELTS Reading Academic Practice Test',
  'ielts-reading-academic-practice',
  'Complete IELTS Academic Reading test with 2 passages and 20 questions.',
  'reading',
  'mock_test',
  'hard',
  20,
  2,
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
  'standalone-write-1',
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

-- Verify data
SELECT
  e.title,
  e.skill_type,
  e.module_id IS NULL as is_standalone,
  e.total_sections,
  e.total_questions,
  COUNT(DISTINCT es.id) as actual_sections,
  COUNT(q.id) as actual_questions
FROM exercises e
LEFT JOIN exercise_sections es ON e.id = es.exercise_id
LEFT JOIN questions q ON e.id = q.exercise_id
GROUP BY e.id, e.title, e.skill_type, e.module_id, e.total_sections, e.total_questions
ORDER BY e.module_id NULLS LAST, e.created_at;

