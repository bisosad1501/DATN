package service

import (
	"github.com/bisosad1501/ielts-platform/exercise-service/internal/models"
	"github.com/bisosad1501/ielts-platform/exercise-service/internal/repository"
	"github.com/google/uuid"
)

type ExerciseService struct {
	repo *repository.ExerciseRepository
}

func NewExerciseService(repo *repository.ExerciseRepository) *ExerciseService {
	return &ExerciseService{repo: repo}
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
	return s.repo.CompleteSubmission(submissionID)
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
