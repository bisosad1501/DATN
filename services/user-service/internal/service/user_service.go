package service

import (
	"fmt"
	"log"
	"time"

	"github.com/bisosad1501/DATN/services/user-service/internal/models"
	"github.com/bisosad1501/DATN/services/user-service/internal/repository"
	"github.com/google/uuid"
)

type UserService struct {
	repo *repository.UserRepository
}

func NewUserService(repo *repository.UserRepository) *UserService {
	return &UserService{repo: repo}
}

// GetOrCreateProfile gets existing profile or creates a new one
func (s *UserService) GetOrCreateProfile(userID uuid.UUID) (*models.UserProfile, error) {
	profile, err := s.repo.GetProfileByUserID(userID)
	if err != nil {
		return nil, err
	}

	// If profile doesn't exist, create it
	if profile == nil {
		err = s.repo.CreateProfile(userID)
		if err != nil {
			return nil, err
		}
		profile, err = s.repo.GetProfileByUserID(userID)
		if err != nil {
			return nil, err
		}
	}

	return profile, nil
}

// UpdateProfile updates user profile
func (s *UserService) UpdateProfile(userID uuid.UUID, req *models.UpdateProfileRequest) (*models.UserProfile, error) {
	// Validate inputs
	if req.TargetBandScore != nil {
		if *req.TargetBandScore < 0 || *req.TargetBandScore > 9 {
			return nil, fmt.Errorf("target band score must be between 0 and 9")
		}
	}

	err := s.repo.UpdateProfile(userID, req)
	if err != nil {
		return nil, err
	}

	// Return updated profile
	return s.repo.GetProfileByUserID(userID)
}

// UpdateAvatar updates user avatar
func (s *UserService) UpdateAvatar(userID uuid.UUID, avatarURL string) error {
	return s.repo.UpdateAvatar(userID, avatarURL)
}

// GetProgressStats gets comprehensive progress statistics
func (s *UserService) GetProgressStats(userID uuid.UUID) (*models.ProgressStatsResponse, error) {
	// Get profile
	profile, err := s.GetOrCreateProfile(userID)
	if err != nil {
		return nil, err
	}

	// Get learning progress
	progress, err := s.repo.GetLearningProgress(userID)
	if err != nil {
		return nil, err
	}

	// Get recent sessions
	recentSessions, err := s.repo.GetRecentSessions(userID, 10)
	if err != nil {
		log.Printf("⚠️  Warning: Failed to get recent sessions: %v", err)
		recentSessions = []models.StudySession{}
	}

	// Get achievements
	achievements, err := s.repo.GetUserAchievements(userID)
	if err != nil {
		log.Printf("⚠️  Warning: Failed to get achievements: %v", err)
		achievements = []models.UserAchievement{}
	}

	// Calculate total points from achievements (simplified for now)
	totalPoints := len(achievements) * 10 // Each achievement worth 10 points

	return &models.ProgressStatsResponse{
		Profile:        profile,
		Progress:       progress,
		RecentSessions: recentSessions,
		Achievements:   achievements,
		TotalPoints:    totalPoints,
	}, nil
}

// StartStudySession starts a new study session
func (s *UserService) StartStudySession(req *models.StudySessionRequest, userID uuid.UUID, deviceType *string) (*models.StudySession, error) {
	session := &models.StudySession{
		ID:           uuid.New(),
		UserID:       userID,
		SessionType:  req.SessionType,
		SkillType:    req.SkillType,
		ResourceType: req.ResourceType,
		StartedAt:    time.Now(),
		IsCompleted:  false,
		DeviceType:   deviceType,
	}

	if req.ResourceID != nil {
		resourceID, err := uuid.Parse(*req.ResourceID)
		if err == nil {
			session.ResourceID = &resourceID
		}
	}

	err := s.repo.CreateStudySession(session)
	if err != nil {
		return nil, err
	}

	return session, nil
}

// EndStudySession ends an active study session
func (s *UserService) EndStudySession(sessionID uuid.UUID, req *models.EndSessionRequest) error {
	return s.repo.EndStudySession(sessionID, req.CompletionPercentage, req.Score)
}

// GetStudyHistory gets study history for a user
func (s *UserService) GetStudyHistory(userID uuid.UUID, limit int) ([]models.StudySession, error) {
	if limit <= 0 || limit > 100 {
		limit = 20 // Default limit
	}
	return s.repo.GetRecentSessions(userID, limit)
}
