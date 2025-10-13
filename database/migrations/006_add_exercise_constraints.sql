-- Migration: Add unique constraint for exercise service fixes
-- Date: 2025-10-13
-- Description: Add unique constraint to prevent duplicate answer submissions (FIX #12)

-- Add unique constraint on (attempt_id, question_id) to prevent race conditions
ALTER TABLE user_answers 
ADD CONSTRAINT user_answers_attempt_question_unique 
UNIQUE (attempt_id, question_id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_answers_attempt_question 
ON user_answers(attempt_id, question_id);

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT user_answers_attempt_question_unique ON user_answers IS 
'Prevents duplicate answer submissions for the same question in the same attempt (FIX #12 - Race Condition Prevention)';
