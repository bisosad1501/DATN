package repository

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/bisosad1501/DATN/services/user-service/internal/database"
	"github.com/bisosad1501/DATN/services/user-service/internal/models"
	"github.com/google/uuid"
)

type UserRepository struct {
	db *database.Database
}

func NewUserRepository(db *database.Database) *UserRepository {
	return &UserRepository{db: db}
}

// CreateProfile creates a new user profile
func (r *UserRepository) CreateProfile(userID uuid.UUID) error {
	query := `
		INSERT INTO user_profiles (user_id, timezone, language_preference)
		VALUES ($1, $2, $3)
		ON CONFLICT (user_id) DO NOTHING
	`
	_, err := r.db.DB.Exec(query, userID, "Asia/Ho_Chi_Minh", "vi")
	if err != nil {
		log.Printf("❌ Error creating profile for user %s: %v", userID, err)
		return fmt.Errorf("failed to create profile: %w", err)
	}

	// Also create learning progress record
	progressQuery := `
		INSERT INTO learning_progress (user_id)
		VALUES ($1)
		ON CONFLICT (user_id) DO NOTHING
	`
	_, err = r.db.DB.Exec(progressQuery, userID)
	if err != nil {
		log.Printf("❌ Error creating learning progress for user %s: %v", userID, err)
		return fmt.Errorf("failed to create learning progress: %w", err)
	}

	log.Printf("✅ Profile created for user: %s", userID)
	return nil
}

// GetProfileByUserID retrieves user profile by user ID
func (r *UserRepository) GetProfileByUserID(userID uuid.UUID) (*models.UserProfile, error) {
	query := `
		SELECT user_id, first_name, last_name, full_name, date_of_birth, gender,
		       phone, address, city, country, timezone, avatar_url, cover_image_url,
		       current_level, target_band_score, target_exam_date, bio,
		       learning_preferences, language_preference, created_at, updated_at
		FROM user_profiles
		WHERE user_id = $1 AND deleted_at IS NULL
	`

	profile := &models.UserProfile{}
	err := r.db.DB.QueryRow(query, userID).Scan(
		&profile.UserID, &profile.FirstName, &profile.LastName, &profile.FullName,
		&profile.DateOfBirth, &profile.Gender, &profile.Phone, &profile.Address,
		&profile.City, &profile.Country, &profile.Timezone, &profile.AvatarURL,
		&profile.CoverImageURL, &profile.CurrentLevel, &profile.TargetBandScore,
		&profile.TargetExamDate, &profile.Bio, &profile.LearningPreferences,
		&profile.LanguagePreference, &profile.CreatedAt, &profile.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		log.Printf("❌ Error getting profile for user %s: %v", userID, err)
		return nil, fmt.Errorf("failed to get profile: %w", err)
	}

	return profile, nil
}

// UpdateProfile updates user profile
func (r *UserRepository) UpdateProfile(userID uuid.UUID, req *models.UpdateProfileRequest) error {
	// Build dynamic update query
	query := `UPDATE user_profiles SET updated_at = CURRENT_TIMESTAMP`
	args := []interface{}{userID}
	paramCount := 1

	if req.FirstName != nil {
		paramCount++
		query += fmt.Sprintf(", first_name = $%d", paramCount)
		args = append(args, *req.FirstName)
	}
	if req.LastName != nil {
		paramCount++
		query += fmt.Sprintf(", last_name = $%d", paramCount)
		args = append(args, *req.LastName)

		// Auto-generate full_name if both first and last name are provided
		if req.FirstName != nil {
			paramCount++
			query += fmt.Sprintf(", full_name = $%d", paramCount)
			args = append(args, fmt.Sprintf("%s %s", *req.FirstName, *req.LastName))
		}
	}
	if req.DateOfBirth != nil {
		paramCount++
		query += fmt.Sprintf(", date_of_birth = $%d", paramCount)
		args = append(args, *req.DateOfBirth)
	}
	if req.Gender != nil {
		paramCount++
		query += fmt.Sprintf(", gender = $%d", paramCount)
		args = append(args, *req.Gender)
	}
	if req.Phone != nil {
		paramCount++
		query += fmt.Sprintf(", phone = $%d", paramCount)
		args = append(args, *req.Phone)
	}
	if req.Address != nil {
		paramCount++
		query += fmt.Sprintf(", address = $%d", paramCount)
		args = append(args, *req.Address)
	}
	if req.City != nil {
		paramCount++
		query += fmt.Sprintf(", city = $%d", paramCount)
		args = append(args, *req.City)
	}
	if req.Country != nil {
		paramCount++
		query += fmt.Sprintf(", country = $%d", paramCount)
		args = append(args, *req.Country)
	}
	if req.Timezone != nil {
		paramCount++
		query += fmt.Sprintf(", timezone = $%d", paramCount)
		args = append(args, *req.Timezone)
	}
	if req.CurrentLevel != nil {
		paramCount++
		query += fmt.Sprintf(", current_level = $%d", paramCount)
		args = append(args, *req.CurrentLevel)
	}
	if req.TargetBandScore != nil {
		paramCount++
		query += fmt.Sprintf(", target_band_score = $%d", paramCount)
		args = append(args, *req.TargetBandScore)
	}
	if req.TargetExamDate != nil {
		paramCount++
		query += fmt.Sprintf(", target_exam_date = $%d", paramCount)
		args = append(args, *req.TargetExamDate)
	}
	if req.Bio != nil {
		paramCount++
		query += fmt.Sprintf(", bio = $%d", paramCount)
		args = append(args, *req.Bio)
	}
	if req.LearningPreferences != nil {
		paramCount++
		query += fmt.Sprintf(", learning_preferences = $%d", paramCount)
		args = append(args, *req.LearningPreferences)
	}
	if req.LanguagePreference != nil {
		paramCount++
		query += fmt.Sprintf(", language_preference = $%d", paramCount)
		args = append(args, *req.LanguagePreference)
	}

	query += " WHERE user_id = $1"

	result, err := r.db.DB.Exec(query, args...)
	if err != nil {
		log.Printf("❌ Error updating profile for user %s: %v", userID, err)
		return fmt.Errorf("failed to update profile: %w", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("profile not found")
	}

	log.Printf("✅ Profile updated for user: %s", userID)
	return nil
}

// UpdateAvatar updates user avatar URL
func (r *UserRepository) UpdateAvatar(userID uuid.UUID, avatarURL string) error {
	query := `
		UPDATE user_profiles
		SET avatar_url = $1, updated_at = CURRENT_TIMESTAMP
		WHERE user_id = $2
	`
	_, err := r.db.DB.Exec(query, avatarURL, userID)
	if err != nil {
		log.Printf("❌ Error updating avatar for user %s: %v", userID, err)
		return fmt.Errorf("failed to update avatar: %w", err)
	}

	log.Printf("✅ Avatar updated for user: %s", userID)
	return nil
}

// GetLearningProgress retrieves learning progress for a user
func (r *UserRepository) GetLearningProgress(userID uuid.UUID) (*models.LearningProgress, error) {
	query := `
		SELECT id, user_id, total_study_hours, total_lessons_completed, total_exercises_completed,
		       listening_progress, reading_progress, writing_progress, speaking_progress,
		       listening_score, reading_score, writing_score, speaking_score, overall_score,
		       current_streak_days, longest_streak_days, last_study_date, created_at, updated_at
		FROM learning_progress
		WHERE user_id = $1
	`

	progress := &models.LearningProgress{}
	err := r.db.DB.QueryRow(query, userID).Scan(
		&progress.ID, &progress.UserID, &progress.TotalStudyHours, &progress.TotalLessonsCompleted,
		&progress.TotalExercisesCompleted, &progress.ListeningProgress, &progress.ReadingProgress,
		&progress.WritingProgress, &progress.SpeakingProgress, &progress.ListeningScore,
		&progress.ReadingScore, &progress.WritingScore, &progress.SpeakingScore,
		&progress.OverallScore, &progress.CurrentStreakDays, &progress.LongestStreakDays,
		&progress.LastStudyDate, &progress.CreatedAt, &progress.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		log.Printf("❌ Error getting learning progress for user %s: %v", userID, err)
		return nil, fmt.Errorf("failed to get learning progress: %w", err)
	}

	return progress, nil
}

// CreateLearningProgress creates a new learning progress record
func (r *UserRepository) CreateLearningProgress(userID uuid.UUID) error {
	query := `
		INSERT INTO learning_progress (user_id)
		VALUES ($1)
		ON CONFLICT (user_id) DO NOTHING
	`
	_, err := r.db.DB.Exec(query, userID)
	if err != nil {
		log.Printf("❌ Error creating learning progress for user %s: %v", userID, err)
		return fmt.Errorf("failed to create learning progress: %w", err)
	}
	return nil
}

// UpdateLearningProgress updates learning progress fields
func (r *UserRepository) UpdateLearningProgress(userID uuid.UUID, updates map[string]interface{}) error {
	if len(updates) == 0 {
		return nil
	}

	// Build dynamic update query
	query := "UPDATE learning_progress SET updated_at = CURRENT_TIMESTAMP"
	args := []interface{}{}
	paramCount := 0

	for field, value := range updates {
		paramCount++
		query += fmt.Sprintf(", %s = $%d", field, paramCount)
		args = append(args, value)
	}

	paramCount++
	query += fmt.Sprintf(" WHERE user_id = $%d", paramCount)
	args = append(args, userID)

	result, err := r.db.DB.Exec(query, args...)
	if err != nil {
		log.Printf("❌ Error updating learning progress for user %s: %v", userID, err)
		return fmt.Errorf("failed to update learning progress: %w", err)
	}

	// Check if row was actually updated
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rowsAffected == 0 {
		log.Printf("⚠️  Warning: No rows updated for user %s (may not exist)", userID)
		return fmt.Errorf("learning progress not found for user %s", userID)
	}

	return nil
}

// CreateStudySession creates a new study session
func (r *UserRepository) CreateStudySession(session *models.StudySession) error {
	query := `
		INSERT INTO study_sessions (id, user_id, session_type, skill_type, resource_id, resource_type, started_at, device_type)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	_, err := r.db.DB.Exec(query, session.ID, session.UserID, session.SessionType,
		session.SkillType, session.ResourceID, session.ResourceType, session.StartedAt, session.DeviceType)

	if err != nil {
		log.Printf("❌ Error creating study session for user %s: %v", session.UserID, err)
		return fmt.Errorf("failed to create study session: %w", err)
	}

	log.Printf("✅ Study session created: %s for user: %s", session.ID, session.UserID)
	return nil
}

// EndStudySession ends a study session
func (r *UserRepository) EndStudySession(sessionID uuid.UUID, completionPercentage *float64, score *float64) error {
	endedAt := time.Now()

	// First, get the session to calculate duration
	var startedAt time.Time
	var userID uuid.UUID
	getQuery := `SELECT started_at, user_id FROM study_sessions WHERE id = $1`
	err := r.db.DB.QueryRow(getQuery, sessionID).Scan(&startedAt, &userID)
	if err != nil {
		return fmt.Errorf("session not found: %w", err)
	}

	durationMinutes := int(endedAt.Sub(startedAt).Minutes())

	query := `
		UPDATE study_sessions
		SET ended_at = $1, duration_minutes = $2, is_completed = true, 
		    completion_percentage = $3, score = $4
		WHERE id = $5
	`
	_, err = r.db.DB.Exec(query, endedAt, durationMinutes, completionPercentage, score, sessionID)
	if err != nil {
		log.Printf("❌ Error ending study session %s: %v", sessionID, err)
		return fmt.Errorf("failed to end study session: %w", err)
	}

	// Update study streak
	_, err = r.db.DB.Exec(`SELECT update_study_streak($1)`, userID)
	if err != nil {
		log.Printf("⚠️  Warning: Failed to update streak for user %s: %v", userID, err)
	}

	log.Printf("✅ Study session ended: %s (duration: %d minutes)", sessionID, durationMinutes)
	return nil
}

// GetRecentSessions retrieves recent study sessions
func (r *UserRepository) GetRecentSessions(userID uuid.UUID, limit int) ([]models.StudySession, error) {
	query := `
		SELECT id, user_id, session_type, skill_type, resource_id, resource_type,
		       started_at, ended_at, duration_minutes, is_completed, completion_percentage,
		       score, device_type, created_at
		FROM study_sessions
		WHERE user_id = $1
		ORDER BY started_at DESC
		LIMIT $2
	`

	rows, err := r.db.DB.Query(query, userID, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get recent sessions: %w", err)
	}
	defer rows.Close()

	sessions := []models.StudySession{}
	for rows.Next() {
		session := models.StudySession{}
		err := rows.Scan(
			&session.ID, &session.UserID, &session.SessionType, &session.SkillType,
			&session.ResourceID, &session.ResourceType, &session.StartedAt, &session.EndedAt,
			&session.DurationMinutes, &session.IsCompleted, &session.CompletionPercentage,
			&session.Score, &session.DeviceType, &session.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan session: %w", err)
		}
		sessions = append(sessions, session)
	}

	return sessions, nil
}

// GetUserAchievements retrieves user's earned achievements
func (r *UserRepository) GetUserAchievements(userID uuid.UUID) ([]models.UserAchievement, error) {
	query := `
		SELECT id, user_id, achievement_id, earned_at
		FROM user_achievements
		WHERE user_id = $1
		ORDER BY earned_at DESC
	`

	rows, err := r.db.DB.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user achievements: %w", err)
	}
	defer rows.Close()

	achievements := []models.UserAchievement{}
	for rows.Next() {
		achievement := models.UserAchievement{}
		err := rows.Scan(&achievement.ID, &achievement.UserID, &achievement.AchievementID, &achievement.EarnedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan achievement: %w", err)
		}
		achievements = append(achievements, achievement)
	}

	return achievements, nil
}

// ============= Study Goals =============

// CreateGoal creates a new study goal
func (r *UserRepository) CreateGoal(goal *models.StudyGoal) error {
	query := `
		INSERT INTO study_goals (id, user_id, goal_type, title, description, target_value, target_unit, current_value, skill_type, start_date, end_date, status, reminder_enabled, reminder_time, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
	`
	_, err := r.db.DB.Exec(query, goal.ID, goal.UserID, goal.GoalType, goal.Title, goal.Description, goal.TargetValue, goal.TargetUnit, goal.CurrentValue, goal.SkillType, goal.StartDate, goal.EndDate, goal.Status, goal.ReminderEnabled, goal.ReminderTime)
	if err != nil {
		return fmt.Errorf("failed to create goal: %w", err)
	}
	return nil
}

// GetUserGoals retrieves all goals for a user
func (r *UserRepository) GetUserGoals(userID uuid.UUID) ([]models.StudyGoal, error) {
	query := `
		SELECT id, user_id, goal_type, title, description, target_value, target_unit, current_value, skill_type, start_date, end_date, 
		       status, completed_at, reminder_enabled, reminder_time, created_at, updated_at
		FROM study_goals
		WHERE user_id = $1
		ORDER BY created_at DESC
	`
	rows, err := r.db.DB.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user goals: %w", err)
	}
	defer rows.Close()

	goals := []models.StudyGoal{}
	for rows.Next() {
		goal := models.StudyGoal{}
		err := rows.Scan(&goal.ID, &goal.UserID, &goal.GoalType, &goal.Title, &goal.Description, &goal.TargetValue, &goal.TargetUnit, &goal.CurrentValue,
			&goal.SkillType, &goal.StartDate, &goal.EndDate, &goal.Status, &goal.CompletedAt,
			&goal.ReminderEnabled, &goal.ReminderTime, &goal.CreatedAt, &goal.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan goal: %w", err)
		}
		goals = append(goals, goal)
	}
	return goals, nil
}

// GetGoalByID retrieves a specific goal by ID
func (r *UserRepository) GetGoalByID(goalID uuid.UUID, userID uuid.UUID) (*models.StudyGoal, error) {
	query := `
		SELECT id, user_id, goal_type, title, description, target_value, target_unit, current_value, skill_type, start_date, end_date, 
		       status, completed_at, reminder_enabled, reminder_time, created_at, updated_at
		FROM study_goals
		WHERE id = $1 AND user_id = $2
	`
	goal := &models.StudyGoal{}
	err := r.db.DB.QueryRow(query, goalID, userID).Scan(
		&goal.ID, &goal.UserID, &goal.GoalType, &goal.Title, &goal.Description, &goal.TargetValue, &goal.TargetUnit, &goal.CurrentValue,
		&goal.SkillType, &goal.StartDate, &goal.EndDate, &goal.Status, &goal.CompletedAt,
		&goal.ReminderEnabled, &goal.ReminderTime, &goal.CreatedAt, &goal.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("goal not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get goal: %w", err)
	}
	return goal, nil
}

// UpdateGoal updates a study goal
func (r *UserRepository) UpdateGoal(goal *models.StudyGoal) error {
	query := `
		UPDATE study_goals
		SET title = $1, description = $2, target_value = $3, target_unit = $4, current_value = $5, 
		    skill_type = $6, end_date = $7, status = $8, completed_at = $9, 
		    reminder_enabled = $10, reminder_time = $11, updated_at = NOW()
		WHERE id = $12 AND user_id = $13
	`
	_, err := r.db.DB.Exec(query, goal.Title, goal.Description, goal.TargetValue, goal.TargetUnit, goal.CurrentValue,
		goal.SkillType, goal.EndDate, goal.Status, goal.CompletedAt,
		goal.ReminderEnabled, goal.ReminderTime, goal.ID, goal.UserID)
	if err != nil {
		return fmt.Errorf("failed to update goal: %w", err)
	}
	return nil
}

// UpdateGoalProgress updates the current progress of a goal
func (r *UserRepository) UpdateGoalProgress(goalID uuid.UUID, userID uuid.UUID, currentValue int) error {
	query := `
		UPDATE study_goals
		SET current_value = $1, updated_at = NOW()
		WHERE id = $2 AND user_id = $3
	`
	_, err := r.db.DB.Exec(query, currentValue, goalID, userID)
	if err != nil {
		return fmt.Errorf("failed to update goal progress: %w", err)
	}
	return nil
}

// CompleteGoal marks a goal as completed
func (r *UserRepository) CompleteGoal(goalID uuid.UUID, userID uuid.UUID) error {
	now := time.Now()
	query := `
		UPDATE study_goals
		SET status = 'completed', completed_at = $1, updated_at = NOW()
		WHERE id = $2 AND user_id = $3
	`
	_, err := r.db.DB.Exec(query, now, goalID, userID)
	if err != nil {
		return fmt.Errorf("failed to complete goal: %w", err)
	}
	return nil
}

// DeleteGoal deletes a study goal
func (r *UserRepository) DeleteGoal(goalID uuid.UUID, userID uuid.UUID) error {
	query := `DELETE FROM study_goals WHERE id = $1 AND user_id = $2`
	_, err := r.db.DB.Exec(query, goalID, userID)
	if err != nil {
		return fmt.Errorf("failed to delete goal: %w", err)
	}
	return nil
}

// UpdateLearningProgressAtomic updates learning progress using atomic operations to prevent race conditions
func (r *UserRepository) UpdateLearningProgressAtomic(userID uuid.UUID, updates map[string]interface{}) error {
	if len(updates) == 0 {
		return nil
	}

	query := "UPDATE learning_progress SET updated_at = CURRENT_TIMESTAMP"
	args := []interface{}{}
	paramCount := 0

	// Handle atomic increments
	if lessonsCompleted, ok := updates["lessons_completed"].(int); ok && lessonsCompleted > 0 {
		paramCount++
		query += fmt.Sprintf(", total_lessons_completed = total_lessons_completed + $%d", paramCount)
		args = append(args, lessonsCompleted)
	}
	if exercisesCompleted, ok := updates["exercises_completed"].(int); ok && exercisesCompleted > 0 {
		paramCount++
		query += fmt.Sprintf(", total_exercises_completed = total_exercises_completed + $%d", paramCount)
		args = append(args, exercisesCompleted)
	}
	if studyMinutes, ok := updates["study_minutes"].(int); ok && studyMinutes > 0 {
		paramCount++
		studyHours := float64(studyMinutes) / 60.0
		query += fmt.Sprintf(", total_study_hours = total_study_hours + $%d", paramCount)
		args = append(args, studyHours)
	}

	// Handle streak updates
	if increment, ok := updates["increment_current_streak"].(int); ok && increment > 0 {
		paramCount++
		query += fmt.Sprintf(", current_streak_days = current_streak_days + $%d", paramCount)
		args = append(args, increment)

		// Update longest streak if needed
		if shouldUpdate, ok := updates["update_longest_if_needed"].(bool); ok && shouldUpdate {
			query += ", longest_streak_days = GREATEST(longest_streak_days, current_streak_days)"
		}
	} else if currentStreak, ok := updates["current_streak_days"].(int); ok {
		paramCount++
		query += fmt.Sprintf(", current_streak_days = $%d", paramCount)
		args = append(args, currentStreak)
	}

	if longestStreak, ok := updates["longest_streak_days"].(int); ok {
		paramCount++
		query += fmt.Sprintf(", longest_streak_days = $%d", paramCount)
		args = append(args, longestStreak)
	}

	// Handle direct updates
	if lastStudyDate, ok := updates["last_study_date"].(time.Time); ok {
		paramCount++
		query += fmt.Sprintf(", last_study_date = $%d", paramCount)
		args = append(args, lastStudyDate)
	}

	// Add WHERE clause
	paramCount++
	query += fmt.Sprintf(" WHERE user_id = $%d", paramCount)
	args = append(args, userID)

	result, err := r.db.DB.Exec(query, args...)
	if err != nil {
		log.Printf("❌ Error updating learning progress atomically for user %s: %v", userID, err)
		return fmt.Errorf("failed to update learning progress: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rowsAffected == 0 {
		return fmt.Errorf("learning progress not found for user %s", userID)
	}

	return nil
}

// ============= Skill Statistics =============

// GetSkillStatistics retrieves statistics for a specific skill
func (r *UserRepository) GetSkillStatistics(userID uuid.UUID, skillType string) (*models.SkillStatistics, error) {
	query := `
		SELECT id, user_id, skill_type, total_practices, completed_practices, average_score, best_score, 
		       total_time_minutes, last_practice_date, last_practice_score, score_trend, weak_areas, created_at, updated_at
		FROM skill_statistics
		WHERE user_id = $1 AND skill_type = $2
	`
	stats := &models.SkillStatistics{}
	err := r.db.DB.QueryRow(query, userID, skillType).Scan(
		&stats.ID, &stats.UserID, &stats.SkillType, &stats.TotalPractices, &stats.CompletedPractices,
		&stats.AverageScore, &stats.BestScore, &stats.TotalTimeMinutes, &stats.LastPracticeDate,
		&stats.LastPracticeScore, &stats.ScoreTrend, &stats.WeakAreas, &stats.CreatedAt, &stats.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil // Return nil if no statistics exist yet
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get skill statistics: %w", err)
	}
	return stats, nil
}

// CreateSkillStatistics creates a new skill statistics record
func (r *UserRepository) CreateSkillStatistics(userID uuid.UUID, skillType string) error {
	query := `
		INSERT INTO skill_statistics (
			user_id, skill_type, 
			total_practices, completed_practices, 
			average_score, best_score, 
			total_time_minutes
		)
		VALUES ($1, $2, 0, 0, 0.0, 0.0, 0)
		ON CONFLICT (user_id, skill_type) DO NOTHING
	`
	_, err := r.db.DB.Exec(query, userID, skillType)
	if err != nil {
		log.Printf("❌ Error creating skill statistics for user %s, skill %s: %v", userID, skillType, err)
		return fmt.Errorf("failed to create skill statistics: %w", err)
	}
	return nil
}

// UpdateSkillStatistics updates skill statistics fields
func (r *UserRepository) UpdateSkillStatistics(userID uuid.UUID, skillType string, updates map[string]interface{}) error {
	if len(updates) == 0 {
		return nil
	}

	// Build dynamic update query
	query := "UPDATE skill_statistics SET updated_at = CURRENT_TIMESTAMP"
	args := []interface{}{}
	paramCount := 0

	for field, value := range updates {
		paramCount++
		query += fmt.Sprintf(", %s = $%d", field, paramCount)
		args = append(args, value)
	}

	paramCount++
	query += fmt.Sprintf(" WHERE user_id = $%d", paramCount)
	args = append(args, userID)

	paramCount++
	query += fmt.Sprintf(" AND skill_type = $%d", paramCount)
	args = append(args, skillType)

	_, err := r.db.DB.Exec(query, args...)
	if err != nil {
		log.Printf("❌ Error updating skill statistics for user %s, skill %s: %v", userID, skillType, err)
		return fmt.Errorf("failed to update skill statistics: %w", err)
	}

	return nil
}

// GetAllSkillStatistics retrieves all skill statistics for a user
func (r *UserRepository) GetAllSkillStatistics(userID uuid.UUID) (map[string]*models.SkillStatistics, error) {
	query := `
		SELECT id, user_id, skill_type, total_practices, completed_practices, average_score, best_score, 
		       total_time_minutes, last_practice_date, last_practice_score, score_trend, weak_areas, created_at, updated_at
		FROM skill_statistics
		WHERE user_id = $1
	`
	rows, err := r.db.DB.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get all skill statistics: %w", err)
	}
	defer rows.Close()

	statsMap := make(map[string]*models.SkillStatistics)
	for rows.Next() {
		stats := &models.SkillStatistics{}
		err := rows.Scan(&stats.ID, &stats.UserID, &stats.SkillType, &stats.TotalPractices, &stats.CompletedPractices,
			&stats.AverageScore, &stats.BestScore, &stats.TotalTimeMinutes, &stats.LastPracticeDate,
			&stats.LastPracticeScore, &stats.ScoreTrend, &stats.WeakAreas, &stats.CreatedAt, &stats.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan skill statistics: %w", err)
		}
		statsMap[stats.SkillType] = stats
	}
	return statsMap, nil
}

// UpsertSkillStatistics creates or updates skill statistics
func (r *UserRepository) UpsertSkillStatistics(stats *models.SkillStatistics) error {
	query := `
		INSERT INTO skill_statistics (user_id, skill_type, total_practices, completed_practices, average_score, best_score, 
		                               total_time_minutes, last_practice_date, last_practice_score, score_trend, weak_areas, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
		ON CONFLICT (user_id, skill_type) 
		DO UPDATE SET 
			total_practices = EXCLUDED.total_practices,
			completed_practices = EXCLUDED.completed_practices,
			average_score = EXCLUDED.average_score,
			best_score = CASE WHEN EXCLUDED.best_score > skill_statistics.best_score THEN EXCLUDED.best_score ELSE skill_statistics.best_score END,
			total_time_minutes = EXCLUDED.total_time_minutes,
			last_practice_date = EXCLUDED.last_practice_date,
			last_practice_score = EXCLUDED.last_practice_score,
			score_trend = EXCLUDED.score_trend,
			weak_areas = EXCLUDED.weak_areas,
			updated_at = NOW()
	`
	_, err := r.db.DB.Exec(query, stats.UserID, stats.SkillType, stats.TotalPractices, stats.CompletedPractices,
		stats.AverageScore, stats.BestScore, stats.TotalTimeMinutes, stats.LastPracticeDate,
		stats.LastPracticeScore, stats.ScoreTrend, stats.WeakAreas)
	if err != nil {
		return fmt.Errorf("failed to upsert skill statistics: %w", err)
	}
	return nil
}

// ============= Achievements =============

// GetAllAchievements retrieves all available achievements
func (r *UserRepository) GetAllAchievements() ([]models.Achievement, error) {
	query := `
		SELECT id, code, name, description, criteria_type, criteria_value, 
		       icon_url, badge_color, points, created_at
		FROM achievements
		ORDER BY points
	`
	rows, err := r.db.DB.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to get achievements: %w", err)
	}
	defer rows.Close()

	achievements := []models.Achievement{}
	for rows.Next() {
		achievement := models.Achievement{}
		err := rows.Scan(&achievement.ID, &achievement.Code, &achievement.Name, &achievement.Description,
			&achievement.CriteriaType, &achievement.CriteriaValue, &achievement.IconURL,
			&achievement.BadgeColor, &achievement.Points, &achievement.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan achievement: %w", err)
		}
		achievements = append(achievements, achievement)
	}
	return achievements, nil
}

// UnlockAchievement unlocks an achievement for a user
func (r *UserRepository) UnlockAchievement(userID uuid.UUID, achievementID uuid.UUID) error {
	query := `
		INSERT INTO user_achievements (id, user_id, achievement_id, earned_at)
		VALUES ($1, $2, $3, NOW())
		ON CONFLICT (user_id, achievement_id) DO NOTHING
	`
	id := uuid.New()
	_, err := r.db.DB.Exec(query, id, userID, achievementID)
	if err != nil {
		return fmt.Errorf("failed to unlock achievement: %w", err)
	}
	return nil
}

// CheckAchievementUnlocked checks if a user has unlocked a specific achievement
func (r *UserRepository) CheckAchievementUnlocked(userID uuid.UUID, achievementID uuid.UUID) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM user_achievements WHERE user_id = $1 AND achievement_id = $2)`
	var exists bool
	err := r.db.DB.QueryRow(query, userID, achievementID).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check achievement: %w", err)
	}
	return exists, nil
}

// ============= User Preferences =============

// GetPreferences retrieves user preferences
func (r *UserRepository) GetPreferences(userID uuid.UUID) (*models.UserPreferences, error) {
	query := `
		SELECT user_id, email_notifications, push_notifications, study_reminders, weekly_report, 
		       theme, font_size, auto_play_next_lesson, show_answer_explanation, playback_speed, 
		       profile_visibility, show_study_stats, updated_at
		FROM user_preferences
		WHERE user_id = $1
	`
	prefs := &models.UserPreferences{}
	err := r.db.DB.QueryRow(query, userID).Scan(
		&prefs.UserID, &prefs.EmailNotifications, &prefs.PushNotifications, &prefs.StudyReminders, &prefs.WeeklyReport,
		&prefs.Theme, &prefs.FontSize, &prefs.AutoPlayNextLesson, &prefs.ShowAnswerExplanation, &prefs.PlaybackSpeed,
		&prefs.ProfileVisibility, &prefs.ShowStudyStats, &prefs.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		// Create default preferences
		return r.CreateDefaultPreferences(userID)
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get preferences: %w", err)
	}
	return prefs, nil
}

// CreateDefaultPreferences creates default preferences for a new user
func (r *UserRepository) CreateDefaultPreferences(userID uuid.UUID) (*models.UserPreferences, error) {
	query := `
		INSERT INTO user_preferences (user_id, email_notifications, push_notifications, study_reminders, weekly_report, 
		                              theme, font_size, auto_play_next_lesson, show_answer_explanation, playback_speed, 
		                              profile_visibility, show_study_stats, updated_at)
		VALUES ($1, true, true, true, true, 'light', 'medium', true, true, 1.0, 'private', true, NOW())
		RETURNING user_id, email_notifications, push_notifications, study_reminders, weekly_report, 
		          theme, font_size, auto_play_next_lesson, show_answer_explanation, playback_speed, 
		          profile_visibility, show_study_stats, updated_at
	`
	prefs := &models.UserPreferences{}
	err := r.db.DB.QueryRow(query, userID).Scan(
		&prefs.UserID, &prefs.EmailNotifications, &prefs.PushNotifications, &prefs.StudyReminders, &prefs.WeeklyReport,
		&prefs.Theme, &prefs.FontSize, &prefs.AutoPlayNextLesson, &prefs.ShowAnswerExplanation, &prefs.PlaybackSpeed,
		&prefs.ProfileVisibility, &prefs.ShowStudyStats, &prefs.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create default preferences: %w", err)
	}
	return prefs, nil
}

// UpdatePreferences updates user preferences
func (r *UserRepository) UpdatePreferences(prefs *models.UserPreferences) error {
	query := `
		UPDATE user_preferences
		SET email_notifications = $1, push_notifications = $2, study_reminders = $3, weekly_report = $4, 
		    theme = $5, font_size = $6, auto_play_next_lesson = $7, show_answer_explanation = $8, playback_speed = $9, 
		    profile_visibility = $10, show_study_stats = $11, updated_at = NOW()
		WHERE user_id = $12
	`
	_, err := r.db.DB.Exec(query, prefs.EmailNotifications, prefs.PushNotifications, prefs.StudyReminders, prefs.WeeklyReport,
		prefs.Theme, prefs.FontSize, prefs.AutoPlayNextLesson, prefs.ShowAnswerExplanation, prefs.PlaybackSpeed,
		prefs.ProfileVisibility, prefs.ShowStudyStats, prefs.UserID)
	if err != nil {
		return fmt.Errorf("failed to update preferences: %w", err)
	}
	return nil
}

// ============= Study Reminders =============

// CreateReminder creates a new study reminder
func (r *UserRepository) CreateReminder(reminder *models.StudyReminder) error {
	query := `
		INSERT INTO study_reminders (id, user_id, title, message, reminder_type, reminder_time, 
		                             days_of_week, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
	`
	_, err := r.db.DB.Exec(query, reminder.ID, reminder.UserID, reminder.Title, reminder.Message,
		reminder.ReminderType, reminder.ReminderTime, reminder.DaysOfWeek, reminder.IsActive)
	if err != nil {
		return fmt.Errorf("failed to create reminder: %w", err)
	}
	return nil
}

// GetUserReminders retrieves all reminders for a user
func (r *UserRepository) GetUserReminders(userID uuid.UUID) ([]models.StudyReminder, error) {
	query := `
		SELECT id, user_id, title, message, reminder_type, reminder_time, days_of_week, 
		       is_active, last_sent_at, next_send_at, created_at, updated_at
		FROM study_reminders
		WHERE user_id = $1
		ORDER BY reminder_time
	`
	rows, err := r.db.DB.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get reminders: %w", err)
	}
	defer rows.Close()

	reminders := []models.StudyReminder{}
	for rows.Next() {
		reminder := models.StudyReminder{}
		err := rows.Scan(&reminder.ID, &reminder.UserID, &reminder.Title, &reminder.Message,
			&reminder.ReminderType, &reminder.ReminderTime, &reminder.DaysOfWeek, &reminder.IsActive,
			&reminder.LastSentAt, &reminder.NextSendAt, &reminder.CreatedAt, &reminder.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan reminder: %w", err)
		}
		reminders = append(reminders, reminder)
	}
	return reminders, nil
}

// GetReminderByID retrieves a specific reminder
func (r *UserRepository) GetReminderByID(reminderID uuid.UUID, userID uuid.UUID) (*models.StudyReminder, error) {
	query := `
		SELECT id, user_id, title, message, reminder_type, reminder_time, days_of_week, 
		       is_active, last_sent_at, next_send_at, created_at, updated_at
		FROM study_reminders
		WHERE id = $1 AND user_id = $2
	`
	reminder := &models.StudyReminder{}
	err := r.db.DB.QueryRow(query, reminderID, userID).Scan(
		&reminder.ID, &reminder.UserID, &reminder.Title, &reminder.Message, &reminder.ReminderType,
		&reminder.ReminderTime, &reminder.DaysOfWeek, &reminder.IsActive, &reminder.LastSentAt,
		&reminder.NextSendAt, &reminder.CreatedAt, &reminder.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("reminder not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get reminder: %w", err)
	}
	return reminder, nil
}

// UpdateReminder updates a study reminder
func (r *UserRepository) UpdateReminder(reminder *models.StudyReminder) error {
	query := `
		UPDATE study_reminders
		SET title = $1, message = $2, reminder_time = $3, days_of_week = $4, 
		    is_active = $5, updated_at = NOW()
		WHERE id = $6 AND user_id = $7
	`
	_, err := r.db.DB.Exec(query, reminder.Title, reminder.Message, reminder.ReminderTime,
		reminder.DaysOfWeek, reminder.IsActive, reminder.ID, reminder.UserID)
	if err != nil {
		return fmt.Errorf("failed to update reminder: %w", err)
	}
	return nil
}

// DeleteReminder deletes a study reminder
func (r *UserRepository) DeleteReminder(reminderID uuid.UUID, userID uuid.UUID) error {
	query := `DELETE FROM study_reminders WHERE id = $1 AND user_id = $2`
	_, err := r.db.DB.Exec(query, reminderID, userID)
	if err != nil {
		return fmt.Errorf("failed to delete reminder: %w", err)
	}
	return nil
}

// ToggleReminder toggles the active status of a reminder
func (r *UserRepository) ToggleReminder(reminderID uuid.UUID, userID uuid.UUID, isActive bool) error {
	query := `UPDATE study_reminders SET is_active = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3`
	_, err := r.db.DB.Exec(query, isActive, reminderID, userID)
	if err != nil {
		return fmt.Errorf("failed to toggle reminder: %w", err)
	}
	return nil
}

// ============= Leaderboard =============

// GetTopLearners retrieves top learners by achievements count and study hours
func (r *UserRepository) GetTopLearners(limit int) ([]models.LeaderboardEntry, error) {
	query := `
		SELECT 
			ROW_NUMBER() OVER (ORDER BY (SELECT COUNT(*) FROM user_achievements ua WHERE ua.user_id = up.user_id) DESC, lp.total_study_hours DESC) as rank,
			up.user_id, up.full_name, up.avatar_url, 
			(SELECT COUNT(*) FROM user_achievements ua WHERE ua.user_id = up.user_id) * 10 as total_points,
			lp.current_streak_days, lp.total_study_hours,
			(SELECT COUNT(*) FROM user_achievements ua WHERE ua.user_id = up.user_id) as achievements_count
		FROM user_profiles up
		JOIN learning_progress lp ON up.user_id = lp.user_id
		ORDER BY achievements_count DESC, lp.total_study_hours DESC
		LIMIT $1
	`
	rows, err := r.db.DB.Query(query, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get top learners: %w", err)
	}
	defer rows.Close()

	entries := []models.LeaderboardEntry{}
	for rows.Next() {
		entry := models.LeaderboardEntry{}
		err := rows.Scan(&entry.Rank, &entry.UserID, &entry.FullName, &entry.AvatarURL,
			&entry.TotalPoints, &entry.CurrentStreakDays, &entry.TotalStudyHours, &entry.AchievementsCount)
		if err != nil {
			return nil, fmt.Errorf("failed to scan leaderboard entry: %w", err)
		}
		entries = append(entries, entry)
	}
	return entries, nil
}

// GetUserRank retrieves the rank of a specific user
func (r *UserRepository) GetUserRank(userID uuid.UUID) (*models.LeaderboardEntry, error) {
	query := `
		WITH ranked_users AS (
			SELECT 
				ROW_NUMBER() OVER (ORDER BY (SELECT COUNT(*) FROM user_achievements ua WHERE ua.user_id = up.user_id) DESC, lp.total_study_hours DESC) as rank,
				up.user_id, up.full_name, up.avatar_url, 
				(SELECT COUNT(*) FROM user_achievements ua WHERE ua.user_id = up.user_id) * 10 as total_points,
				lp.current_streak_days, lp.total_study_hours,
				(SELECT COUNT(*) FROM user_achievements ua WHERE ua.user_id = up.user_id) as achievements_count
			FROM user_profiles up
			JOIN learning_progress lp ON up.user_id = lp.user_id
		)
		SELECT rank, user_id, full_name, avatar_url, total_points, current_streak_days, 
		       total_study_hours, achievements_count
		FROM ranked_users
		WHERE user_id = $1
	`
	entry := &models.LeaderboardEntry{}
	err := r.db.DB.QueryRow(query, userID).Scan(&entry.Rank, &entry.UserID, &entry.FullName,
		&entry.AvatarURL, &entry.TotalPoints, &entry.CurrentStreakDays, &entry.TotalStudyHours,
		&entry.AchievementsCount)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user rank not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get user rank: %w", err)
	}
	return entry, nil
}
