-- ============================================
-- Course Service Database Schema
-- ============================================
-- Database: course_db
-- Purpose: Courses, modules, lessons, videos, learning materials

-- CREATE DATABASE course_db;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- COURSES TABLE
-- ============================================
-- Main course structure
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic information
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(250) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    
    -- Course details
    skill_type VARCHAR(20) NOT NULL, -- listening, reading, writing, speaking, general
    level VARCHAR(20) NOT NULL, -- beginner, elementary, pre-intermediate, intermediate, upper-intermediate, advanced
    target_band_score DECIMAL(2,1), -- 5.0, 6.0, 6.5, 7.0, etc.
    
    -- Content
    thumbnail_url TEXT,
    preview_video_url TEXT,
    
    -- Instructor
    instructor_id UUID NOT NULL, -- References user_id from auth_db
    instructor_name VARCHAR(200),
    
    -- Metadata
    duration_hours DECIMAL(5,2), -- Total course duration
    total_lessons INT DEFAULT 0,
    total_videos INT DEFAULT 0,
    
    -- Enrollment
    enrollment_type VARCHAR(20) DEFAULT 'free', -- free, premium, subscription
    price DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'VND',
    
    -- Status and visibility
    status VARCHAR(20) DEFAULT 'draft', -- draft, published, archived
    is_featured BOOLEAN DEFAULT false,
    is_recommended BOOLEAN DEFAULT false,
    
    -- Stats
    total_enrollments INT DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INT DEFAULT 0,
    
    -- SEO
    meta_title VARCHAR(200),
    meta_description TEXT,
    meta_keywords VARCHAR(500),
    
    -- Ordering
    display_order INT DEFAULT 0,
    
    -- Timestamps
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_courses_skill_type ON courses(skill_type);
CREATE INDEX idx_courses_level ON courses(level);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX idx_courses_slug ON courses(slug) WHERE deleted_at IS NULL;

-- ============================================
-- MODULES TABLE
-- ============================================
-- Course modules/sections
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    
    -- Module information
    title VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Content
    duration_hours DECIMAL(5,2),
    total_lessons INT DEFAULT 0,
    
    -- Ordering
    display_order INT NOT NULL DEFAULT 0,
    
    -- Status
    is_published BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_modules_course_id ON modules(course_id);
CREATE INDEX idx_modules_display_order ON modules(course_id, display_order);

-- ============================================
-- LESSONS TABLE
-- ============================================
-- Individual lessons within modules
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    
    -- Lesson information
    title VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Content type
    content_type VARCHAR(50) NOT NULL, -- video, article, quiz, exercise, mixed
    
    -- Duration
    duration_minutes INT,
    
    -- Ordering
    display_order INT NOT NULL DEFAULT 0,
    
    -- Access control
    is_free BOOLEAN DEFAULT false, -- Free preview lesson
    is_published BOOLEAN DEFAULT true,
    
    -- Completion criteria
    completion_criteria JSONB, -- {video_watch_percentage: 80, quiz_pass_score: 70}
    
    -- Stats
    total_completions INT DEFAULT 0,
    average_time_spent INT, -- in minutes
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_lessons_module_id ON lessons(module_id);
CREATE INDEX idx_lessons_course_id ON lessons(course_id);
CREATE INDEX idx_lessons_display_order ON lessons(module_id, display_order);

-- ============================================
-- LESSON_VIDEOS TABLE
-- ============================================
-- Video content for lessons
CREATE TABLE lesson_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    
    -- Video information
    title VARCHAR(200),
    description TEXT,
    
    -- Video source
    video_url TEXT NOT NULL,
    video_provider VARCHAR(50) DEFAULT 'self-hosted', -- self-hosted, youtube, vimeo
    video_id VARCHAR(200), -- External video ID
    
    -- Video metadata
    duration_seconds INT,
    thumbnail_url TEXT,
    
    -- Quality options
    resolutions JSONB, -- [{quality: "720p", url: "..."}, {quality: "1080p", url: "..."}]
    
    -- Subtitles
    has_subtitles BOOLEAN DEFAULT false,
    subtitle_languages VARCHAR(100)[], -- ['vi', 'en']
    
    -- Ordering (if lesson has multiple videos)
    display_order INT DEFAULT 0,
    
    -- Stats
    total_views INT DEFAULT 0,
    average_watch_percentage DECIMAL(5,2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_lesson_videos_lesson_id ON lesson_videos(lesson_id);

-- ============================================
-- VIDEO_SUBTITLES TABLE
-- ============================================
-- Subtitle files for videos
CREATE TABLE video_subtitles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID NOT NULL REFERENCES lesson_videos(id) ON DELETE CASCADE,
    
    language VARCHAR(10) NOT NULL, -- vi, en
    subtitle_url TEXT NOT NULL,
    format VARCHAR(20) DEFAULT 'vtt', -- vtt, srt
    
    is_default BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_video_subtitles_video_id ON video_subtitles(video_id);

-- ============================================
-- LESSON_MATERIALS TABLE
-- ============================================
-- Additional learning materials (PDFs, documents, etc.)
CREATE TABLE lesson_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    
    -- Material information
    title VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- File details
    file_type VARCHAR(50) NOT NULL, -- pdf, doc, ppt, zip, etc.
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    
    -- Ordering
    display_order INT DEFAULT 0,
    
    -- Stats
    total_downloads INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_lesson_materials_lesson_id ON lesson_materials(lesson_id);

-- ============================================
-- COURSE_ENROLLMENTS TABLE
-- ============================================
-- Track user course enrollments
CREATE TABLE course_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- References user_id from auth_db
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    
    -- Enrollment details
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    enrollment_type VARCHAR(20) NOT NULL, -- free, purchased, gifted
    
    -- Payment info (if applicable)
    payment_id UUID,
    amount_paid DECIMAL(10,2),
    currency VARCHAR(10),
    
    -- Progress tracking
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    lessons_completed INT DEFAULT 0,
    total_time_spent_minutes INT DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- active, completed, dropped, expired
    completed_at TIMESTAMP,
    certificate_issued BOOLEAN DEFAULT false,
    certificate_url TEXT,
    
    -- Access
    expires_at TIMESTAMP, -- For time-limited courses
    last_accessed_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, course_id)
);

-- Indexes
CREATE INDEX idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX idx_course_enrollments_status ON course_enrollments(status);

-- ============================================
-- LESSON_PROGRESS TABLE
-- ============================================
-- Track user progress for individual lessons
CREATE TABLE lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    
    -- Progress
    status VARCHAR(20) DEFAULT 'not_started', -- not_started, in_progress, completed
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Video progress
    video_watched_seconds INT DEFAULT 0,
    video_total_seconds INT,
    -- time_spent_minutes REMOVED by Migration 013; video_watch_percentage REMOVED by Migration 011
    
    -- Completion
    completed_at TIMESTAMP,
    
    -- Timestamps
    first_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, lesson_id)
);

-- Indexes
CREATE INDEX idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);
CREATE INDEX idx_lesson_progress_status ON lesson_progress(status);

-- ============================================
-- VIDEO_WATCH_HISTORY TABLE
-- ============================================
-- Detailed video watching history
CREATE TABLE video_watch_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    video_id UUID NOT NULL REFERENCES lesson_videos(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    
    -- Watch details
    watched_seconds INT NOT NULL,
    total_seconds INT NOT NULL,
    watch_percentage DECIMAL(5,2),
    
    -- Session info
    session_id UUID,
    device_type VARCHAR(20), -- web, android, ios
    
    -- Timestamp
    watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_video_watch_history_user_id ON video_watch_history(user_id);
CREATE INDEX idx_video_watch_history_video_id ON video_watch_history(video_id);
CREATE INDEX idx_video_watch_history_watched_at ON video_watch_history(watched_at);

-- ============================================
-- COURSE_REVIEWS TABLE
-- ============================================
-- User reviews for courses
CREATE TABLE course_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    
    -- Review content
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    comment TEXT,
    
    -- Helpful votes
    helpful_count INT DEFAULT 0,
    
    -- Status
    is_approved BOOLEAN DEFAULT false,
    approved_by UUID,
    approved_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, course_id)
);

-- Indexes
CREATE INDEX idx_course_reviews_course_id ON course_reviews(course_id);
CREATE INDEX idx_course_reviews_rating ON course_reviews(rating);
CREATE INDEX idx_course_reviews_is_approved ON course_reviews(is_approved);

-- ============================================
-- COURSE_CATEGORIES TABLE
-- ============================================
-- Categories/tags for courses
CREATE TABLE course_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    
    parent_id INT REFERENCES course_categories(id),
    
    display_order INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO course_categories (name, slug, description) VALUES
('Listening', 'listening', 'Các khóa học kỹ năng Listening'),
('Reading', 'reading', 'Các khóa học kỹ năng Reading'),
('Writing', 'writing', 'Các khóa học kỹ năng Writing'),
('Speaking', 'speaking', 'Các khóa học kỹ năng Speaking'),
('Grammar', 'grammar', 'Các khóa học ngữ pháp'),
('Vocabulary', 'vocabulary', 'Các khóa học từ vựng'),
('Test Preparation', 'test-preparation', 'Luyện đề thi IELTS'),
('Academic IELTS', 'academic-ielts', 'IELTS Academic'),
('General IELTS', 'general-ielts', 'IELTS General Training');

-- ============================================
-- COURSE_CATEGORY_MAPPING TABLE
-- ============================================
-- Many-to-many relationship between courses and categories
CREATE TABLE course_category_mapping (
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES course_categories(id) ON DELETE CASCADE,
    
    PRIMARY KEY (course_id, category_id)
);

-- Indexes
CREATE INDEX idx_course_category_mapping_course_id ON course_category_mapping(course_id);
CREATE INDEX idx_course_category_mapping_category_id ON course_category_mapping(category_id);

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
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update course stats when enrollment changes
CREATE OR REPLACE FUNCTION update_course_enrollment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE courses 
        SET total_enrollments = total_enrollments + 1
        WHERE id = NEW.course_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE courses 
        SET total_enrollments = GREATEST(0, total_enrollments - 1)
        WHERE id = OLD.course_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_course_enrollment_count
    AFTER INSERT OR DELETE ON course_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_course_enrollment_count();

-- Function to update course average rating
CREATE OR REPLACE FUNCTION update_course_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE courses
    SET average_rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM course_reviews
        WHERE course_id = NEW.course_id AND is_approved = true
    ),
    total_reviews = (
        SELECT COUNT(*)
        FROM course_reviews
        WHERE course_id = NEW.course_id AND is_approved = true
    )
    WHERE id = NEW.course_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_course_rating
    AFTER INSERT OR UPDATE ON course_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_course_rating();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE courses IS 'Bảng khóa học chính';
COMMENT ON TABLE modules IS 'Các module/phần trong khóa học';
COMMENT ON TABLE lessons IS 'Các bài học cụ thể';
COMMENT ON TABLE lesson_videos IS 'Video bài giảng';
COMMENT ON TABLE course_enrollments IS 'Đăng ký khóa học của học viên';
COMMENT ON TABLE lesson_progress IS 'Tiến trình học từng bài học';
COMMENT ON TABLE course_reviews IS 'Đánh giá khóa học';
