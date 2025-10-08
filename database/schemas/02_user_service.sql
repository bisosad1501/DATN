-- ============================================
-- User Service Database Schema
-- ============================================
-- Database: user_db
-- Purpose: User profiles, learning progress, statistics, goals

-- Create database (run separately)
-- CREATE DATABASE user_db;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USER_PROFILES TABLE
-- ============================================
-- Detailed user profile information
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY, -- References users.id from auth_db
    
    -- Personal information
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(200),
    date_of_birth DATE,
    gender VARCHAR(20), -- male, female, other
    
    -- Contact information
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
    
    -- Avatar and media
    avatar_url TEXT,
    cover_image_url TEXT,
    
    -- IELTS related
    current_level VARCHAR(20), -- beginner, elementary, pre-intermediate, intermediate, upper-intermediate, advanced
    target_band_score DECIMAL(2,1), -- 5.0, 6.5, 7.0, etc.
    target_exam_date DATE,
    
    -- Bio and preferences
    bio TEXT,
    learning_preferences JSONB, -- {study_time_preference: "morning", daily_goal_minutes: 60}
    language_preference VARCHAR(10) DEFAULT 'vi', -- vi, en
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_user_profiles_country ON user_profiles(country);
CREATE INDEX idx_user_profiles_current_level ON user_profiles(current_level);

-- ============================================
-- LEARNING_PROGRESS TABLE
-- ============================================
-- Track overall learning progress for each user
CREATE TABLE learning_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    
    -- Overall statistics
    total_study_hours DECIMAL(10,2) DEFAULT 0,
    total_lessons_completed INT DEFAULT 0,
    total_exercises_completed INT DEFAULT 0,
    
    -- Skill-wise progress (0-100)
    listening_progress DECIMAL(5,2) DEFAULT 0,
    reading_progress DECIMAL(5,2) DEFAULT 0,
    writing_progress DECIMAL(5,2) DEFAULT 0,
    speaking_progress DECIMAL(5,2) DEFAULT 0,
    
    -- Current scores (band scores)
    listening_score DECIMAL(2,1),
    reading_score DECIMAL(2,1),
    writing_score DECIMAL(2,1),
    speaking_score DECIMAL(2,1),
    overall_score DECIMAL(2,1),
    
    -- Streak tracking
    current_streak_days INT DEFAULT 0,
    longest_streak_days INT DEFAULT 0,
    last_study_date DATE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_learning_progress_user_id ON learning_progress(user_id);

-- ============================================
-- SKILL_STATISTICS TABLE
-- ============================================
-- Detailed statistics for each skill
CREATE TABLE skill_statistics (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    
    skill_type VARCHAR(20) NOT NULL, -- listening, reading, writing, speaking
    
    -- Practice statistics
    total_practices INT DEFAULT 0,
    completed_practices INT DEFAULT 0,
    average_score DECIMAL(5,2),
    best_score DECIMAL(5,2),
    
    -- Time spent
    total_time_minutes INT DEFAULT 0,
    
    -- Last practice
    last_practice_date TIMESTAMP,
    last_practice_score DECIMAL(5,2),
    
    -- Improvement tracking
    score_trend JSONB, -- [{date: "2025-01-01", score: 6.5}, ...]
    weak_areas JSONB, -- [{topic: "Multiple Choice", accuracy: 65}, ...]
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, skill_type)
);

-- Indexes
CREATE INDEX idx_skill_statistics_user_id ON skill_statistics(user_id);
CREATE INDEX idx_skill_statistics_skill_type ON skill_statistics(skill_type);

-- ============================================
-- STUDY_SESSIONS TABLE
-- ============================================
-- Track individual study sessions
CREATE TABLE study_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    
    session_type VARCHAR(50) NOT NULL, -- lesson, exercise, practice_test
    skill_type VARCHAR(20), -- listening, reading, writing, speaking
    
    -- Session details
    resource_id UUID, -- ID of lesson, exercise, etc.
    resource_type VARCHAR(50), -- lesson, exercise, mock_test
    
    -- Duration
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    duration_minutes INT,
    
    -- Completion
    is_completed BOOLEAN DEFAULT false,
    completion_percentage DECIMAL(5,2),
    
    -- Performance
    score DECIMAL(5,2),
    
    -- Device info
    device_type VARCHAR(20), -- web, android, ios
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_started_at ON study_sessions(started_at);
CREATE INDEX idx_study_sessions_skill_type ON study_sessions(skill_type);

-- ============================================
-- STUDY_GOALS TABLE
-- ============================================
-- User-defined study goals
CREATE TABLE study_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    
    goal_type VARCHAR(50) NOT NULL, -- daily, weekly, monthly, custom
    
    -- Goal details
    title VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Targets
    target_value INT NOT NULL, -- e.g., 60 minutes, 5 lessons
    target_unit VARCHAR(20) NOT NULL, -- minutes, lessons, exercises
    current_value INT DEFAULT 0,
    
    -- Skill focus (optional)
    skill_type VARCHAR(20), -- listening, reading, writing, speaking, null for general
    
    -- Timeline
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- active, completed, cancelled, expired
    completed_at TIMESTAMP,
    
    -- Reminders
    reminder_enabled BOOLEAN DEFAULT true,
    reminder_time TIME, -- e.g., 19:00
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_study_goals_user_id ON study_goals(user_id);
CREATE INDEX idx_study_goals_status ON study_goals(status);
CREATE INDEX idx_study_goals_end_date ON study_goals(end_date);

-- ============================================
-- ACHIEVEMENTS TABLE
-- ============================================
-- User achievements and badges
CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Achievement criteria
    criteria_type VARCHAR(50) NOT NULL, -- streak, score, completion, time
    criteria_value INT NOT NULL,
    
    -- Display
    icon_url TEXT,
    badge_color VARCHAR(20),
    
    -- Points
    points INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default achievements
INSERT INTO achievements (code, name, description, criteria_type, criteria_value, points) VALUES
('first_lesson', 'Bài học đầu tiên', 'Hoàn thành bài học đầu tiên', 'completion', 1, 10),
('streak_7', '7 ngày liên tiếp', 'Học 7 ngày liên tiếp', 'streak', 7, 50),
('streak_30', '30 ngày liên tiếp', 'Học 30 ngày liên tiếp', 'streak', 30, 200),
('band_6', 'IELTS 6.0', 'Đạt band 6.0 trong bài test', 'score', 60, 100),
('band_7', 'IELTS 7.0', 'Đạt band 7.0 trong bài test', 'score', 70, 150),
('listening_master', 'Listening Master', 'Hoàn thành 100 bài listening', 'completion', 100, 100);

-- ============================================
-- USER_ACHIEVEMENTS TABLE
-- ============================================
-- Track which achievements users have earned
CREATE TABLE user_achievements (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    achievement_id INT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, achievement_id)
);

-- Indexes
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_earned_at ON user_achievements(earned_at);

-- ============================================
-- USER_PREFERENCES TABLE
-- ============================================
-- User application preferences and settings
CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    
    -- Notification preferences
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    study_reminders BOOLEAN DEFAULT true,
    weekly_report BOOLEAN DEFAULT true,
    
    -- Display preferences
    theme VARCHAR(20) DEFAULT 'light', -- light, dark, auto
    font_size VARCHAR(20) DEFAULT 'medium', -- small, medium, large
    
    -- Study preferences
    auto_play_next_lesson BOOLEAN DEFAULT true,
    show_answer_explanation BOOLEAN DEFAULT true,
    playback_speed DECIMAL(3,2) DEFAULT 1.0, -- 0.75, 1.0, 1.25, 1.5, 2.0
    
    -- Privacy
    profile_visibility VARCHAR(20) DEFAULT 'private', -- public, friends, private
    show_study_stats BOOLEAN DEFAULT true,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- STUDY_REMINDERS TABLE
-- ============================================
-- Scheduled study reminders
CREATE TABLE study_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    
    title VARCHAR(200) NOT NULL,
    message TEXT,
    
    -- Schedule
    reminder_type VARCHAR(20) NOT NULL, -- daily, weekly, custom
    reminder_time TIME NOT NULL,
    days_of_week INT[], -- [1,2,3,4,5] for Mon-Fri, 0=Sunday, 6=Saturday
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_sent_at TIMESTAMP,
    next_send_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_study_reminders_user_id ON study_reminders(user_id);
CREATE INDEX idx_study_reminders_next_send_at ON study_reminders(next_send_at) WHERE is_active = true;

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
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_progress_updated_at 
    BEFORE UPDATE ON learning_progress FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skill_statistics_updated_at 
    BEFORE UPDATE ON skill_statistics FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_goals_updated_at 
    BEFORE UPDATE ON study_goals FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate overall IELTS score
CREATE OR REPLACE FUNCTION calculate_overall_score(
    listening DECIMAL,
    reading DECIMAL,
    writing DECIMAL,
    speaking DECIMAL
)
RETURNS DECIMAL AS $$
BEGIN
    RETURN ROUND((listening + reading + writing + speaking) / 4, 1);
END;
$$ LANGUAGE plpgsql;

-- Function to update study streak
CREATE OR REPLACE FUNCTION update_study_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
    v_last_study_date DATE;
    v_current_streak INT;
BEGIN
    SELECT last_study_date, current_streak_days 
    INTO v_last_study_date, v_current_streak
    FROM learning_progress
    WHERE user_id = p_user_id;
    
    -- If studied today, no need to update
    IF v_last_study_date = CURRENT_DATE THEN
        RETURN;
    END IF;
    
    -- If studied yesterday, increment streak
    IF v_last_study_date = CURRENT_DATE - INTERVAL '1 day' THEN
        UPDATE learning_progress
        SET current_streak_days = current_streak_days + 1,
            longest_streak_days = GREATEST(longest_streak_days, current_streak_days + 1),
            last_study_date = CURRENT_DATE
        WHERE user_id = p_user_id;
    ELSE
        -- Streak broken, reset to 1
        UPDATE learning_progress
        SET current_streak_days = 1,
            last_study_date = CURRENT_DATE
        WHERE user_id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE user_profiles IS 'Thông tin chi tiết profile người dùng';
COMMENT ON TABLE learning_progress IS 'Theo dõi tiến trình học tổng thể';
COMMENT ON TABLE skill_statistics IS 'Thống kê chi tiết cho từng kỹ năng';
COMMENT ON TABLE study_sessions IS 'Lịch sử các session học tập';
COMMENT ON TABLE study_goals IS 'Mục tiêu học tập người dùng tự đặt';
COMMENT ON TABLE achievements IS 'Danh sách thành tựu có thể đạt được';
COMMENT ON TABLE user_achievements IS 'Thành tựu người dùng đã đạt được';
