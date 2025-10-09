-- ============================================
-- Auth Service Database Schema
-- ============================================
-- Database: auth_db
-- Purpose: Authentication, authorization, user credentials

-- Create database (run separately)
-- CREATE DATABASE auth_db;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
-- Stores basic authentication credentials
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    phone VARCHAR(20),
    
    -- OAuth fields
    google_id VARCHAR(255),
    oauth_provider VARCHAR(50),
    
    -- Account status
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP,
    
    -- Security
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP,
    last_login_at TIMESTAMP,
    last_login_ip VARCHAR(45),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP -- Soft delete
);

-- Indexes for users table
CREATE UNIQUE INDEX idx_users_email_unique ON users(email) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_users_phone_unique ON users(phone) WHERE phone IS NOT NULL AND deleted_at IS NULL;
CREATE UNIQUE INDEX idx_users_google_id_unique ON users(google_id) WHERE google_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_users_active ON users(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON users(created_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_oauth_provider ON users(oauth_provider) WHERE deleted_at IS NULL;

-- ============================================
-- ROLES TABLE
-- ============================================
-- Define user roles in the system
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- student, instructor, admin
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (name, display_name, description) VALUES
('student', 'Học viên', 'Người dùng học IELTS trên nền tảng'),
('instructor', 'Giảng viên', 'Người tạo và quản lý nội dung học liệu'),
('admin', 'Quản trị viên', 'Quản trị toàn bộ hệ thống');

-- ============================================
-- PERMISSIONS TABLE
-- ============================================
-- Define granular permissions
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    resource VARCHAR(50) NOT NULL, -- courses, exercises, users, etc.
    action VARCHAR(50) NOT NULL, -- create, read, update, delete
    description TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default permissions
INSERT INTO permissions (name, resource, action, description) VALUES
-- Student permissions
('view_courses', 'courses', 'read', 'Xem các khóa học'),
('enroll_course', 'courses', 'create', 'Đăng ký khóa học'),
('submit_exercise', 'exercises', 'create', 'Nộp bài tập'),
('view_own_progress', 'progress', 'read', 'Xem tiến trình của chính mình'),

-- Instructor permissions
('manage_courses', 'courses', 'manage', 'Quản lý khóa học'),
('manage_exercises', 'exercises', 'manage', 'Quản lý bài tập'),
('view_student_progress', 'progress', 'read', 'Xem tiến trình học viên'),

-- Admin permissions
('manage_users', 'users', 'manage', 'Quản lý người dùng'),
('manage_system', 'system', 'manage', 'Quản lý hệ thống'),
('view_analytics', 'analytics', 'read', 'Xem thống kê toàn hệ thống');

-- ============================================
-- USER_ROLES TABLE
-- ============================================
-- Many-to-many relationship between users and roles
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    
    -- Timestamps
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES users(id),
    
    UNIQUE(user_id, role_id)
);

-- Indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

-- ============================================
-- ROLE_PERMISSIONS TABLE
-- ============================================
-- Many-to-many relationship between roles and permissions
CREATE TABLE role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(role_id, permission_id)
);

-- Assign permissions to roles
INSERT INTO role_permissions (role_id, permission_id) VALUES
-- Student role
(1, 1), (1, 2), (1, 3), (1, 4),
-- Instructor role
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 7),
-- Admin role (all permissions)
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 6), (3, 7), (3, 8), (3, 9), (3, 10);

-- ============================================
-- REFRESH_TOKENS TABLE
-- ============================================
-- Store refresh tokens for JWT authentication
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    
    -- Device info
    device_id VARCHAR(255),
    device_name VARCHAR(100),
    device_type VARCHAR(50), -- web, android, ios
    user_agent TEXT,
    ip_address VARCHAR(45),
    
    -- Token lifecycle
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP,
    revoked_by UUID REFERENCES users(id),
    revoked_reason VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- ============================================
-- PASSWORD_RESET_TOKENS TABLE
-- ============================================
-- Store tokens for password reset functionality
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    code VARCHAR(6), -- 6-digit verification code sent to user email
    
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_password_reset_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_token_hash ON password_reset_tokens(token_hash);
CREATE INDEX idx_password_reset_code ON password_reset_tokens(code) WHERE used_at IS NULL;

-- ============================================
-- EMAIL_VERIFICATION_TOKENS TABLE
-- ============================================
-- Store tokens for email verification
CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    code VARCHAR(6), -- 6-digit verification code sent to user email
    
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_email_verification_user_id ON email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_token_hash ON email_verification_tokens(token_hash);
CREATE INDEX idx_email_verification_code ON email_verification_tokens(code) WHERE verified_at IS NULL;

-- ============================================
-- AUDIT_LOGS TABLE
-- ============================================
-- Log all authentication events for security
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    event_type VARCHAR(50) NOT NULL, -- login, logout, register, password_change, etc.
    event_status VARCHAR(20) NOT NULL, -- success, failed
    
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_info JSONB,
    
    metadata JSONB, -- Additional event data
    error_message TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for roles table
CREATE TRIGGER update_roles_updated_at 
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to cleanup expired tokens (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
    -- Delete expired refresh tokens
    DELETE FROM refresh_tokens WHERE expires_at < CURRENT_TIMESTAMP;
    
    -- Delete used/expired password reset tokens
    DELETE FROM password_reset_tokens 
    WHERE expires_at < CURRENT_TIMESTAMP OR used_at IS NOT NULL;
    
    -- Delete verified/expired email verification tokens
    DELETE FROM email_verification_tokens 
    WHERE expires_at < CURRENT_TIMESTAMP OR verified_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE users IS 'Bảng lưu thông tin xác thực người dùng';
COMMENT ON TABLE roles IS 'Bảng vai trò người dùng (student, instructor, admin)';
COMMENT ON TABLE permissions IS 'Bảng phân quyền chi tiết';
COMMENT ON TABLE user_roles IS 'Bảng quan hệ nhiều-nhiều giữa user và role';
COMMENT ON TABLE refresh_tokens IS 'Bảng lưu refresh token cho JWT authentication';
COMMENT ON TABLE audit_logs IS 'Bảng log các sự kiện authentication để audit';
