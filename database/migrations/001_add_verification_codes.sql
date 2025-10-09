-- Migration: Add code column to password_reset_tokens and email_verification_tokens
-- Description: Add code field to store 6-digit verification codes for users

-- Add code column to password_reset_tokens
ALTER TABLE password_reset_tokens 
ADD COLUMN IF NOT EXISTS code VARCHAR(6);

-- Add index for faster code lookup
CREATE INDEX IF NOT EXISTS idx_password_reset_code ON password_reset_tokens(code) WHERE used_at IS NULL;

-- Add code column to email_verification_tokens  
ALTER TABLE email_verification_tokens
ADD COLUMN IF NOT EXISTS code VARCHAR(6);

-- Add index for faster code lookup
CREATE INDEX IF NOT EXISTS idx_email_verification_code ON email_verification_tokens(code) WHERE verified_at IS NULL;

-- Add comment
COMMENT ON COLUMN password_reset_tokens.code IS '6-digit verification code sent to user email';
COMMENT ON COLUMN email_verification_tokens.code IS '6-digit verification code sent to user email';
