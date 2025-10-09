package handlers

import (
	"log"
	"net/http"
	"strconv"

	"github.com/bisosad1501/DATN/services/user-service/internal/models"
	"github.com/bisosad1501/DATN/services/user-service/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type UserHandler struct {
	service *service.UserService
}

func NewUserHandler(service *service.UserService) *UserHandler {
	return &UserHandler{service: service}
}

// HealthCheck handles health check requests
func (h *UserHandler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Data: gin.H{
			"status":  "healthy",
			"service": "user-service",
		},
	})
}

// GetProfile gets current user's profile
func (h *UserHandler) GetProfile(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INVALID_USER_ID",
				Message: "Invalid user ID format",
			},
		})
		return
	}

	profile, err := h.service.GetOrCreateProfile(userID)
	if err != nil {
		log.Printf("❌ Error getting profile: %v", err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to retrieve profile",
				Details: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    profile,
	})
}

// UpdateProfile updates current user's profile
func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INVALID_USER_ID",
				Message: "Invalid user ID format",
			},
		})
		return
	}

	var req models.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "VALIDATION_ERROR",
				Message: "Invalid request data",
				Details: err.Error(),
			},
		})
		return
	}

	profile, err := h.service.UpdateProfile(userID, &req)
	if err != nil {
		log.Printf("❌ Error updating profile: %v", err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "UPDATE_FAILED",
				Message: "Failed to update profile",
				Details: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "Profile updated successfully",
		Data:    profile,
	})
}

// UpdateAvatar updates user's avatar
func (h *UserHandler) UpdateAvatar(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INVALID_USER_ID",
				Message: "Invalid user ID format",
			},
		})
		return
	}

	var req struct {
		AvatarURL string `json:"avatar_url" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "VALIDATION_ERROR",
				Message: "Avatar URL is required",
			},
		})
		return
	}

	err = h.service.UpdateAvatar(userID, req.AvatarURL)
	if err != nil {
		log.Printf("❌ Error updating avatar: %v", err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "UPDATE_FAILED",
				Message: "Failed to update avatar",
				Details: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "Avatar updated successfully",
		Data: gin.H{
			"avatar_url": req.AvatarURL,
		},
	})
}

// GetProgress gets user's learning progress and statistics
func (h *UserHandler) GetProgress(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INVALID_USER_ID",
				Message: "Invalid user ID format",
			},
		})
		return
	}

	stats, err := h.service.GetProgressStats(userID)
	if err != nil {
		log.Printf("❌ Error getting progress stats: %v", err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to retrieve progress statistics",
				Details: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    stats,
	})
}

// StartSession starts a new study session
func (h *UserHandler) StartSession(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INVALID_USER_ID",
				Message: "Invalid user ID format",
			},
		})
		return
	}

	var req models.StudySessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "VALIDATION_ERROR",
				Message: "Invalid request data",
				Details: err.Error(),
			},
		})
		return
	}

	// Get device type from user agent
	deviceType := c.GetHeader("User-Agent")

	session, err := h.service.StartStudySession(&req, userID, &deviceType)
	if err != nil {
		log.Printf("❌ Error starting session: %v", err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "SESSION_START_FAILED",
				Message: "Failed to start study session",
				Details: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusCreated, models.Response{
		Success: true,
		Message: "Study session started",
		Data:    session,
	})
}

// EndSession ends an active study session
func (h *UserHandler) EndSession(c *gin.Context) {
	sessionIDStr := c.Param("id")
	sessionID, err := uuid.Parse(sessionIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INVALID_SESSION_ID",
				Message: "Invalid session ID format",
			},
		})
		return
	}

	var req models.EndSessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "VALIDATION_ERROR",
				Message: "Invalid request data",
				Details: err.Error(),
			},
		})
		return
	}

	err = h.service.EndStudySession(sessionID, &req)
	if err != nil {
		log.Printf("❌ Error ending session: %v", err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "SESSION_END_FAILED",
				Message: "Failed to end study session",
				Details: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "Study session ended successfully",
	})
}

// GetHistory gets study history
func (h *UserHandler) GetHistory(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INVALID_USER_ID",
				Message: "Invalid user ID format",
			},
		})
		return
	}

	// Get limit from query param
	limitStr := c.DefaultQuery("limit", "20")
	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = 20
	}

	sessions, err := h.service.GetStudyHistory(userID, limit)
	if err != nil {
		log.Printf("❌ Error getting study history: %v", err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to retrieve study history",
				Details: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Data: gin.H{
			"sessions": sessions,
			"count":    len(sessions),
		},
	})
}
