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

	// Get limit from query param (support both 'limit' and 'page_size')
	limitStr := c.Query("limit")
	if limitStr == "" {
		limitStr = c.DefaultQuery("page_size", "20")
	}
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 20
	}
	// Cap at 200 to prevent excessive queries
	if limit > 200 {
		limit = 200
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

// ============= Study Goals Handlers =============

// CreateGoal creates a new study goal
func (h *UserHandler) CreateGoal(c *gin.Context) {
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

	var req models.CreateGoalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INVALID_REQUEST",
				Message: "Invalid request body",
				Details: err.Error(),
			},
		})
		return
	}

	goal, err := h.service.CreateGoal(userID, &req)
	if err != nil {
		log.Printf("❌ Error creating goal: %v", err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to create goal",
				Details: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusCreated, models.Response{
		Success: true,
		Data:    goal,
		Message: "Goal created successfully",
	})
}

// GetGoals retrieves all goals for the user
func (h *UserHandler) GetGoals(c *gin.Context) {
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

	goals, err := h.service.GetUserGoals(userID)
	if err != nil {
		log.Printf("❌ Error getting goals: %v", err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to retrieve goals",
				Details: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Data: gin.H{
			"goals": goals,
			"count": len(goals),
		},
	})
}

// GetGoalByID retrieves a specific goal
func (h *UserHandler) GetGoalByID(c *gin.Context) {
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

	goalID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INVALID_GOAL_ID",
				Message: "Invalid goal ID format",
			},
		})
		return
	}

	goal, err := h.service.GetGoalByID(goalID, userID)
	if err != nil {
		log.Printf("❌ Error getting goal: %v", err)
		c.JSON(http.StatusNotFound, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "NOT_FOUND",
				Message: "Goal not found",
				Details: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    goal,
	})
}

// UpdateGoal updates a study goal
func (h *UserHandler) UpdateGoal(c *gin.Context) {
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

	goalID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INVALID_GOAL_ID",
				Message: "Invalid goal ID format",
			},
		})
		return
	}

	var req models.UpdateGoalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INVALID_REQUEST",
				Message: "Invalid request body",
				Details: err.Error(),
			},
		})
		return
	}

	goal, err := h.service.UpdateGoal(goalID, userID, &req)
	if err != nil {
		log.Printf("❌ Error updating goal: %v", err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to update goal",
				Details: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    goal,
		Message: "Goal updated successfully",
	})
}

// CompleteGoal marks a goal as completed
func (h *UserHandler) CompleteGoal(c *gin.Context) {
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

	goalID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INVALID_GOAL_ID",
				Message: "Invalid goal ID format",
			},
		})
		return
	}

	err = h.service.CompleteGoal(goalID, userID)
	if err != nil {
		log.Printf("❌ Error completing goal: %v", err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to complete goal",
				Details: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "Goal completed successfully",
	})
}

// DeleteGoal deletes a study goal
func (h *UserHandler) DeleteGoal(c *gin.Context) {
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

	goalID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INVALID_GOAL_ID",
				Message: "Invalid goal ID format",
			},
		})
		return
	}

	err = h.service.DeleteGoal(goalID, userID)
	if err != nil {
		log.Printf("❌ Error deleting goal: %v", err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to delete goal",
				Details: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "Goal deleted successfully",
	})
}

// ============= Statistics Handlers =============

// GetStatistics retrieves comprehensive statistics
func (h *UserHandler) GetStatistics(c *gin.Context) {
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

	stats, err := h.service.GetDetailedStatistics(userID)
	if err != nil {
		log.Printf("❌ Error getting statistics: %v", err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to retrieve statistics",
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

// GetSkillStatistics retrieves statistics for a specific skill
func (h *UserHandler) GetSkillStatistics(c *gin.Context) {
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

	skillType := c.Param("skill")
	if skillType == "" {
		c.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INVALID_SKILL",
				Message: "Skill type is required",
			},
		})
		return
	}

	stats, err := h.service.GetSkillStatistics(userID, skillType)
	if err != nil {
		log.Printf("❌ Error getting skill statistics: %v", err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to retrieve skill statistics",
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

// ============= Achievements Handlers =============

// GetAchievements retrieves all available achievements with progress
func (h *UserHandler) GetAchievements(c *gin.Context) {
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

	achievements, err := h.service.GetAllAchievements(userID)
	if err != nil {
		log.Printf("❌ Error getting achievements: %v", err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to retrieve achievements",
				Details: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Data: gin.H{
			"achievements": achievements,
			"count":        len(achievements),
		},
	})
}

// GetEarnedAchievements retrieves only user's earned achievements
func (h *UserHandler) GetEarnedAchievements(c *gin.Context) {
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

	achievements, err := h.service.GetEarnedAchievements(userID)
	if err != nil {
		log.Printf("❌ Error getting earned achievements: %v", err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to retrieve earned achievements",
				Details: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Data: gin.H{
			"achievements": achievements,
			"count":        len(achievements),
		},
	})
}

// ============= Preferences Handlers =============

// GetPreferences retrieves user preferences
func (h *UserHandler) GetPreferences(c *gin.Context) {
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

	prefs, err := h.service.GetPreferences(userID)
	if err != nil {
		log.Printf("❌ Error getting preferences: %v", err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to retrieve preferences",
				Details: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    prefs,
	})
}

// UpdatePreferences updates user preferences
func (h *UserHandler) UpdatePreferences(c *gin.Context) {
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

	var req models.UpdatePreferencesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INVALID_REQUEST",
				Message: "Invalid request body",
				Details: err.Error(),
			},
		})
		return
	}

	prefs, err := h.service.UpdatePreferences(userID, &req)
	if err != nil {
		log.Printf("❌ Error updating preferences: %v", err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to update preferences",
				Details: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    prefs,
		Message: "Preferences updated successfully",
	})
}

// ============= Reminders Handlers =============

// CreateReminder creates a new study reminder
func (h *UserHandler) CreateReminder(c *gin.Context) {
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

	var req models.CreateReminderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INVALID_REQUEST",
				Message: "Invalid request body",
				Details: err.Error(),
			},
		})
		return
	}

	reminder, err := h.service.CreateReminder(userID, &req)
	if err != nil {
		log.Printf("❌ Error creating reminder: %v", err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to create reminder",
				Details: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusCreated, models.Response{
		Success: true,
		Data:    reminder,
		Message: "Reminder created successfully",
	})
}

// GetReminders retrieves all reminders for the user
func (h *UserHandler) GetReminders(c *gin.Context) {
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

	reminders, err := h.service.GetUserReminders(userID)
	if err != nil {
		log.Printf("❌ Error getting reminders: %v", err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to retrieve reminders",
				Details: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Data: gin.H{
			"reminders": reminders,
			"count":     len(reminders),
		},
	})
}

// UpdateReminder updates a study reminder
func (h *UserHandler) UpdateReminder(c *gin.Context) {
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

	reminderID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INVALID_REMINDER_ID",
				Message: "Invalid reminder ID format",
			},
		})
		return
	}

	var req models.UpdateReminderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INVALID_REQUEST",
				Message: "Invalid request body",
				Details: err.Error(),
			},
		})
		return
	}

	reminder, err := h.service.UpdateReminder(reminderID, userID, &req)
	if err != nil {
		log.Printf("❌ Error updating reminder: %v", err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to update reminder",
				Details: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    reminder,
		Message: "Reminder updated successfully",
	})
}

// DeleteReminder deletes a study reminder
func (h *UserHandler) DeleteReminder(c *gin.Context) {
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

	reminderID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INVALID_REMINDER_ID",
				Message: "Invalid reminder ID format",
			},
		})
		return
	}

	err = h.service.DeleteReminder(reminderID, userID)
	if err != nil {
		log.Printf("❌ Error deleting reminder: %v", err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to delete reminder",
				Details: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "Reminder deleted successfully",
	})
}

// ToggleReminder toggles the active status of a reminder
func (h *UserHandler) ToggleReminder(c *gin.Context) {
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

	reminderID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INVALID_REMINDER_ID",
				Message: "Invalid reminder ID format",
			},
		})
		return
	}

	var req struct {
		IsActive bool `json:"is_active"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INVALID_REQUEST",
				Message: "Invalid request body",
				Details: err.Error(),
			},
		})
		return
	}

	err = h.service.ToggleReminder(reminderID, userID, req.IsActive)
	if err != nil {
		log.Printf("❌ Error toggling reminder: %v", err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to toggle reminder",
				Details: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "Reminder toggled successfully",
	})
}

// ============= Leaderboard Handlers =============

// GetLeaderboard retrieves the leaderboard
func (h *UserHandler) GetLeaderboard(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "50")
	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = 50
	}

	leaderboard, err := h.service.GetLeaderboard(limit)
	if err != nil {
		log.Printf("❌ Error getting leaderboard: %v", err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to retrieve leaderboard",
				Details: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Data: gin.H{
			"leaderboard": leaderboard,
			"count":       len(leaderboard),
		},
	})
}

// GetUserRank retrieves the rank of the current user
func (h *UserHandler) GetUserRank(c *gin.Context) {
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

	rank, err := h.service.GetUserRank(userID)
	if err != nil {
		log.Printf("❌ Error getting user rank: %v", err)
		c.JSON(http.StatusNotFound, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "NOT_FOUND",
				Message: "User rank not found",
				Details: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Data:    rank,
	})
}
