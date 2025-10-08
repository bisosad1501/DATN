-- ============================================
-- Notification Service Database Schema
-- ============================================
-- Database: notification_db
-- Purpose: Manage notifications, push notifications, emails

-- CREATE DATABASE notification_db;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
-- All types of notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    
    -- Notification type
    type VARCHAR(50) NOT NULL, -- achievement, reminder, course_update, exercise_graded, system
    category VARCHAR(50) NOT NULL, -- info, success, warning, alert
    
    -- Content
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    
    -- Action data (deep link, etc.)
    action_type VARCHAR(50), -- navigate_to_course, navigate_to_exercise, external_link
    action_data JSONB, -- {course_id: "...", screen: "..."}
    
    -- Visual
    icon_url TEXT,
    image_url TEXT,
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    
    -- Delivery
    is_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP,
    
    -- Scheduling
    scheduled_for TIMESTAMP,
    
    -- Expiry
    expires_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_scheduled_for ON notifications(scheduled_for) WHERE is_sent = false;

-- ============================================
-- PUSH_NOTIFICATIONS TABLE
-- ============================================
-- Push notifications for mobile devices
CREATE TABLE push_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    
    -- Device info
    device_token VARCHAR(500) NOT NULL,
    device_type VARCHAR(20) NOT NULL, -- android, ios
    device_id VARCHAR(255),
    
    -- Notification payload
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    data JSONB, -- Additional data
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- pending, sent, delivered, failed
    
    -- Delivery tracking
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    clicked_at TIMESTAMP,
    
    -- Error handling
    error_message TEXT,
    retry_count INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_push_notifications_user_id ON push_notifications(user_id);
CREATE INDEX idx_push_notifications_device_token ON push_notifications(device_token);
CREATE INDEX idx_push_notifications_status ON push_notifications(status);

-- ============================================
-- EMAIL_NOTIFICATIONS TABLE
-- ============================================
-- Email notifications
CREATE TABLE email_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    
    -- Email details
    to_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    
    -- Template
    template_name VARCHAR(100),
    template_data JSONB,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- pending, sent, delivered, bounced, failed
    
    -- Delivery tracking
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    
    -- External email service
    external_id VARCHAR(255), -- ID from SendGrid, AWS SES, etc.
    
    -- Error handling
    error_message TEXT,
    retry_count INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_email_notifications_user_id ON email_notifications(user_id);
CREATE INDEX idx_email_notifications_to_email ON email_notifications(to_email);
CREATE INDEX idx_email_notifications_status ON email_notifications(status);

-- ============================================
-- DEVICE_TOKENS TABLE
-- ============================================
-- Store device tokens for push notifications
CREATE TABLE device_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    
    -- Device information
    device_token VARCHAR(500) UNIQUE NOT NULL,
    device_type VARCHAR(20) NOT NULL, -- android, ios
    device_id VARCHAR(255),
    device_name VARCHAR(100),
    
    -- App version
    app_version VARCHAR(50),
    
    -- OS information
    os_version VARCHAR(50),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Last used
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_device_tokens_user_id ON device_tokens(user_id);
CREATE INDEX idx_device_tokens_device_token ON device_tokens(device_token);
CREATE INDEX idx_device_tokens_is_active ON device_tokens(is_active);

-- ============================================
-- NOTIFICATION_PREFERENCES TABLE
-- ============================================
-- User preferences for notifications
CREATE TABLE notification_preferences (
    user_id UUID PRIMARY KEY,
    
    -- Push notification preferences
    push_enabled BOOLEAN DEFAULT true,
    push_achievements BOOLEAN DEFAULT true,
    push_reminders BOOLEAN DEFAULT true,
    push_course_updates BOOLEAN DEFAULT true,
    push_exercise_graded BOOLEAN DEFAULT true,
    
    -- Email preferences
    email_enabled BOOLEAN DEFAULT true,
    email_weekly_report BOOLEAN DEFAULT true,
    email_course_updates BOOLEAN DEFAULT true,
    email_marketing BOOLEAN DEFAULT false,
    
    -- In-app preferences
    in_app_enabled BOOLEAN DEFAULT true,
    
    -- Quiet hours
    quiet_hours_enabled BOOLEAN DEFAULT false,
    quiet_hours_start TIME, -- e.g., 22:00
    quiet_hours_end TIME, -- e.g., 08:00
    
    -- Frequency limits
    max_notifications_per_day INT DEFAULT 20,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- NOTIFICATION_TEMPLATES TABLE
-- ============================================
-- Templates for different types of notifications
CREATE TABLE notification_templates (
    id SERIAL PRIMARY KEY,
    
    -- Template identification
    template_code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Template type
    notification_type VARCHAR(50) NOT NULL, -- push, email, in_app
    category VARCHAR(50) NOT NULL,
    
    -- Content (supports variables like {{user_name}}, {{course_title}})
    title_template VARCHAR(500),
    body_template TEXT NOT NULL,
    
    -- For emails
    subject_template VARCHAR(500),
    html_template TEXT,
    
    -- Variables expected
    required_variables TEXT[], -- ['user_name', 'course_title']
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default templates
INSERT INTO notification_templates (template_code, name, notification_type, category, title_template, body_template, required_variables) VALUES
('achievement_unlocked', 'Achievement Unlocked', 'push', 'success', 
 'Chúc mừng! 🎉', 'Bạn đã đạt được thành tựu "{{achievement_name}}"', 
 ARRAY['achievement_name']),
 
('daily_reminder', 'Daily Study Reminder', 'push', 'info',
 'Đã đến giờ học rồi! 📚', 'Hãy dành {{minutes}} phút để tiếp tục hành trình chinh phục IELTS của bạn!',
 ARRAY['minutes']),
 
('exercise_graded', 'Exercise Graded', 'push', 'success',
 'Bài tập đã được chấm điểm', 'Bạn đạt {{score}} điểm trong bài "{{exercise_title}}". Xem chi tiết ngay!',
 ARRAY['score', 'exercise_title']),
 
('writing_evaluated', 'Writing Evaluated', 'push', 'success',
 'Bài viết đã được đánh giá', 'Bạn đạt band {{band_score}} cho bài Writing. Xem phản hồi chi tiết!',
 ARRAY['band_score']),
 
('course_enrolled', 'Course Enrolled', 'email', 'info',
 'Chào mừng đến với khóa học', 'Xin chào {{user_name}},\n\nBạn đã đăng ký thành công khóa học "{{course_title}}". Bắt đầu học ngay!',
 ARRAY['user_name', 'course_title']);

-- ============================================
-- NOTIFICATION_LOGS TABLE
-- ============================================
-- Comprehensive logging of all notification events
CREATE TABLE notification_logs (
    id BIGSERIAL PRIMARY KEY,
    notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,
    user_id UUID NOT NULL,
    
    -- Event details
    event_type VARCHAR(50) NOT NULL, -- created, sent, delivered, read, clicked, failed
    event_status VARCHAR(20) NOT NULL, -- success, failed
    
    -- Notification details
    notification_type VARCHAR(50), -- push, email, in_app
    
    -- Error info
    error_message TEXT,
    
    -- Metadata
    metadata JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_notification_logs_notification_id ON notification_logs(notification_id);
CREATE INDEX idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX idx_notification_logs_event_type ON notification_logs(event_type);
CREATE INDEX idx_notification_logs_created_at ON notification_logs(created_at);

-- ============================================
-- SCHEDULED_NOTIFICATIONS TABLE
-- ============================================
-- Recurring scheduled notifications (like study reminders)
CREATE TABLE scheduled_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    
    -- Schedule details
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    
    -- Schedule type
    schedule_type VARCHAR(20) NOT NULL, -- daily, weekly, monthly, custom
    
    -- Timing
    scheduled_time TIME NOT NULL,
    days_of_week INT[], -- [1,2,3,4,5] for Mon-Fri
    timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Last execution
    last_sent_at TIMESTAMP,
    next_send_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_scheduled_notifications_user_id ON scheduled_notifications(user_id);
CREATE INDEX idx_scheduled_notifications_next_send_at ON scheduled_notifications(next_send_at) WHERE is_active = true;

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
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_device_tokens_updated_at BEFORE UPDATE ON device_tokens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check if user can receive notification based on preferences
CREATE OR REPLACE FUNCTION can_send_notification(
    p_user_id UUID,
    p_notification_type VARCHAR,
    p_category VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
    v_preferences RECORD;
    v_current_time TIME;
    v_notifications_today INT;
BEGIN
    -- Get user preferences
    SELECT * INTO v_preferences
    FROM notification_preferences
    WHERE user_id = p_user_id;
    
    -- If no preferences, use defaults (allow)
    IF NOT FOUND THEN
        RETURN true;
    END IF;
    
    -- Check if notification type is enabled
    IF p_notification_type = 'push' AND NOT v_preferences.push_enabled THEN
        RETURN false;
    ELSIF p_notification_type = 'email' AND NOT v_preferences.email_enabled THEN
        RETURN false;
    END IF;
    
    -- Check quiet hours
    IF v_preferences.quiet_hours_enabled THEN
        v_current_time := CURRENT_TIME;
        IF v_current_time >= v_preferences.quiet_hours_start 
           OR v_current_time <= v_preferences.quiet_hours_end THEN
            RETURN false;
        END IF;
    END IF;
    
    -- Check daily limit
    SELECT COUNT(*) INTO v_notifications_today
    FROM notifications
    WHERE user_id = p_user_id
    AND created_at >= CURRENT_DATE
    AND is_sent = true;
    
    IF v_notifications_today >= v_preferences.max_notifications_per_day THEN
        RETURN false;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
    -- Delete read notifications older than 30 days
    DELETE FROM notifications
    WHERE is_read = true
    AND read_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
    
    -- Delete expired notifications
    DELETE FROM notifications
    WHERE expires_at IS NOT NULL
    AND expires_at < CURRENT_TIMESTAMP;
    
    -- Delete old notification logs (keep 90 days)
    DELETE FROM notification_logs
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE notifications IS 'Tất cả các thông báo trong hệ thống';
COMMENT ON TABLE push_notifications IS 'Push notifications cho mobile app';
COMMENT ON TABLE email_notifications IS 'Email notifications';
COMMENT ON TABLE device_tokens IS 'Device tokens cho push notifications';
COMMENT ON TABLE notification_preferences IS 'Tùy chỉnh thông báo của người dùng';
COMMENT ON TABLE notification_templates IS 'Mẫu thông báo có thể tái sử dụng';
COMMENT ON TABLE scheduled_notifications IS 'Thông báo được lên lịch định kỳ';
