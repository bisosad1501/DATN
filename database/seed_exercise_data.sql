-- ============================================
-- SEED DATA FOR EXERCISE SERVICE
-- ============================================
-- Purpose: Insert complete sample data for testing Listening and Reading exercises
-- Usage: psql -U postgres -d exercise_db -f seed_exercise_data.sql

-- Clean existing data (optional - comment out if you want to keep existing data)
-- DELETE FROM user_answers;
-- DELETE FROM user_exercise_attempts;
-- DELETE FROM question_options;
-- DELETE FROM question_answers;
-- DELETE FROM questions;
-- DELETE FROM exercise_sections;
-- DELETE FROM exercises;

-- ============================================
-- 1. LISTENING EXERCISE - Complete Test
-- ============================================

-- Insert Listening Exercise
INSERT INTO exercises (
    id, title, slug, description, exercise_type, skill_type, difficulty, ielts_level,
    total_questions, total_sections, time_limit_minutes, passing_score, total_points,
    is_free, is_published, created_by, display_order
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'IELTS Listening Practice Test - Complete',
    'ielts-listening-practice-test-complete',
    'Full IELTS Listening test with 4 sections covering various topics and question types',
    'practice',
    'listening',
    'medium',
    'band 6.0-7.0',
    40,
    4,
    30,
    60.00,
    40.00,
    true,
    true,
    '00000000-0000-0000-0000-000000000001', -- Replace with actual instructor ID
    1
);

-- Section 1: Social Conversation (Questions 1-10)
INSERT INTO exercise_sections (
    id, exercise_id, title, description, section_number,
    audio_url, transcript, instructions, total_questions, display_order
) VALUES (
    '11111111-1111-1111-1111-111111111101',
    '11111111-1111-1111-1111-111111111111',
    'Section 1: Hotel Booking',
    'A conversation between a customer and a hotel receptionist',
    1,
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', -- Sample audio URL
    'Receptionist: Good morning, Grand Hotel. How may I help you?
Customer: Hello, I''d like to make a reservation for next weekend.
Receptionist: Certainly. What dates are you looking at?
Customer: Friday the 15th to Sunday the 17th of March.
Receptionist: Let me check our availability... Yes, we have rooms available. How many guests?
Customer: Just two adults.
Receptionist: Would you prefer a double room or twin beds?
Customer: A double room, please. And does it have a sea view?
Receptionist: Yes, our deluxe rooms have beautiful ocean views. The rate is $180 per night.
Customer: That sounds perfect. Does the price include breakfast?
Receptionist: Yes, it includes a full buffet breakfast served from 7 to 10 AM.',
    '<p><strong>Listen to the conversation and answer questions 1-5.</strong></p>
<p>You will hear a conversation between a customer and a hotel receptionist.</p>
<p>Complete the form below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.</p>',
    5,
    1
);

-- Questions for Section 1
INSERT INTO questions (id, exercise_id, section_id, question_number, question_text, question_type, points, display_order) VALUES
('11111111-1111-1111-1111-111111111201', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111101', 1, 'Check-in date: Friday _____ March', 'fill_in_blank', 1.00, 1),
('11111111-1111-1111-1111-111111111202', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111101', 2, 'Number of guests: _____', 'fill_in_blank', 1.00, 2),
('11111111-1111-1111-1111-111111111203', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111101', 3, 'Room type: _____ room', 'fill_in_blank', 1.00, 3),
('11111111-1111-1111-1111-111111111204', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111101', 4, 'Price per night: $_____', 'fill_in_blank', 1.00, 4),
('11111111-1111-1111-1111-111111111205', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111101', 5, 'Breakfast is served until _____ AM', 'fill_in_blank', 1.00, 5);

-- Answers for Section 1
INSERT INTO question_answers (question_id, answer_text, answer_variations) VALUES
('11111111-1111-1111-1111-111111111201', '15th', ARRAY['15th', '15', 'the 15th']),
('11111111-1111-1111-1111-111111111202', 'two', ARRAY['two', '2', 'two adults']),
('11111111-1111-1111-1111-111111111203', 'double', ARRAY['double']),
('11111111-1111-1111-1111-111111111204', '180', ARRAY['180', '$180', '180 dollars']),
('11111111-1111-1111-1111-111111111205', '10', ARRAY['10', '10 AM', 'ten']);

-- Section 2: Multiple Choice (Questions 6-10)
INSERT INTO exercise_sections (
    id, exercise_id, title, description, section_number,
    audio_url, transcript, instructions, total_questions, display_order
) VALUES (
    '11111111-1111-1111-1111-111111111102',
    '11111111-1111-1111-1111-111111111111',
    'Section 2: City Tour Information',
    'A tour guide describing a city tour',
    2,
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    'Guide: Welcome to our Historic City Tour. Today we''ll visit three main attractions. First, we''ll start at the Old Town Square, which dates back to the 14th century. The square is famous for its astronomical clock that performs every hour. Next, we''ll walk to the Royal Palace, built in 1520. The palace has 250 rooms, but only 50 are open to the public. Finally, we''ll end at the National Museum, which houses over 2 million artifacts. The tour lasts approximately 3 hours, and we''ll have a 30-minute lunch break at a local restaurant.',
    '<p><strong>Listen to the tour guide and answer questions 6-10.</strong></p>
<p>Choose the correct letter, <strong>A, B, or C</strong>.</p>',
    5,
    2
);

-- Questions for Section 2 (Multiple Choice)
INSERT INTO questions (id, exercise_id, section_id, question_number, question_text, question_type, points, display_order) VALUES
('11111111-1111-1111-1111-111111111206', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111102', 6, 'The Old Town Square is famous for its', 'multiple_choice', 1.00, 6),
('11111111-1111-1111-1111-111111111207', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111102', 7, 'The Royal Palace was built in', 'multiple_choice', 1.00, 7),
('11111111-1111-1111-1111-111111111208', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111102', 8, 'How many rooms in the palace are open to visitors?', 'multiple_choice', 1.00, 8),
('11111111-1111-1111-1111-111111111209', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111102', 9, 'The National Museum contains', 'multiple_choice', 1.00, 9),
('11111111-1111-1111-1111-111111111210', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111102', 10, 'The total tour duration is', 'multiple_choice', 1.00, 10);

-- Options for Question 6
INSERT INTO question_options (question_id, option_label, option_text, is_correct, display_order) VALUES
('11111111-1111-1111-1111-111111111206', 'A', 'astronomical clock', true, 1),
('11111111-1111-1111-1111-111111111206', 'B', 'fountain', false, 2),
('11111111-1111-1111-1111-111111111206', 'C', 'statue', false, 3);

-- Options for Question 7
INSERT INTO question_options (question_id, option_label, option_text, is_correct, display_order) VALUES
('11111111-1111-1111-1111-111111111207', 'A', '1420', false, 1),
('11111111-1111-1111-1111-111111111207', 'B', '1520', true, 2),
('11111111-1111-1111-1111-111111111207', 'C', '1620', false, 3);

-- Options for Question 8
INSERT INTO question_options (question_id, option_label, option_text, is_correct, display_order) VALUES
('11111111-1111-1111-1111-111111111208', 'A', '50', true, 1),
('11111111-1111-1111-1111-111111111208', 'B', '150', false, 2),
('11111111-1111-1111-1111-111111111208', 'C', '250', false, 3);

-- Options for Question 9
INSERT INTO question_options (question_id, option_label, option_text, is_correct, display_order) VALUES
('11111111-1111-1111-1111-111111111209', 'A', 'over 1 million artifacts', false, 1),
('11111111-1111-1111-1111-111111111209', 'B', 'over 2 million artifacts', true, 2),
('11111111-1111-1111-1111-111111111209', 'C', 'over 3 million artifacts', false, 3);

-- Options for Question 10
INSERT INTO question_options (question_id, option_label, option_text, is_correct, display_order) VALUES
('11111111-1111-1111-1111-111111111210', 'A', '2 hours', false, 1),
('11111111-1111-1111-1111-111111111210', 'B', '3 hours', true, 2),
('11111111-1111-1111-1111-111111111210', 'C', '4 hours', false, 3);

-- ============================================
-- 2. READING EXERCISE - Complete Test
-- ============================================

-- Insert Reading Exercise
INSERT INTO exercises (
    id, title, slug, description, exercise_type, skill_type, difficulty, ielts_level,
    total_questions, total_sections, time_limit_minutes, passage_count, passing_score, total_points,
    is_free, is_published, created_by, display_order
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    'IELTS Reading Practice Test - Academic',
    'ielts-reading-practice-test-academic',
    'Full IELTS Academic Reading test with 3 passages covering various topics',
    'practice',
    'reading',
    'medium',
    'band 6.5-7.5',
    40,
    3,
    60,
    3,
    60.00,
    40.00,
    true,
    true,
    '00000000-0000-0000-0000-000000000001',
    2
);

-- Reading Section 1: Climate Change
INSERT INTO exercise_sections (
    id, exercise_id, title, description, section_number,
    passage_title, passage_content, passage_word_count, instructions, total_questions, display_order
) VALUES (
    '22222222-2222-2222-2222-222222222201',
    '22222222-2222-2222-2222-222222222222',
    'Passage 1: Climate Change and Its Effects',
    'An academic passage about climate change',
    1,
    'The Impact of Climate Change on Global Ecosystems',
    '<h3>The Impact of Climate Change on Global Ecosystems</h3>

<p>Climate change represents one of the most significant challenges facing our planet today. Over the past century, global temperatures have risen by approximately 1.1 degrees Celsius, primarily due to human activities such as burning fossil fuels, deforestation, and industrial processes. This warming trend has triggered a cascade of environmental changes that affect ecosystems worldwide.</p>

<p>The effects of climate change are particularly evident in polar regions, where ice sheets and glaciers are melting at unprecedented rates. The Arctic sea ice extent has declined by about 13% per decade since 1979, threatening species such as polar bears and seals that depend on ice for hunting and breeding. Similarly, the Antarctic ice sheet is losing mass at an accelerating rate, contributing to rising sea levels that threaten coastal communities globally.</p>

<p>Ocean ecosystems are also experiencing dramatic changes. As the oceans absorb excess carbon dioxide from the atmosphere, they become more acidic, a process known as ocean acidification. This phenomenon poses a severe threat to marine life, particularly organisms with calcium carbonate shells or skeletons, such as corals, mollusks, and some plankton species. Coral reefs, often called the "rainforests of the sea," are especially vulnerable, with mass bleaching events becoming increasingly common.</p>

<p>Terrestrial ecosystems face their own set of challenges. Many plant and animal species are shifting their ranges toward the poles or to higher elevations in search of suitable climates. However, not all species can migrate quickly enough to keep pace with the rapid rate of climate change. This has led to disruptions in ecological relationships, such as mismatches between the timing of plant flowering and pollinator activity.</p>

<p>Despite these challenges, there is hope. Conservation efforts, renewable energy adoption, and international cooperation through agreements like the Paris Climate Accord demonstrate humanity''s capacity to address this global crisis. Scientists emphasize that limiting global warming to 1.5 degrees Celsius above pre-industrial levels is crucial to preventing the most catastrophic impacts of climate change.</p>',
    350,
    '<p><strong>Read the passage and answer questions 1-13.</strong></p>
<p>You should spend about 20 minutes on this section.</p>',
    13,
    1
);

-- Reading Questions - True/False/Not Given
INSERT INTO questions (id, exercise_id, section_id, question_number, question_text, question_type, points, explanation, display_order) VALUES
('22222222-2222-2222-2222-222222222301', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222201', 1, 'Global temperatures have increased by more than 1 degree Celsius in the last 100 years.', 'true_false_not_given', 1.00, 'The passage states temperatures have risen by approximately 1.1 degrees Celsius.', 1),
('22222222-2222-2222-2222-222222222302', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222201', 2, 'Arctic sea ice has decreased by 13% every year since 1979.', 'true_false_not_given', 1.00, 'The passage says 13% per decade, not per year.', 2),
('22222222-2222-2222-2222-222222222303', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222201', 3, 'Ocean acidification is caused by oceans absorbing carbon dioxide.', 'true_false_not_given', 1.00, 'The passage explicitly states this.', 3);

-- Options for True/False/Not Given questions
INSERT INTO question_options (question_id, option_label, option_text, is_correct, display_order) VALUES
('22222222-2222-2222-2222-222222222301', 'A', 'TRUE', true, 1),
('22222222-2222-2222-2222-222222222301', 'B', 'FALSE', false, 2),
('22222222-2222-2222-2222-222222222301', 'C', 'NOT GIVEN', false, 3);

INSERT INTO question_options (question_id, option_label, option_text, is_correct, display_order) VALUES
('22222222-2222-2222-2222-222222222302', 'A', 'TRUE', false, 1),
('22222222-2222-2222-2222-222222222302', 'B', 'FALSE', true, 2),
('22222222-2222-2222-2222-222222222302', 'C', 'NOT GIVEN', false, 3);

INSERT INTO question_options (question_id, option_label, option_text, is_correct, display_order) VALUES
('22222222-2222-2222-2222-222222222303', 'A', 'TRUE', true, 1),
('22222222-2222-2222-2222-222222222303', 'B', 'FALSE', false, 2),
('22222222-2222-2222-2222-222222222303', 'C', 'NOT GIVEN', false, 3);

-- Update exercise total_questions count
UPDATE exercises SET total_questions = (
    SELECT COUNT(*) FROM questions WHERE exercise_id = exercises.id
) WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');

-- Update section total_questions count
UPDATE exercise_sections SET total_questions = (
    SELECT COUNT(*) FROM questions WHERE section_id = exercise_sections.id
) WHERE exercise_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');

-- Success message
SELECT 'Sample data inserted successfully!' as status,
       (SELECT COUNT(*) FROM exercises WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222')) as exercises_count,
       (SELECT COUNT(*) FROM exercise_sections WHERE exercise_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222')) as sections_count,
       (SELECT COUNT(*) FROM questions WHERE exercise_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222')) as questions_count;

