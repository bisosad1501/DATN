-- Migration 016: Add performance indexes for leaderboard queries
-- Purpose: Optimize leaderboard queries by adding indexes on frequently accessed columns
-- Created: 2025-10-31

-- Index for user_achievements COUNT queries (used in leaderboard ranking)
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id_count 
ON user_achievements(user_id);

-- Composite index for better performance when grouping by user_id
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_earned 
ON user_achievements(user_id, earned_at DESC);

-- Index for study_sessions aggregation (SUM duration_minutes by user_id)
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_duration 
ON study_sessions(user_id, duration_minutes);

-- Composite index for filtering active users in leaderboard
CREATE INDEX IF NOT EXISTS idx_user_profiles_leaderboard 
ON user_profiles(user_id, full_name) WHERE full_name IS NOT NULL;

-- Index for learning_progress current_streak_days (used in leaderboard display)
CREATE INDEX IF NOT EXISTS idx_learning_progress_streak 
ON learning_progress(user_id, current_streak_days DESC);

-- Comments
COMMENT ON INDEX idx_user_achievements_user_id_count IS 'Optimize COUNT(*) queries for achievements in leaderboard';
COMMENT ON INDEX idx_user_achievements_user_earned IS 'Optimize achievement queries with date sorting';
COMMENT ON INDEX idx_study_sessions_user_duration IS 'Optimize SUM(duration_minutes) aggregation for leaderboard';
COMMENT ON INDEX idx_user_profiles_leaderboard IS 'Optimize user profile lookups in leaderboard';
COMMENT ON INDEX idx_learning_progress_streak IS 'Optimize streak queries for leaderboard display';

