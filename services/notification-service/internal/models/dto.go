package models

import (
	"github.com/google/uuid"
)

// CreateNotificationRequest represents request to create notification
type CreateNotificationRequest struct {
	UserID       uuid.UUID              `json:"user_id" binding:"required"`
	Type         string                 `json:"type" binding:"required,oneof=achievement reminder course_update exercise_graded system"`
	Category     string                 `json:"category" binding:"required,oneof=info success warning alert"`
	Title        string                 `json:"title" binding:"required,max=200"`
	Message      string                 `json:"message" binding:"required,max=1000"`
	ActionType   *string                `json:"action_type,omitempty"`
	ActionData   map[string]interface{} `json:"action_data,omitempty"`
	IconURL      *string                `json:"icon_url,omitempty"`
	ImageURL     *string                `json:"image_url,omitempty"`
	ScheduledFor *string                `json:"scheduled_for,omitempty"` // ISO8601 timestamp
	ExpiresAt    *string                `json:"expires_at,omitempty"`    // ISO8601 timestamp
}

// NotificationResponse represents notification response
type NotificationResponse struct {
	ID         uuid.UUID              `json:"id"`
	Type       string                 `json:"type"`
	Category   string                 `json:"category"`
	Title      string                 `json:"title"`
	Message    string                 `json:"message"`
	ActionType *string                `json:"action_type,omitempty"`
	ActionData map[string]interface{} `json:"action_data,omitempty"`
	IconURL    *string                `json:"icon_url,omitempty"`
	ImageURL   *string                `json:"image_url,omitempty"`
	IsRead     bool                   `json:"is_read"`
	ReadAt     *string                `json:"read_at,omitempty"` // ISO8601
	CreatedAt  string                 `json:"created_at"`        // ISO8601
}

// NotificationListResponse represents paginated notifications
type NotificationListResponse struct {
	Notifications []NotificationResponse `json:"notifications"`
	Pagination    PaginationResponse     `json:"pagination"`
}

// PaginationResponse represents pagination info
type PaginationResponse struct {
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	TotalItems int `json:"total_items"`
	TotalPages int `json:"total_pages"`
}

// UnreadCountResponse represents unread count
type UnreadCountResponse struct {
	UnreadCount int `json:"unread_count"`
}

// RegisterDeviceRequest represents device registration request
type RegisterDeviceRequest struct {
	DeviceToken string  `json:"device_token" binding:"required,max=500"`
	DeviceType  string  `json:"device_type" binding:"required,oneof=android ios"`
	DeviceID    *string `json:"device_id,omitempty"`
	DeviceName  *string `json:"device_name,omitempty"`
	AppVersion  *string `json:"app_version,omitempty"`
	OSVersion   *string `json:"os_version,omitempty"`
}

// DeviceTokenResponse represents device token response
type DeviceTokenResponse struct {
	ID          uuid.UUID `json:"id"`
	DeviceToken string    `json:"device_token"`
	DeviceType  string    `json:"device_type"`
	DeviceName  *string   `json:"device_name,omitempty"`
	IsActive    bool      `json:"is_active"`
	LastUsedAt  string    `json:"last_used_at"` // ISO8601
}

// UpdatePreferencesRequest represents preferences update request
type UpdatePreferencesRequest struct {
	PushEnabled            *bool   `json:"push_enabled,omitempty"`
	PushAchievements       *bool   `json:"push_achievements,omitempty"`
	PushReminders          *bool   `json:"push_reminders,omitempty"`
	PushCourseUpdates      *bool   `json:"push_course_updates,omitempty"`
	PushExerciseGraded     *bool   `json:"push_exercise_graded,omitempty"`
	EmailEnabled           *bool   `json:"email_enabled,omitempty"`
	EmailWeeklyReport      *bool   `json:"email_weekly_report,omitempty"`
	EmailCourseUpdates     *bool   `json:"email_course_updates,omitempty"`
	EmailMarketing         *bool   `json:"email_marketing,omitempty"`
	InAppEnabled           *bool   `json:"in_app_enabled,omitempty"`
	QuietHoursEnabled      *bool   `json:"quiet_hours_enabled,omitempty"`
	QuietHoursStart        *string `json:"quiet_hours_start,omitempty"` // "22:00:00"
	QuietHoursEnd          *string `json:"quiet_hours_end,omitempty"`   // "08:00:00"
	MaxNotificationsPerDay *int    `json:"max_notifications_per_day,omitempty"`
}

// PreferencesResponse represents preferences response
type PreferencesResponse struct {
	PushEnabled            bool    `json:"push_enabled"`
	PushAchievements       bool    `json:"push_achievements"`
	PushReminders          bool    `json:"push_reminders"`
	PushCourseUpdates      bool    `json:"push_course_updates"`
	PushExerciseGraded     bool    `json:"push_exercise_graded"`
	EmailEnabled           bool    `json:"email_enabled"`
	EmailWeeklyReport      bool    `json:"email_weekly_report"`
	EmailCourseUpdates     bool    `json:"email_course_updates"`
	EmailMarketing         bool    `json:"email_marketing"`
	InAppEnabled           bool    `json:"in_app_enabled"`
	QuietHoursEnabled      bool    `json:"quiet_hours_enabled"`
	QuietHoursStart        *string `json:"quiet_hours_start,omitempty"`
	QuietHoursEnd          *string `json:"quiet_hours_end,omitempty"`
	MaxNotificationsPerDay int     `json:"max_notifications_per_day"`
	UpdatedAt              string  `json:"updated_at"` // ISO8601
}

// SendBulkNotificationRequest represents bulk send request
type SendBulkNotificationRequest struct {
	UserIDs    []uuid.UUID            `json:"user_ids" binding:"required,min=1"`
	Type       string                 `json:"type" binding:"required,oneof=achievement reminder course_update exercise_graded system"`
	Category   string                 `json:"category" binding:"required,oneof=info success warning alert"`
	Title      string                 `json:"title" binding:"required,max=200"`
	Message    string                 `json:"message" binding:"required,max=1000"`
	ActionType *string                `json:"action_type,omitempty"`
	ActionData map[string]interface{} `json:"action_data,omitempty"`
	IconURL    *string                `json:"icon_url,omitempty"`
	ImageURL   *string                `json:"image_url,omitempty"`
}

// BulkNotificationResponse represents bulk send response
type BulkNotificationResponse struct {
	TotalUsers   int    `json:"total_users"`
	SuccessCount int    `json:"success_count"`
	FailedCount  int    `json:"failed_count"`
	Message      string `json:"message"`
}

// ErrorResponse represents API error response
type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
	Code    string `json:"code,omitempty"`
}

// SuccessResponse represents generic success response
type SuccessResponse struct {
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}
