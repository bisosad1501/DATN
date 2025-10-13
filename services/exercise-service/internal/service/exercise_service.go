package service

import (
	"log"
	"time"

	"github.com/bisosad1501/DATN/shared/pkg/client"
	"github.com/bisosad1501/ielts-platform/exercise-service/internal/models"
	"github.com/bisosad1501/ielts-platform/exercise-service/internal/repository"
	"github.com/google/uuid"
)

type ExerciseService struct {
	repo               *repository.ExerciseRepository
	userServiceClient  *client.UserServiceClient
	notificationClient *client.NotificationServiceClient
}

func NewExerciseService(repo *repository.ExerciseRepository, userServiceClient *client.UserServiceClient, notificationClient *client.NotificationServiceClient) *ExerciseService {
	return &ExerciseService{
		repo:               repo,
		userServiceClient:  userServiceClient,
		notificationClient: notificationClient,
	}
}

// GetExercises returns filtered and paginated exercises
func (s *ExerciseService) GetExercises(query *models.ExerciseListQuery) ([]models.Exercise, int, error) {
	// Set defaults
	if query.Page < 1 {
		query.Page = 1
	}
	if query.Limit < 1 || query.Limit > 100 {
		query.Limit = 20
	}

	return s.repo.GetExercises(query)
}

// GetExerciseByID returns exercise with all details
func (s *ExerciseService) GetExerciseByID(id uuid.UUID) (*models.ExerciseDetailResponse, error) {
	return s.repo.GetExerciseByID(id)
}

// StartExercise creates a new submission for user
func (s *ExerciseService) StartExercise(userID, exerciseID uuid.UUID, deviceType *string) (*models.Submission, error) {
	return s.repo.CreateSubmission(userID, exerciseID, deviceType)
}

// SubmitAnswers saves answers and grades the submission
func (s *ExerciseService) SubmitAnswers(submissionID uuid.UUID, answers []models.SubmitAnswerItem) error {
	// Save and grade answers
	err := s.repo.SaveSubmissionAnswers(submissionID, answers)
	if err != nil {
		return err
	}

	// Complete submission and calculate final score
	err = s.repo.CompleteSubmission(submissionID)
	if err != nil {
		return err
	}

	// Service-to-service integration: Update user stats and send notification
	go func() {
		defer func() {
			if r := recover(); r != nil {
				log.Printf("[Exercise-Service] PANIC in handleExerciseCompletion: %v", r)
			}
		}()
		s.handleExerciseCompletion(submissionID)
	}()

	return nil
}

// GetSubmissionResult returns detailed results
func (s *ExerciseService) GetSubmissionResult(submissionID uuid.UUID) (*models.SubmissionResultResponse, error) {
	return s.repo.GetSubmissionResult(submissionID)
}

// GetMySubmissions returns user's submission history
func (s *ExerciseService) GetMySubmissions(userID uuid.UUID, page, limit int) (*models.MySubmissionsResponse, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	return s.repo.GetUserSubmissions(userID, page, limit)
}

// CreateExercise creates new exercise (admin only)
func (s *ExerciseService) CreateExercise(req *models.CreateExerciseRequest, createdBy uuid.UUID) (*models.Exercise, error) {
	return s.repo.CreateExercise(req, createdBy)
}

// UpdateExercise updates exercise details (admin only)
func (s *ExerciseService) UpdateExercise(id uuid.UUID, req *models.UpdateExerciseRequest) error {
	return s.repo.UpdateExercise(id, req)
}

// DeleteExercise soft deletes exercise (admin only)
func (s *ExerciseService) DeleteExercise(id uuid.UUID) error {
	return s.repo.DeleteExercise(id)
}

// CheckOwnership verifies if user owns the exercise
func (s *ExerciseService) CheckOwnership(exerciseID, userID uuid.UUID) error {
	return s.repo.CheckExerciseOwnership(exerciseID, userID)
}

// CreateSection creates a new section for exercise
func (s *ExerciseService) CreateSection(exerciseID uuid.UUID, req *models.CreateSectionRequest, userID uuid.UUID) (*models.ExerciseSection, error) {
	// Verify ownership
	if err := s.repo.CheckExerciseOwnership(exerciseID, userID); err != nil {
		return nil, err
	}
	return s.repo.CreateSection(exerciseID, req)
}

// CreateQuestion creates a new question
func (s *ExerciseService) CreateQuestion(req *models.CreateQuestionRequest, userID uuid.UUID) (*models.Question, error) {
	// Verify ownership
	if err := s.repo.CheckExerciseOwnership(req.ExerciseID, userID); err != nil {
		return nil, err
	}
	return s.repo.CreateQuestion(req)
}

// CreateQuestionOption creates an option for multiple choice question
func (s *ExerciseService) CreateQuestionOption(questionID uuid.UUID, req *models.CreateQuestionOptionRequest, userID uuid.UUID) (*models.QuestionOption, error) {
	// Get exercise ID from question and verify ownership
	// TODO: Add method to get exercise ID from question ID
	return s.repo.CreateQuestionOption(questionID, req)
}

// CreateQuestionAnswer creates answer for text-based question
func (s *ExerciseService) CreateQuestionAnswer(questionID uuid.UUID, req *models.CreateQuestionAnswerRequest, userID uuid.UUID) (*models.QuestionAnswer, error) {
	// Get exercise ID from question and verify ownership
	// TODO: Add method to get exercise ID from question ID
	return s.repo.CreateQuestionAnswer(questionID, req)
}

// PublishExercise publishes an exercise
func (s *ExerciseService) PublishExercise(exerciseID, userID uuid.UUID) error {
	// Verify ownership
	if err := s.repo.CheckExerciseOwnership(exerciseID, userID); err != nil {
		return err
	}
	return s.repo.PublishExercise(exerciseID)
}

// UnpublishExercise unpublishes an exercise
func (s *ExerciseService) UnpublishExercise(exerciseID, userID uuid.UUID) error {
	// Verify ownership
	if err := s.repo.CheckExerciseOwnership(exerciseID, userID); err != nil {
		return err
	}
	return s.repo.UnpublishExercise(exerciseID)
}

// GetAllTags returns all available tags
func (s *ExerciseService) GetAllTags() ([]models.ExerciseTag, error) {
	return s.repo.GetAllTags()
}

// GetExerciseTags returns tags for a specific exercise
func (s *ExerciseService) GetExerciseTags(exerciseID uuid.UUID) ([]models.ExerciseTag, error) {
	return s.repo.GetExerciseTags(exerciseID)
}

// AddTagToExercise adds a tag to an exercise
func (s *ExerciseService) AddTagToExercise(exerciseID uuid.UUID, tagID int, userID uuid.UUID) error {
	// Verify ownership
	if err := s.repo.CheckExerciseOwnership(exerciseID, userID); err != nil {
		return err
	}
	return s.repo.AddTagToExercise(exerciseID, tagID)
}

// RemoveTagFromExercise removes a tag from an exercise
func (s *ExerciseService) RemoveTagFromExercise(exerciseID uuid.UUID, tagID int, userID uuid.UUID) error {
	// Verify ownership
	if err := s.repo.CheckExerciseOwnership(exerciseID, userID); err != nil {
		return err
	}
	return s.repo.RemoveTagFromExercise(exerciseID, tagID)
}

// CreateTag creates a new tag
func (s *ExerciseService) CreateTag(name, slug string) (*models.ExerciseTag, error) {
	return s.repo.CreateTag(name, slug)
}

// GetBankQuestions returns questions from question bank
func (s *ExerciseService) GetBankQuestions(skillType, questionType string, page, limit int) ([]models.QuestionBank, int, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit
	return s.repo.GetBankQuestions(skillType, questionType, limit, offset)
}

// CreateBankQuestion creates a question in question bank
func (s *ExerciseService) CreateBankQuestion(req *models.CreateBankQuestionRequest, userID uuid.UUID) (*models.QuestionBank, error) {
	return s.repo.CreateBankQuestion(req, userID)
}

// UpdateBankQuestion updates a question in question bank
func (s *ExerciseService) UpdateBankQuestion(questionID uuid.UUID, req *models.UpdateBankQuestionRequest, userID uuid.UUID) error {
	return s.repo.UpdateBankQuestion(questionID, req)
}

// DeleteBankQuestion deletes a question from question bank
func (s *ExerciseService) DeleteBankQuestion(questionID, userID uuid.UUID) error {
	return s.repo.DeleteBankQuestion(questionID)
}

// GetExerciseAnalytics returns analytics for an exercise
func (s *ExerciseService) GetExerciseAnalytics(exerciseID uuid.UUID) (*models.ExerciseAnalytics, error) {
	return s.repo.GetExerciseAnalytics(exerciseID)
}

// handleExerciseCompletion handles service-to-service integration when exercise is completed
func (s *ExerciseService) handleExerciseCompletion(submissionID uuid.UUID) {
	log.Printf("[Exercise-Service] Handling exercise completion for submission %s", submissionID)

	// Get submission result (includes both submission and exercise)
	result, err := s.repo.GetSubmissionResult(submissionID)
	if err != nil {
		log.Printf("[Exercise-Service] ERROR: Failed to get submission result: %v", err)
		return
	}

	submission := result.Submission
	exercise := result.Exercise
	skillType := exercise.SkillType

	// Extract score value (handle pointer)
	score := 0.0
	if submission.Score != nil {
		score = *submission.Score
	}

	// Calculate time spent (in minutes)
	timeMinutes := 0
	if submission.CompletedAt != nil {
		duration := submission.CompletedAt.Sub(submission.StartedAt)
		timeMinutes = int(duration.Minutes())
	}

	// FIX #15: Add retry mechanism for service integration
	maxRetries := 3
	retryDelay := time.Second

	// 1. Update skill statistics in User Service (only if score > 0)
	if score > 0 {
		log.Printf("[Exercise-Service] Updating skill statistics in User Service...")
		var lastErr error
		for attempt := 1; attempt <= maxRetries; attempt++ {
			err = s.userServiceClient.UpdateSkillStatistics(client.UpdateSkillStatsRequest{
				UserID:         submission.UserID.String(),
				SkillType:      skillType,
				Score:          score,
				TimeMinutes:    timeMinutes,
				IsCompleted:    true,
				TotalPractices: 1,
			})
			if err == nil {
				log.Printf("[Exercise-Service] SUCCESS: Updated skill statistics (attempt %d)", attempt)
				break
			}
			lastErr = err
			if attempt < maxRetries {
				log.Printf("[Exercise-Service] Attempt %d failed, retrying in %v...", attempt, retryDelay)
				time.Sleep(retryDelay)
				retryDelay *= 2 // Exponential backoff
			}
		}
		if lastErr != nil {
			log.Printf("[Exercise-Service] ERROR: Failed to update skill stats after %d attempts: %v", maxRetries, lastErr)
		}
	} else {
		log.Printf("[Exercise-Service] Skipping skill statistics update (score = 0)")
	}

	// 2. Update overall progress in User Service
	log.Printf("[Exercise-Service] Updating user progress in User Service...")
	retryDelay = time.Second // Reset delay
	var lastErr error
	for attempt := 1; attempt <= maxRetries; attempt++ {
		err = s.userServiceClient.UpdateProgress(client.UpdateProgressRequest{
			UserID:            submission.UserID.String(),
			ExercisesComplete: 1,
			StudyMinutes:      timeMinutes,
			SkillType:         skillType,
			SessionType:       "exercise",
			ResourceID:        submission.ExerciseID.String(),
			Score:             score,
		})
		if err == nil {
			log.Printf("[Exercise-Service] SUCCESS: Updated user progress (attempt %d)", attempt)
			break
		}
		lastErr = err
		if attempt < maxRetries {
			log.Printf("[Exercise-Service] Attempt %d failed, retrying in %v...", attempt, retryDelay)
			time.Sleep(retryDelay)
			retryDelay *= 2 // Exponential backoff
		}
	}
	if lastErr != nil {
		log.Printf("[Exercise-Service] ERROR: Failed to update user progress after %d attempts: %v", maxRetries, lastErr)
	}

	// 3. Send exercise result notification
	log.Printf("[Exercise-Service] Sending exercise result notification...")
	retryDelay = time.Second // Reset delay
	lastErr = nil
	for attempt := 1; attempt <= maxRetries; attempt++ {
		err = s.notificationClient.SendExerciseResultNotification(
			submission.UserID.String(),
			exercise.Title,
			score,
		)
		if err == nil {
			log.Printf("[Exercise-Service] SUCCESS: Sent exercise result notification (attempt %d)", attempt)
			break
		}
		lastErr = err
		if attempt < maxRetries {
			log.Printf("[Exercise-Service] Attempt %d failed, retrying in %v...", attempt, retryDelay)
			time.Sleep(retryDelay)
			retryDelay *= 2 // Exponential backoff
		}
	}
	if lastErr != nil {
		log.Printf("[Exercise-Service] ERROR: Failed to send notification after %d attempts: %v", maxRetries, lastErr)
	}
}
