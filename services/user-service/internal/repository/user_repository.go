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
