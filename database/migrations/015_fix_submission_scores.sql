-- Migration 015: Fix submission scores
-- Purpose: Update completed submissions that have NULL or incorrect scores
-- Score should be percentage (0-100) based on correct_answers/total_questions

-- Fix score calculation for completed submissions
-- Calculate score as percentage: (correct_answers / total_questions) * 100
UPDATE user_exercise_attempts
SET 
    score = ROUND((correct_answers::decimal / NULLIF(total_questions, 0)) * 100, 2),
    updated_at = CURRENT_TIMESTAMP
WHERE 
    status = 'completed'
    AND total_questions > 0
    AND (
        score IS NULL 
        OR score = 0
        OR score < 0
        OR score > 100
    );

-- Also update band_score if it's NULL for completed submissions with valid score
UPDATE user_exercise_attempts uea
SET 
    band_score = CASE
        WHEN correct_percentage < 12.5 THEN 0.0 + (correct_percentage / 12.5 * 3.0)
        WHEN correct_percentage < 30 THEN 3.0 + ((correct_percentage - 12.5) / 17.5 * 1.5)
        WHEN correct_percentage < 50 THEN 4.5 + ((correct_percentage - 30) / 20 * 1.0)
        WHEN correct_percentage < 70 THEN 5.5 + ((correct_percentage - 50) / 20 * 1.5)
        WHEN correct_percentage < 85 THEN 7.0 + ((correct_percentage - 70) / 15 * 1.0)
        WHEN correct_percentage < 95 THEN 8.0 + ((correct_percentage - 85) / 10 * 0.5)
        ELSE 8.5 + ((correct_percentage - 95) / 5 * 0.5)
    END,
    updated_at = CURRENT_TIMESTAMP
FROM (
    SELECT 
        id,
        (correct_answers::decimal / NULLIF(total_questions, 0)) * 100 as correct_percentage
    FROM user_exercise_attempts
    WHERE status = 'completed' AND total_questions > 0 AND band_score IS NULL
) calc
WHERE uea.id = calc.id;

COMMENT ON COLUMN user_exercise_attempts.score IS 'Percentage score (0-100) calculated from correct_answers/total_questions';

