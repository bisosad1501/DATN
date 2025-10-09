package models

import "time"

// UpdateProfileRequest represents profile update request
type UpdateProfileRequest struct {
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
	UserID      string  `json:"user_id"`
	FullName    string  `json:"full_name"`
	AvatarURL   *string `json:"avatar_url,omitempty"`
	TotalPoints int     `json:"total_points"`
	TotalHours  float64 `json:"total_hours"`
	Streak      int     `json:"streak"`
	Rank        int     `json:"rank"`
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
