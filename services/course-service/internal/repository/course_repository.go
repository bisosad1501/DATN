package repository

import (
	"database/sql"
	"fmt"
	"log"
	"math"
	"strings"

	"github.com/bisosad1501/ielts-platform/course-service/internal/models"
	"github.com/google/uuid"
)

type CourseRepository struct {
	db *sql.DB
}

func NewCourseRepository(db *sql.DB) *CourseRepository {
	return &CourseRepository{db: db}
}

// GetCourses retrieves courses with filters
func (r *CourseRepository) GetCourses(query *models.CourseListQuery) ([]models.Course, error) {
	var conditions []string
	var args []interface{}
	argCount := 1

	baseQuery := `
		SELECT c.id, c.title, c.slug, c.description, c.short_description, c.skill_type, c.level, 
			   c.target_band_score, c.thumbnail_url, c.preview_video_url, c.instructor_id, 
			   c.instructor_name, c.duration_hours, 
			   -- Compute total_lessons from actual lessons count
			   COALESCE((SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id), 0) as total_lessons,
			   c.total_videos, 
			   c.enrollment_type, c.price, c.currency, c.status, c.is_featured, c.is_recommended,
			   c.total_enrollments, c.average_rating, c.total_reviews, c.display_order,
			   c.published_at, c.created_at, c.updated_at
		FROM courses c
		WHERE c.status = 'published'
	`

	if query.SkillType != "" {
		conditions = append(conditions, fmt.Sprintf("skill_type = $%d", argCount))
		args = append(args, query.SkillType)
		argCount++
	}

	if query.Level != "" {
		conditions = append(conditions, fmt.Sprintf("level = $%d", argCount))
		args = append(args, query.Level)
		argCount++
	}

	if query.EnrollmentType != "" {
		conditions = append(conditions, fmt.Sprintf("enrollment_type = $%d", argCount))
		args = append(args, query.EnrollmentType)
		argCount++
	}

	if query.IsFeatured != nil {
		conditions = append(conditions, fmt.Sprintf("is_featured = $%d", argCount))
		args = append(args, *query.IsFeatured)
		argCount++
	}

	if query.Search != "" {
		conditions = append(conditions, fmt.Sprintf("(title ILIKE $%d OR description ILIKE $%d)", argCount, argCount))
		args = append(args, "%"+query.Search+"%")
		argCount++
	}

	if len(conditions) > 0 {
		baseQuery += " AND " + strings.Join(conditions, " AND ")
	}

	baseQuery += " ORDER BY display_order ASC, created_at DESC"

	// Pagination
	limit := 20
	if query.Limit > 0 && query.Limit <= 100 {
		limit = query.Limit
	}
	offset := 0
	if query.Page > 0 {
		offset = (query.Page - 1) * limit
	}

	baseQuery += fmt.Sprintf(" LIMIT %d OFFSET %d", limit, offset)

	rows, err := r.db.Query(baseQuery, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var courses []models.Course
	for rows.Next() {
		var course models.Course
		err := rows.Scan(
			&course.ID, &course.Title, &course.Slug, &course.Description, &course.ShortDescription,
			&course.SkillType, &course.Level, &course.TargetBandScore, &course.ThumbnailURL,
			&course.PreviewVideoURL, &course.InstructorID, &course.InstructorName,
			&course.DurationHours, &course.TotalLessons, &course.TotalVideos,
			&course.EnrollmentType, &course.Price, &course.Currency, &course.Status,
			&course.IsFeatured, &course.IsRecommended, &course.TotalEnrollments,
			&course.AverageRating, &course.TotalReviews, &course.DisplayOrder,
			&course.PublishedAt, &course.CreatedAt, &course.UpdatedAt,
		)
		if err != nil {
			log.Printf("Error scanning course: %v", err)
			continue
		}
		courses = append(courses, course)
	}

	return courses, nil
}

// GetCourseByID retrieves a course by ID
func (r *CourseRepository) GetCourseByID(courseID uuid.UUID) (*models.Course, error) {
	query := `
		SELECT c.id, c.title, c.slug, c.description, c.short_description, c.skill_type, c.level, 
			   c.target_band_score, c.thumbnail_url, c.preview_video_url, c.instructor_id, 
			   c.instructor_name, c.duration_hours, 
			   -- Compute total_lessons from actual lessons count
			   COALESCE((SELECT COUNT(*) FROM lessons WHERE course_id = c.id), 0) as total_lessons,
			   c.total_videos, 
			   c.enrollment_type, c.price, c.currency, c.status, c.is_featured, c.is_recommended,
			   c.total_enrollments, c.average_rating, c.total_reviews, c.display_order,
			   c.published_at, c.created_at, c.updated_at
		FROM courses c
		WHERE c.id = $1
	`

	var course models.Course
	err := r.db.QueryRow(query, courseID).Scan(
		&course.ID, &course.Title, &course.Slug, &course.Description, &course.ShortDescription,
		&course.SkillType, &course.Level, &course.TargetBandScore, &course.ThumbnailURL,
		&course.PreviewVideoURL, &course.InstructorID, &course.InstructorName,
		&course.DurationHours, &course.TotalLessons, &course.TotalVideos,
		&course.EnrollmentType, &course.Price, &course.Currency, &course.Status,
		&course.IsFeatured, &course.IsRecommended, &course.TotalEnrollments,
		&course.AverageRating, &course.TotalReviews, &course.DisplayOrder,
		&course.PublishedAt, &course.CreatedAt, &course.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &course, nil
}

// GetModulesByCourseID retrieves modules for a course
func (r *CourseRepository) GetModulesByCourseID(courseID uuid.UUID) ([]models.Module, error) {
	query := `
		SELECT id, course_id, title, description, duration_hours, total_lessons,
			   display_order, is_published, created_at, updated_at
		FROM modules
		WHERE course_id = $1 AND is_published = true
		ORDER BY display_order ASC
	`

	rows, err := r.db.Query(query, courseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var modules []models.Module
	for rows.Next() {
		var module models.Module
		err := rows.Scan(
			&module.ID, &module.CourseID, &module.Title, &module.Description,
			&module.DurationHours, &module.TotalLessons, &module.DisplayOrder,
			&module.IsPublished, &module.CreatedAt, &module.UpdatedAt,
		)
		if err != nil {
			continue
		}
		modules = append(modules, module)
	}

	return modules, nil
}

// GetLessonsByModuleID retrieves lessons for a module
func (r *CourseRepository) GetLessonsByModuleID(moduleID uuid.UUID) ([]models.Lesson, error) {
	query := `
		SELECT 
			l.id, l.module_id, l.course_id, l.title, l.description, l.content_type,
			-- Use video duration if available, fallback to lesson duration_minutes
			CASE 
				WHEN l.content_type = 'video' THEN 
					COALESCE(
						(SELECT CEIL(v.duration_seconds / 60.0) 
						 FROM lesson_videos v 
						 WHERE v.lesson_id = l.id 
						 ORDER BY v.display_order 
						 LIMIT 1),
						l.duration_minutes
					)
				ELSE l.duration_minutes
			END as duration_minutes,
			l.display_order, l.is_free, l.is_published,
			l.total_completions, l.average_time_spent, l.created_at, l.updated_at
		FROM lessons l
		WHERE l.module_id = $1 AND l.is_published = true
		ORDER BY l.display_order ASC
	`

	rows, err := r.db.Query(query, moduleID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lessons []models.Lesson
	for rows.Next() {
		var lesson models.Lesson
		err := rows.Scan(
			&lesson.ID, &lesson.ModuleID, &lesson.CourseID, &lesson.Title,
			&lesson.Description, &lesson.ContentType, &lesson.DurationMinutes,
			&lesson.DisplayOrder, &lesson.IsFree, &lesson.IsPublished,
			&lesson.TotalCompletions, &lesson.AverageTimeSpent,
			&lesson.CreatedAt, &lesson.UpdatedAt,
		)
		if err != nil {
			continue
		}
		lessons = append(lessons, lesson)
	}

	return lessons, nil
}

// GetLessonByID retrieves a lesson by ID
func (r *CourseRepository) GetLessonByID(lessonID uuid.UUID) (*models.Lesson, error) {
	query := `
		SELECT 
			l.id, l.module_id, l.course_id, l.title, l.description, l.content_type,
			-- Use video duration if available, fallback to lesson duration_minutes
			CASE 
				WHEN l.content_type = 'video' THEN 
					COALESCE(
						(SELECT CEIL(v.duration_seconds / 60.0) 
						 FROM lesson_videos v 
						 WHERE v.lesson_id = l.id 
						 ORDER BY v.display_order 
						 LIMIT 1),
						l.duration_minutes
					)
				ELSE l.duration_minutes
			END as duration_minutes,
			l.display_order, l.is_free, l.is_published,
			l.total_completions, l.average_time_spent, l.created_at, l.updated_at
		FROM lessons l
		WHERE l.id = $1
	`

	var lesson models.Lesson
	err := r.db.QueryRow(query, lessonID).Scan(
		&lesson.ID, &lesson.ModuleID, &lesson.CourseID, &lesson.Title,
		&lesson.Description, &lesson.ContentType, &lesson.DurationMinutes,
		&lesson.DisplayOrder, &lesson.IsFree, &lesson.IsPublished,
		&lesson.TotalCompletions, &lesson.AverageTimeSpent,
		&lesson.CreatedAt, &lesson.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &lesson, nil
}

// GetModuleByID retrieves a module by ID
func (r *CourseRepository) GetModuleByID(moduleID uuid.UUID) (*models.Module, error) {
	query := `
		SELECT id, course_id, title, description, duration_hours,
			   display_order, is_published, total_lessons,
			   created_at, updated_at
		FROM modules
		WHERE id = $1
	`

	var module models.Module
	err := r.db.QueryRow(query, moduleID).Scan(
		&module.ID, &module.CourseID, &module.Title, &module.Description,
		&module.DurationHours, &module.DisplayOrder, &module.IsPublished,
		&module.TotalLessons,
		&module.CreatedAt, &module.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &module, nil
}

// GetVideosByLessonID retrieves videos for a lesson
func (r *CourseRepository) GetVideosByLessonID(lessonID uuid.UUID) ([]models.LessonVideo, error) {
	query := `
		SELECT id, lesson_id, title, video_url, video_provider, video_id,
			   duration_seconds, thumbnail_url, display_order,
			   created_at, updated_at
		FROM lesson_videos
		WHERE lesson_id = $1
		ORDER BY display_order ASC
	`

	rows, err := r.db.Query(query, lessonID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var videos []models.LessonVideo
	for rows.Next() {
		var video models.LessonVideo
		err := rows.Scan(
			&video.ID, &video.LessonID, &video.Title, &video.VideoURL,
			&video.VideoProvider, &video.VideoID, &video.DurationSeconds,
			&video.ThumbnailURL, &video.DisplayOrder,
			&video.CreatedAt, &video.UpdatedAt,
		)
		if err != nil {
			continue
		}
		videos = append(videos, video)
	}

	return videos, nil
}

// GetMaterialsByLessonID retrieves materials for a lesson
func (r *CourseRepository) GetMaterialsByLessonID(lessonID uuid.UUID) ([]models.LessonMaterial, error) {
	query := `
		SELECT id, lesson_id, title, description, file_type, file_url,
			   file_size_bytes, display_order, total_downloads,
			   created_at, updated_at
		FROM lesson_materials
		WHERE lesson_id = $1
		ORDER BY display_order ASC
	`

	rows, err := r.db.Query(query, lessonID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var materials []models.LessonMaterial
	for rows.Next() {
		var material models.LessonMaterial
		err := rows.Scan(
			&material.ID, &material.LessonID, &material.Title, &material.Description,
			&material.FileType, &material.FileURL, &material.FileSizeBytes,
			&material.DisplayOrder, &material.TotalDownloads,
			&material.CreatedAt, &material.UpdatedAt,
		)
		if err != nil {
			continue
		}
		materials = append(materials, material)
	}

	return materials, nil
}

// CreateEnrollment creates a new course enrollment
func (r *CourseRepository) CreateEnrollment(enrollment *models.CourseEnrollment) error {
	query := `
		INSERT INTO course_enrollments (
			id, user_id, course_id, enrollment_type, amount_paid, currency, status
		) VALUES ($1, $2, $3, $4, $5, $6, $7)
		ON CONFLICT (user_id, course_id) DO NOTHING
	`

	_, err := r.db.Exec(query,
		enrollment.ID, enrollment.UserID, enrollment.CourseID,
		enrollment.EnrollmentType, enrollment.AmountPaid, enrollment.Currency,
		enrollment.Status,
	)

	return err
}

// GetEnrollment retrieves enrollment for user and course
func (r *CourseRepository) GetEnrollment(userID, courseID uuid.UUID) (*models.CourseEnrollment, error) {
	query := `
		SELECT id, user_id, course_id, enrollment_date, enrollment_type,
			   payment_id, amount_paid, currency, progress_percentage,
			   lessons_completed, total_time_spent_minutes, status,
			   completed_at, certificate_issued, certificate_url,
			   expires_at, last_accessed_at, created_at, updated_at
		FROM course_enrollments
		WHERE user_id = $1 AND course_id = $2
	`

	var enrollment models.CourseEnrollment
	err := r.db.QueryRow(query, userID, courseID).Scan(
		&enrollment.ID, &enrollment.UserID, &enrollment.CourseID,
		&enrollment.EnrollmentDate, &enrollment.EnrollmentType,
		&enrollment.PaymentID, &enrollment.AmountPaid, &enrollment.Currency,
		&enrollment.ProgressPercentage, &enrollment.LessonsCompleted,
		&enrollment.TotalTimeSpentMinutes, &enrollment.Status,
		&enrollment.CompletedAt, &enrollment.CertificateIssued,
		&enrollment.CertificateURL, &enrollment.ExpiresAt,
		&enrollment.LastAccessedAt, &enrollment.CreatedAt, &enrollment.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &enrollment, nil
}

// GetUserEnrollments retrieves all enrollments for a user
func (r *CourseRepository) GetUserEnrollments(userID uuid.UUID) ([]models.CourseEnrollment, error) {
	query := `
		SELECT id, user_id, course_id, enrollment_date, enrollment_type,
			   payment_id, amount_paid, currency, progress_percentage,
			   lessons_completed, total_time_spent_minutes, status,
			   completed_at, certificate_issued, certificate_url,
			   expires_at, last_accessed_at, created_at, updated_at
		FROM course_enrollments
		WHERE user_id = $1
		ORDER BY enrollment_date DESC
	`

	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var enrollments []models.CourseEnrollment
	for rows.Next() {
		var enrollment models.CourseEnrollment
		err := rows.Scan(
			&enrollment.ID, &enrollment.UserID, &enrollment.CourseID,
			&enrollment.EnrollmentDate, &enrollment.EnrollmentType,
			&enrollment.PaymentID, &enrollment.AmountPaid, &enrollment.Currency,
			&enrollment.ProgressPercentage, &enrollment.LessonsCompleted,
			&enrollment.TotalTimeSpentMinutes, &enrollment.Status,
			&enrollment.CompletedAt, &enrollment.CertificateIssued,
			&enrollment.CertificateURL, &enrollment.ExpiresAt,
			&enrollment.LastAccessedAt, &enrollment.CreatedAt, &enrollment.UpdatedAt,
		)
		if err != nil {
			continue
		}
		enrollments = append(enrollments, enrollment)
	}

	return enrollments, nil
}

// GetLessonProgress retrieves lesson progress
func (r *CourseRepository) GetLessonProgress(userID, lessonID uuid.UUID) (*models.LessonProgress, error) {
	query := `
		SELECT id, user_id, lesson_id, course_id, status, progress_percentage,
			   video_watched_seconds, video_total_seconds, video_watch_percentage,
			   time_spent_minutes, completed_at, first_accessed_at, last_accessed_at
		FROM lesson_progress
		WHERE user_id = $1 AND lesson_id = $2
	`

	var progress models.LessonProgress
	err := r.db.QueryRow(query, userID, lessonID).Scan(
		&progress.ID, &progress.UserID, &progress.LessonID, &progress.CourseID,
		&progress.Status, &progress.ProgressPercentage, &progress.VideoWatchedSeconds,
		&progress.VideoTotalSeconds, &progress.VideoWatchPercentage,
		&progress.TimeSpentMinutes, &progress.CompletedAt,
		&progress.FirstAccessedAt, &progress.LastAccessedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &progress, nil
}

// UpdateLessonProgress updates or creates lesson progress
func (r *CourseRepository) UpdateLessonProgress(progress *models.LessonProgress) error {
	query := `
		INSERT INTO lesson_progress (
			id, user_id, lesson_id, course_id, status, progress_percentage,
			video_watched_seconds, video_total_seconds, video_watch_percentage,
			time_spent_minutes, completed_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		ON CONFLICT (user_id, lesson_id) DO UPDATE SET
			status = EXCLUDED.status,
			progress_percentage = EXCLUDED.progress_percentage,
			video_watched_seconds = EXCLUDED.video_watched_seconds,
			video_total_seconds = EXCLUDED.video_total_seconds,
			video_watch_percentage = EXCLUDED.video_watch_percentage,
			time_spent_minutes = EXCLUDED.time_spent_minutes,
			completed_at = EXCLUDED.completed_at,
			last_accessed_at = CURRENT_TIMESTAMP
	`

	_, err := r.db.Exec(query,
		progress.ID, progress.UserID, progress.LessonID, progress.CourseID,
		progress.Status, progress.ProgressPercentage, progress.VideoWatchedSeconds,
		progress.VideoTotalSeconds, progress.VideoWatchPercentage,
		progress.TimeSpentMinutes, progress.CompletedAt,
	)

	return err
}

// UpdateLessonProgressAtomic atomically updates lesson progress using increments
// FIX #7: Prevents race conditions when updating progress from multiple devices
func (r *CourseRepository) UpdateLessonProgressAtomic(
	userID, lessonID uuid.UUID,
	videoWatchedSecondsIncrement int,
	timeSpentMinutesIncrement int,
	newProgressPercentage *float64,
	newStatus *string,
	newCompletedAt *string,
) error {
	query := `
		UPDATE lesson_progress 
		SET video_watched_seconds = video_watched_seconds + $3,
		    time_spent_minutes = time_spent_minutes + $4,
		    progress_percentage = COALESCE($5, progress_percentage),
		    status = COALESCE($6, status),
		    completed_at = COALESCE($7::timestamp, completed_at),
		    last_accessed_at = CURRENT_TIMESTAMP
		WHERE user_id = $1 AND lesson_id = $2
	`

	_, err := r.db.Exec(query,
		userID, lessonID,
		videoWatchedSecondsIncrement,
		timeSpentMinutesIncrement,
		newProgressPercentage,
		newStatus,
		newCompletedAt,
	)

	return err
}

// UpdateEnrollmentProgressAtomic atomically updates enrollment progress
// FIX #8: Auto-update enrollment progress when lessons complete
func (r *CourseRepository) UpdateEnrollmentProgressAtomic(
	userID, courseID uuid.UUID,
	lessonsCompletedIncrement int,
	timeSpentMinutesIncrement int,
) error {
	// Calculate progress percentage based on total lessons in course
	query := `
		UPDATE course_enrollments ce
		SET lessons_completed = lessons_completed + $3,
		    total_time_spent_minutes = total_time_spent_minutes + $4,
		    progress_percentage = CASE 
		        WHEN c.total_lessons > 0 
		        THEN ((ce.lessons_completed + $3)::float / c.total_lessons) * 100
		        ELSE 0
		    END,
		    last_accessed_at = CURRENT_TIMESTAMP
		FROM courses c
		WHERE ce.user_id = $1 
		  AND ce.course_id = $2 
		  AND ce.course_id = c.id
	`

	_, err := r.db.Exec(query,
		userID, courseID,
		lessonsCompletedIncrement,
		timeSpentMinutesIncrement,
	)

	return err
}

// CreateCourse creates a new course
func (r *CourseRepository) CreateCourse(course *models.Course) error {
	query := `
		INSERT INTO courses (
			id, title, slug, description, short_description, skill_type, level,
			target_band_score, thumbnail_url, preview_video_url, instructor_id,
			instructor_name, duration_hours, enrollment_type, price, currency,
			status, display_order
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
		RETURNING created_at, updated_at
	`

	return r.db.QueryRow(query,
		course.ID, course.Title, course.Slug, course.Description, course.ShortDescription,
		course.SkillType, course.Level, course.TargetBandScore, course.ThumbnailURL,
		course.PreviewVideoURL, course.InstructorID, course.InstructorName,
		course.DurationHours, course.EnrollmentType, course.Price, course.Currency,
		course.Status, course.DisplayOrder,
	).Scan(&course.CreatedAt, &course.UpdatedAt)
}

// UpdateCourse updates an existing course
func (r *CourseRepository) UpdateCourse(courseID uuid.UUID, updates map[string]interface{}) error {
	if len(updates) == 0 {
		return nil
	}

	query := "UPDATE courses SET updated_at = CURRENT_TIMESTAMP"
	args := []interface{}{}
	argCount := 1

	for key, value := range updates {
		query += fmt.Sprintf(", %s = $%d", key, argCount)
		args = append(args, value)
		argCount++
	}

	query += fmt.Sprintf(" WHERE id = $%d", argCount)
	args = append(args, courseID)

	_, err := r.db.Exec(query, args...)
	return err
}

// DeleteCourse soft deletes a course
func (r *CourseRepository) DeleteCourse(courseID uuid.UUID) error {
	query := "UPDATE courses SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1"
	_, err := r.db.Exec(query, courseID)
	return err
}

// CreateModule creates a new module
func (r *CourseRepository) CreateModule(module *models.Module) error {
	query := `
		INSERT INTO modules (
			id, course_id, title, description, duration_hours, display_order, is_published
		) VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING created_at, updated_at
	`

	return r.db.QueryRow(query,
		module.ID, module.CourseID, module.Title, module.Description,
		module.DurationHours, module.DisplayOrder, module.IsPublished,
	).Scan(&module.CreatedAt, &module.UpdatedAt)
}

// CreateLesson creates a new lesson
func (r *CourseRepository) CreateLesson(lesson *models.Lesson) error {
	query := `
		INSERT INTO lessons (
			id, module_id, course_id, title, description, content_type,
			duration_minutes, display_order, is_free, is_published
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING created_at, updated_at
	`

	return r.db.QueryRow(query,
		lesson.ID, lesson.ModuleID, lesson.CourseID, lesson.Title, lesson.Description,
		lesson.ContentType, lesson.DurationMinutes, lesson.DisplayOrder,
		lesson.IsFree, lesson.IsPublished,
	).Scan(&lesson.CreatedAt, &lesson.UpdatedAt)
}

// PublishCourse publishes a course
func (r *CourseRepository) PublishCourse(courseID uuid.UUID) error {
	query := `
		UPDATE courses 
		SET status = 'published', published_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
		WHERE id = $1 AND status = 'draft'
	`
	_, err := r.db.Exec(query, courseID)
	return err
}

// CheckCourseOwnership checks if a user is the instructor of a course
func (r *CourseRepository) CheckCourseOwnership(courseID, instructorID uuid.UUID) (bool, error) {
	query := `
		SELECT EXISTS(
			SELECT 1 FROM courses 
			WHERE id = $1 AND instructor_id = $2 AND deleted_at IS NULL
		)
	`
	var exists bool
	err := r.db.QueryRow(query, courseID, instructorID).Scan(&exists)
	return exists, err
}

// GetCourseInstructorID retrieves the instructor ID of a course
func (r *CourseRepository) GetCourseInstructorID(courseID uuid.UUID) (uuid.UUID, error) {
	query := `SELECT instructor_id FROM courses WHERE id = $1 AND deleted_at IS NULL`
	var instructorID uuid.UUID
	err := r.db.QueryRow(query, courseID).Scan(&instructorID)
	return instructorID, err
}

// GetModuleCourseID retrieves the course ID from a module
func (r *CourseRepository) GetModuleCourseID(moduleID uuid.UUID) (uuid.UUID, error) {
	query := `SELECT course_id FROM modules WHERE id = $1`
	var courseID uuid.UUID
	err := r.db.QueryRow(query, moduleID).Scan(&courseID)
	return courseID, err
}

// ============================================
// COURSE REVIEWS
// ============================================

// GetCourseReviews retrieves approved reviews for a course
func (r *CourseRepository) GetCourseReviews(courseID uuid.UUID) ([]models.CourseReview, error) {
	query := `
		SELECT id, user_id, course_id, rating, title, comment, helpful_count, 
			   is_approved, approved_by, approved_at, created_at, updated_at
		FROM course_reviews
		WHERE course_id = $1 AND is_approved = true
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(query, courseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reviews []models.CourseReview
	for rows.Next() {
		var review models.CourseReview
		err := rows.Scan(
			&review.ID, &review.UserID, &review.CourseID, &review.Rating,
			&review.Title, &review.Comment, &review.HelpfulCount,
			&review.IsApproved, &review.ApprovedBy, &review.ApprovedAt,
			&review.CreatedAt, &review.UpdatedAt,
		)
		if err != nil {
			log.Printf("Error scanning review: %v", err)
			continue
		}
		reviews = append(reviews, review)
	}

	return reviews, nil
}

// CreateReview creates a new course review
func (r *CourseRepository) CreateReview(review *models.CourseReview) error {
	query := `
		INSERT INTO course_reviews (user_id, course_id, rating, title, comment, is_approved)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(
		query,
		review.UserID,
		review.CourseID,
		review.Rating,
		review.Title,
		review.Comment,
		review.IsApproved,
	).Scan(&review.ID, &review.CreatedAt, &review.UpdatedAt)

	return err
}

// GetUserReview checks if user already reviewed a course
func (r *CourseRepository) GetUserReview(userID, courseID uuid.UUID) (*models.CourseReview, error) {
	query := `
		SELECT id, user_id, course_id, rating, title, comment, helpful_count,
			   is_approved, approved_by, approved_at, created_at, updated_at
		FROM course_reviews
		WHERE user_id = $1 AND course_id = $2
	`

	var review models.CourseReview
	err := r.db.QueryRow(query, userID, courseID).Scan(
		&review.ID, &review.UserID, &review.CourseID, &review.Rating,
		&review.Title, &review.Comment, &review.HelpfulCount,
		&review.IsApproved, &review.ApprovedBy, &review.ApprovedAt,
		&review.CreatedAt, &review.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}

	return &review, err
}

// ============================================
// COURSE CATEGORIES
// ============================================

// GetAllCategories retrieves all course categories
func (r *CourseRepository) GetAllCategories() ([]models.CourseCategory, error) {
	query := `
		SELECT id, name, slug, description, parent_id, display_order, created_at
		FROM course_categories
		ORDER BY display_order, name
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []models.CourseCategory
	for rows.Next() {
		var category models.CourseCategory
		err := rows.Scan(
			&category.ID, &category.Name, &category.Slug, &category.Description,
			&category.ParentID, &category.DisplayOrder, &category.CreatedAt,
		)
		if err != nil {
			log.Printf("Error scanning category: %v", err)
			continue
		}
		categories = append(categories, category)
	}

	return categories, nil
}

// GetCourseCategories retrieves categories for a specific course
func (r *CourseRepository) GetCourseCategories(courseID uuid.UUID) ([]models.CourseCategory, error) {
	query := `
		SELECT c.id, c.name, c.slug, c.description, c.parent_id, c.display_order, c.created_at
		FROM course_categories c
		JOIN course_category_mapping ccm ON c.id = ccm.category_id
		WHERE ccm.course_id = $1
		ORDER BY c.display_order, c.name
	`

	rows, err := r.db.Query(query, courseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []models.CourseCategory
	for rows.Next() {
		var category models.CourseCategory
		err := rows.Scan(
			&category.ID, &category.Name, &category.Slug, &category.Description,
			&category.ParentID, &category.DisplayOrder, &category.CreatedAt,
		)
		if err != nil {
			log.Printf("Error scanning category: %v", err)
			continue
		}
		categories = append(categories, category)
	}

	return categories, nil
}

// ============================================
// VIDEO WATCH HISTORY
// ============================================

// CreateVideoWatchHistory records video watch event
func (r *CourseRepository) CreateVideoWatchHistory(history *models.VideoWatchHistory) error {
	query := `
		INSERT INTO video_watch_history 
		(user_id, video_id, lesson_id, watched_seconds, total_seconds, 
		 watch_percentage, session_id, device_type)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, watched_at
	`

	err := r.db.QueryRow(
		query,
		history.UserID,
		history.VideoID,
		history.LessonID,
		history.WatchedSeconds,
		history.TotalSeconds,
		history.WatchPercentage,
		history.SessionID,
		history.DeviceType,
	).Scan(&history.ID, &history.WatchedAt)

	return err
}

// GetUserVideoWatchHistory retrieves watch history for a user
func (r *CourseRepository) GetUserVideoWatchHistory(userID uuid.UUID, limit int) ([]models.VideoWatchHistory, error) {
	query := `
		SELECT id, user_id, video_id, lesson_id, watched_seconds, total_seconds,
			   watch_percentage, session_id, device_type, watched_at
		FROM video_watch_history
		WHERE user_id = $1
		ORDER BY watched_at DESC
		LIMIT $2
	`

	rows, err := r.db.Query(query, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var history []models.VideoWatchHistory
	for rows.Next() {
		var record models.VideoWatchHistory
		err := rows.Scan(
			&record.ID, &record.UserID, &record.VideoID, &record.LessonID,
			&record.WatchedSeconds, &record.TotalSeconds, &record.WatchPercentage,
			&record.SessionID, &record.DeviceType, &record.WatchedAt,
		)
		if err != nil {
			log.Printf("Error scanning watch history: %v", err)
			continue
		}
		history = append(history, record)
	}

	return history, nil
}

// ============================================
// VIDEO SUBTITLES
// ============================================

// GetVideoSubtitles retrieves subtitles for a video
func (r *CourseRepository) GetVideoSubtitles(videoID uuid.UUID) ([]models.VideoSubtitle, error) {
	query := `
		SELECT id, video_id, language, subtitle_url, format, is_default, created_at
		FROM video_subtitles
		WHERE video_id = $1
		ORDER BY is_default DESC, language
	`

	rows, err := r.db.Query(query, videoID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var subtitles []models.VideoSubtitle
	for rows.Next() {
		var subtitle models.VideoSubtitle
		err := rows.Scan(
			&subtitle.ID, &subtitle.VideoID, &subtitle.Language,
			&subtitle.SubtitleURL, &subtitle.Format, &subtitle.IsDefault,
			&subtitle.CreatedAt,
		)
		if err != nil {
			log.Printf("Error scanning subtitle: %v", err)
			continue
		}
		subtitles = append(subtitles, subtitle)
	}

	return subtitles, nil
}

// IncrementMaterialDownload increments download count for a material
func (r *CourseRepository) IncrementMaterialDownload(materialID uuid.UUID) error {
	query := `
		UPDATE lesson_materials
		SET total_downloads = total_downloads + 1
		WHERE id = $1
	`

	_, err := r.db.Exec(query, materialID)
	return err
}

// ============================================
// VIDEO MANAGEMENT
// ============================================

// CreateLessonVideo creates a new video for a lesson
func (r *CourseRepository) CreateLessonVideo(video *models.LessonVideo) error {
	query := `
		INSERT INTO lesson_videos 
		(lesson_id, title, video_provider, video_id, video_url, 
		 duration_seconds, thumbnail_url, display_order)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(
		query,
		video.LessonID,
		video.Title,
		video.VideoProvider,
		video.VideoID,
		video.VideoURL,
		video.DurationSeconds,
		video.ThumbnailURL,
		video.DisplayOrder,
	).Scan(&video.ID, &video.CreatedAt, &video.UpdatedAt)

	return err
}

// GetLessonVideoCount counts videos in a lesson
func (r *CourseRepository) GetLessonVideoCount(lessonID uuid.UUID) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM lesson_videos WHERE lesson_id = $1`
	err := r.db.QueryRow(query, lessonID).Scan(&count)
	return count, err
}

// UpdateVideoDuration updates video duration by video_id
func (r *CourseRepository) UpdateVideoDuration(videoID string, durationSeconds int) error {
	query := `
		UPDATE lesson_videos 
		SET duration_seconds = $1,
		    updated_at = NOW()
		WHERE video_id = $2 AND video_provider = 'youtube'
	`

	result, err := r.db.Exec(query, durationSeconds, videoID)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("no video found with video_id: %s", videoID)
	}

	return nil
}

// UpdateVideoDurationAndSyncLesson updates video duration and auto-syncs lesson duration_minutes
func (r *CourseRepository) UpdateVideoDurationAndSyncLesson(videoID string, durationSeconds int) error {
	// Start transaction
	tx, err := r.db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Update video duration and get lesson_id
	var lessonID uuid.UUID
	query := `
		UPDATE lesson_videos 
		SET duration_seconds = $1,
		    updated_at = NOW()
		WHERE video_id = $2 AND video_provider = 'youtube'
		RETURNING lesson_id
	`
	err = tx.QueryRow(query, durationSeconds, videoID).Scan(&lessonID)
	if err != nil {
		if err == sql.ErrNoRows {
			return fmt.Errorf("no video found with video_id: %s", videoID)
		}
		return fmt.Errorf("failed to update video: %w", err)
	}

	// Calculate duration in minutes (ceiling)
	durationMinutes := int(math.Ceil(float64(durationSeconds) / 60.0))

	// Update lesson duration_minutes
	updateLessonQuery := `
		UPDATE lessons 
		SET duration_minutes = $1,
		    updated_at = NOW()
		WHERE id = $2
	`
	_, err = tx.Exec(updateLessonQuery, durationMinutes, lessonID)
	if err != nil {
		return fmt.Errorf("failed to update lesson duration: %w", err)
	}

	// Commit transaction
	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// GetVideosWithMissingDuration gets all YouTube videos with missing or zero duration
func (r *CourseRepository) GetVideosWithMissingDuration() ([]*models.LessonVideo, error) {
	query := `
		SELECT id, lesson_id, video_url, video_id, video_provider, 
		       title, duration_seconds, display_order, thumbnail_url,
		       created_at, updated_at
		FROM lesson_videos
		WHERE video_provider = 'youtube' 
		  AND (duration_seconds IS NULL OR duration_seconds = 0)
		  AND video_id IS NOT NULL
		  AND video_id != ''
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var videos []*models.LessonVideo
	for rows.Next() {
		video := &models.LessonVideo{}
		err := rows.Scan(
			&video.ID,
			&video.LessonID,
			&video.VideoURL,
			&video.VideoID,
			&video.VideoProvider,
			&video.Title,
			&video.DurationSeconds,
			&video.DisplayOrder,
			&video.ThumbnailURL,
			&video.CreatedAt,
			&video.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		videos = append(videos, video)
	}

	return videos, nil
}

// GetAllYouTubeVideos gets ALL YouTube videos (for force re-sync)
func (r *CourseRepository) GetAllYouTubeVideos() ([]*models.LessonVideo, error) {
	query := `
		SELECT id, lesson_id, video_url, video_id, video_provider, 
		       title, duration_seconds, display_order, thumbnail_url,
		       created_at, updated_at
		FROM lesson_videos
		WHERE video_provider = 'youtube' 
		  AND video_id IS NOT NULL
		  AND video_id != ''
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var videos []*models.LessonVideo
	for rows.Next() {
		video := &models.LessonVideo{}
		err := rows.Scan(
			&video.ID,
			&video.LessonID,
			&video.VideoURL,
			&video.VideoID,
			&video.VideoProvider,
			&video.Title,
			&video.DurationSeconds,
			&video.DisplayOrder,
			&video.ThumbnailURL,
			&video.CreatedAt,
			&video.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		videos = append(videos, video)
	}

	return videos, nil
}

// UpdateLessonDuration updates the duration_minutes field of a lesson
func (r *CourseRepository) UpdateLessonDuration(lessonID uuid.UUID, durationMinutes int) error {
	query := `
		UPDATE lessons 
		SET duration_minutes = $1, updated_at = NOW() 
		WHERE id = $2
	`

	_, err := r.db.Exec(query, durationMinutes, lessonID)
	return err
}
