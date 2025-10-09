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

// ============= Study Goals =============

// CreateGoal creates a new study goal with validation
func (s *UserService) CreateGoal(userID uuid.UUID, req *models.CreateGoalRequest) (*models.StudyGoal, error) {
	// Parse end_date string to time.Time
	endDate, err := time.Parse("2006-01-02", req.EndDate)
	if err != nil {
		return nil, fmt.Errorf("invalid end_date format, expected YYYY-MM-DD: %v", err)
	}

	// Validate end_date is in the future
	if endDate.Before(time.Now()) {
		return nil, fmt.Errorf("end date must be in the future")
	}

	// Validate target value
	if req.TargetValue <= 0 {
		return nil, fmt.Errorf("target value must be greater than 0")
	}

	goal := &models.StudyGoal{
		ID:              uuid.New(),
		UserID:          userID,
		GoalType:        req.GoalType,
		Title:           req.Title,
		Description:     req.Description,
		TargetValue:     req.TargetValue,
		CurrentValue:    0,
		TargetUnit:      req.TargetUnit,
		SkillType:       req.SkillType,
		StartDate:       time.Now(),
		EndDate:         endDate,
		Status:          "not_started",
		ReminderEnabled: false,
		ReminderTime:    nil,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	err = s.repo.CreateGoal(goal)
	if err != nil {
		return nil, err
	}

	return goal, nil
}

// GetUserGoals retrieves all goals for a user with progress percentages
func (s *UserService) GetUserGoals(userID uuid.UUID) ([]*models.GoalResponse, error) {
	goals, err := s.repo.GetUserGoals(userID)
	if err != nil {
		return nil, err
	}

	responses := make([]*models.GoalResponse, len(goals))
	for i, goal := range goals {
		responses[i] = s.enrichGoalResponse(&goal)
	}

	return responses, nil
}

// GetGoalByID retrieves a specific goal with enriched information
func (s *UserService) GetGoalByID(goalID uuid.UUID, userID uuid.UUID) (*models.GoalResponse, error) {
	goal, err := s.repo.GetGoalByID(goalID, userID)
	if err != nil {
		return nil, err
	}

	return s.enrichGoalResponse(goal), nil
}

// enrichGoalResponse adds calculated fields to goal
func (s *UserService) enrichGoalResponse(goal *models.StudyGoal) *models.GoalResponse {
	completionPercentage := float64(0)
	if goal.TargetValue > 0 {
		completionPercentage = (float64(goal.CurrentValue) / float64(goal.TargetValue)) * 100
		if completionPercentage > 100 {
			completionPercentage = 100
		}
	}

	statusMessage := "On track"
	var daysRemaining *int

	days := int(time.Until(goal.EndDate).Hours() / 24)
	daysRemaining = &days

	if goal.Status == "completed" {
		statusMessage = "Completed"
	} else if days < 0 {
		statusMessage = "Overdue"
	} else if completionPercentage < 50 && days < 7 {
		statusMessage = "Behind schedule"
	}

	return &models.GoalResponse{
		StudyGoal:            goal,
		CompletionPercentage: completionPercentage,
		DaysRemaining:        daysRemaining,
		StatusMessage:        statusMessage,
	}
}

// UpdateGoal updates a study goal
func (s *UserService) UpdateGoal(goalID uuid.UUID, userID uuid.UUID, req *models.UpdateGoalRequest) (*models.StudyGoal, error) {
	goal, err := s.repo.GetGoalByID(goalID, userID)
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if req.Title != nil {
		goal.Title = *req.Title
	}
	if req.TargetValue != nil {
		if *req.TargetValue <= 0 {
			return nil, fmt.Errorf("target value must be greater than 0")
		}
		goal.TargetValue = *req.TargetValue
	}
	if req.CurrentValue != nil {
		goal.CurrentValue = *req.CurrentValue
	}
	if req.EndDate != nil {
		endDate, err := time.Parse("2006-01-02", *req.EndDate)
		if err != nil {
			return nil, fmt.Errorf("invalid end_date format, expected YYYY-MM-DD: %v", err)
		}
		goal.EndDate = endDate
	}
	if req.Description != nil {
		goal.Description = req.Description
	}
	if req.Status != nil {
		goal.Status = *req.Status
	}

	// Auto-complete if target reached
	if goal.CurrentValue >= goal.TargetValue && goal.Status != "completed" {
		goal.Status = "completed"
		now := time.Now()
		goal.CompletedAt = &now
	}

	goal.UpdatedAt = time.Now()

	err = s.repo.UpdateGoal(goal)
	if err != nil {
		return nil, err
	}

	return goal, nil
}

// CompleteGoal marks a goal as completed
func (s *UserService) CompleteGoal(goalID uuid.UUID, userID uuid.UUID) error {
	return s.repo.CompleteGoal(goalID, userID)
}

// DeleteGoal deletes a study goal
func (s *UserService) DeleteGoal(goalID uuid.UUID, userID uuid.UUID) error {
	return s.repo.DeleteGoal(goalID, userID)
}

// ============= Skill Statistics =============

// GetDetailedStatistics retrieves comprehensive statistics for all skills
func (s *UserService) GetDetailedStatistics(userID uuid.UUID) (*models.StatisticsResponse, error) {
	statsMap, err := s.repo.GetAllSkillStatistics(userID)
	if err != nil {
		return nil, err
	}

	// Calculate overall statistics from all skills
	totalPractices := 0
	completedPractices := 0
	totalTimeMinutes := 0
	for _, stats := range statsMap {
		totalPractices += stats.TotalPractices
		completedPractices += stats.CompletedPractices
		totalTimeMinutes += stats.TotalTimeMinutes
	}

	averageAccuracy := float64(0)
	if totalPractices > 0 {
		averageAccuracy = (float64(completedPractices) / float64(totalPractices)) * 100
	}

	response := &models.StatisticsResponse{
		TotalPractices:     totalPractices,
		CompletedPractices: completedPractices,
		AverageAccuracy:    averageAccuracy,
		TotalTimeMinutes:   totalTimeMinutes,
		SkillBreakdown:     statsMap,
		WeakSkills:         []string{},
		StrongSkills:       []string{},
	}

	// Extract weak and strong skills based on average score
	for skill, stats := range statsMap {
		if stats.AverageScore < 60 && stats.TotalPractices > 0 {
			response.WeakSkills = append(response.WeakSkills, skill)
		} else if stats.AverageScore >= 80 && stats.TotalPractices > 0 {
			response.StrongSkills = append(response.StrongSkills, skill)
		}
	}

	return response, nil
}

// GetSkillStatistics retrieves statistics for a specific skill
func (s *UserService) GetSkillStatistics(userID uuid.UUID, skillType string) (*models.SkillStatistics, error) {
	return s.repo.GetSkillStatistics(userID, skillType)
}

// ============= Achievements =============

// GetAllAchievements retrieves all available achievements with user's progress
func (s *UserService) GetAllAchievements(userID uuid.UUID) ([]*models.AchievementWithProgress, error) {
	allAchievements, err := s.repo.GetAllAchievements()
	if err != nil {
		return nil, err
	}

	earnedAchievements, err := s.repo.GetUserAchievements(userID)
	if err != nil {
		return nil, err
	}

	// Create map of earned achievement IDs
	earnedMap := make(map[int]time.Time)
	for _, earned := range earnedAchievements {
		earnedMap[earned.AchievementID] = earned.EarnedAt
	}

	// Combine achievements with earned status
	result := make([]*models.AchievementWithProgress, len(allAchievements))
	for i, achievement := range allAchievements {
		earnedAt, isEarned := earnedMap[achievement.ID]
		result[i] = &models.AchievementWithProgress{
			Achievement: &achievement,
			IsEarned:    isEarned,
		}
		if isEarned {
			result[i].EarnedAt = &earnedAt
			result[i].Progress = achievement.CriteriaValue
			result[i].ProgressPercentage = 100
		} else {
			// TODO: Calculate actual progress based on criteria_type
			result[i].Progress = 0
			result[i].ProgressPercentage = 0
		}
	}

	return result, nil
}

// GetEarnedAchievements retrieves only user's earned achievements
func (s *UserService) GetEarnedAchievements(userID uuid.UUID) ([]models.UserAchievement, error) {
	return s.repo.GetUserAchievements(userID)
}

// UnlockAchievement unlocks an achievement for a user (admin function or auto-triggered)
func (s *UserService) UnlockAchievement(userID uuid.UUID, achievementID uuid.UUID) error {
	// Check if already unlocked
	id, err := uuid.Parse(achievementID.String())
	if err != nil {
		return fmt.Errorf("invalid achievement ID")
	}

	// Convert UUID to int (simplified - in production, fix achievement ID type consistency)
	_ = id

	return s.repo.UnlockAchievement(userID, achievementID)
}

// ============= User Preferences =============

// GetPreferences retrieves user preferences (creates default if not exists)
func (s *UserService) GetPreferences(userID uuid.UUID) (*models.UserPreferences, error) {
	return s.repo.GetPreferences(userID)
}

// UpdatePreferences updates user preferences
func (s *UserService) UpdatePreferences(userID uuid.UUID, req *models.UpdatePreferencesRequest) (*models.UserPreferences, error) {
	// Get existing preferences
	prefs, err := s.repo.GetPreferences(userID)
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if req.EmailNotifications != nil {
		prefs.EmailNotifications = *req.EmailNotifications
	}
	if req.PushNotifications != nil {
		prefs.PushNotifications = *req.PushNotifications
	}
	if req.StudyReminders != nil {
		prefs.StudyReminders = *req.StudyReminders
	}
	if req.WeeklyReport != nil {
		prefs.WeeklyReport = *req.WeeklyReport
	}
	if req.Theme != nil {
		prefs.Theme = *req.Theme
	}
	if req.FontSize != nil {
		prefs.FontSize = *req.FontSize
	}
	if req.AutoPlayNextLesson != nil {
		prefs.AutoPlayNextLesson = *req.AutoPlayNextLesson
	}
	if req.ShowAnswerExplanation != nil {
		prefs.ShowAnswerExplanation = *req.ShowAnswerExplanation
	}
	if req.PlaybackSpeed != nil {
		prefs.PlaybackSpeed = *req.PlaybackSpeed
	}
	if req.ProfileVisibility != nil {
		prefs.ProfileVisibility = *req.ProfileVisibility
	}
	if req.ShowStudyStats != nil {
		prefs.ShowStudyStats = *req.ShowStudyStats
	}

	prefs.UpdatedAt = time.Now()

	err = s.repo.UpdatePreferences(prefs)
	if err != nil {
		return nil, err
	}

	return prefs, nil
}

// ============= Study Reminders =============

// CreateReminder creates a new study reminder with validation
func (s *UserService) CreateReminder(userID uuid.UUID, req *models.CreateReminderRequest) (*models.StudyReminder, error) {
	// Validate time format (simplified - in production, parse and validate HH:MM:SS)
	if len(req.ReminderTime) < 8 {
		return nil, fmt.Errorf("invalid time format, use HH:MM:SS")
	}

	reminder := &models.StudyReminder{
		ID:           uuid.New(),
		UserID:       userID,
		ReminderType: req.ReminderType,
		Title:        req.Title,
		Message:      req.Message,
		ReminderTime: req.ReminderTime,
		DaysOfWeek:   req.DaysOfWeek,
		IsActive:     true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	err := s.repo.CreateReminder(reminder)
	if err != nil {
		return nil, err
	}

	return reminder, nil
}

// GetUserReminders retrieves all reminders for a user
func (s *UserService) GetUserReminders(userID uuid.UUID) ([]models.StudyReminder, error) {
	return s.repo.GetUserReminders(userID)
}

// UpdateReminder updates a study reminder
func (s *UserService) UpdateReminder(reminderID uuid.UUID, userID uuid.UUID, req *models.UpdateReminderRequest) (*models.StudyReminder, error) {
	reminder, err := s.repo.GetReminderByID(reminderID, userID)
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if req.Title != nil {
		reminder.Title = *req.Title
	}
	if req.Message != nil {
		reminder.Message = req.Message
	}
	if req.ReminderTime != nil {
		reminder.ReminderTime = *req.ReminderTime
	}
	if req.DaysOfWeek != nil {
		reminder.DaysOfWeek = req.DaysOfWeek
	}
	if req.IsActive != nil {
		reminder.IsActive = *req.IsActive
	}

	reminder.UpdatedAt = time.Now()

	err = s.repo.UpdateReminder(reminder)
	if err != nil {
		return nil, err
	}

	return reminder, nil
}

// DeleteReminder deletes a study reminder
func (s *UserService) DeleteReminder(reminderID uuid.UUID, userID uuid.UUID) error {
	return s.repo.DeleteReminder(reminderID, userID)
}

// ToggleReminder toggles the active status of a reminder
func (s *UserService) ToggleReminder(reminderID uuid.UUID, userID uuid.UUID, isActive bool) error {
	return s.repo.ToggleReminder(reminderID, userID, isActive)
}

// ============= Leaderboard =============

// GetLeaderboard retrieves top learners
func (s *UserService) GetLeaderboard(limit int) ([]models.LeaderboardEntry, error) {
	if limit <= 0 || limit > 100 {
		limit = 50 // Default limit
	}
	return s.repo.GetTopLearners(limit)
}

// GetUserRank retrieves the rank of a specific user
func (s *UserService) GetUserRank(userID uuid.UUID) (*models.LeaderboardEntry, error) {
	return s.repo.GetUserRank(userID)
}
