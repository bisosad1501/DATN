-- ============================================
-- Exercise Service Database Schema
-- ============================================
-- Database: exercise_db
-- Purpose: Exercises, questions, answers, submissions for Listening & Reading

-- CREATE DATABASE exercise_db;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- EXERCISES TABLE
-- ============================================
-- Main exercise/test structure
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic information
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(250) UNIQUE NOT NULL,
    description TEXT,
    
    -- Exercise type
    exercise_type VARCHAR(50) NOT NULL, -- practice, mock_test, full_test, mini_test
    skill_type VARCHAR(20) NOT NULL, -- listening, reading
    
    -- Difficulty and level
    difficulty VARCHAR(20) NOT NULL, -- easy, medium, hard
    ielts_level VARCHAR(20), -- band 5.0-6.0, 6.5-7.0, 7.5-8.0
    
    -- Test metadata
    total_questions INT DEFAULT 0,
    total_sections INT DEFAULT 0,
    time_limit_minutes INT, -- null for practice, set for timed tests
    
    -- Content
    thumbnail_url TEXT,
    
    -- For Listening exercises
    audio_url TEXT,
    audio_duration_seconds INT,
    audio_transcript TEXT,
    
    -- For Reading exercises
    passage_count INT,
    
    -- Related course (optional)
    course_id UUID, -- References course from course_db
    lesson_id UUID, -- References lesson from course_db
    
    -- Scoring
    passing_score DECIMAL(5,2), -- e.g., 70.00 for 70%
    total_points DECIMAL(5,2),
    
    -- Access control
    is_free BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    
    -- Stats
    total_attempts INT DEFAULT 0,
    average_score DECIMAL(5,2),
    average_completion_time INT, -- in minutes
    
    -- Ordering
    display_order INT DEFAULT 0,
    
    -- Creator
    created_by UUID NOT NULL, -- instructor_id
    
    -- Timestamps
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_exercises_skill_type ON exercises(skill_type);
CREATE INDEX idx_exercises_exercise_type ON exercises(exercise_type);
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX idx_exercises_is_published ON exercises(is_published);
CREATE INDEX idx_exercises_slug ON exercises(slug) WHERE deleted_at IS NULL;

-- ============================================
-- EXERCISE_SECTIONS TABLE
-- ============================================
-- Sections within an exercise (e.g., Listening Part 1, Part 2, etc.)
CREATE TABLE exercise_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    
    -- Section information
    title VARCHAR(200) NOT NULL,
    description TEXT,
    section_number INT NOT NULL, -- 1, 2, 3, 4
    
    -- For Listening
    audio_url TEXT,
    audio_start_time INT, -- Start time in seconds if using single audio file
    audio_end_time INT,
    transcript TEXT,
    
    -- For Reading
    passage_title VARCHAR(200),
    passage_content TEXT,
    passage_word_count INT,
    
    -- Instructions
    instructions TEXT,
    
    -- Metadata
    total_questions INT DEFAULT 0,
    time_limit_minutes INT,
    
    -- Ordering
    display_order INT NOT NULL DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_exercise_sections_exercise_id ON exercise_sections(exercise_id);
CREATE INDEX idx_exercise_sections_display_order ON exercise_sections(exercise_id, display_order);

-- ============================================
-- QUESTIONS TABLE
-- ============================================
-- Individual questions in exercises
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    section_id UUID REFERENCES exercise_sections(id) ON DELETE CASCADE,
    
    -- Question content
    question_number INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL, -- multiple_choice, true_false_not_given, matching, fill_in_blank, sentence_completion, diagram_labeling
    
    -- For audio/visual questions
    audio_url TEXT,
    image_url TEXT,
    
    -- Context (for questions that share a passage/paragraph)
    context_text TEXT,
    
    -- Metadata
    points DECIMAL(5,2) DEFAULT 1.00,
    difficulty VARCHAR(20), -- easy, medium, hard
    
    -- Explanation
    explanation TEXT, -- Why the answer is correct
    tips TEXT, -- Study tips for this question type
    
    -- Ordering
    display_order INT NOT NULL DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_questions_exercise_id ON questions(exercise_id);
CREATE INDEX idx_questions_section_id ON questions(section_id);
CREATE INDEX idx_questions_question_type ON questions(question_type);
CREATE INDEX idx_questions_display_order ON questions(exercise_id, display_order);

-- ============================================
-- QUESTION_OPTIONS TABLE
-- ============================================
-- Options for multiple choice questions
CREATE TABLE question_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    
    option_label VARCHAR(10) NOT NULL, -- A, B, C, D
    option_text TEXT NOT NULL,
    option_image_url TEXT,
    
    is_correct BOOLEAN DEFAULT false,
    
    display_order INT NOT NULL DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_question_options_question_id ON question_options(question_id);

-- ============================================
-- QUESTION_ANSWERS TABLE
-- ============================================
-- Correct answers for questions (especially for fill-in-blank, matching)
CREATE TABLE question_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    
    -- Answer content
    answer_text TEXT NOT NULL,
    
    -- For case-insensitive matching
    answer_variations TEXT[], -- ['color', 'colour'] for British/American spelling
    
    -- For matching questions
    match_left TEXT, -- Left side item
    match_right TEXT, -- Right side item
    
    is_primary_answer BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_question_answers_question_id ON question_answers(question_id);

-- ============================================
-- USER_EXERCISE_ATTEMPTS TABLE
-- ============================================
-- Track user attempts on exercises
CREATE TABLE user_exercise_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    
    -- Attempt details
    attempt_number INT DEFAULT 1,
    
    -- Status
    status VARCHAR(20) DEFAULT 'in_progress', -- in_progress, completed, abandoned
    
    -- Scoring
    total_questions INT NOT NULL,
    questions_answered INT DEFAULT 0,
    correct_answers INT DEFAULT 0,
    score DECIMAL(5,2), -- Percentage or points
    band_score DECIMAL(2,1), -- IELTS band score
    
    -- Time tracking
    time_limit_minutes INT,
    time_spent_seconds INT DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Metadata
    device_type VARCHAR(20), -- web, android, ios
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_user_exercise_attempts_user_id ON user_exercise_attempts(user_id);
CREATE INDEX idx_user_exercise_attempts_exercise_id ON user_exercise_attempts(exercise_id);
CREATE INDEX idx_user_exercise_attempts_status ON user_exercise_attempts(status);
CREATE INDEX idx_user_exercise_attempts_completed_at ON user_exercise_attempts(completed_at);

-- ============================================
-- USER_ANSWERS TABLE
-- ============================================
-- User's answers to individual questions
CREATE TABLE user_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES user_exercise_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    
    -- Answer content
    answer_text TEXT, -- For text answers
    selected_option_id UUID, -- For multiple choice
    selected_options UUID[], -- For multiple answer questions
    
    -- Grading
    is_correct BOOLEAN,
    points_earned DECIMAL(5,2) DEFAULT 0,
    
    -- Time tracking
    time_spent_seconds INT,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Flag for review
    is_marked_for_review BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_user_answers_attempt_id ON user_answers(attempt_id);
CREATE INDEX idx_user_answers_question_id ON user_answers(question_id);
CREATE INDEX idx_user_answers_user_id ON user_answers(user_id);

-- ============================================
-- QUESTION_BANK TABLE
-- ============================================
-- Reusable question bank for instructors
CREATE TABLE question_bank (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Question metadata
    title VARCHAR(200),
    skill_type VARCHAR(20) NOT NULL, -- listening, reading
    question_type VARCHAR(50) NOT NULL,
    difficulty VARCHAR(20),
    topic VARCHAR(100), -- e.g., "Academic Discussion", "Tourism", "Technology"
    
    -- Question content (similar structure to questions table)
    question_text TEXT NOT NULL,
    context_text TEXT,
    audio_url TEXT,
    image_url TEXT,
    
    -- Answer data (stored as JSONB)
    answer_data JSONB NOT NULL, -- Flexible structure for different question types
    
    -- Tags for organization
    tags VARCHAR(50)[],
    
    -- Usage tracking
    times_used INT DEFAULT 0,
    
    -- Creator
    created_by UUID NOT NULL,
    
    -- Status
    is_verified BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_question_bank_skill_type ON question_bank(skill_type);
CREATE INDEX idx_question_bank_question_type ON question_bank(question_type);
CREATE INDEX idx_question_bank_difficulty ON question_bank(difficulty);
CREATE INDEX idx_question_bank_created_by ON question_bank(created_by);
CREATE INDEX idx_question_bank_tags ON question_bank USING GIN(tags);

-- ============================================
-- EXERCISE_TAGS TABLE
-- ============================================
-- Tags for exercises
CREATE TABLE exercise_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert common tags
INSERT INTO exercise_tags (name, slug) VALUES
('Cambridge IELTS', 'cambridge-ielts'),
('Mock Test', 'mock-test'),
('Practice Test', 'practice-test'),
('Beginner Friendly', 'beginner-friendly'),
('Advanced Level', 'advanced-level'),
('Academic', 'academic'),
('General Training', 'general-training'),
('Map Diagram', 'map-diagram'),
('Multiple Choice', 'multiple-choice'),
('True/False/Not Given', 'true-false-not-given'),
('Matching Headings', 'matching-headings'),
('Sentence Completion', 'sentence-completion');

-- ============================================
-- EXERCISE_TAG_MAPPING TABLE
-- ============================================
CREATE TABLE exercise_tag_mapping (
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    tag_id INT NOT NULL REFERENCES exercise_tags(id) ON DELETE CASCADE,
    
    PRIMARY KEY (exercise_id, tag_id)
);

-- Indexes
CREATE INDEX idx_exercise_tag_mapping_exercise_id ON exercise_tag_mapping(exercise_id);
CREATE INDEX idx_exercise_tag_mapping_tag_id ON exercise_tag_mapping(tag_id);

-- ============================================
-- EXERCISE_ANALYTICS TABLE
-- ============================================
-- Detailed analytics for each exercise
CREATE TABLE exercise_analytics (
    exercise_id UUID PRIMARY KEY REFERENCES exercises(id) ON DELETE CASCADE,
    
    -- Attempt statistics
    total_attempts INT DEFAULT 0,
    completed_attempts INT DEFAULT 0,
    abandoned_attempts INT DEFAULT 0,
    
    -- Score statistics
    average_score DECIMAL(5,2),
    median_score DECIMAL(5,2),
    highest_score DECIMAL(5,2),
    lowest_score DECIMAL(5,2),
    
    -- Time statistics
    average_completion_time INT, -- in seconds
    median_completion_time INT,
    
    -- Difficulty insights (based on user performance)
    actual_difficulty VARCHAR(20), -- May differ from assigned difficulty
    
    -- Question-level stats (stored as JSONB)
    question_statistics JSONB, -- [{question_id: "...", correct_rate: 0.65}, ...]
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_exercise_sections_updated_at BEFORE UPDATE ON exercise_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate band score from raw score
CREATE OR REPLACE FUNCTION calculate_band_score(
    skill VARCHAR(20),
    correct_answers INT,
    total_questions INT
)
RETURNS DECIMAL(2,1) AS $$
DECLARE
    percentage DECIMAL(5,2);
BEGIN
    percentage := (correct_answers::DECIMAL / total_questions) * 100;
    
    -- Simplified band score calculation (adjust based on official IELTS scoring)
    IF skill = 'listening' THEN
        CASE
            WHEN correct_answers >= 37 THEN RETURN 9.0;
            WHEN correct_answers >= 35 THEN RETURN 8.5;
            WHEN correct_answers >= 32 THEN RETURN 8.0;
            WHEN correct_answers >= 30 THEN RETURN 7.5;
            WHEN correct_answers >= 26 THEN RETURN 7.0;
            WHEN correct_answers >= 23 THEN RETURN 6.5;
            WHEN correct_answers >= 18 THEN RETURN 6.0;
            WHEN correct_answers >= 16 THEN RETURN 5.5;
            WHEN correct_answers >= 13 THEN RETURN 5.0;
            ELSE RETURN 4.5;
        END CASE;
    ELSIF skill = 'reading' THEN
        CASE
            WHEN correct_answers >= 39 THEN RETURN 9.0;
            WHEN correct_answers >= 37 THEN RETURN 8.5;
            WHEN correct_answers >= 35 THEN RETURN 8.0;
            WHEN correct_answers >= 33 THEN RETURN 7.5;
            WHEN correct_answers >= 30 THEN RETURN 7.0;
            WHEN correct_answers >= 27 THEN RETURN 6.5;
            WHEN correct_answers >= 23 THEN RETURN 6.0;
            WHEN correct_answers >= 19 THEN RETURN 5.5;
            WHEN correct_answers >= 15 THEN RETURN 5.0;
            ELSE RETURN 4.5;
        END CASE;
    END IF;
    
    RETURN 5.0;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-grade multiple choice answer
CREATE OR REPLACE FUNCTION auto_grade_answer(
    p_question_id UUID,
    p_selected_option_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_is_correct BOOLEAN;
BEGIN
    SELECT is_correct INTO v_is_correct
    FROM question_options
    WHERE id = p_selected_option_id AND question_id = p_question_id;
    
    RETURN COALESCE(v_is_correct, false);
END;
$$ LANGUAGE plpgsql;

-- Update exercise attempt statistics
CREATE OR REPLACE FUNCTION update_exercise_statistics()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Update exercise stats
        UPDATE exercises
        SET total_attempts = total_attempts + 1,
            average_score = (
                SELECT AVG(score)
                FROM user_exercise_attempts
                WHERE exercise_id = NEW.exercise_id AND status = 'completed'
            ),
            average_completion_time = (
                SELECT AVG(time_spent_seconds) / 60
                FROM user_exercise_attempts
                WHERE exercise_id = NEW.exercise_id AND status = 'completed'
            )
        WHERE id = NEW.exercise_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_exercise_statistics
    AFTER UPDATE ON user_exercise_attempts
    FOR EACH ROW
    EXECUTE FUNCTION update_exercise_statistics();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE exercises IS 'Bài tập và đề thi Listening/Reading';
COMMENT ON TABLE exercise_sections IS 'Các phần trong bài tập (Part 1, 2, 3, 4)';
COMMENT ON TABLE questions IS 'Câu hỏi trong bài tập';
COMMENT ON TABLE question_options IS 'Các lựa chọn cho câu hỏi trắc nghiệm';
COMMENT ON TABLE user_exercise_attempts IS 'Lịch sử làm bài của học viên';
COMMENT ON TABLE user_answers IS 'Câu trả lời cụ thể của học viên';
COMMENT ON TABLE question_bank IS 'Ngân hàng câu hỏi có thể tái sử dụng';
