package service

import (
	"encoding/json"
	"fmt"
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
func (s *NotificationService) CreateNotification(req *models.CreateNotificationRequest) (*models.Notification, error) {
	// Check if notification can be sent
	canSend, err := s.repo.CanSendNotification(req.UserID, req.Type, req.Category)
	if err != nil {
		return nil, fmt.Errorf("failed to check notification permissions: %w", err)
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
func (s *NotificationService) MarkAllAsRead(userID uuid.UUID) error {
	err := s.repo.MarkAllAsRead(userID)
	if err != nil {
		return fmt.Errorf("failed to mark all as read: %w", err)
	}

	// Log the event
	s.logNotificationEvent(nil, userID, "mark_all_read", "success", nil, nil)

	return nil
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
func (s *NotificationService) SendBulkNotifications(req *models.SendBulkNotificationRequest) (int, int, error) {
	successCount := 0
	failedCount := 0

	for _, userID := range req.UserIDs {
		// Create notification request for each user
		notifReq := &models.CreateNotificationRequest{
			UserID:     userID,
			Type:       req.Type,
			Category:   req.Category,
			Title:      req.Title,
			Message:    req.Message,
			ActionType: req.ActionType,
			ActionData: req.ActionData,
			IconURL:    req.IconURL,
			ImageURL:   req.ImageURL,
		}

		_, err := s.CreateNotification(notifReq)
		if err != nil {
			failedCount++
			// Log error but continue with other users
			errMsg := err.Error()
			s.logNotificationEvent(nil, userID, "bulk_send", "failed", &req.Type, &errMsg)
		} else {
			successCount++
		}
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
