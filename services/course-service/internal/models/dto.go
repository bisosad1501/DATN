package models

import "github.com/google/uuid"

// CreateCourseRequest represents course creation request
type CreateCourseRequest struct {
	Title            string   `json:"title" binding:"required"`
	Slug             string   `json:"slug" binding:"required"`
	Description      *string  `json:"description"`
	ShortDescription *string  `json:"short_description"`
	SkillType        string   `json:"skill_type" binding:"required"` // listening, reading, writing, speaking, general
	Level            string   `json:"level" binding:"required"`      // beginner, intermediate, advanced
	TargetBandScore  *float64 `json:"target_band_score"`
	ThumbnailURL     *string  `json:"thumbnail_url"`
	PreviewVideoURL  *string  `json:"preview_video_url"`
	DurationHours    *float64 `json:"duration_hours"`
	EnrollmentType   string   `json:"enrollment_type"` // free, premium
	Price            float64  `json:"price"`
	Currency         string   `json:"currency"`
}

// UpdateCourseRequest represents course update request
type UpdateCourseRequest struct {
	Title            *string  `json:"title"`
	Description      *string  `json:"description"`
	ShortDescription *string  `json:"short_description"`
	TargetBandScore  *float64 `json:"target_band_score"`
	ThumbnailURL     *string  `json:"thumbnail_url"`
	PreviewVideoURL  *string  `json:"preview_video_url"`
	DurationHours    *float64 `json:"duration_hours"`
	Price            *float64 `json:"price"`
	Status           *string  `json:"status"` // draft, published, archived
	IsFeatured       *bool    `json:"is_featured"`
	IsRecommended    *bool    `json:"is_recommended"`
}

// CreateModuleRequest represents module creation request
type CreateModuleRequest struct {
	CourseID      uuid.UUID `json:"course_id" binding:"required"`
	Title         string    `json:"title" binding:"required"`
	Description   *string   `json:"description"`
	DurationHours *float64  `json:"duration_hours"`
	DisplayOrder  int       `json:"display_order"`
}

// CreateLessonRequest represents lesson creation request
type CreateLessonRequest struct {
	ModuleID        uuid.UUID `json:"module_id" binding:"required"`
	Title           string    `json:"title" binding:"required"`
	Description     *string   `json:"description"`
	ContentType     string    `json:"content_type" binding:"required"` // video, article, quiz, exercise
	DurationMinutes *int      `json:"duration_minutes"`
	DisplayOrder    int       `json:"display_order"`
	IsFree          bool      `json:"is_free"`
}

// CourseListQuery represents query parameters for listing courses
type CourseListQuery struct {
	SkillType      string `form:"skill_type"`      // listening, reading, writing, speaking, general
	Level          string `form:"level"`           // beginner, intermediate, advanced
	EnrollmentType string `form:"enrollment_type"` // free, premium
	IsFeatured     *bool  `form:"is_featured"`
	Search         string `form:"search"` // Search in title, description
	Page           int    `form:"page"`
	Limit          int    `form:"limit"`
}

// CourseDetailResponse represents detailed course with modules and lessons
type CourseDetailResponse struct {
	Course            Course              `json:"course"`
	Modules           []ModuleWithLessons `json:"modules"`
	IsEnrolled        bool                `json:"is_enrolled"`
	EnrollmentDetails *CourseEnrollment   `json:"enrollment_details,omitempty"`
}

// ModuleWithLessons represents a module with its lessons
type ModuleWithLessons struct {
	Module  Module   `json:"module"`
	Lessons []Lesson `json:"lessons"`
}

// EnrollmentRequest represents enrollment request
type EnrollmentRequest struct {
	CourseID       uuid.UUID `json:"course_id" binding:"required"`
	EnrollmentType string    `json:"enrollment_type"` // free, purchased
}

// UpdateLessonProgressRequest represents lesson progress update
type UpdateLessonProgressRequest struct {
	ProgressPercentage  *float64 `json:"progress_percentage,omitempty"`
	VideoWatchedSeconds *int     `json:"video_watched_seconds,omitempty"`
	VideoTotalSeconds   *int     `json:"video_total_seconds,omitempty"`
	TimeSpentMinutes    *int     `json:"time_spent_minutes,omitempty"`
	IsCompleted         *bool    `json:"is_completed,omitempty"`
}

// MyEnrollmentsResponse represents user's enrollments
type MyEnrollmentsResponse struct {
	Enrollments []EnrollmentWithCourse `json:"enrollments"`
	Total       int                    `json:"total"`
}

// EnrollmentWithCourse represents enrollment with course details
type EnrollmentWithCourse struct {
	Enrollment CourseEnrollment `json:"enrollment"`
	Course     Course           `json:"course"`
}

// LessonDetailResponse represents detailed lesson with materials
type LessonDetailResponse struct {
	Lesson    Lesson           `json:"lesson"`
	Videos    []LessonVideo    `json:"videos"`
	Materials []LessonMaterial `json:"materials"`
	Progress  *LessonProgress  `json:"progress,omitempty"`
}

// EnrollmentProgressResponse represents enrollment progress details
type EnrollmentProgressResponse struct {
	Enrollment      CourseEnrollment     `json:"enrollment"`
	Course          Course               `json:"course"`
	ModulesProgress []ModuleProgress     `json:"modules_progress"`
	RecentLessons   []LessonWithProgress `json:"recent_lessons"`
}

// ModuleProgress represents module completion stats
type ModuleProgress struct {
	Module             Module  `json:"module"`
	TotalLessons       int     `json:"total_lessons"`
	CompletedLessons   int     `json:"completed_lessons"`
	ProgressPercentage float64 `json:"progress_percentage"`
}

// LessonWithProgress represents lesson with progress
type LessonWithProgress struct {
	Lesson   Lesson         `json:"lesson"`
	Progress LessonProgress `json:"progress"`
}

// CreateReviewRequest represents course review creation request
type CreateReviewRequest struct {
	Rating  int     `json:"rating" binding:"required,min=1,max=5"`
	Title   *string `json:"title"`
	Comment *string `json:"comment"`
}

// TrackVideoProgressRequest represents video watch progress tracking
type TrackVideoProgressRequest struct {
	VideoID        uuid.UUID  `json:"video_id" binding:"required"`
	LessonID       uuid.UUID  `json:"lesson_id" binding:"required"`
	WatchedSeconds int        `json:"watched_seconds" binding:"required"`
	TotalSeconds   int        `json:"total_seconds" binding:"required"`
	SessionID      *uuid.UUID `json:"session_id"`
	DeviceType     *string    `json:"device_type"` // web, android, ios
}
