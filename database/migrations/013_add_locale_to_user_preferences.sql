-- ============================================
-- Migration: Add locale to user_preferences
-- Description: Adds language/locale preference to user_preferences table
-- Date: 2025-01-XX
-- ============================================

-- Add locale column to user_preferences table
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS locale VARCHAR(10) DEFAULT 'vi';

-- Update existing records to have default locale
UPDATE user_preferences 
SET locale = 'vi' 
WHERE locale IS NULL;

-- Add comment
COMMENT ON COLUMN user_preferences.locale IS 'User interface language: vi (Vietnamese), en (English)';

