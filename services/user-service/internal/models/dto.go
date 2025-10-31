package models

import (
	"time"

	"github.com/google/uuid"
)

// UpdateProfileRequest represents profile update request
type UpdateProfileRequest struct {
	FullName            *string    `json:"full_name,omitempty"`
	FirstName           *string    `json:"first_name,omitempty"`
	LastName            *string    `json:"last_name,omitempty"`
	DateOfBirth         *time.Time `json:"date_of_birth,omitempty"`
	Gender              *string    `json:"gender,omitempty"`
	Phone               *string    `json:"phone,omitempty"`
	Address             *string    `json:"address,omitempty"`
	City                *string    `json:"city,omitempty"`
	Country             *string    `json:"country,omitempty"`
	Timezone            *string    `json:"timezone,omitempty"`
	CurrentLevel        *string    `json:"current_level,omitempty"`
	TargetBandScore     *float64   `json:"target_band_score,omitempty"`
	TargetExamDate      *time.Time `json:"target_exam_date,omitempty"`
	Bio                 *string    `json:"bio,omitempty"`
	LearningPreferences *string    `json:"learning_preferences,omitempty"`
	LanguagePreference  *string    `json:"language_preference,omitempty"`
}

// StudySessionRequest represents creating a study session
type StudySessionRequest struct {
	SessionType  string  `json:"session_type" binding:"required"` // lesson, exercise, practice_test
	SkillType    *string `json:"skill_type,omitempty"`            // listening, reading, writing, speaking
	ResourceID   *string `json:"resource_id,omitempty"`
	ResourceType *string `json:"resource_type,omitempty"`
	DeviceType   *string `json:"device_type,omitempty"`
}

// EndSessionRequest represents ending a study session
type EndSessionRequest struct {
	CompletionPercentage *float64 `json:"completion_percentage,omitempty"`
	Score                *float64 `json:"score,omitempty"`
}

// ProgressStatsResponse represents progress statistics
type ProgressStatsResponse struct {
	Profile        *UserProfile      `json:"profile"`
	Progress       *LearningProgress `json:"progress"`
	RecentSessions []StudySession    `json:"recent_sessions"`
	Achievements   []UserAchievement `json:"achievements"`
	TotalPoints    int               `json:"total_points"`
	Rank           int               `json:"rank,omitempty"`
}

// LeaderboardEntry represents a leaderboard entry
type LeaderboardEntry struct {
	Rank              int       `json:"rank"`
	UserID            uuid.UUID `json:"user_id"`
	FullName          string    `json:"full_name"`
	AvatarURL         *string   `json:"avatar_url,omitempty"`
	TotalPoints       int       `json:"total_points"`
	CurrentStreakDays int       `json:"current_streak_days"`
	TotalStudyHours   float64   `json:"total_study_hours"`
	AchievementsCount int       `json:"achievements_count"`
}

// Response represents standard API response
type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   *ErrorInfo  `json:"error,omitempty"`
}

// ErrorInfo represents error details
type ErrorInfo struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Details string `json:"details,omitempty"`
}

// ============= Study Goals DTOs =============

// CreateGoalRequest represents request to create a study goal
type CreateGoalRequest struct {
	GoalType    string  `json:"goal_type" binding:"required,oneof=daily weekly monthly custom"`
	Title       string  `json:"title" binding:"required,min=1,max=200"`
	Description *string `json:"description,omitempty"`
	TargetValue int     `json:"target_value" binding:"required,min=1"`
	TargetUnit  string  `json:"target_unit" binding:"required"` // minutes, lessons, exercises
	SkillType   *string `json:"skill_type,omitempty"`
	EndDate     string  `json:"end_date" binding:"required"` // YYYY-MM-DD
}

// UpdateGoalRequest represents request to update a study goal
type UpdateGoalRequest struct {
	Title        *string `json:"title,omitempty" binding:"omitempty,min=1,max=200"`
	Description  *string `json:"description,omitempty"`
	TargetValue  *int    `json:"target_value,omitempty" binding:"omitempty,min=1"`
	CurrentValue *int    `json:"current_value,omitempty" binding:"omitempty,min=0"`
	EndDate      *string `json:"end_date,omitempty"` // YYYY-MM-DD
	Status       *string `json:"status,omitempty" binding:"omitempty,oneof=active completed cancelled expired"`
}

// ============= User Preferences DTOs =============

// UpdatePreferencesRequest represents request to update user preferences
type UpdatePreferencesRequest struct {
	EmailNotifications    *bool    `json:"email_notifications,omitempty"`
	PushNotifications     *bool    `json:"push_notifications,omitempty"`
	StudyReminders        *bool    `json:"study_reminders,omitempty"`
	WeeklyReport          *bool    `json:"weekly_report,omitempty"`
	Theme                 *string  `json:"theme,omitempty" binding:"omitempty,oneof=light dark auto"`
	FontSize              *string  `json:"font_size,omitempty" binding:"omitempty,oneof=small medium large"`
	AutoPlayNextLesson    *bool    `json:"auto_play_next_lesson,omitempty"`
	ShowAnswerExplanation *bool    `json:"show_answer_explanation,omitempty"`
	PlaybackSpeed         *float64 `json:"playback_speed,omitempty"`
	ProfileVisibility     *string  `json:"profile_visibility,omitempty" binding:"omitempty,oneof=public friends private"`
	ShowStudyStats        *bool    `json:"show_study_stats,omitempty"`
}

// ============= Study Reminders DTOs =============

// CreateReminderRequest represents request to create a study reminder
type CreateReminderRequest struct {
	Title        string  `json:"title" binding:"required,min=1,max=200"`
	Message      *string `json:"message,omitempty" binding:"omitempty,max=500"`
	ReminderType string  `json:"reminder_type" binding:"required,oneof=daily weekly custom"`
	ReminderTime string  `json:"reminder_time" binding:"required"` // "09:00:00" format
	DaysOfWeek   *string `json:"days_of_week,omitempty"`           // JSON array string like "[1,2,3,4,5]"
}

// UpdateReminderRequest represents request to update a study reminder
type UpdateReminderRequest struct {
	Title        *string `json:"title,omitempty" binding:"omitempty,min=1,max=200"`
	Message      *string `json:"message,omitempty" binding:"omitempty,max=500"`
	ReminderTime *string `json:"reminder_time,omitempty"` // "09:00:00" format
	DaysOfWeek   *string `json:"days_of_week,omitempty"`
	IsActive     *bool   `json:"is_active,omitempty"`
}

// ============= Response DTOs =============

// GoalResponse represents enriched study goal response
type GoalResponse struct {
	*StudyGoal
	CompletionPercentage float64 `json:"completion_percentage"`
	DaysRemaining        *int    `json:"days_remaining,omitempty"`
	StatusMessage        string  `json:"status_message"`
}

// StatisticsResponse represents overall statistics response
type StatisticsResponse struct {
	TotalPractices     int                         `json:"total_practices"`
	CompletedPractices int                         `json:"completed_practices"`
	AverageAccuracy    float64                     `json:"average_accuracy"`
	TotalTimeMinutes   int                         `json:"total_time_minutes"`
	SkillBreakdown     map[string]*SkillStatistics `json:"skill_breakdown"`
	WeakSkills         []string                    `json:"weak_skills"`
	StrongSkills       []string                    `json:"strong_skills"`
}
