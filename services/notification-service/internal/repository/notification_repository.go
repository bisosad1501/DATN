package repository

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/bisosad1501/ielts-platform/notification-service/internal/models"
	"github.com/google/uuid"
)

type NotificationRepository struct {
	db *sql.DB
}

func NewNotificationRepository(db *sql.DB) *NotificationRepository {
	return &NotificationRepository{db: db}
}

// CreateNotification creates a new notification
func (r *NotificationRepository) CreateNotification(notification *models.Notification) error {
	query := `
		INSERT INTO notifications (
			id, user_id, type, category, title, message,
			action_type, action_data, icon_url, image_url,
			scheduled_for, expires_at, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
	`

	_, err := r.db.Exec(query,
		notification.ID,
		notification.UserID,
		notification.Type,
		notification.Category,
		notification.Title,
		notification.Message,
		notification.ActionType,
		notification.ActionData,
		notification.IconURL,
		notification.ImageURL,
		notification.ScheduledFor,
		notification.ExpiresAt,
		notification.CreatedAt,
		notification.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create notification: %w", err)
	}

	return nil
}

// GetNotifications retrieves notifications with pagination and optional filtering
func (r *NotificationRepository) GetNotifications(userID uuid.UUID, isRead *bool, page, limit int) ([]models.Notification, int, error) {
	offset := (page - 1) * limit

	// Build query with optional is_read filter
	whereClause := "WHERE user_id = $1 AND (expires_at IS NULL OR expires_at > NOW())"
	args := []interface{}{userID}
	argPos := 2

	if isRead != nil {
		whereClause += fmt.Sprintf(" AND is_read = $%d", argPos)
		args = append(args, *isRead)
		argPos++
	}

	// Count total items
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM notifications %s", whereClause)
	var totalItems int
	err := r.db.QueryRow(countQuery, args...).Scan(&totalItems)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count notifications: %w", err)
	}

	// Get paginated results
	query := fmt.Sprintf(`
		SELECT id, user_id, type, category, title, message,
			   action_type, action_data, icon_url, image_url,
			   is_read, read_at, is_sent, sent_at,
			   scheduled_for, expires_at, created_at, updated_at
		FROM notifications
		%s
		ORDER BY created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, argPos, argPos+1)

	args = append(args, limit, offset)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query notifications: %w", err)
	}
	defer rows.Close()

	var notifications []models.Notification
	for rows.Next() {
		var n models.Notification
		err := rows.Scan(
			&n.ID, &n.UserID, &n.Type, &n.Category, &n.Title, &n.Message,
			&n.ActionType, &n.ActionData, &n.IconURL, &n.ImageURL,
			&n.IsRead, &n.ReadAt, &n.IsSent, &n.SentAt,
			&n.ScheduledFor, &n.ExpiresAt, &n.CreatedAt, &n.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan notification: %w", err)
		}
		notifications = append(notifications, n)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("rows iteration error: %w", err)
	}

	return notifications, totalItems, nil
}

// GetNotificationByID retrieves a single notification by ID
func (r *NotificationRepository) GetNotificationByID(id uuid.UUID) (*models.Notification, error) {
	query := `
		SELECT id, user_id, type, category, title, message,
			   action_type, action_data, icon_url, image_url,
			   is_read, read_at, is_sent, sent_at,
			   scheduled_for, expires_at, created_at, updated_at
		FROM notifications
		WHERE id = $1
	`

	var n models.Notification
	err := r.db.QueryRow(query, id).Scan(
		&n.ID, &n.UserID, &n.Type, &n.Category, &n.Title, &n.Message,
		&n.ActionType, &n.ActionData, &n.IconURL, &n.ImageURL,
		&n.IsRead, &n.ReadAt, &n.IsSent, &n.SentAt,
		&n.ScheduledFor, &n.ExpiresAt, &n.CreatedAt, &n.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("notification not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get notification: %w", err)
	}

	return &n, nil
}

// MarkAsRead marks a notification as read
func (r *NotificationRepository) MarkAsRead(id uuid.UUID) error {
	query := `
		UPDATE notifications
		SET is_read = true, read_at = NOW(), updated_at = NOW()
		WHERE id = $1
	`

	result, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to mark notification as read: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to check rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("notification not found")
	}

	return nil
}

// MarkAllAsRead marks all notifications as read for a user
func (r *NotificationRepository) MarkAllAsRead(userID uuid.UUID) error {
	query := `
		UPDATE notifications
		SET is_read = true, read_at = NOW(), updated_at = NOW()
		WHERE user_id = $1 AND is_read = false
	`

	_, err := r.db.Exec(query, userID)
	if err != nil {
		return fmt.Errorf("failed to mark all notifications as read: %w", err)
	}

	return nil
}

// DeleteNotification deletes a notification
func (r *NotificationRepository) DeleteNotification(id uuid.UUID) error {
	query := "DELETE FROM notifications WHERE id = $1"

	result, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete notification: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to check rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("notification not found")
	}

	return nil
}

// GetUnreadCount gets count of unread notifications for a user
func (r *NotificationRepository) GetUnreadCount(userID uuid.UUID) (int, error) {
	query := `
		SELECT COUNT(*) 
		FROM notifications 
		WHERE user_id = $1 AND is_read = false 
		  AND (expires_at IS NULL OR expires_at > NOW())
	`

	var count int
	err := r.db.QueryRow(query, userID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to get unread count: %w", err)
	}

	return count, nil
}

// RegisterDeviceToken registers or updates a device token
func (r *NotificationRepository) RegisterDeviceToken(token *models.DeviceToken) error {
	// First deactivate existing tokens for this device_token
	deactivateQuery := `
		UPDATE device_tokens 
		SET is_active = false, updated_at = NOW()
		WHERE device_token = $1
	`
	_, err := r.db.Exec(deactivateQuery, token.DeviceToken)
	if err != nil {
		return fmt.Errorf("failed to deactivate old tokens: %w", err)
	}

	// Insert new token
	query := `
		INSERT INTO device_tokens (
			id, user_id, device_token, device_type, device_id,
			device_name, app_version, os_version, is_active,
			last_used_at, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
	`

	_, err = r.db.Exec(query,
		token.ID,
		token.UserID,
		token.DeviceToken,
		token.DeviceType,
		token.DeviceID,
		token.DeviceName,
		token.AppVersion,
		token.OSVersion,
		token.IsActive,
		token.LastUsedAt,
		token.CreatedAt,
		token.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to register device token: %w", err)
	}

	return nil
}

// GetDeviceTokens retrieves all active device tokens for a user
func (r *NotificationRepository) GetDeviceTokens(userID uuid.UUID) ([]models.DeviceToken, error) {
	query := `
		SELECT id, user_id, device_token, device_type, device_id,
			   device_name, app_version, os_version, is_active,
			   last_used_at, created_at, updated_at
		FROM device_tokens
		WHERE user_id = $1 AND is_active = true
		ORDER BY last_used_at DESC
	`

	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to query device tokens: %w", err)
	}
	defer rows.Close()

	var tokens []models.DeviceToken
	for rows.Next() {
		var t models.DeviceToken
		err := rows.Scan(
			&t.ID, &t.UserID, &t.DeviceToken, &t.DeviceType, &t.DeviceID,
			&t.DeviceName, &t.AppVersion, &t.OSVersion, &t.IsActive,
			&t.LastUsedAt, &t.CreatedAt, &t.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan device token: %w", err)
		}
		tokens = append(tokens, t)
	}

	return tokens, nil
}

// GetNotificationPreferences retrieves notification preferences for a user
func (r *NotificationRepository) GetNotificationPreferences(userID uuid.UUID) (*models.NotificationPreferences, error) {
	query := `
		SELECT user_id, push_enabled, push_achievements, push_reminders,
			   push_course_updates, push_exercise_graded, email_enabled,
			   email_weekly_report, email_course_updates, email_marketing,
			   in_app_enabled, quiet_hours_enabled, 
			   quiet_hours_start::TEXT, quiet_hours_end::TEXT,
			   max_notifications_per_day, updated_at
		FROM notification_preferences
		WHERE user_id = $1
	`

	var prefs models.NotificationPreferences
	err := r.db.QueryRow(query, userID).Scan(
		&prefs.UserID, &prefs.PushEnabled, &prefs.PushAchievements, &prefs.PushReminders,
		&prefs.PushCourseUpdates, &prefs.PushExerciseGraded, &prefs.EmailEnabled,
		&prefs.EmailWeeklyReport, &prefs.EmailCourseUpdates, &prefs.EmailMarketing,
		&prefs.InAppEnabled, &prefs.QuietHoursEnabled, &prefs.QuietHoursStart,
		&prefs.QuietHoursEnd, &prefs.MaxNotificationsPerDay, &prefs.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		// Create default preferences if not exists
		return r.CreateDefaultPreferences(userID)
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get notification preferences: %w", err)
	}

	return &prefs, nil
}

// CreateDefaultPreferences creates default notification preferences for a new user
func (r *NotificationRepository) CreateDefaultPreferences(userID uuid.UUID) (*models.NotificationPreferences, error) {
	query := `
		INSERT INTO notification_preferences (user_id)
		VALUES ($1)
		RETURNING user_id, push_enabled, push_achievements, push_reminders,
				  push_course_updates, push_exercise_graded, email_enabled,
				  email_weekly_report, email_course_updates, email_marketing,
				  in_app_enabled, quiet_hours_enabled, 
				  quiet_hours_start::TEXT,
				  quiet_hours_end::TEXT,
				  max_notifications_per_day, updated_at
	`

	var prefs models.NotificationPreferences
	err := r.db.QueryRow(query, userID).Scan(
		&prefs.UserID, &prefs.PushEnabled, &prefs.PushAchievements, &prefs.PushReminders,
		&prefs.PushCourseUpdates, &prefs.PushExerciseGraded, &prefs.EmailEnabled,
		&prefs.EmailWeeklyReport, &prefs.EmailCourseUpdates, &prefs.EmailMarketing,
		&prefs.InAppEnabled, &prefs.QuietHoursEnabled, &prefs.QuietHoursStart,
		&prefs.QuietHoursEnd, &prefs.MaxNotificationsPerDay, &prefs.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to create default preferences: %w", err)
	}

	return &prefs, nil
}

// UpdateNotificationPreferences updates notification preferences for a user
func (r *NotificationRepository) UpdateNotificationPreferences(prefs *models.NotificationPreferences) error {
	query := `
		UPDATE notification_preferences
		SET push_enabled = $2, push_achievements = $3, push_reminders = $4,
			push_course_updates = $5, push_exercise_graded = $6,
			email_enabled = $7, email_weekly_report = $8,
			email_course_updates = $9, email_marketing = $10,
			in_app_enabled = $11, quiet_hours_enabled = $12,
			quiet_hours_start = $13::TEXT::TIME,
			quiet_hours_end = $14::TEXT::TIME,
			max_notifications_per_day = $15, updated_at = NOW()
		WHERE user_id = $1
	`

	result, err := r.db.Exec(query,
		prefs.UserID,
		prefs.PushEnabled,
		prefs.PushAchievements,
		prefs.PushReminders,
		prefs.PushCourseUpdates,
		prefs.PushExerciseGraded,
		prefs.EmailEnabled,
		prefs.EmailWeeklyReport,
		prefs.EmailCourseUpdates,
		prefs.EmailMarketing,
		prefs.InAppEnabled,
		prefs.QuietHoursEnabled,
		prefs.QuietHoursStart,
		prefs.QuietHoursEnd,
		prefs.MaxNotificationsPerDay,
	)

	if err != nil {
		return fmt.Errorf("failed to update notification preferences: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to check rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("preferences not found")
	}

	return nil
}

// CanSendNotification checks if a notification can be sent based on user preferences
func (r *NotificationRepository) CanSendNotification(userID uuid.UUID, notifType, category string) (bool, error) {
	// Get user preferences
	prefs, err := r.GetNotificationPreferences(userID)
	if err != nil {
		return false, fmt.Errorf("failed to get preferences: %w", err)
	}

	// Check if in-app notifications are enabled
	if !prefs.InAppEnabled {
		return false, nil
	}

	// Check type-specific preferences
	switch notifType {
	case "achievement":
		if !prefs.PushAchievements {
			return false, nil
		}
	case "reminder":
		if !prefs.PushReminders {
			return false, nil
		}
	case "course_update":
		if !prefs.PushCourseUpdates {
			return false, nil
		}
	case "exercise_graded":
		if !prefs.PushExerciseGraded {
			return false, nil
		}
	}

	// Check quiet hours
	if prefs.QuietHoursEnabled && prefs.QuietHoursStart != nil && prefs.QuietHoursEnd != nil {
		now := time.Now().Format("15:04:05")
		if now >= *prefs.QuietHoursStart || now <= *prefs.QuietHoursEnd {
			return false, nil
		}
	}

	// Check daily limit
	if prefs.MaxNotificationsPerDay > 0 {
		countQuery := `
			SELECT COUNT(*) 
			FROM notifications 
			WHERE user_id = $1 
			  AND created_at >= CURRENT_DATE
		`
		var todayCount int
		err := r.db.QueryRow(countQuery, userID).Scan(&todayCount)
		if err != nil {
			return false, fmt.Errorf("failed to check daily count: %w", err)
		}

		if todayCount >= prefs.MaxNotificationsPerDay {
			return false, nil
		}
	}

	return true, nil
}

// GetTemplateByCode retrieves a notification template by code
func (r *NotificationRepository) GetTemplateByCode(code string) (*models.NotificationTemplate, error) {
	query := `
		SELECT id, template_code, name, description, notification_type,
			   category, title_template, body_template, subject_template,
			   html_template, required_variables, is_active, created_at, updated_at
		FROM notification_templates
		WHERE template_code = $1 AND is_active = true
	`

	var tmpl models.NotificationTemplate
	err := r.db.QueryRow(query, code).Scan(
		&tmpl.ID, &tmpl.TemplateCode, &tmpl.Name, &tmpl.Description,
		&tmpl.NotificationType, &tmpl.Category, &tmpl.TitleTemplate,
		&tmpl.BodyTemplate, &tmpl.SubjectTemplate, &tmpl.HTMLTemplate,
		&tmpl.RequiredVariables, &tmpl.IsActive, &tmpl.CreatedAt, &tmpl.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("template not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get template: %w", err)
	}

	return &tmpl, nil
}

// CreateNotificationLog creates a log entry for notification events
func (r *NotificationRepository) CreateNotificationLog(log *models.NotificationLog) error {
	query := `
		INSERT INTO notification_logs (
			notification_id, user_id, event_type, event_status,
			notification_type, error_message, metadata, created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`

	_, err := r.db.Exec(query,
		log.NotificationID,
		log.UserID,
		log.EventType,
		log.EventStatus,
		log.NotificationType,
		log.ErrorMessage,
		log.Metadata,
		log.CreatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create notification log: %w", err)
	}

	return nil
}
