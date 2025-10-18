-- Migration: Add performance indexes for computed fields
-- Created: 2025-10-17
-- Purpose: Optimize COUNT queries for total_lessons calculation

-- Enable pg_trgm extension for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Index for lessons count by course (used in total_lessons computation)
CREATE INDEX IF NOT EXISTS idx_lessons_course_id_perf 
ON lessons(course_id);

-- Index for modules count by course
CREATE INDEX IF NOT EXISTS idx_modules_course_id_perf 
ON modules(course_id);

-- Index for lessons by module (for module.total_lessons)
CREATE INDEX IF NOT EXISTS idx_lessons_module_id_perf 
ON lessons(module_id);

-- Composite index for course filtering and sorting
CREATE INDEX IF NOT EXISTS idx_courses_status_display 
ON courses(status, display_order, created_at);

-- Index for course search (text search)
CREATE INDEX IF NOT EXISTS idx_courses_title_search 
ON courses USING gin(title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_courses_desc_search 
ON courses USING gin(description gin_trgm_ops);

-- Index for filtering
CREATE INDEX IF NOT EXISTS idx_courses_skill_level 
ON courses(skill_type, level);

CREATE INDEX IF NOT EXISTS idx_courses_enrollment_type 
ON courses(enrollment_type);

CREATE INDEX IF NOT EXISTS idx_courses_featured 
ON courses(is_featured) WHERE is_featured = true;

-- Comments
COMMENT ON INDEX idx_lessons_course_id_perf IS 'Optimize total_lessons COUNT query';
COMMENT ON INDEX idx_modules_course_id_perf IS 'Optimize module count queries';
COMMENT ON INDEX idx_lessons_module_id_perf IS 'Optimize module total_lessons query';
COMMENT ON INDEX idx_courses_status_display IS 'Optimize course listing queries';
COMMENT ON INDEX idx_courses_title_search IS 'Optimize course title search';
COMMENT ON INDEX idx_courses_desc_search IS 'Optimize course description search';
