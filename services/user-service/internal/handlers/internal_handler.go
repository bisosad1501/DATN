package handlers

import (
	"log"
	"net/http"
	"time"

	"github.com/bisosad1501/DATN/services/user-service/internal/models"
	"github.com/bisosad1501/DATN/services/user-service/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// InternalHandler handles internal service-to-service API calls
type InternalHandler struct {
	userService *service.UserService
}

// NewInternalHandler creates a new internal handler
func NewInternalHandler(userService *service.UserService) *InternalHandler {
	return &InternalHandler{
		userService: userService,
	}
}

// CreateProfileInternal creates a user profile (called by Auth Service after registration)
func (h *InternalHandler) CreateProfileInternal(c *gin.Context) {
	var req struct {
		UserID          string  `json:"user_id" binding:"required"`
		Email           string  `json:"email" binding:"required"`
		Role            string  `json:"role" binding:"required"`
		FirstName       string  `json:"first_name"`
		LastName        string  `json:"last_name"`
		FullName        string  `json:"full_name"`
		TargetBandScore float64 `json:"target_band_score"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INVALID_REQUEST",
				Message: "Invalid request payload",
				Details: err.Error(),
			},
		})
		return
	}

	// Parse user ID
	userID, err := uuid.Parse(req.UserID)
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

	// Create profile with full name and target band score
	err = h.userService.CreateProfileWithData(userID, req.FullName, req.TargetBandScore)
	if err != nil {
		log.Printf("❌ Failed to create profile for user %s: %v", req.UserID, err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "PROFILE_CREATION_FAILED",
				Message: "Failed to create user profile",
				Details: err.Error(),
			},
		})
		return
	}

	log.Printf("✅ Profile created for user %s (email: %s, role: %s, fullName: %s)", req.UserID, req.Email, req.Role, req.FullName)

	c.JSON(http.StatusCreated, models.Response{
		Success: true,
		Message: "Profile created successfully",
		Data: map[string]interface{}{
			"user_id": req.UserID,
		},
	})
}

// UpdateProgressInternal updates user learning progress (called by Course/Exercise services)
func (h *InternalHandler) UpdateProgressInternal(c *gin.Context) {
	var req struct {
		UserID            string  `json:"user_id" binding:"required"`
		LessonsCompleted  int     `json:"lessons_completed"`
		ExercisesComplete int     `json:"exercises_completed"`
		StudyMinutes      int     `json:"study_minutes"`
		SkillType         string  `json:"skill_type"`
		SessionType       string  `json:"session_type"`
		ResourceID        string  `json:"resource_id"`
		ResourceType      string  `json:"resource_type"`
		Score             float64 `json:"score"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INVALID_REQUEST",
				Message: "Invalid request payload",
				Details: err.Error(),
			},
		})
		return
	}

	userID, err := uuid.Parse(req.UserID)
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

	// Update progress
	updates := map[string]interface{}{}
	if req.LessonsCompleted > 0 {
		updates["lessons_completed"] = req.LessonsCompleted
	}
	if req.ExercisesComplete > 0 {
		updates["exercises_completed"] = req.ExercisesComplete
	}
	if req.StudyMinutes > 0 {
		updates["study_minutes"] = req.StudyMinutes
	}

	if err := h.userService.UpdateProgress(userID, updates); err != nil {
		log.Printf("❌ Failed to update progress for user %s: %v", req.UserID, err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "UPDATE_FAILED",
				Message: "Failed to update progress",
				Details: err.Error(),
			},
		})
		return
	}

	// Create study session record if session info provided
	// Note: We create session even if StudyMinutes = 0 (e.g., quick completion or tests)
	if req.SessionType != "" {
		var resourceIDPtr *uuid.UUID
		if req.ResourceID != "" {
			if resID, err := uuid.Parse(req.ResourceID); err == nil {
				resourceIDPtr = &resID
			}
		}

		var skillTypePtr *string
		if req.SkillType != "" {
			skillTypePtr = &req.SkillType
		}

		now := time.Now()

		// Use at least 1 minute if StudyMinutes is 0 (for quick completions)
		durationMinutes := req.StudyMinutes
		if durationMinutes == 0 {
			durationMinutes = 1
		}

		session := &models.StudySession{
			ID:              uuid.New(),
			UserID:          userID,
			SessionType:     req.SessionType,
			SkillType:       skillTypePtr,
			ResourceID:      resourceIDPtr,
			StartedAt:       now,
			EndedAt:         &now,
			DurationMinutes: &durationMinutes,
			IsCompleted:     true,
		}

		if req.Score > 0 {
			session.Score = &req.Score
		}

		if err := h.userService.RecordCompletedSession(session); err != nil {
			log.Printf("⚠️ Failed to create study session for user %s: %v", req.UserID, err)
			// Don't fail the request, just log the error
		} else {
			log.Printf("✅ Study session created for user %s: type=%s, skill=%s, duration=%d min, score=%.2f",
				req.UserID, req.SessionType, req.SkillType, durationMinutes, req.Score)
		}
	}

	log.Printf("✅ Progress updated for user %s: lessons=%d, exercises=%d, minutes=%d",
		req.UserID, req.LessonsCompleted, req.ExercisesComplete, req.StudyMinutes)

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "Progress updated successfully",
	})
}

// UpdateSkillStatisticsInternal updates skill-specific statistics
func (h *InternalHandler) UpdateSkillStatisticsInternal(c *gin.Context) {
	skillType := c.Param("skill")

	var req struct {
		UserID         string  `json:"user_id" binding:"required"`
		Score          float64 `json:"score" binding:"required"`
		TimeMinutes    int     `json:"time_minutes"`
		IsCompleted    bool    `json:"is_completed"`
		TotalPractices int     `json:"total_practices"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INVALID_REQUEST",
				Message: "Invalid request payload",
				Details: err.Error(),
			},
		})
		return
	}

	userID, err := uuid.Parse(req.UserID)
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

	// Validate skill type
	validSkills := map[string]bool{"listening": true, "reading": true, "writing": true, "speaking": true}
	if !validSkills[skillType] {
		c.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INVALID_SKILL_TYPE",
				Message: "Skill type must be one of: listening, reading, writing, speaking",
			},
		})
		return
	}

	// Update skill statistics
	updates := map[string]interface{}{
		"score":        req.Score,
		"time_minutes": req.TimeMinutes,
		"is_completed": req.IsCompleted,
	}
	if req.TotalPractices > 0 {
		updates["total_practices"] = req.TotalPractices
	}

	if err := h.userService.UpdateSkillStatistics(userID, skillType, updates); err != nil {
		log.Printf("❌ Failed to update %s statistics for user %s: %v", skillType, req.UserID, err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "UPDATE_FAILED",
				Message: "Failed to update skill statistics",
				Details: err.Error(),
			},
		})
		return
	}

	log.Printf("✅ %s statistics updated for user %s: score=%.2f, time=%d min",
		skillType, req.UserID, req.Score, req.TimeMinutes)

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "Skill statistics updated successfully",
	})
}

// StartSessionInternal starts a study session
func (h *InternalHandler) StartSessionInternal(c *gin.Context) {
	var req struct {
		UserID       string `json:"user_id" binding:"required"`
		SessionType  string `json:"session_type" binding:"required"`
		SkillType    string `json:"skill_type"`
		ResourceID   string `json:"resource_id"`
		ResourceType string `json:"resource_type"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INVALID_REQUEST",
				Message: "Invalid request payload",
				Details: err.Error(),
			},
		})
		return
	}

	userID, err := uuid.Parse(req.UserID)
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

	var resourceID *uuid.UUID
	if req.ResourceID != "" {
		id, err := uuid.Parse(req.ResourceID)
		if err == nil {
			resourceID = &id
		}
	}

	var skillType *string
	if req.SkillType != "" {
		skillType = &req.SkillType
	}

	var resourceType *string
	if req.ResourceType != "" {
		resourceType = &req.ResourceType
	}

	session := &models.StudySession{
		UserID:       userID,
		SessionType:  req.SessionType,
		SkillType:    skillType,
		ResourceID:   resourceID,
		ResourceType: resourceType,
	}

	sessionID, err := h.userService.StartSession(session)
	if err != nil {
		log.Printf("❌ Failed to start session for user %s: %v", req.UserID, err)
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

	log.Printf("✅ Session started for user %s: type=%s, session_id=%s", req.UserID, req.SessionType, sessionID)

	c.JSON(http.StatusCreated, models.Response{
		Success: true,
		Message: "Study session started",
		Data: map[string]interface{}{
			"session_id": sessionID.String(),
		},
	})
}

// EndSessionInternal ends a study session
func (h *InternalHandler) EndSessionInternal(c *gin.Context) {
	sessionID := c.Param("session_id")

	var req struct {
		IsCompleted bool    `json:"is_completed"`
		Score       float64 `json:"score"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INVALID_REQUEST",
				Message: "Invalid request payload",
				Details: err.Error(),
			},
		})
		return
	}

	id, err := uuid.Parse(sessionID)
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

	if err := h.userService.EndSession(id, req.IsCompleted, req.Score); err != nil {
		log.Printf("❌ Failed to end session %s: %v", sessionID, err)
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

	log.Printf("✅ Session ended: session_id=%s, completed=%v, score=%.2f", sessionID, req.IsCompleted, req.Score)

	c.JSON(http.StatusOK, models.Response{
		Success: true,
		Message: "Study session ended successfully",
	})
}

// RecordCompletedSessionInternal records a completed study session with custom duration
// This is used for tracking activity that already happened (e.g., video watching progress)
func (h *InternalHandler) RecordCompletedSessionInternal(c *gin.Context) {
	var req struct {
		UserID          string  `json:"user_id" binding:"required"`
		SessionType     string  `json:"session_type" binding:"required"`
		SkillType       string  `json:"skill_type"`
		ResourceID      string  `json:"resource_id"`
		ResourceType    string  `json:"resource_type"`
		DurationMinutes int     `json:"duration_minutes" binding:"required,min=1"`
		Score           float64 `json:"score"`
		IsCompleted     bool    `json:"is_completed"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INVALID_REQUEST",
				Message: "Invalid request payload",
				Details: err.Error(),
			},
		})
		return
	}

	userID, err := uuid.Parse(req.UserID)
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

	var resourceID *uuid.UUID
	if req.ResourceID != "" {
		id, err := uuid.Parse(req.ResourceID)
		if err == nil {
			resourceID = &id
		}
	}

	var skillType *string
	if req.SkillType != "" {
		skillType = &req.SkillType
	}

	var resourceType *string
	if req.ResourceType != "" {
		resourceType = &req.ResourceType
	}

	// Create session with custom start time based on duration
	now := time.Now()
	startedAt := now.Add(-time.Duration(req.DurationMinutes) * time.Minute)

	session := &models.StudySession{
		ID:              uuid.New(),
		UserID:          userID,
		SessionType:     req.SessionType,
		SkillType:       skillType,
		ResourceID:      resourceID,
		ResourceType:    resourceType,
		StartedAt:       startedAt,
		EndedAt:         &now,
		DurationMinutes: &req.DurationMinutes,
		IsCompleted:     req.IsCompleted,
		Score:           &req.Score,
	}

	if err := h.userService.RecordCompletedSession(session); err != nil {
		log.Printf("❌ Failed to record completed session for user %s: %v", req.UserID, err)
		c.JSON(http.StatusInternalServerError, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "SESSION_RECORD_FAILED",
				Message: "Failed to record completed session",
				Details: err.Error(),
			},
		})
		return
	}

	log.Printf("✅ Recorded completed session for user %s: type=%s, duration=%dm, skill=%s", 
		req.UserID, req.SessionType, req.DurationMinutes, req.SkillType)

	c.JSON(http.StatusCreated, models.Response{
		Success: true,
		Message: "Completed session recorded successfully",
	})
}
