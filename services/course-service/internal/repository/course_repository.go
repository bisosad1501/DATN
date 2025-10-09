package repository

import (
	"database/sql"
	"fmt"
	"log"
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
		SELECT id, title, slug, description, short_description, skill_type, level, 
			   target_band_score, thumbnail_url, preview_video_url, instructor_id, 
			   instructor_name, duration_hours, total_lessons, total_videos, 
			   enrollment_type, price, currency, status, is_featured, is_recommended,
			   total_enrollments, average_rating, total_reviews, display_order,
			   published_at, created_at, updated_at
		FROM courses
		WHERE deleted_at IS NULL AND status = 'published'
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
		SELECT id, title, slug, description, short_description, skill_type, level, 
			   target_band_score, thumbnail_url, preview_video_url, instructor_id, 
			   instructor_name, duration_hours, total_lessons, total_videos, 
			   enrollment_type, price, currency, status, is_featured, is_recommended,
			   total_enrollments, average_rating, total_reviews, display_order,
			   published_at, created_at, updated_at
		FROM courses
		WHERE id = $1 AND deleted_at IS NULL
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
		SELECT id, module_id, course_id, title, description, content_type,
			   duration_minutes, display_order, is_free, is_published,
			   total_completions, average_time_spent, created_at, updated_at
		FROM lessons
		WHERE module_id = $1 AND is_published = true
		ORDER BY display_order ASC
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
		SELECT id, module_id, course_id, title, description, content_type,
			   duration_minutes, display_order, is_free, is_published,
			   total_completions, average_time_spent, created_at, updated_at
		FROM lessons
		WHERE id = $1
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

// GetVideosByLessonID retrieves videos for a lesson
func (r *CourseRepository) GetVideosByLessonID(lessonID uuid.UUID) ([]models.LessonVideo, error) {
	query := `
		SELECT id, lesson_id, title, video_url, video_provider, video_id,
			   duration_seconds, quality, thumbnail_url, display_order,
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
			&video.Quality, &video.ThumbnailURL, &video.DisplayOrder,
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
