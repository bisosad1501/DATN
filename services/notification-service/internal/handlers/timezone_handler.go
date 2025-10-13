package handlers

import (
	"net/http"

	"github.com/bisosad1501/ielts-platform/notification-service/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// GetTimezone returns the user's timezone preference
func (h *NotificationHandler) GetTimezone(c *gin.Context) {
	userIDStr := c.GetHeader("X-User-ID")
	if userIDStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "unauthorized",
			"message": "User ID not found in request",
		})
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_user_id",
			"message": "Invalid user ID format",
		})
		return
	}

	// Get preferences from database
	prefs, err := h.service.GetPreferences(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "database_error",
			"message": "Failed to retrieve timezone preference",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"timezone": prefs.Timezone,
		},
	})
}

// UpdateTimezone updates the user's timezone preference
func (h *NotificationHandler) UpdateTimezone(c *gin.Context) {
	userIDStr := c.GetHeader("X-User-ID")
	if userIDStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "unauthorized",
			"message": "User ID not found in request",
		})
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_user_id",
			"message": "Invalid user ID format",
		})
		return
	}

	var req struct {
		Timezone string `json:"timezone" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "validation_error",
			"message": "Timezone is required",
		})
		return
	}

	// Validate timezone format (basic validation)
	if req.Timezone == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "validation_error",
			"message": "Timezone cannot be empty",
		})
		return
	}

	// Update preferences (include timezone in the update request)
	updateReq := &models.UpdatePreferencesRequest{
		Timezone: &req.Timezone,
	}

	prefs, err := h.service.UpdatePreferences(userID, updateReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "database_error",
			"message": "Failed to update timezone preference",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Timezone updated successfully",
		"data": gin.H{
			"timezone": prefs.Timezone,
		},
	})
}
