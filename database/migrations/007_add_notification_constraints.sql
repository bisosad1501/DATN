-- ============================================
-- Migration 007: Notification Service Constraints
-- ============================================
-- Purpose: Add constraints to prevent race conditions and duplicates
-- Date: 2025-10-13
-- Issues Fixed: #20 (Device Token), #22 (Scheduled Notification), #24/#25 (Timezone)

-- ISSUE #20: Unique constraint for active device tokens
-- Prevents multiple active tokens for same device (race condition in RegisterDeviceToken)
CREATE UNIQUE INDEX IF NOT EXISTS idx_device_tokens_device_token_active 
ON device_tokens(device_token) WHERE is_active = true;

COMMENT ON INDEX idx_device_tokens_device_token_active IS 
'Prevents duplicate active device tokens (ISSUE #20 - Device Token Race Condition Prevention)';

-- ISSUE #22: Unique constraint for scheduled notifications
-- Prevents duplicate schedules (same user, type, time, title)
CREATE UNIQUE INDEX IF NOT EXISTS idx_scheduled_notifications_unique
ON scheduled_notifications(user_id, schedule_type, scheduled_time, title)
WHERE is_active = true;

COMMENT ON INDEX idx_scheduled_notifications_unique IS
'Prevents duplicate scheduled notifications (ISSUE #22 - Duplicate Schedule Prevention)';

-- ISSUE #24/#25: Add timezone to notification_preferences if not exists
-- Enables proper timezone handling for quiet hours and daily limits
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notification_preferences' 
        AND column_name = 'timezone'
    ) THEN
        ALTER TABLE notification_preferences 
        ADD COLUMN timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh';
        
        COMMENT ON COLUMN notification_preferences.timezone IS
        'User timezone for quiet hours and daily limit calculations (ISSUE #24, #25)';
    END IF;
END $$;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_device_tokens_user_active 
ON device_tokens(user_id, is_active);

COMMENT ON INDEX idx_device_tokens_user_active IS
'Improves performance for querying user active tokens';
