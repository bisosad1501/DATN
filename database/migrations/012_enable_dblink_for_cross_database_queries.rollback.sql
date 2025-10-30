-- ============================================
-- Migration 012 ROLLBACK: Remove dblink Extension
-- ============================================
-- Purpose: Remove dblink extension if needed
-- Date: 2025-10-30
-- Affects: course_db
-- ============================================

-- ⚠️  WARNING: This will break course review queries that fetch user info
-- Only run this if you're reverting the cross-database query functionality

-- Drop the extension
DROP EXTENSION IF EXISTS dblink CASCADE;

-- Verify removal
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'dblink') THEN
        RAISE NOTICE '✅ dblink extension removed successfully';
    ELSE
        RAISE WARNING '⚠️  dblink extension still exists';
    END IF;
END $$;

-- Log rollback completion
DO $$
BEGIN
    RAISE NOTICE '⏪ Rollback 012 completed: dblink extension removed';
    RAISE WARNING '⚠️  Course review user info display will NOT work without dblink';
END $$;

