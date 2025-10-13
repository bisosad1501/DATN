package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

// Notification represents an in-app notification
type Notification struct {
	ID           uuid.UUID  `json:"id"`
	UserID       uuid.UUID  `json:"user_id"`
	Type         string     `json:"type"`     // achievement, reminder, course_update, exercise_graded, system
	Category     string     `json:"category"` // info, success, warning, alert
	Title        string     `json:"title"`
	Message      string     `json:"message"`
	ActionType   *string    `json:"action_type,omitempty"` // navigate_to_course, navigate_to_exercise, external_link
	ActionData   *string    `json:"action_data,omitempty"` // JSON string
	IconURL      *string    `json:"icon_url,omitempty"`
	ImageURL     *string    `json:"image_url,omitempty"`
	IsRead       bool       `json:"is_read"`
	ReadAt       *time.Time `json:"read_at,omitempty"`
	IsSent       bool       `json:"is_sent"`
	SentAt       *time.Time `json:"sent_at,omitempty"`
	ScheduledFor *time.Time `json:"scheduled_for,omitempty"`
	ExpiresAt    *time.Time `json:"expires_at,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

// DeviceToken represents a user's device for push notifications
type DeviceToken struct {
	ID          uuid.UUID `json:"id"`
	UserID      uuid.UUID `json:"user_id"`
	DeviceToken string    `json:"device_token"`
	DeviceType  string    `json:"device_type"` // android, ios
	DeviceID    *string   `json:"device_id,omitempty"`
	DeviceName  *string   `json:"device_name,omitempty"`
	AppVersion  *string   `json:"app_version,omitempty"`
	OSVersion   *string   `json:"os_version,omitempty"`
	IsActive    bool      `json:"is_active"`
	LastUsedAt  time.Time `json:"last_used_at"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// NotificationPreferences represents user notification settings
type NotificationPreferences struct {
	UserID                 uuid.UUID `json:"user_id"`
	PushEnabled            bool      `json:"push_enabled"`
	PushAchievements       bool      `json:"push_achievements"`
	PushReminders          bool      `json:"push_reminders"`
	PushCourseUpdates      bool      `json:"push_course_updates"`
	PushExerciseGraded     bool      `json:"push_exercise_graded"`
	EmailEnabled           bool      `json:"email_enabled"`
	EmailWeeklyReport      bool      `json:"email_weekly_report"`
	EmailCourseUpdates     bool      `json:"email_course_updates"`
	EmailMarketing         bool      `json:"email_marketing"`
	InAppEnabled           bool      `json:"in_app_enabled"`
	QuietHoursEnabled      bool      `json:"quiet_hours_enabled"`
	QuietHoursStart        *string   `json:"quiet_hours_start,omitempty"` // TIME string "22:00:00"
	QuietHoursEnd          *string   `json:"quiet_hours_end,omitempty"`   // TIME string "08:00:00"
	MaxNotificationsPerDay int       `json:"max_notifications_per_day"`
	Timezone               string    `json:"timezone"`                 // User timezone (e.g., "Asia/Ho_Chi_Minh", "America/New_York")
	UpdatedAt              time.Time `json:"updated_at"`
}

// PushNotification represents a push notification to mobile device
type PushNotification struct {
	ID             uuid.UUID  `json:"id"`
	NotificationID *uuid.UUID `json:"notification_id,omitempty"`
	UserID         uuid.UUID  `json:"user_id"`
	DeviceToken    string     `json:"device_token"`
	DeviceType     string     `json:"device_type"` // android, ios
	DeviceID       *string    `json:"device_id,omitempty"`
	Title          string     `json:"title"`
	Body           string     `json:"body"`
	Data           *string    `json:"data,omitempty"` // JSON string
	Status         string     `json:"status"`         // pending, sent, delivered, failed
	SentAt         *time.Time `json:"sent_at,omitempty"`
	DeliveredAt    *time.Time `json:"delivered_at,omitempty"`
	ClickedAt      *time.Time `json:"clicked_at,omitempty"`
	ErrorMessage   *string    `json:"error_message,omitempty"`
	RetryCount     int        `json:"retry_count"`
	CreatedAt      time.Time  `json:"created_at"`
}

// EmailNotification represents an email notification
type EmailNotification struct {
	ID             uuid.UUID  `json:"id"`
	NotificationID *uuid.UUID `json:"notification_id,omitempty"`
	UserID         uuid.UUID  `json:"user_id"`
	ToEmail        string     `json:"to_email"`
	Subject        string     `json:"subject"`
	BodyHTML       string     `json:"body_html"`
	BodyText       *string    `json:"body_text,omitempty"`
	TemplateName   *string    `json:"template_name,omitempty"`
	TemplateData   *string    `json:"template_data,omitempty"` // JSON string
	Status         string     `json:"status"`                  // pending, sent, delivered, bounced, failed
	SentAt         *time.Time `json:"sent_at,omitempty"`
	DeliveredAt    *time.Time `json:"delivered_at,omitempty"`
	OpenedAt       *time.Time `json:"opened_at,omitempty"`
	ClickedAt      *time.Time `json:"clicked_at,omitempty"`
	ExternalID     *string    `json:"external_id,omitempty"`
	ErrorMessage   *string    `json:"error_message,omitempty"`
	RetryCount     int        `json:"retry_count"`
	CreatedAt      time.Time  `json:"created_at"`
}

// NotificationTemplate represents a reusable notification template
type NotificationTemplate struct {
	ID                int            `json:"id"`
	TemplateCode      string         `json:"template_code"`
	Name              string         `json:"name"`
	Description       *string        `json:"description,omitempty"`
	NotificationType  string         `json:"notification_type"` // push, email, in_app
	Category          string         `json:"category"`
	TitleTemplate     *string        `json:"title_template,omitempty"`
	BodyTemplate      string         `json:"body_template"`
	SubjectTemplate   *string        `json:"subject_template,omitempty"`
	HTMLTemplate      *string        `json:"html_template,omitempty"`
	RequiredVariables pq.StringArray `json:"required_variables"` // PostgreSQL text[]
	IsActive          bool           `json:"is_active"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
}

// IntArray is a custom type for PostgreSQL INT[] arrays
type IntArray []int

// ScheduledNotification represents a recurring notification
type ScheduledNotification struct {
	ID            uuid.UUID  `json:"id"`
	UserID        uuid.UUID  `json:"user_id"`
	Title         string     `json:"title"`
	Message       string     `json:"message"`
	ScheduleType  string     `json:"schedule_type"`  // daily, weekly, monthly, custom
	ScheduledTime string     `json:"scheduled_time"` // TIME string "09:00:00"
	DaysOfWeek    IntArray   `json:"days_of_week"`   // [1,2,3,4,5] for Mon-Fri
	Timezone      string     `json:"timezone"`
	IsActive      bool       `json:"is_active"`
	LastSentAt    *time.Time `json:"last_sent_at,omitempty"`
	NextSendAt    *time.Time `json:"next_send_at,omitempty"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

// NotificationLog represents a log entry for notification events
type NotificationLog struct {
	ID               int64      `json:"id"`
	NotificationID   *uuid.UUID `json:"notification_id,omitempty"`
	UserID           uuid.UUID  `json:"user_id"`
	EventType        string     `json:"event_type"`   // created, sent, delivered, read, clicked, failed
	EventStatus      string     `json:"event_status"` // success, failed
	NotificationType *string    `json:"notification_type,omitempty"`
	ErrorMessage     *string    `json:"error_message,omitempty"`
	Metadata         *string    `json:"metadata,omitempty"` // JSON string
	CreatedAt        time.Time  `json:"created_at"`
}
