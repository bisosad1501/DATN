package service

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/bisosad1501/ielts-platform/notification-service/internal/models"
	"github.com/bisosad1501/ielts-platform/notification-service/internal/repository"
	"github.com/google/uuid"
)

type NotificationService struct {
	repo *repository.NotificationRepository
}

func NewNotificationService(repo *repository.NotificationRepository) *NotificationService {
	return &NotificationService{repo: repo}
}

// CreateNotification creates a new notification after checking permissions
// FIX #23: Use retry mechanism for preference checks
func (s *NotificationService) CreateNotification(req *models.CreateNotificationRequest) (*models.Notification, error) {
	// Check if notification can be sent with retry
	canSend, err := s.checkNotificationPermissionsWithRetry(req.UserID, req.Type, req.Category)
	if err != nil {
		// Log error but continue with default behavior (allow)
		// Better to send than miss important notification
		log.Printf("[Notification-Service] WARNING: Failed to check preferences after retry: %v. Allowing notification by default.", err)
		canSend = true // Fail open
	}

	if !canSend {
		return nil, fmt.Errorf("notification blocked by user preferences")
	}

	// Marshal action_data to JSON string if provided
	var actionDataJSON *string
	if req.ActionData != nil {
		dataBytes, err := json.Marshal(req.ActionData)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal action_data: %w", err)
		}
		jsonStr := string(dataBytes)
		actionDataJSON = &jsonStr
	}

	// Parse timestamps if provided
	var scheduledFor *time.Time
	if req.ScheduledFor != nil {
		t, err := time.Parse(time.RFC3339, *req.ScheduledFor)
		if err != nil {
			return nil, fmt.Errorf("invalid scheduled_for format: %w", err)
		}
		scheduledFor = &t
	}

	var expiresAt *time.Time
	if req.ExpiresAt != nil {
		t, err := time.Parse(time.RFC3339, *req.ExpiresAt)
		if err != nil {
			return nil, fmt.Errorf("invalid expires_at format: %w", err)
		}
		expiresAt = &t
	}

	// Create notification entity
	notification := &models.Notification{
		ID:           uuid.New(),
		UserID:       req.UserID,
		Type:         req.Type,
		Category:     req.Category,
		Title:        req.Title,
		Message:      req.Message,
		ActionType:   req.ActionType,
		ActionData:   actionDataJSON,
		IconURL:      req.IconURL,
		ImageURL:     req.ImageURL,
		IsRead:       false,
		IsSent:       scheduledFor == nil, // Sent immediately if not scheduled
		SentAt:       nil,
		ScheduledFor: scheduledFor,
		ExpiresAt:    expiresAt,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if notification.IsSent {
		now := time.Now()
		notification.SentAt = &now
	}

	// Save to database
	err = s.repo.CreateNotification(notification)
	if err != nil {
		return nil, fmt.Errorf("failed to create notification: %w", err)
	}

	// Log the creation
	s.logNotificationEvent(&notification.ID, notification.UserID, "created", "success", &notification.Type, nil)

	return notification, nil
}

// GetNotifications retrieves notifications with pagination
func (s *NotificationService) GetNotifications(userID uuid.UUID, isRead *bool, page, limit int) ([]models.Notification, int, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	notifications, totalItems, err := s.repo.GetNotifications(userID, isRead, page, limit)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get notifications: %w", err)
	}

	return notifications, totalItems, nil
}

// GetNotificationByID retrieves a notification by ID
func (s *NotificationService) GetNotificationByID(id uuid.UUID, userID uuid.UUID) (*models.Notification, error) {
	notification, err := s.repo.GetNotificationByID(id)
	if err != nil {
		return nil, fmt.Errorf("failed to get notification: %w", err)
	}

	// Verify ownership
	if notification.UserID != userID {
		return nil, fmt.Errorf("unauthorized: notification does not belong to user")
	}

	return notification, nil
}

// MarkAsRead marks a notification as read
func (s *NotificationService) MarkAsRead(id uuid.UUID, userID uuid.UUID) error {
	// Verify ownership first
	notification, err := s.repo.GetNotificationByID(id)
	if err != nil {
		return fmt.Errorf("failed to get notification: %w", err)
	}

	if notification.UserID != userID {
		return fmt.Errorf("unauthorized: notification does not belong to user")
	}

	// Mark as read
	err = s.repo.MarkAsRead(id)
	if err != nil {
		return fmt.Errorf("failed to mark as read: %w", err)
	}

	// Log the event
	s.logNotificationEvent(&id, userID, "read", "success", &notification.Type, nil)

	return nil
}

// MarkAllAsRead marks all notifications as read for a user
// FIX #19: Returns count of marked notifications for idempotency
func (s *NotificationService) MarkAllAsRead(userID uuid.UUID) (int, error) {
	count, err := s.repo.MarkAllAsRead(userID)
	if err != nil {
		return 0, fmt.Errorf("failed to mark all as read: %w", err)
	}

	// Log the event (only if changes were made)
	if count > 0 {
		s.logNotificationEvent(nil, userID, "mark_all_read", "success", nil, nil)
	}

	return count, nil
}

// DeleteNotification deletes a notification
func (s *NotificationService) DeleteNotification(id uuid.UUID, userID uuid.UUID) error {
	// Verify ownership first
	notification, err := s.repo.GetNotificationByID(id)
	if err != nil {
		return fmt.Errorf("failed to get notification: %w", err)
	}

	if notification.UserID != userID {
		return fmt.Errorf("unauthorized: notification does not belong to user")
	}

	// Delete
	err = s.repo.DeleteNotification(id)
	if err != nil {
		return fmt.Errorf("failed to delete notification: %w", err)
	}

	// Log the event
	s.logNotificationEvent(&id, userID, "deleted", "success", &notification.Type, nil)

	return nil
}

// GetUnreadCount gets unread notification count
func (s *NotificationService) GetUnreadCount(userID uuid.UUID) (int, error) {
	count, err := s.repo.GetUnreadCount(userID)
	if err != nil {
		return 0, fmt.Errorf("failed to get unread count: %w", err)
	}

	return count, nil
}

// RegisterDevice registers a device token for push notifications
func (s *NotificationService) RegisterDevice(userID uuid.UUID, req *models.RegisterDeviceRequest) (*models.DeviceToken, error) {
	token := &models.DeviceToken{
		ID:          uuid.New(),
		UserID:      userID,
		DeviceToken: req.DeviceToken,
		DeviceType:  req.DeviceType,
		DeviceID:    req.DeviceID,
		DeviceName:  req.DeviceName,
		AppVersion:  req.AppVersion,
		OSVersion:   req.OSVersion,
		IsActive:    true,
		LastUsedAt:  time.Now(),
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	err := s.repo.RegisterDeviceToken(token)
	if err != nil {
		return nil, fmt.Errorf("failed to register device: %w", err)
	}

	return token, nil
}

// GetDeviceTokens retrieves all device tokens for a user
func (s *NotificationService) GetDeviceTokens(userID uuid.UUID) ([]models.DeviceToken, error) {
	tokens, err := s.repo.GetDeviceTokens(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get device tokens: %w", err)
	}

	return tokens, nil
}

// GetPreferences retrieves notification preferences
func (s *NotificationService) GetPreferences(userID uuid.UUID) (*models.NotificationPreferences, error) {
	prefs, err := s.repo.GetNotificationPreferences(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get preferences: %w", err)
	}

	return prefs, nil
}

// UpdatePreferences updates notification preferences
func (s *NotificationService) UpdatePreferences(userID uuid.UUID, req *models.UpdatePreferencesRequest) (*models.NotificationPreferences, error) {
	// Get current preferences
	prefs, err := s.repo.GetNotificationPreferences(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get current preferences: %w", err)
	}

	// Update only provided fields
	if req.PushEnabled != nil {
		prefs.PushEnabled = *req.PushEnabled
	}
	if req.PushAchievements != nil {
		prefs.PushAchievements = *req.PushAchievements
	}
	if req.PushReminders != nil {
		prefs.PushReminders = *req.PushReminders
	}
	if req.PushCourseUpdates != nil {
		prefs.PushCourseUpdates = *req.PushCourseUpdates
	}
	if req.PushExerciseGraded != nil {
		prefs.PushExerciseGraded = *req.PushExerciseGraded
	}
	if req.EmailEnabled != nil {
		prefs.EmailEnabled = *req.EmailEnabled
	}
	if req.EmailWeeklyReport != nil {
		prefs.EmailWeeklyReport = *req.EmailWeeklyReport
	}
	if req.EmailCourseUpdates != nil {
		prefs.EmailCourseUpdates = *req.EmailCourseUpdates
	}
	if req.EmailMarketing != nil {
		prefs.EmailMarketing = *req.EmailMarketing
	}
	if req.InAppEnabled != nil {
		prefs.InAppEnabled = *req.InAppEnabled
	}
	if req.QuietHoursEnabled != nil {
		prefs.QuietHoursEnabled = *req.QuietHoursEnabled
	}
	if req.QuietHoursStart != nil {
		prefs.QuietHoursStart = req.QuietHoursStart
	}
	if req.QuietHoursEnd != nil {
		prefs.QuietHoursEnd = req.QuietHoursEnd
	}
	if req.MaxNotificationsPerDay != nil {
		prefs.MaxNotificationsPerDay = *req.MaxNotificationsPerDay
	}
	if req.Timezone != nil {
		prefs.Timezone = *req.Timezone
	}

	// Update in database
	err = s.repo.UpdateNotificationPreferences(prefs)
	if err != nil {
		return nil, fmt.Errorf("failed to update preferences: %w", err)
	}

	// Get updated preferences
	updatedPrefs, err := s.repo.GetNotificationPreferences(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get updated preferences: %w", err)
	}

	return updatedPrefs, nil
}

// SendBulkNotifications sends notifications to multiple users
// FIX #21: Use batch insert with transaction for better performance and atomicity
func (s *NotificationService) SendBulkNotifications(req *models.SendBulkNotificationRequest) (int, int, error) {
	if len(req.UserIDs) == 0 {
		return 0, 0, nil
	}

	// Pre-fetch all users' preferences in single query (optimization)
	prefsMap, err := s.repo.GetBulkNotificationPreferences(req.UserIDs, req.Type, req.Category)
	if err != nil {
		return 0, 0, fmt.Errorf("failed to get bulk preferences: %w", err)
	}

	// Marshal action_data to JSON string if provided
	var actionDataJSON *string
	if req.ActionData != nil {
		dataBytes, err := json.Marshal(req.ActionData)
		if err != nil {
			return 0, 0, fmt.Errorf("failed to marshal action_data: %w", err)
		}
		jsonStr := string(dataBytes)
		actionDataJSON = &jsonStr
	}

	// Filter users who can receive this notification and build notification list
	var notifications []*models.Notification
	successCount := 0
	failedCount := 0
	now := time.Now()

	for _, userID := range req.UserIDs {
		canSend, exists := prefsMap[userID]
		if !exists || !canSend {
			failedCount++
			errMsg := "blocked by user preferences"
			s.logNotificationEvent(nil, userID, "bulk_send", "blocked", &req.Type, &errMsg)
			continue
		}

		notification := &models.Notification{
			ID:         uuid.New(),
			UserID:     userID,
			Type:       req.Type,
			Category:   req.Category,
			Title:      req.Title,
			Message:    req.Message,
			ActionType: req.ActionType,
			ActionData: actionDataJSON,
			IconURL:    req.IconURL,
			ImageURL:   req.ImageURL,
			IsRead:     false,
			IsSent:     true,
			SentAt:     &now,
			CreatedAt:  now,
			UpdatedAt:  now,
		}

		notifications = append(notifications, notification)
		successCount++
	}

	// Batch insert all notifications in single transaction
	if len(notifications) > 0 {
		err = s.repo.CreateBulkNotifications(notifications)
		if err != nil {
			// If batch insert fails, all notifications fail
			return 0, len(req.UserIDs), fmt.Errorf("failed to create bulk notifications: %w", err)
		}

		// Log success
		s.logNotificationEvent(nil, uuid.Nil, "bulk_send", "success", &req.Type, nil)
	}

	return successCount, failedCount, nil
}

// RenderTemplate renders a notification template with variables
func (s *NotificationService) RenderTemplate(templateCode string, variables map[string]string) (string, string, error) {
	// Get template
	tmpl, err := s.repo.GetTemplateByCode(templateCode)
	if err != nil {
		return "", "", fmt.Errorf("failed to get template: %w", err)
	}

	// Check required variables
	for _, reqVar := range tmpl.RequiredVariables {
		if _, ok := variables[reqVar]; !ok {
			return "", "", fmt.Errorf("missing required variable: %s", reqVar)
		}
	}

	// Render title
	title := ""
	if tmpl.TitleTemplate != nil {
		title = *tmpl.TitleTemplate
		for key, value := range variables {
			placeholder := fmt.Sprintf("{{%s}}", key)
			title = strings.ReplaceAll(title, placeholder, value)
		}
	}

	// Render body
	body := tmpl.BodyTemplate
	for key, value := range variables {
		placeholder := fmt.Sprintf("{{%s}}", key)
		body = strings.ReplaceAll(body, placeholder, value)
	}

	return title, body, nil
}

// checkNotificationPermissionsWithRetry checks notification permissions with retry
// FIX #23: Retry mechanism for preference checks with fallback
func (s *NotificationService) checkNotificationPermissionsWithRetry(userID uuid.UUID, notifType, category string) (bool, error) {
	maxRetries := 3
	baseDelay := 100 * time.Millisecond

	for attempt := 1; attempt <= maxRetries; attempt++ {
		canSend, err := s.repo.CanSendNotification(userID, notifType, category)

		if err == nil {
			if attempt > 1 {
				log.Printf("[Notification-Service] SUCCESS: Preferences check succeeded on attempt %d", attempt)
			}
			return canSend, nil
		}

		log.Printf("[Notification-Service] WARNING: Preferences check failed (attempt %d/%d): %v", attempt, maxRetries, err)

		if attempt < maxRetries {
			delay := baseDelay * time.Duration(attempt)
			time.Sleep(delay)
		}
	}

	return false, fmt.Errorf("failed after %d attempts", maxRetries)
}

// logNotificationEvent creates a log entry for notification events
func (s *NotificationService) logNotificationEvent(notificationID *uuid.UUID, userID uuid.UUID, eventType, eventStatus string, notificationType *string, errorMessage *string) {
	var errMsg *string
	if errorMessage != nil {
		msg := fmt.Sprintf("%v", *errorMessage)
		errMsg = &msg
	}

	log := &models.NotificationLog{
		NotificationID:   notificationID,
		UserID:           userID,
		EventType:        eventType,
		EventStatus:      eventStatus,
		NotificationType: notificationType,
		ErrorMessage:     errMsg,
		CreatedAt:        time.Now(),
	}

	// Ignore errors in logging to not disrupt main flow
	_ = s.repo.CreateNotificationLog(log)
}

// ============================================
// Scheduled Notifications Service Methods
// ============================================

// CreateScheduledNotification creates a new scheduled notification
func (s *NotificationService) CreateScheduledNotification(userID uuid.UUID, req *models.CreateScheduledNotificationRequest) (*models.ScheduledNotification, error) {
	// Default timezone if not provided
	timezone := req.Timezone
	if timezone == "" {
		timezone = "Asia/Ho_Chi_Minh"
	}

	schedule := &models.ScheduledNotification{
		ID:            uuid.New(),
		UserID:        userID,
		Title:         req.Title,
		Message:       req.Message,
		ScheduleType:  req.ScheduleType,
		ScheduledTime: req.ScheduledTime,
		DaysOfWeek:    req.DaysOfWeek, // Already []int
		Timezone:      timezone,
		IsActive:      true,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	// Calculate next_send_at based on schedule type
	// This is a simplified version - in production, use proper timezone handling
	nextSend := calculateNextSendTime(schedule.ScheduleType, schedule.ScheduledTime, schedule.DaysOfWeek)
	schedule.NextSendAt = nextSend

	err := s.repo.CreateScheduledNotification(schedule)
	if err != nil {
		return nil, fmt.Errorf("failed to create scheduled notification: %w", err)
	}

	return schedule, nil
}

// GetScheduledNotifications retrieves all scheduled notifications for a user
func (s *NotificationService) GetScheduledNotifications(userID uuid.UUID) ([]models.ScheduledNotification, error) {
	schedules, err := s.repo.GetScheduledNotifications(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get scheduled notifications: %w", err)
	}
	return schedules, nil
}

// GetScheduledNotificationByID retrieves a scheduled notification by ID
func (s *NotificationService) GetScheduledNotificationByID(id uuid.UUID, userID uuid.UUID) (*models.ScheduledNotification, error) {
	schedule, err := s.repo.GetScheduledNotificationByID(id)
	if err != nil {
		return nil, err
	}

	// Check ownership
	if schedule.UserID != userID {
		return nil, fmt.Errorf("unauthorized: scheduled notification does not belong to user")
	}

	return schedule, nil
}

// UpdateScheduledNotification updates a scheduled notification
func (s *NotificationService) UpdateScheduledNotification(id uuid.UUID, userID uuid.UUID, req *models.UpdateScheduledNotificationRequest) (*models.ScheduledNotification, error) {
	// Get existing schedule
	schedule, err := s.repo.GetScheduledNotificationByID(id)
	if err != nil {
		return nil, err
	}

	// Check ownership
	if schedule.UserID != userID {
		return nil, fmt.Errorf("unauthorized: scheduled notification does not belong to user")
	}

	// Update fields if provided
	if req.Title != nil {
		schedule.Title = *req.Title
	}
	if req.Message != nil {
		schedule.Message = *req.Message
	}
	if req.ScheduleType != nil {
		schedule.ScheduleType = *req.ScheduleType
	}
	if req.ScheduledTime != nil {
		schedule.ScheduledTime = *req.ScheduledTime
	}
	if req.DaysOfWeek != nil {
		schedule.DaysOfWeek = *req.DaysOfWeek
	}
	if req.Timezone != nil {
		schedule.Timezone = *req.Timezone
	}
	if req.IsActive != nil {
		schedule.IsActive = *req.IsActive
	}

	// Recalculate next_send_at
	nextSend := calculateNextSendTime(schedule.ScheduleType, schedule.ScheduledTime, schedule.DaysOfWeek)
	schedule.NextSendAt = nextSend
	schedule.UpdatedAt = time.Now()

	err = s.repo.UpdateScheduledNotification(schedule)
	if err != nil {
		return nil, fmt.Errorf("failed to update scheduled notification: %w", err)
	}

	return schedule, nil
}

// DeleteScheduledNotification deletes a scheduled notification
func (s *NotificationService) DeleteScheduledNotification(id uuid.UUID, userID uuid.UUID) error {
	// Check ownership first
	schedule, err := s.repo.GetScheduledNotificationByID(id)
	if err != nil {
		return err
	}

	if schedule.UserID != userID {
		return fmt.Errorf("unauthorized: scheduled notification does not belong to user")
	}

	err = s.repo.DeleteScheduledNotification(id)
	if err != nil {
		return fmt.Errorf("failed to delete scheduled notification: %w", err)
	}

	return nil
}

// calculateNextSendTime calculates the next send time for a scheduled notification
// This is a simplified version - in production, use proper timezone handling
func calculateNextSendTime(scheduleType, scheduledTime string, daysOfWeek []int) *time.Time {
	now := time.Now()

	// Parse scheduled time (HH:MM:SS)
	timeParts := strings.Split(scheduledTime, ":")
	if len(timeParts) != 3 {
		return nil
	}

	hour, _ := time.Parse("15", timeParts[0])
	minute, _ := time.Parse("04", timeParts[1])

	switch scheduleType {
	case "daily":
		// Next occurrence at specified time
		nextSend := time.Date(now.Year(), now.Month(), now.Day(),
			hour.Hour(), minute.Minute(), 0, 0, now.Location())

		// If time has passed today, schedule for tomorrow
		if nextSend.Before(now) {
			nextSend = nextSend.Add(24 * time.Hour)
		}
		return &nextSend

	case "weekly":
		// For weekly, use days_of_week
		// Find next matching day
		currentDay := int(now.Weekday())
		if currentDay == 0 { // Sunday is 0, but we use 7
			currentDay = 7
		}

		// Find next day in daysOfWeek
		var daysUntilNext int
		found := false
		for i := 0; i < 7; i++ {
			testDay := (currentDay+i-1)%7 + 1
			for _, day := range daysOfWeek {
				if testDay == day {
					daysUntilNext = i
					found = true
					break
				}
			}
			if found {
				break
			}
		}

		nextSend := time.Date(now.Year(), now.Month(), now.Day()+daysUntilNext,
			hour.Hour(), minute.Minute(), 0, 0, now.Location())

		// If same day but time passed, go to next week occurrence
		if daysUntilNext == 0 && nextSend.Before(now) {
			nextSend = nextSend.Add(7 * 24 * time.Hour)
		}
		return &nextSend

	default:
		// For monthly and custom, return nil (need more complex logic)
		return nil
	}
}
