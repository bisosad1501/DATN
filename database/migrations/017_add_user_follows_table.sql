-- ============================================
-- Migration 017: Add user_follows table
-- ============================================
-- Purpose: Enable social features (follow/unfollow users)
-- Date: 2025-01-XX
-- Affects: user_db
-- ============================================

\c user_db;

-- ============================================
-- USER_FOLLOWS TABLE
-- ============================================
-- Track user follow relationships
CREATE TABLE IF NOT EXISTS user_follows (
    id BIGSERIAL PRIMARY KEY,
    follower_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent self-following
    CONSTRAINT check_no_self_follow CHECK (follower_id != following_id),
    
    -- Unique constraint: one user can only follow another user once
    UNIQUE(follower_id, following_id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_created_at ON user_follows(created_at DESC);

-- Comments
COMMENT ON TABLE user_follows IS 'Tracks user follow relationships for social features';
COMMENT ON COLUMN user_follows.follower_id IS 'User who is following';
COMMENT ON COLUMN user_follows.following_id IS 'User being followed';
COMMENT ON CONSTRAINT check_no_self_follow ON user_follows IS 'Prevents users from following themselves';

-- ============================================
-- VERIFICATION
-- ============================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_follows'
    ) THEN
        RAISE NOTICE '✅ Migration 017 completed: user_follows table created successfully';
    ELSE
        RAISE EXCEPTION '❌ Failed to create user_follows table';
    END IF;
END $$;

