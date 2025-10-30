package service

import (
	"fmt"
	"log"
	"math"
	"time"

	"github.com/bisosad1501/DATN/shared/pkg/client"
	"github.com/bisosad1501/ielts-platform/course-service/internal/models"
	"github.com/bisosad1501/ielts-platform/course-service/internal/repository"
	"github.com/google/uuid"
)

type CourseService struct {
	repo               *repository.CourseRepository
	userServiceClient  *client.UserServiceClient
	notificationClient *client.NotificationServiceClient
	exerciseClient     *client.ExerciseServiceClient
	youtubeService     *YouTubeService
}

func NewCourseService(repo *repository.CourseRepository, userServiceClient *client.UserServiceClient, notificationClient *client.NotificationServiceClient, exerciseClient *client.ExerciseServiceClient, youtubeService *YouTubeService) *CourseService {
	return &CourseService{
		repo:               repo,
		userServiceClient:  userServiceClient,
		notificationClient: notificationClient,
		exerciseClient:     exerciseClient,
		youtubeService:     youtubeService,
	}
}

// GetCourses retrieves courses with filters
func (s *CourseService) GetCourses(query *models.CourseListQuery) ([]models.Course, error) {
	// Set defaults
	if query.Page <= 0 {
		query.Page = 1
	}
	if query.Limit <= 0 || query.Limit > 100 {
		query.Limit = 20
	}

	return s.repo.GetCourses(query)
}

// GetCourseDetail retrieves detailed course with modules and lessons
func (s *CourseService) GetCourseDetail(courseID uuid.UUID, userID *uuid.UUID) (*models.CourseDetailResponse, error) {
	// Get course
	course, err := s.repo.GetCourseByID(courseID)
	if err != nil {
		return nil, fmt.Errorf("failed to get course: %w", err)
	}
	if course == nil {
		return nil, fmt.Errorf("course not found")
	}

	// Get modules
	modules, err := s.repo.GetModulesByCourseID(courseID)
	if err != nil {
		return nil, fmt.Errorf("failed to get modules: %w", err)
	}

	// 📊 Calculate total duration from lessons
	var totalDurationMinutes int

	// Get lessons and exercises for each module
	var modulesWithLessons []models.ModuleWithLessons
	for _, module := range modules {
		// Get lessons
		lessons, err := s.repo.GetLessonsByModuleID(module.ID)
		if err != nil {
			log.Printf("Warning: failed to get lessons for module %s: %v", module.ID, err)
			lessons = []models.Lesson{}
		}

		// Load videos for each lesson
		var lessonsWithVideos []models.LessonWithVideos
		for _, lesson := range lessons {
			// 📊 Add lesson duration to total (already computed with video duration in query)
			if lesson.DurationMinutes != nil {
				totalDurationMinutes += *lesson.DurationMinutes
			}

			lessonWithVideo := models.LessonWithVideos{
				Lesson: lesson,
			}

			// Get videos for this lesson
			videos, err := s.repo.GetVideosByLessonID(lesson.ID)
			if err != nil {
				log.Printf("Warning: failed to get videos for lesson %s: %v", lesson.ID, err)
			} else {
				lessonWithVideo.Videos = videos
			}

			lessonsWithVideos = append(lessonsWithVideos, lessonWithVideo)
		}

		// Get exercises for this module from Exercise Service
		var exercises []models.ExerciseSummary
		if s.exerciseClient != nil {
			exercisesData, err := s.exerciseClient.GetExercisesByModuleID(module.ID.String())
			if err != nil {
				log.Printf("Warning: failed to get exercises for module %s: %v", module.ID, err)
			} else {
				// Convert client.ExerciseSummary to models.ExerciseSummary
				for _, ex := range exercisesData {
					exercises = append(exercises, models.ExerciseSummary{
						ID:             uuid.MustParse(ex.ID),
						Title:          ex.Title,
						Slug:           ex.Slug,
						Description:    ex.Description,
						ExerciseType:   ex.ExerciseType,
						SkillType:      ex.SkillType,
						Difficulty:     ex.Difficulty,
						TotalQuestions: ex.TotalQuestions,
						TotalSections:  ex.TotalSections,
						TimeLimitMins:  ex.TimeLimitMins,
						PassingScore:   ex.PassingScore,
						DisplayOrder:   ex.DisplayOrder,
					})
				}
			}
		}

		modulesWithLessons = append(modulesWithLessons, models.ModuleWithLessons{
			Module:    module,
			Lessons:   lessonsWithVideos,
			Exercises: exercises,
		})
	}

	// 📊 Update course duration_hours from calculated total
	if totalDurationMinutes > 0 {
		durationHours := float64(totalDurationMinutes) / 60.0
		course.DurationHours = &durationHours
		log.Printf("[Course-Service] 📊 Calculated course duration: %d minutes = %.2f hours", totalDurationMinutes, durationHours)
	}

	response := &models.CourseDetailResponse{
		Course:  *course,
		Modules: modulesWithLessons,
	}

	// Check enrollment if user is authenticated
	if userID != nil {
		enrollment, err := s.repo.GetEnrollment(*userID, courseID)
		if err != nil {
			log.Printf("Warning: failed to get enrollment: %v", err)
		} else if enrollment != nil {
			response.IsEnrolled = true
			response.EnrollmentDetails = enrollment
		}
	}

	return response, nil
}

// GetLessonDetail retrieves detailed lesson with videos and materials
func (s *CourseService) GetLessonDetail(lessonID uuid.UUID, userID *uuid.UUID) (*models.LessonDetailResponse, error) {
	// Get lesson
	lesson, err := s.repo.GetLessonByID(lessonID)
	if err != nil {
		return nil, fmt.Errorf("failed to get lesson: %w", err)
	}
	if lesson == nil {
		return nil, fmt.Errorf("lesson not found")
	}

	// Get videos
	videos, err := s.repo.GetVideosByLessonID(lessonID)
	if err != nil {
		log.Printf("Warning: failed to get videos: %v", err)
		videos = []models.LessonVideo{}
	}

	// Get materials
	materials, err := s.repo.GetMaterialsByLessonID(lessonID)
	if err != nil {
		log.Printf("Warning: failed to get materials: %v", err)
		materials = []models.LessonMaterial{}
	}

	response := &models.LessonDetailResponse{
		Lesson:    *lesson,
		Videos:    videos,
		Materials: materials,
	}

	// Get progress if user is authenticated
	if userID != nil {
		progress, err := s.repo.GetLessonProgress(*userID, lessonID)
		if err != nil {
			log.Printf("Warning: failed to get lesson progress: %v", err)
		} else if progress != nil {
			response.Progress = progress
		}
	}

	return response, nil
}

// EnrollCourse enrolls a user in a course
func (s *CourseService) EnrollCourse(userID uuid.UUID, req *models.EnrollmentRequest) (*models.CourseEnrollment, error) {
	// Check if course exists
	course, err := s.repo.GetCourseByID(req.CourseID)
	if err != nil {
		return nil, fmt.Errorf("failed to get course: %w", err)
	}
	if course == nil {
		return nil, fmt.Errorf("course not found")
	}

	// Validate enrollment type
	enrollmentType := req.EnrollmentType
	if enrollmentType == "" {
		enrollmentType = "free"
	}

	// For paid courses, validate enrollment type
	if course.EnrollmentType != "free" && enrollmentType == "free" {
		return nil, fmt.Errorf("this course requires payment")
	}

	// FIX #9: Let database handle duplicate check via ON CONFLICT
	// This prevents race conditions from check-then-insert pattern
	enrollment := &models.CourseEnrollment{
		ID:             uuid.New(),
		UserID:         userID,
		CourseID:       req.CourseID,
		EnrollmentType: enrollmentType,
		Status:         "active",
	}

	if enrollmentType == "purchased" {
		enrollment.AmountPaid = &course.Price
		enrollment.Currency = &course.Currency
	}

	err = s.repo.CreateEnrollment(enrollment)
	if err != nil {
		return nil, fmt.Errorf("failed to create enrollment: %w", err)
	}

	// Return the enrollment (might be existing one due to ON CONFLICT)
	return s.repo.GetEnrollment(userID, req.CourseID)
}

// GetMyEnrollments retrieves user's enrollments
func (s *CourseService) GetMyEnrollments(userID uuid.UUID) (*models.MyEnrollmentsResponse, error) {
	enrollments, err := s.repo.GetUserEnrollments(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get enrollments: %w", err)
	}

	var enrollmentsWithCourses []models.EnrollmentWithCourse
	for _, enrollment := range enrollments {
		course, err := s.repo.GetCourseByID(enrollment.CourseID)
		if err != nil {
			log.Printf("Warning: failed to get course %s: %v", enrollment.CourseID, err)
			continue
		}
		if course == nil {
			continue
		}

		enrollmentsWithCourses = append(enrollmentsWithCourses, models.EnrollmentWithCourse{
			Enrollment: enrollment,
			Course:     *course,
		})
	}

	return &models.MyEnrollmentsResponse{
		Enrollments: enrollmentsWithCourses,
		Total:       len(enrollmentsWithCourses),
	}, nil
}

// UpdateLessonProgress updates lesson progress
func (s *CourseService) UpdateLessonProgress(userID, lessonID uuid.UUID, req *models.UpdateLessonProgressRequest) (*models.LessonProgress, error) {
	// Get lesson to validate
	lesson, err := s.repo.GetLessonByID(lessonID)
	if err != nil {
		return nil, fmt.Errorf("failed to get lesson: %w", err)
	}
	if lesson == nil {
		return nil, fmt.Errorf("lesson not found")
	}

	// Check enrollment
	enrollment, err := s.repo.GetEnrollment(userID, lesson.CourseID)
	if err != nil {
		return nil, fmt.Errorf("failed to check enrollment: %w", err)
	}
	if enrollment == nil {
		return nil, fmt.Errorf("not enrolled in this course")
	}

	// FIX #7 & #10: Use UPSERT pattern with atomic operations for ALL updates
	// This prevents race conditions by letting database handle concurrency

	// Check existing progress BEFORE update to detect completion
	existingProgress, _ := s.repo.GetLessonProgress(userID, lessonID)
	wasAlreadyCompleted := existingProgress != nil && existingProgress.Status == "completed"

	// Build progress update (preserve existing values)
	progress := &models.LessonProgress{
		ID:       uuid.New(),
		UserID:   userID,
		LessonID: lessonID,
		CourseID: lesson.CourseID,
		Status:   "in_progress",
	}

	// Preserve existing completed_at if already completed
	if existingProgress != nil {
		if existingProgress.Status == "completed" {
			progress.Status = "completed"
			progress.CompletedAt = existingProgress.CompletedAt
		}
		// Preserve ID for UPSERT
		progress.ID = existingProgress.ID
	}

	// ✅ Get current values from existingProgress to compare
	currentWatchedSeconds := 0
	currentTimeSpent := 0
	currentProgressPct := 0.0
	if existingProgress != nil {
		currentWatchedSeconds = existingProgress.VideoWatchedSeconds
		currentTimeSpent = existingProgress.TimeSpentMinutes
		currentProgressPct = existingProgress.ProgressPercentage
	}

	// ✅ Only update video progress if new value is GREATER than current
	// This prevents progress from being reset when user reloads page
	if req.VideoWatchedSeconds != nil {
		if *req.VideoWatchedSeconds > currentWatchedSeconds {
			progress.VideoWatchedSeconds = *req.VideoWatchedSeconds
			log.Printf("[Course-Service] ✅ Updated video_watched_seconds: %d -> %d", 
				currentWatchedSeconds, *req.VideoWatchedSeconds)
		} else {
			// Keep existing value
			progress.VideoWatchedSeconds = currentWatchedSeconds
			log.Printf("[Course-Service] ⏭️  Skipped video_watched_seconds update: new=%d <= current=%d", 
				*req.VideoWatchedSeconds, currentWatchedSeconds)
		}
	} else {
		// If not provided in request, keep existing value
		progress.VideoWatchedSeconds = currentWatchedSeconds
	}

	if req.VideoTotalSeconds != nil {
		progress.VideoTotalSeconds = req.VideoTotalSeconds
	} else if existingProgress != nil {
		progress.VideoTotalSeconds = existingProgress.VideoTotalSeconds
	}

	// video_watch_percentage field removed (see migration 011)

	// ⏭️ Skip progress_percentage calculation here - will calculate AFTER last_position is updated

	// ✅ Only increase time_spent_minutes (never decrease)
	if req.TimeSpentMinutes != nil {
		if *req.TimeSpentMinutes > currentTimeSpent {
			progress.TimeSpentMinutes = *req.TimeSpentMinutes
		} else {
			progress.TimeSpentMinutes = currentTimeSpent
		}
	} else {
		progress.TimeSpentMinutes = currentTimeSpent
	}

	// ✅ Smart update last_position (for resume watching)
	// CRITICAL: Don't reset to 0 if we already have a saved position!
	// This prevents overwriting resume position when page reloads (video not started yet)
	if req.LastPositionSeconds != nil {
		newPosition := *req.LastPositionSeconds
		currentPosition := 0
		if existingProgress != nil {
			currentPosition = existingProgress.LastPositionSeconds
		}

		// Only update if:
		// 1. New position > 0 (video is actually playing)
		// 2. OR current position is 0 (no saved position yet)
		if newPosition > 0 || currentPosition == 0 {
			progress.LastPositionSeconds = newPosition
			log.Printf("[Course-Service] ✅ Updated last_position_seconds: %d -> %d",
				currentPosition, newPosition)
		} else {
			// Keep existing position (don't reset to 0)
			progress.LastPositionSeconds = currentPosition
			log.Printf("[Course-Service] ⏭️  Kept last_position_seconds: %d (rejected new=0)",
				currentPosition)
		}
	} else if existingProgress != nil {
		// Keep existing value if not provided in request
		progress.LastPositionSeconds = existingProgress.LastPositionSeconds
	}

	// 🎯 PRODUCTION LOGIC: Calculate Progress AFTER last_position is updated
	// Progress = Furthest Position Reached (like YouTube/Coursera/Udemy)
	// This is simple, predictable, and matches user expectations:
	// - User seeks ahead → progress increases ✅
	// - User rewinds → progress stays same ✅
	// - Clear percentage based on how far they've reached in the video
	if req.ProgressPercentage != nil {
		// Allow manual override if provided
		progress.ProgressPercentage = *req.ProgressPercentage
		log.Printf("[Course-Service] 📊 Using provided progress_percentage: %.2f%%", progress.ProgressPercentage)
	} else {
		// Auto-calculate: Progress = last_position / total_duration * 100
		if progress.VideoTotalSeconds != nil && *progress.VideoTotalSeconds > 0 {
			progress.ProgressPercentage = float64(progress.LastPositionSeconds) / float64(*progress.VideoTotalSeconds) * 100
			log.Printf("[Course-Service] 📊 Auto-calculated progress: %.2f%% (position: %ds / %ds)", 
				progress.ProgressPercentage, progress.LastPositionSeconds, *progress.VideoTotalSeconds)
		} else {
			// Keep existing value if no video data
			progress.ProgressPercentage = currentProgressPct
		}
	}

	// Check if completing (and was not already completed)
	wasJustCompleted := false
	isCompletedVal := "nil"
	if req.IsCompleted != nil {
		isCompletedVal = fmt.Sprintf("%v", *req.IsCompleted)
	}
	log.Printf("[Course-Service] UpdateLessonProgress for user %s: req.IsCompleted=%s, wasAlreadyCompleted=%v",
		userID, isCompletedVal, wasAlreadyCompleted)

	if req.IsCompleted != nil && *req.IsCompleted {
		progress.Status = "completed"
		now := time.Now()
		progress.CompletedAt = &now
		progress.ProgressPercentage = 100

		if !wasAlreadyCompleted {
			wasJustCompleted = true
			log.Printf("[Course-Service] Lesson just completed by user %s", userID)
		} else {
			log.Printf("[Course-Service] Lesson already completed - skipping user service integration for user %s", userID)
		}
	} else if progress.ProgressPercentage >= 100 {
		progress.Status = "completed"
		now := time.Now()
		progress.CompletedAt = &now

		if !wasAlreadyCompleted {
			wasJustCompleted = true
			log.Printf("[Course-Service] Lesson just completed (progress >= 100) by user %s", userID)
		}
	}

	// UPSERT: Insert or update using database ON CONFLICT
	err = s.repo.UpdateLessonProgress(progress)
	if err != nil {
		return nil, fmt.Errorf("failed to upsert progress: %w", err)
	}

	// 🎯 AUTO-RECORD STUDY SESSION for analytics
	// This syncs lesson viewing activity to User Service for progress tracking
	// Only record if there's actual study time increase
	if req.TimeSpentMinutes != nil && *req.TimeSpentMinutes > currentTimeSpent {
		studyDuration := *req.TimeSpentMinutes - currentTimeSpent
		
		// Only record if duration >= 1 minute
		if studyDuration >= 1 {
			go func() {
				defer func() {
					if r := recover(); r != nil {
						log.Printf("[Course-Service] PANIC in auto-record session: %v", r)
					}
				}()

				// Get course to determine skill type
				course, err := s.repo.GetCourseByID(lesson.CourseID)
				skillType := ""
				if err == nil && course != nil {
					skillType = course.SkillType
				}

				// Record completed study session with actual duration
				err = s.userServiceClient.RecordCompletedSession(
					userID.String(),
					"lesson",                  // session_type
					skillType,                 // skill_type (listening, reading, etc.)
					lessonID.String(),        // resource_id
					"video_lesson",           // resource_type
					studyDuration,            // duration_minutes
				)

				if err != nil {
					log.Printf("[Course-Service] ⚠️  Failed to auto-record study session: %v", err)
				} else {
					log.Printf("[Course-Service] ✅ Auto-recorded study session: user=%s, lesson=%s, duration=%dm, skill=%s", 
						userID, lessonID, studyDuration, skillType)
				}
			}()
		}
	}

	// ✅ NEW: Always update enrollment progress (not just on completion)
	// This keeps enrollment progress in sync with lesson progress
	if req.TimeSpentMinutes != nil && *req.TimeSpentMinutes > 0 {
		// Only update time, not lesson count (unless completing)
		lessonsCompletedIncrement := 0
		if wasJustCompleted {
			lessonsCompletedIncrement = 1
			log.Printf("[Course-Service] Lesson just completed! Updating enrollment progress for user %s, course %s", userID, lesson.CourseID)
		}
		
		err = s.repo.UpdateEnrollmentProgressAtomic(userID, lesson.CourseID, lessonsCompletedIncrement, progress.TimeSpentMinutes)
		if err != nil {
			log.Printf("[Course-Service] WARNING: Failed to update enrollment progress: %v", err)
		} else if wasJustCompleted {
			log.Printf("[Course-Service] SUCCESS: Enrollment progress updated (lessons +%d, time +%d)", lessonsCompletedIncrement, progress.TimeSpentMinutes)
		}
	} // Handle lesson completion
	if wasJustCompleted {

		// Refresh progress for notification
		updatedProgress, _ := s.repo.GetLessonProgress(userID, lessonID)
		if updatedProgress != nil {
			go func() {
				defer func() {
					if r := recover(); r != nil {
						log.Printf("[Course-Service] PANIC in handleLessonCompletion: %v", r)
					}
				}()
				s.handleLessonCompletion(userID, lessonID, lesson, updatedProgress)
			}()
		}
	}

	// Return final progress
	return s.repo.GetLessonProgress(userID, lessonID)
}

// GetEnrollmentProgress retrieves detailed enrollment progress
func (s *CourseService) GetEnrollmentProgress(userID, courseID uuid.UUID) (*models.EnrollmentProgressResponse, error) {
	// Get enrollment
	enrollment, err := s.repo.GetEnrollment(userID, courseID)
	if err != nil {
		return nil, fmt.Errorf("failed to get enrollment: %w", err)
	}
	if enrollment == nil {
		return nil, fmt.Errorf("not enrolled in this course")
	}

	// Get course
	course, err := s.repo.GetCourseByID(courseID)
	if err != nil {
		return nil, fmt.Errorf("failed to get course: %w", err)
	}
	if course == nil {
		return nil, fmt.Errorf("course not found")
	}

	// Get modules
	modules, err := s.repo.GetModulesByCourseID(courseID)
	if err != nil {
		return nil, fmt.Errorf("failed to get modules: %w", err)
	}

	// Calculate progress for each module
	var modulesProgress []models.ModuleProgress
	for _, module := range modules {
		lessons, err := s.repo.GetLessonsByModuleID(module.ID)
		if err != nil {
			log.Printf("Warning: failed to get lessons for module %s: %v", module.ID, err)
			continue
		}

		completedCount := 0
		for _, lesson := range lessons {
			progress, _ := s.repo.GetLessonProgress(userID, lesson.ID)
			if progress != nil && progress.Status == "completed" {
				completedCount++
			}
		}

		progressPercentage := 0.0
		if len(lessons) > 0 {
			progressPercentage = float64(completedCount) / float64(len(lessons)) * 100
		}

		modulesProgress = append(modulesProgress, models.ModuleProgress{
			Module:             module,
			TotalLessons:       len(lessons),
			CompletedLessons:   completedCount,
			ProgressPercentage: progressPercentage,
		})
	}

	return &models.EnrollmentProgressResponse{
		Enrollment:      *enrollment,
		Course:          *course,
		ModulesProgress: modulesProgress,
		RecentLessons:   []models.LessonWithProgress{}, // Can be enhanced later
	}, nil
}

// GetLessonProgressByID retrieves progress for a single lesson (for resume watching)
func (s *CourseService) GetLessonProgressByID(userID, lessonID uuid.UUID) (*models.LessonProgress, error) {
	// Simply return the progress from repository (no enrollment check needed here)
	progress, err := s.repo.GetLessonProgress(userID, lessonID)
	if err != nil {
		return nil, fmt.Errorf("failed to get lesson progress: %w", err)
	}
	
	// ℹ️ No resume position sanitization needed with production logic
	// Progress = last_position → User sees 65%, resumes at 65% → CONSISTENT!
	// Old logic would reset skip-ahead, causing mismatch between progress display and resume position.
	
	return progress, nil
}

// GetCourseProgressLessons retrieves all lesson progress for a course
func (s *CourseService) GetCourseProgressLessons(userID, courseID uuid.UUID) ([]models.LessonProgress, error) {
	// Check if user is enrolled
	enrollment, err := s.repo.GetEnrollment(userID, courseID)
	if err != nil {
		return nil, fmt.Errorf("failed to get enrollment: %w", err)
	}
	if enrollment == nil {
		return nil, fmt.Errorf("not enrolled in this course")
	}

	// Get all modules for this course
	modules, err := s.repo.GetModulesByCourseID(courseID)
	if err != nil {
		return nil, fmt.Errorf("failed to get modules: %w", err)
	}

	// Collect all lesson progress
	var allProgress []models.LessonProgress
	for _, module := range modules {
		lessons, err := s.repo.GetLessonsByModuleID(module.ID)
		if err != nil {
			log.Printf("Warning: failed to get lessons for module %s: %v", module.ID, err)
			continue
		}

		for _, lesson := range lessons {
			progress, err := s.repo.GetLessonProgress(userID, lesson.ID)
			if err != nil {
				// If no progress yet, skip (don't return error)
				continue
			}
			if progress != nil {
				allProgress = append(allProgress, *progress)
			}
		}
	}

	return allProgress, nil
}

// CreateCourse creates a new course (Admin/Instructor only)
func (s *CourseService) CreateCourse(instructorID uuid.UUID, instructorName string, req *models.CreateCourseRequest) (*models.Course, error) {
	// Validate enrollment type and price
	enrollmentType := "free"
	if req.EnrollmentType != "" {
		enrollmentType = req.EnrollmentType
	}

	course := &models.Course{
		ID:               uuid.New(),
		Title:            req.Title,
		Slug:             req.Slug,
		Description:      req.Description,
		ShortDescription: req.ShortDescription,
		SkillType:        req.SkillType,
		Level:            req.Level,
		TargetBandScore:  req.TargetBandScore,
		ThumbnailURL:     req.ThumbnailURL,
		PreviewVideoURL:  req.PreviewVideoURL,
		InstructorID:     instructorID,
		InstructorName:   &instructorName,
		DurationHours:    req.DurationHours,
		EnrollmentType:   enrollmentType,
		Price:            req.Price,
		Currency:         req.Currency,
		Status:           "draft",
		DisplayOrder:     0,
	}

	if course.Currency == "" {
		course.Currency = "VND"
	}

	err := s.repo.CreateCourse(course)
	if err != nil {
		return nil, fmt.Errorf("failed to create course: %w", err)
	}

	return course, nil
}

// UpdateCourse updates a course (Admin/Instructor only with ownership check)
func (s *CourseService) UpdateCourse(courseID uuid.UUID, userID uuid.UUID, userRole string, req *models.UpdateCourseRequest) (*models.Course, error) {
	// Check ownership if not admin
	if userRole != "admin" {
		isOwner, err := s.repo.CheckCourseOwnership(courseID, userID)
		if err != nil {
			return nil, fmt.Errorf("failed to check ownership: %w", err)
		}
		if !isOwner {
			return nil, fmt.Errorf("you don't have permission to update this course")
		}
	}

	// Get existing course
	course, err := s.repo.GetCourseByID(courseID)
	if err != nil {
		return nil, fmt.Errorf("failed to get course: %w", err)
	}
	if course == nil {
		return nil, fmt.Errorf("course not found")
	}

	// Build updates map
	updates := make(map[string]interface{})
	if req.Title != nil {
		updates["title"] = *req.Title
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}
	if req.ShortDescription != nil {
		updates["short_description"] = *req.ShortDescription
	}
	if req.TargetBandScore != nil {
		updates["target_band_score"] = *req.TargetBandScore
	}
	if req.ThumbnailURL != nil {
		updates["thumbnail_url"] = *req.ThumbnailURL
	}
	if req.PreviewVideoURL != nil {
		updates["preview_video_url"] = *req.PreviewVideoURL
	}
	if req.DurationHours != nil {
		updates["duration_hours"] = *req.DurationHours
	}
	if req.Price != nil {
		updates["price"] = *req.Price
	}
	if req.Status != nil {
		updates["status"] = *req.Status
	}
	if req.IsFeatured != nil {
		updates["is_featured"] = *req.IsFeatured
	}
	if req.IsRecommended != nil {
		updates["is_recommended"] = *req.IsRecommended
	}

	err = s.repo.UpdateCourse(courseID, updates)
	if err != nil {
		return nil, fmt.Errorf("failed to update course: %w", err)
	}

	// Return updated course
	return s.repo.GetCourseByID(courseID)
}

// DeleteCourse deletes a course (Admin only)
func (s *CourseService) DeleteCourse(courseID uuid.UUID) error {
	return s.repo.DeleteCourse(courseID)
}

// CreateModule creates a new module (Admin/Instructor with ownership check)
func (s *CourseService) CreateModule(userID uuid.UUID, userRole string, req *models.CreateModuleRequest) (*models.Module, error) {
	// Check ownership if not admin
	if userRole != "admin" {
		isOwner, err := s.repo.CheckCourseOwnership(req.CourseID, userID)
		if err != nil {
			return nil, fmt.Errorf("failed to check ownership: %w", err)
		}
		if !isOwner {
			return nil, fmt.Errorf("you don't have permission to add modules to this course")
		}
	}

	// Verify course exists
	course, err := s.repo.GetCourseByID(req.CourseID)
	if err != nil {
		return nil, fmt.Errorf("failed to get course: %w", err)
	}
	if course == nil {
		return nil, fmt.Errorf("course not found")
	}

	module := &models.Module{
		ID:            uuid.New(),
		CourseID:      req.CourseID,
		Title:         req.Title,
		Description:   req.Description,
		DurationHours: req.DurationHours,
		DisplayOrder:  req.DisplayOrder,
		IsPublished:   true,
	}

	err = s.repo.CreateModule(module)
	if err != nil {
		return nil, fmt.Errorf("failed to create module: %w", err)
	}

	return module, nil
}

// CreateLesson creates a new lesson (Admin/Instructor with ownership check)
func (s *CourseService) CreateLesson(userID uuid.UUID, userRole string, req *models.CreateLessonRequest) (*models.Lesson, error) {
	// Get course_id from module
	courseID, err := s.repo.GetModuleCourseID(req.ModuleID)
	if err != nil {
		return nil, fmt.Errorf("failed to get module: %w", err)
	}

	// Check ownership if not admin
	if userRole != "admin" {
		isOwner, err := s.repo.CheckCourseOwnership(courseID, userID)
		if err != nil {
			return nil, fmt.Errorf("failed to check ownership: %w", err)
		}
		if !isOwner {
			return nil, fmt.Errorf("you don't have permission to add lessons to this course")
		}
	}

	lesson := &models.Lesson{
		ID:              uuid.New(),
		ModuleID:        req.ModuleID,
		CourseID:        courseID,
		Title:           req.Title,
		Description:     req.Description,
		ContentType:     req.ContentType,
		DurationMinutes: req.DurationMinutes,
		DisplayOrder:    req.DisplayOrder,
		IsFree:          req.IsFree,
		IsPublished:     true,
	}

	err = s.repo.CreateLesson(lesson)
	if err != nil {
		return nil, fmt.Errorf("failed to create lesson: %w", err)
	}

	return lesson, nil
}

// PublishCourse publishes a draft course (Admin/Instructor with ownership check)
func (s *CourseService) PublishCourse(courseID uuid.UUID, userID uuid.UUID, userRole string) error {
	// Check ownership if not admin
	if userRole != "admin" {
		isOwner, err := s.repo.CheckCourseOwnership(courseID, userID)
		if err != nil {
			return fmt.Errorf("failed to check ownership: %w", err)
		}
		if !isOwner {
			return fmt.Errorf("you don't have permission to publish this course")
		}
	}

	return s.repo.PublishCourse(courseID)
}

// ============================================
// COURSE REVIEWS
// ============================================

// GetCourseReviews retrieves reviews for a course
func (s *CourseService) GetCourseReviews(courseID uuid.UUID) ([]models.CourseReview, error) {
	return s.repo.GetCourseReviews(courseID)
}

// CreateReview creates a new review for a course
func (s *CourseService) CreateReview(userID, courseID uuid.UUID, req *models.CreateReviewRequest) (*models.CourseReview, error) {
	// Check if user is enrolled
	enrollment, err := s.repo.GetEnrollment(userID, courseID)
	if err != nil {
		return nil, fmt.Errorf("failed to check enrollment: %w", err)
	}
	if enrollment == nil {
		return nil, fmt.Errorf("you must be enrolled in the course to leave a review")
	}

	// Check if user already reviewed
	existingReview, err := s.repo.GetUserReview(userID, courseID)
	if err != nil {
		return nil, fmt.Errorf("failed to check existing review: %w", err)
	}
	if existingReview != nil {
		return nil, fmt.Errorf("you have already reviewed this course")
	}

	// Create review
	now := time.Now()
	review := &models.CourseReview{
		UserID:     userID,
		CourseID:   courseID,
		Rating:     req.Rating,
		Title:      req.Title,
		Comment:    req.Comment,
		IsApproved: true,        // Auto-approve (instant publish like Udemy/Coursera)
		ApprovedAt: &now,        // Set approval timestamp
	}

	err = s.repo.CreateReview(review)
	if err != nil {
		return nil, fmt.Errorf("failed to create review: %w", err)
	}

	return review, nil
}

// ============================================
// CATEGORIES
// ============================================

// GetAllCategories retrieves all course categories
func (s *CourseService) GetAllCategories() ([]models.CourseCategory, error) {
	return s.repo.GetAllCategories()
}

// GetCourseCategories retrieves categories for a specific course
func (s *CourseService) GetCourseCategories(courseID uuid.UUID) ([]models.CourseCategory, error) {
	return s.repo.GetCourseCategories(courseID)
}

// ============================================
// VIDEO TRACKING
// ============================================

// TrackVideoProgress records video watch progress
func (s *CourseService) TrackVideoProgress(userID uuid.UUID, req *models.TrackVideoProgressRequest) error {
	watchPercentage := float64(req.WatchedSeconds) / float64(req.TotalSeconds) * 100

	history := &models.VideoWatchHistory{
		UserID:          userID,
		VideoID:         req.VideoID,
		LessonID:        req.LessonID,
		WatchedSeconds:  req.WatchedSeconds,
		TotalSeconds:    req.TotalSeconds,
		WatchPercentage: watchPercentage,
		SessionID:       req.SessionID,
		DeviceType:      req.DeviceType,
	}

	return s.repo.CreateVideoWatchHistory(history)
}

// GetUserVideoWatchHistory retrieves user's video watch history
func (s *CourseService) GetUserVideoWatchHistory(userID uuid.UUID, limit int) ([]models.VideoWatchHistory, error) {
	if limit <= 0 {
		limit = 20
	}
	return s.repo.GetUserVideoWatchHistory(userID, limit)
}

// ============================================
// MATERIALS
// ============================================

// IncrementMaterialDownload increments download count
func (s *CourseService) IncrementMaterialDownload(materialID uuid.UUID) error {
	return s.repo.IncrementMaterialDownload(materialID)
}

// ============================================
// SUBTITLES
// ============================================

// GetVideoSubtitles retrieves subtitles for a video
func (s *CourseService) GetVideoSubtitles(videoID uuid.UUID) ([]models.VideoSubtitle, error) {
	return s.repo.GetVideoSubtitles(videoID)
}

// ============================================
// VIDEO MANAGEMENT
// ============================================

// AddVideoToLesson adds a video to a lesson
func (s *CourseService) AddVideoToLesson(userID uuid.UUID, userRole string, lessonID uuid.UUID, req *models.AddVideoToLessonRequest) (*models.LessonVideo, error) {
	// Verify user has permission (admin or instructor who owns the course)
	lesson, err := s.repo.GetLessonByID(lessonID)
	if err != nil {
		return nil, fmt.Errorf("lesson not found: %v", err)
	}
	if lesson == nil {
		return nil, fmt.Errorf("lesson not found")
	}

	module, err := s.repo.GetModuleByID(lesson.ModuleID)
	if err != nil {
		return nil, fmt.Errorf("module not found: %v", err)
	}
	if module == nil {
		return nil, fmt.Errorf("module not found")
	}

	course, err := s.repo.GetCourseByID(module.CourseID)
	if err != nil {
		return nil, fmt.Errorf("course not found: %v", err)
	}
	if course == nil {
		return nil, fmt.Errorf("course not found")
	}

	// Check ownership
	if userRole != "admin" && course.InstructorID != userID {
		return nil, fmt.Errorf("unauthorized: you don't own this course")
	}

	// Get next display order
	displayOrder := 1
	if req.DisplayOrder != nil {
		displayOrder = *req.DisplayOrder
	} else {
		count, err := s.repo.GetLessonVideoCount(lessonID)
		if err == nil {
			displayOrder = count + 1
		}
	}

	video := &models.LessonVideo{
		LessonID:        lessonID,
		Title:           req.Title,
		VideoProvider:   req.VideoProvider,
		VideoID:         &req.VideoID,
		VideoURL:        req.VideoURL,
		DurationSeconds: 0,
		ThumbnailURL:    req.ThumbnailURL,
		DisplayOrder:    displayOrder,
	}

	if req.DurationSeconds != nil {
		video.DurationSeconds = *req.DurationSeconds
	}

	// Auto-fetch duration from YouTube API if provider is youtube and duration not provided
	if s.youtubeService != nil && req.VideoProvider == "youtube" && req.VideoID != "" && (req.DurationSeconds == nil || *req.DurationSeconds == 0) {
		log.Printf("[Course-Service] Auto-fetching YouTube video duration for video_id: %s", req.VideoID)

		duration, err := s.youtubeService.GetVideoDuration(req.VideoID)
		if err != nil {
			log.Printf("[Course-Service] WARNING: Failed to fetch YouTube duration: %v (continuing with 0)", err)
			// Continue anyway - duration can be updated later
		} else {
			video.DurationSeconds = int(duration)
			log.Printf("[Course-Service] ✅ Auto-fetched YouTube duration: %d seconds for video_id: %s", duration, req.VideoID)
		}
	}

	err = s.repo.CreateLessonVideo(video)
	if err != nil {
		return nil, fmt.Errorf("failed to create video: %v", err)
	}

	// Auto-sync lesson duration_minutes from video duration_seconds
	if video.DurationSeconds > 0 {
		durationMinutes := int(math.Ceil(float64(video.DurationSeconds) / 60.0))
		err = s.repo.UpdateLessonDuration(lessonID, durationMinutes)
		if err != nil {
			log.Printf("[Course-Service] WARNING: Failed to auto-sync lesson duration: %v", err)
		} else {
			log.Printf("[Course-Service] ✅ Auto-synced lesson duration: %d minutes (from %d seconds)", durationMinutes, video.DurationSeconds)
		}
	}

	return video, nil
}

// handleLessonCompletion handles service-to-service integration when a lesson is completed
// FIX #11: Added retry mechanism and better error handling
func (s *CourseService) handleLessonCompletion(userID, lessonID uuid.UUID, lesson *models.Lesson, progress *models.LessonProgress) {
	log.Printf("[Course-Service] Handling lesson completion for user %s, lesson %s", userID, lessonID)

	// Get course to determine skill type
	course, err := s.repo.GetCourseByID(lesson.CourseID)
	if err != nil {
		log.Printf("[Course-Service] ERROR: Failed to get course: %v", err)
		return
	}

	// Calculate study minutes (default to lesson duration or time spent)
	studyMinutes := progress.TimeSpentMinutes
	if studyMinutes == 0 && lesson.DurationMinutes != nil {
		studyMinutes = *lesson.DurationMinutes
	}

	// 1. Update user progress in User Service with retry
	log.Printf("[Course-Service] Updating user progress in User Service...")
	progressUpdateSuccess := false
	for attempt := 1; attempt <= 3; attempt++ {
		err = s.userServiceClient.UpdateProgress(client.UpdateProgressRequest{
			UserID:           userID.String(),
			LessonsCompleted: 1,
			StudyMinutes:     studyMinutes,
			SkillType:        course.SkillType,
			SessionType:      "lesson",
			ResourceID:       lessonID.String(),
		})
		if err == nil {
			log.Printf("[Course-Service] SUCCESS: Updated user progress (attempt %d)", attempt)
			progressUpdateSuccess = true
			break
		}
		log.Printf("[Course-Service] WARNING: Failed to update user progress (attempt %d/%d): %v", attempt, 3, err)
		if attempt < 3 {
			time.Sleep(time.Duration(attempt) * time.Second)
		}
	}

	// If all retries failed, log critical error
	if !progressUpdateSuccess {
		log.Printf("[Course-Service] CRITICAL ERROR: Failed to update user progress after 3 attempts for user %s, lesson %s", userID, lessonID)
		// TODO: Store in dead letter queue or manual reconciliation table
	}

	// 2. Send lesson completion notification with retry
	log.Printf("[Course-Service] Sending lesson completion notification...")

	// Get enrollment to calculate overall progress
	enrollment, err := s.repo.GetEnrollment(userID, lesson.CourseID)
	overallProgress := 0
	if err == nil && enrollment != nil {
		overallProgress = int(enrollment.ProgressPercentage)
	}

	notificationSuccess := false
	for attempt := 1; attempt <= 2; attempt++ {
		err = s.notificationClient.SendLessonCompletionNotification(
			userID.String(),
			lesson.Title,
			overallProgress,
		)
		if err == nil {
			log.Printf("[Course-Service] SUCCESS: Sent lesson completion notification (attempt %d)", attempt)
			notificationSuccess = true
			break
		}
		log.Printf("[Course-Service] WARNING: Failed to send notification (attempt %d/%d): %v", attempt, 2, err)
		if attempt < 2 {
			time.Sleep(1 * time.Second)
		}
	}

	if !notificationSuccess {
		log.Printf("[Course-Service] ERROR: Failed to send notification after 2 attempts (non-critical)")
		// Notification failure is non-critical, don't rollback
	}
}

// SyncYouTubeVideoDuration syncs video duration from YouTube API
func (s *CourseService) SyncYouTubeVideoDuration(videoID string) error {
	youtubeService, err := NewYouTubeService()
	if err != nil {
		return fmt.Errorf("failed to initialize YouTube service: %w", err)
	}

	// Get video details from YouTube
	details, err := youtubeService.GetVideoDetails(videoID)
	if err != nil {
		return fmt.Errorf("failed to fetch YouTube video details: %w", err)
	}

	// Update lesson_videos table
	err = s.repo.UpdateVideoDuration(videoID, int(details.Duration))
	if err != nil {
		return fmt.Errorf("failed to update video duration: %w", err)
	}

	log.Printf("✅ Synced duration for video %s: %d seconds", videoID, details.Duration)
	return nil
}
