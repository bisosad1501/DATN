-- ============================================
-- Migration 012: Enable dblink Extension
-- ============================================
-- Purpose: Enable cross-database queries for course reviews to fetch user info
-- Date: 2025-10-30
-- Affects: course_db
-- ============================================

-- Install dblink extension in course_db
-- This allows us to query user_db and auth_db from course_db
CREATE EXTENSION IF NOT EXISTS dblink;

-- Verify installation
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'dblink') THEN
        RAISE NOTICE '✅ dblink extension installed successfully';
    ELSE
        RAISE EXCEPTION '❌ Failed to install dblink extension';
    END IF;
END $$;

-- Test cross-database query (optional - for verification)
-- This should work if user_db has data
DO $$
DECLARE
    test_result INTEGER;
BEGIN
    SELECT COUNT(*) INTO test_result
    FROM dblink(
        'dbname=user_db user=ielts_admin',
        'SELECT 1'
    ) AS t(x INTEGER);
    
    RAISE NOTICE '✅ Cross-database query test successful (result: %)', test_result;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '⚠️  Cross-database query test failed: %', SQLERRM;
END $$;

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE '✅ Migration 012 completed: dblink extension enabled for cross-database queries';
    RAISE NOTICE 'ℹ️  This enables course_reviews to fetch user info from user_db and auth_db';
END $$;

