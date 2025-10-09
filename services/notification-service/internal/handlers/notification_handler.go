package handlers

import (
	"encoding/json"
	"math"
	"net/http"
	"strconv"

	"github.com/bisosad1501/ielts-platform/notification-service/internal/models"
	"github.com/bisosad1501/ielts-platform/notification-service/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type NotificationHandler struct {
	service *service.NotificationService
}

func NewNotificationHandler(service *service.NotificationService) *NotificationHandler {
	return &NotificationHandler{service: service}
}

// GetMyNotifications retrieves notifications for the authenticated user
// GET /api/v1/notifications?is_read=false&page=1&limit=20
func (h *NotificationHandler) GetMyNotifications(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "unauthorized",
			Message: "User ID not found in context",
		})
		return
	}

	uid := userID.(uuid.UUID)

	// Parse query parameters
	var isRead *bool
	if isReadStr := c.Query("is_read"); isReadStr != "" {
		val := isReadStr == "true"
		isRead = &val
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	// Get notifications
	notifications, totalItems, err := h.service.GetNotifications(uid, isRead, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "internal_error",
			Message: "Failed to get notifications: " + err.Error(),
		})
		return
	}

	// Convert to response format
	var notifResponses []models.NotificationResponse
	for _, n := range notifications {
		resp := h.convertToNotificationResponse(&n)
		notifResponses = append(notifResponses, resp)
	}

	// Calculate pagination
	totalPages := int(math.Ceil(float64(totalItems) / float64(limit)))

	c.JSON(http.StatusOK, models.NotificationListResponse{
		Notifications: notifResponses,
		Pagination: models.PaginationResponse{
			Page:       page,
			Limit:      limit,
			TotalItems: totalItems,
			TotalPages: totalPages,
		},
	})
}

// GetNotificationByID retrieves a single notification by ID
// GET /api/v1/notifications/:id
func (h *NotificationHandler) GetNotificationByID(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "unauthorized",
			Message: "User ID not found in context",
		})
		return
	}

	uid := userID.(uuid.UUID)

	// Parse notification ID
	idStr := c.Param("id")
	notificationID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_id",
			Message: "Invalid notification ID format",
		})
		return
	}

	// Get notification
	notification, err := h.service.GetNotificationByID(notificationID, uid)
	if err != nil {
		if err.Error() == "notification not found" || err.Error() == "unauthorized: notification does not belong to user" {
			c.JSON(http.StatusNotFound, models.ErrorResponse{
				Error:   "not_found",
				Message: "Notification not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "internal_error",
			Message: "Failed to get notification: " + err.Error(),
		})
		return
	}

	resp := h.convertToNotificationResponse(notification)
	c.JSON(http.StatusOK, resp)
}

// MarkAsRead marks a notification as read
// PUT /api/v1/notifications/:id/read
func (h *NotificationHandler) MarkAsRead(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "unauthorized",
			Message: "User ID not found in context",
		})
		return
	}

	uid := userID.(uuid.UUID)

	// Parse notification ID
	idStr := c.Param("id")
	notificationID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_id",
			Message: "Invalid notification ID format",
		})
		return
	}

	// Mark as read
	err = h.service.MarkAsRead(notificationID, uid)
	if err != nil {
		if err.Error() == "notification not found" || err.Error() == "unauthorized: notification does not belong to user" {
			c.JSON(http.StatusNotFound, models.ErrorResponse{
				Error:   "not_found",
				Message: "Notification not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "internal_error",
			Message: "Failed to mark as read: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse{
		Message: "Notification marked as read",
	})
}

// MarkAllAsRead marks all notifications as read
// PUT /api/v1/notifications/mark-all-read
func (h *NotificationHandler) MarkAllAsRead(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "unauthorized",
			Message: "User ID not found in context",
		})
		return
	}

	uid := userID.(uuid.UUID)

	// Mark all as read
	err := h.service.MarkAllAsRead(uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "internal_error",
			Message: "Failed to mark all as read: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse{
		Message: "All notifications marked as read",
	})
}

// DeleteNotification deletes a notification
// DELETE /api/v1/notifications/:id
func (h *NotificationHandler) DeleteNotification(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "unauthorized",
			Message: "User ID not found in context",
		})
		return
	}

	uid := userID.(uuid.UUID)

	// Parse notification ID
	idStr := c.Param("id")
	notificationID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_id",
			Message: "Invalid notification ID format",
		})
		return
	}

	// Delete notification
	err = h.service.DeleteNotification(notificationID, uid)
	if err != nil {
		if err.Error() == "notification not found" || err.Error() == "unauthorized: notification does not belong to user" {
			c.JSON(http.StatusNotFound, models.ErrorResponse{
				Error:   "not_found",
				Message: "Notification not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "internal_error",
			Message: "Failed to delete notification: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse{
		Message: "Notification deleted successfully",
	})
}

// GetUnreadCount gets unread notification count
// GET /api/v1/notifications/unread-count
func (h *NotificationHandler) GetUnreadCount(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "unauthorized",
			Message: "User ID not found in context",
		})
		return
	}

	uid := userID.(uuid.UUID)

	// Get unread count
	count, err := h.service.GetUnreadCount(uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "internal_error",
			Message: "Failed to get unread count: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.UnreadCountResponse{
		UnreadCount: count,
	})
}

// RegisterDevice registers a device for push notifications
// POST /api/v1/notifications/devices
func (h *NotificationHandler) RegisterDevice(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "unauthorized",
			Message: "User ID not found in context",
		})
		return
	}

	uid := userID.(uuid.UUID)

	// Parse request
	var req models.RegisterDeviceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request format: " + err.Error(),
		})
		return
	}

	// Register device
	token, err := h.service.RegisterDevice(uid, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "internal_error",
			Message: "Failed to register device: " + err.Error(),
		})
		return
	}

	resp := models.DeviceTokenResponse{
		ID:          token.ID,
		DeviceToken: token.DeviceToken,
		DeviceType:  token.DeviceType,
		DeviceName:  token.DeviceName,
		IsActive:    token.IsActive,
		LastUsedAt:  token.LastUsedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	c.JSON(http.StatusCreated, resp)
}

// GetPreferences retrieves notification preferences
// GET /api/v1/notifications/preferences
func (h *NotificationHandler) GetPreferences(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "unauthorized",
			Message: "User ID not found in context",
		})
		return
	}

	uid := userID.(uuid.UUID)

	// Get preferences
	prefs, err := h.service.GetPreferences(uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "internal_error",
			Message: "Failed to get preferences: " + err.Error(),
		})
		return
	}

	resp := models.PreferencesResponse{
		PushEnabled:            prefs.PushEnabled,
		PushAchievements:       prefs.PushAchievements,
		PushReminders:          prefs.PushReminders,
		PushCourseUpdates:      prefs.PushCourseUpdates,
		PushExerciseGraded:     prefs.PushExerciseGraded,
		EmailEnabled:           prefs.EmailEnabled,
		EmailWeeklyReport:      prefs.EmailWeeklyReport,
		EmailCourseUpdates:     prefs.EmailCourseUpdates,
		EmailMarketing:         prefs.EmailMarketing,
		InAppEnabled:           prefs.InAppEnabled,
		QuietHoursEnabled:      prefs.QuietHoursEnabled,
		QuietHoursStart:        prefs.QuietHoursStart,
		QuietHoursEnd:          prefs.QuietHoursEnd,
		MaxNotificationsPerDay: prefs.MaxNotificationsPerDay,
		UpdatedAt:              prefs.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	c.JSON(http.StatusOK, resp)
}

// UpdatePreferences updates notification preferences
// PUT /api/v1/notifications/preferences
func (h *NotificationHandler) UpdatePreferences(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "unauthorized",
			Message: "User ID not found in context",
		})
		return
	}

	uid := userID.(uuid.UUID)

	// Parse request
	var req models.UpdatePreferencesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request format: " + err.Error(),
		})
		return
	}

	// Update preferences
	prefs, err := h.service.UpdatePreferences(uid, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "internal_error",
			Message: "Failed to update preferences: " + err.Error(),
		})
		return
	}

	resp := models.PreferencesResponse{
		PushEnabled:            prefs.PushEnabled,
		PushAchievements:       prefs.PushAchievements,
		PushReminders:          prefs.PushReminders,
		PushCourseUpdates:      prefs.PushCourseUpdates,
		PushExerciseGraded:     prefs.PushExerciseGraded,
		EmailEnabled:           prefs.EmailEnabled,
		EmailWeeklyReport:      prefs.EmailWeeklyReport,
		EmailCourseUpdates:     prefs.EmailCourseUpdates,
		EmailMarketing:         prefs.EmailMarketing,
		InAppEnabled:           prefs.InAppEnabled,
		QuietHoursEnabled:      prefs.QuietHoursEnabled,
		QuietHoursStart:        prefs.QuietHoursStart,
		QuietHoursEnd:          prefs.QuietHoursEnd,
		MaxNotificationsPerDay: prefs.MaxNotificationsPerDay,
		UpdatedAt:              prefs.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	c.JSON(http.StatusOK, resp)
}

// CreateNotification creates a new notification (Admin only)
// POST /api/v1/admin/notifications
func (h *NotificationHandler) CreateNotification(c *gin.Context) {
	// Parse request
	var req models.CreateNotificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request format: " + err.Error(),
		})
		return
	}

	// Create notification
	notification, err := h.service.CreateNotification(&req)
	if err != nil {
		if err.Error() == "notification blocked by user preferences" {
			c.JSON(http.StatusForbidden, models.ErrorResponse{
				Error:   "blocked",
				Message: "Notification blocked by user preferences",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "internal_error",
			Message: "Failed to create notification: " + err.Error(),
		})
		return
	}

	resp := h.convertToNotificationResponse(notification)
	c.JSON(http.StatusCreated, resp)
}

// SendBulkNotifications sends notifications to multiple users (Admin only)
// POST /api/v1/admin/notifications/bulk
func (h *NotificationHandler) SendBulkNotifications(c *gin.Context) {
	// Parse request
	var req models.SendBulkNotificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request format: " + err.Error(),
		})
		return
	}

	// Send bulk notifications
	successCount, failedCount, err := h.service.SendBulkNotifications(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "internal_error",
			Message: "Failed to send bulk notifications: " + err.Error(),
		})
		return
	}

	resp := models.BulkNotificationResponse{
		TotalUsers:   len(req.UserIDs),
		SuccessCount: successCount,
		FailedCount:  failedCount,
		Message:      "Bulk notification sent",
	}

	c.JSON(http.StatusOK, resp)
}

// Helper function to convert Notification to NotificationResponse
func (h *NotificationHandler) convertToNotificationResponse(n *models.Notification) models.NotificationResponse {
	resp := models.NotificationResponse{
		ID:         n.ID,
		Type:       n.Type,
		Category:   n.Category,
		Title:      n.Title,
		Message:    n.Message,
		ActionType: n.ActionType,
		IconURL:    n.IconURL,
		ImageURL:   n.ImageURL,
		IsRead:     n.IsRead,
		CreatedAt:  n.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	// Parse action_data from JSON string
	if n.ActionData != nil {
		var actionData map[string]interface{}
		if err := json.Unmarshal([]byte(*n.ActionData), &actionData); err == nil {
			resp.ActionData = actionData
		}
	}

	// Format read_at
	if n.ReadAt != nil {
		readAt := n.ReadAt.Format("2006-01-02T15:04:05Z07:00")
		resp.ReadAt = &readAt
	}

	return resp
}
