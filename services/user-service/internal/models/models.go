package models

import (
	"time"

	"github.com/google/uuid"
)

// UserProfile represents user profile information
type UserProfile struct {
	UserID              uuid.UUID  `json:"user_id" db:"user_id"`
	FirstName           *string    `json:"first_name,omitempty" db:"first_name"`
	LastName            *string    `json:"last_name,omitempty" db:"last_name"`
	FullName            *string    `json:"full_name,omitempty" db:"full_name"`
	DateOfBirth         *time.Time `json:"date_of_birth,omitempty" db:"date_of_birth"`
	Gender              *string    `json:"gender,omitempty" db:"gender"`
	Phone               *string    `json:"phone,omitempty" db:"phone"`
	Address             *string    `json:"address,omitempty" db:"address"`
	City                *string    `json:"city,omitempty" db:"city"`
	Country             *string    `json:"country,omitempty" db:"country"`
	Timezone            string     `json:"timezone" db:"timezone"`
	AvatarURL           *string    `json:"avatar_url,omitempty" db:"avatar_url"`
	CoverImageURL       *string    `json:"cover_image_url,omitempty" db:"cover_image_url"`
	CurrentLevel        *string    `json:"current_level,omitempty" db:"current_level"`
	TargetBandScore     *float64   `json:"target_band_score,omitempty" db:"target_band_score"`
	TargetExamDate      *time.Time `json:"target_exam_date,omitempty" db:"target_exam_date"`
	Bio                 *string    `json:"bio,omitempty" db:"bio"`
	LearningPreferences *string    `json:"learning_preferences,omitempty" db:"learning_preferences"` // JSONB as string
	LanguagePreference  string     `json:"language_preference" db:"language_preference"`
	CreatedAt           time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt           time.Time  `json:"updated_at" db:"updated_at"`
}

// LearningProgress represents overall learning progress
type LearningProgress struct {
	ID                      int64      `json:"id" db:"id"`
	UserID                  uuid.UUID  `json:"user_id" db:"user_id"`
	// total_study_hours REMOVED - Migration 013
	// SOURCE OF TRUTH: Calculate real-time from study_sessions
	TotalStudyHours         float64    `json:"total_study_hours"` // Computed field (not in DB)
	TotalLessonsCompleted   int        `json:"total_lessons_completed" db:"total_lessons_completed"`
	TotalExercisesCompleted int        `json:"total_exercises_completed" db:"total_exercises_completed"`
	ListeningProgress       float64    `json:"listening_progress" db:"listening_progress"`
	ReadingProgress         float64    `json:"reading_progress" db:"reading_progress"`
	WritingProgress         float64    `json:"writing_progress" db:"writing_progress"`
	SpeakingProgress        float64    `json:"speaking_progress" db:"speaking_progress"`
	ListeningScore          *float64   `json:"listening_score,omitempty" db:"listening_score"`
	ReadingScore            *float64   `json:"reading_score,omitempty" db:"reading_score"`
	WritingScore            *float64   `json:"writing_score,omitempty" db:"writing_score"`
	SpeakingScore           *float64   `json:"speaking_score,omitempty" db:"speaking_score"`
	OverallScore            *float64   `json:"overall_score,omitempty" db:"overall_score"`
	CurrentStreakDays       int        `json:"current_streak_days" db:"current_streak_days"`
	LongestStreakDays       int        `json:"longest_streak_days" db:"longest_streak_days"`
	LastStudyDate           *time.Time `json:"last_study_date,omitempty" db:"last_study_date"`
	CreatedAt               time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt               time.Time  `json:"updated_at" db:"updated_at"`
}

// StudySession represents a study session
type StudySession struct {
	ID                   uuid.UUID  `json:"id" db:"id"`
	UserID               uuid.UUID  `json:"user_id" db:"user_id"`
	SessionType          string     `json:"session_type" db:"session_type"`
	SkillType            *string    `json:"skill_type,omitempty" db:"skill_type"`
	ResourceID           *uuid.UUID `json:"resource_id,omitempty" db:"resource_id"`
	ResourceType         *string    `json:"resource_type,omitempty" db:"resource_type"`
	StartedAt            time.Time  `json:"started_at" db:"started_at"`
	EndedAt              *time.Time `json:"ended_at,omitempty" db:"ended_at"`
	DurationMinutes      *int       `json:"duration_minutes,omitempty" db:"duration_minutes"`
	IsCompleted          bool       `json:"is_completed" db:"is_completed"`
	CompletionPercentage *float64   `json:"completion_percentage,omitempty" db:"completion_percentage"`
	Score                *float64   `json:"score,omitempty" db:"score"`
	DeviceType           *string    `json:"device_type,omitempty" db:"device_type"`
	CreatedAt            time.Time  `json:"created_at" db:"created_at"`
}

// Achievement represents an achievement/badge
type Achievement struct {
	ID            int       `json:"id" db:"id"`
	Code          string    `json:"code" db:"code"`
	Name          string    `json:"name" db:"name"`
	Description   *string   `json:"description,omitempty" db:"description"`
	CriteriaType  string    `json:"criteria_type" db:"criteria_type"`
	CriteriaValue int       `json:"criteria_value" db:"criteria_value"`
	IconURL       *string   `json:"icon_url,omitempty" db:"icon_url"`
	BadgeColor    *string   `json:"badge_color,omitempty" db:"badge_color"`
	Points        int       `json:"points" db:"points"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
}

// UserAchievement represents a user's earned achievement
type UserAchievement struct {
	ID            int64     `json:"id" db:"id"`
	UserID        uuid.UUID `json:"user_id" db:"user_id"`
	AchievementID int       `json:"achievement_id" db:"achievement_id"`
	EarnedAt      time.Time `json:"earned_at" db:"earned_at"`
}

// UserProfileWithProgress combines profile and progress
type UserProfileWithProgress struct {
	Profile  *UserProfile      `json:"profile"`
	Progress *LearningProgress `json:"progress"`
}

// SkillStatistics represents detailed statistics for each skill (DB schema matched)
type SkillStatistics struct {
	ID                 int64      `json:"id" db:"id"`
	UserID             uuid.UUID  `json:"user_id" db:"user_id"`
	SkillType          string     `json:"skill_type" db:"skill_type"` // listening, reading, writing, speaking
	TotalPractices     int        `json:"total_practices" db:"total_practices"`
	CompletedPractices int        `json:"completed_practices" db:"completed_practices"`
	AverageScore       float64    `json:"average_score" db:"average_score"`
	BestScore          float64    `json:"best_score" db:"best_score"`
	TotalTimeMinutes   int        `json:"total_time_minutes" db:"total_time_minutes"`
	LastPracticeDate   *time.Time `json:"last_practice_date,omitempty" db:"last_practice_date"`
	LastPracticeScore  *float64   `json:"last_practice_score,omitempty" db:"last_practice_score"`
	ScoreTrend         *string    `json:"score_trend,omitempty" db:"score_trend"` // JSONB as string
	WeakAreas          *string    `json:"weak_areas,omitempty" db:"weak_areas"`   // JSONB as string
	CreatedAt          time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at" db:"updated_at"`
}

// StudyGoal represents a user's study goal (DB schema matched)
type StudyGoal struct {
	ID              uuid.UUID  `json:"id" db:"id"`
	UserID          uuid.UUID  `json:"user_id" db:"user_id"`
	GoalType        string     `json:"goal_type" db:"goal_type"` // daily, weekly, monthly, custom
	Title           string     `json:"title" db:"title"`
	Description     *string    `json:"description,omitempty" db:"description"`
	TargetValue     int        `json:"target_value" db:"target_value"`
	TargetUnit      string     `json:"target_unit" db:"target_unit"` // minutes, lessons, exercises
	CurrentValue    int        `json:"current_value" db:"current_value"`
	SkillType       *string    `json:"skill_type,omitempty" db:"skill_type"`
	StartDate       time.Time  `json:"start_date" db:"start_date"`
	EndDate         time.Time  `json:"end_date" db:"end_date"`
	Status          string     `json:"status" db:"status"` // active, completed, cancelled, expired
	CompletedAt     *time.Time `json:"completed_at,omitempty" db:"completed_at"`
	ReminderEnabled bool       `json:"reminder_enabled" db:"reminder_enabled"`
	ReminderTime    *string    `json:"reminder_time,omitempty" db:"reminder_time"` // TIME as string
	CreatedAt       time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at" db:"updated_at"`
}

// UserPreferences represents user application preferences (DB schema matched)
type UserPreferences struct {
	UserID                uuid.UUID `json:"user_id" db:"user_id"`
	EmailNotifications    bool      `json:"email_notifications" db:"email_notifications"`
	PushNotifications     bool      `json:"push_notifications" db:"push_notifications"`
	StudyReminders        bool      `json:"study_reminders" db:"study_reminders"`
	WeeklyReport          bool      `json:"weekly_report" db:"weekly_report"`
	Theme                 string    `json:"theme" db:"theme"`         // light, dark, auto
	FontSize              string    `json:"font_size" db:"font_size"` // small, medium, large
	AutoPlayNextLesson    bool      `json:"auto_play_next_lesson" db:"auto_play_next_lesson"`
	ShowAnswerExplanation bool      `json:"show_answer_explanation" db:"show_answer_explanation"`
	PlaybackSpeed         float64   `json:"playback_speed" db:"playback_speed"`         // 0.75, 1.0, 1.25, 1.5, 2.0
	ProfileVisibility     string    `json:"profile_visibility" db:"profile_visibility"` // public, friends, private
	ShowStudyStats        bool      `json:"show_study_stats" db:"show_study_stats"`
	UpdatedAt             time.Time `json:"updated_at" db:"updated_at"`
}

// StudyReminder represents a study reminder (DB schema matched)
type StudyReminder struct {
	ID           uuid.UUID  `json:"id" db:"id"`
	UserID       uuid.UUID  `json:"user_id" db:"user_id"`
	Title        string     `json:"title" db:"title"`
	Message      *string    `json:"message,omitempty" db:"message"`
	ReminderType string     `json:"reminder_type" db:"reminder_type"`         // daily, weekly, custom
	ReminderTime string     `json:"reminder_time" db:"reminder_time"`         // TIME format "09:00:00"
	DaysOfWeek   *string    `json:"days_of_week,omitempty" db:"days_of_week"` // INT[] as string (PostgreSQL array)
	IsActive     bool       `json:"is_active" db:"is_active"`
	LastSentAt   *time.Time `json:"last_sent_at,omitempty" db:"last_sent_at"`
	NextSendAt   *time.Time `json:"next_send_at,omitempty" db:"next_send_at"`
	CreatedAt    time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at" db:"updated_at"`
}

// AchievementWithProgress combines achievement with user progress
type AchievementWithProgress struct {
	Achievement        *Achievement `json:"achievement"`
	IsEarned           bool         `json:"is_earned"`
	EarnedAt           *time.Time   `json:"earned_at,omitempty"`
	Progress           int          `json:"progress"`
	ProgressPercentage float64      `json:"progress_percentage"`
}

// ProgressInsight represents AI-generated progress insights
type ProgressInsight struct {
	Type        string    `json:"type"` // strength, weakness, recommendation, prediction
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Score       *float64  `json:"score,omitempty"`
	Confidence  float64   `json:"confidence"`
	CreatedAt   time.Time `json:"created_at"`
}
