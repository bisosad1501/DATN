package client

import (
	"encoding/json"
	"fmt"
	"time"
)

// UserServiceClient handles communication with User Service
type UserServiceClient struct {
	*ServiceClient
}

// NewUserServiceClient creates a new user service client
func NewUserServiceClient(baseURL, apiKey string) *UserServiceClient {
	return &UserServiceClient{
		ServiceClient: NewServiceClient(baseURL, apiKey),
	}
}

// CreateProfileRequest represents profile creation request
type CreateProfileRequest struct {
	UserID    string `json:"user_id"`
	Email     string `json:"email"`
	Role      string `json:"role"`
	FirstName string `json:"first_name,omitempty"`
	LastName  string `json:"last_name,omitempty"`
	FullName  string `json:"full_name,omitempty"`
}

// UpdateProgressRequest represents progress update request
type UpdateProgressRequest struct {
	UserID            string  `json:"user_id"`
	LessonsCompleted  int     `json:"lessons_completed,omitempty"`
	ExercisesComplete int     `json:"exercises_completed,omitempty"`
	StudyMinutes      int     `json:"study_minutes,omitempty"`
	SkillType         string  `json:"skill_type,omitempty"` // listening, reading, writing, speaking
	SessionType       string  `json:"session_type"`         // lesson, exercise, practice_test
	ResourceID        string  `json:"resource_id,omitempty"`
	ResourceType      string  `json:"resource_type,omitempty"`
	Score             float64 `json:"score,omitempty"`
}

// UpdateSkillStatsRequest represents skill statistics update request
type UpdateSkillStatsRequest struct {
	UserID         string  `json:"user_id"`
	SkillType      string  `json:"skill_type"` // listening, reading, writing, speaking
	Score          float64 `json:"score"`
	TimeMinutes    int     `json:"time_minutes"`
	IsCompleted    bool    `json:"is_completed"`
	TotalPractices int     `json:"total_practices,omitempty"`
}

// StandardResponse represents standard API response
type StandardResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// CreateProfile creates a user profile in User Service
func (c *UserServiceClient) CreateProfile(req CreateProfileRequest) error {
	endpoint := "/api/v1/user/internal/profile/create"

	err := c.PostWithRetry(endpoint, req, 3)
	if err != nil {
		return fmt.Errorf("create profile: %w", err)
	}

	return nil
}

// UpdateProgress updates user learning progress
func (c *UserServiceClient) UpdateProgress(req UpdateProgressRequest) error {
	endpoint := "/api/v1/user/internal/progress/update"

	err := c.PutWithRetry(endpoint, req, 3)
	if err != nil {
		return fmt.Errorf("update progress: %w", err)
	}

	return nil
}

// UpdateSkillStatistics updates skill-specific statistics
func (c *UserServiceClient) UpdateSkillStatistics(req UpdateSkillStatsRequest) error {
	endpoint := fmt.Sprintf("/api/v1/user/internal/statistics/%s/update", req.SkillType)

	err := c.PutWithRetry(endpoint, req, 3)
	if err != nil {
		return fmt.Errorf("update skill statistics: %w", err)
	}

	return nil
}

// StartStudySession creates a study session
func (c *UserServiceClient) StartStudySession(userID, sessionType, skillType, resourceID, resourceType string) (string, error) {
	endpoint := "/api/v1/user/internal/session/start"

	payload := map[string]interface{}{
		"user_id":       userID,
		"session_type":  sessionType,
		"skill_type":    skillType,
		"resource_id":   resourceID,
		"resource_type": resourceType,
		"started_at":    time.Now(),
	}

	resp, err := c.Post(endpoint, payload)
	if err != nil {
		return "", fmt.Errorf("start session: %w", err)
	}
	defer resp.Body.Close()

	var result struct {
		Success bool `json:"success"`
		Data    struct {
			SessionID string `json:"session_id"`
		} `json:"data"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("decode response: %w", err)
	}

	return result.Data.SessionID, nil
}

// EndStudySession ends a study session
func (c *UserServiceClient) EndStudySession(sessionID string, score float64, completed bool) error {
	endpoint := fmt.Sprintf("/api/v1/user/internal/session/%s/end", sessionID)

	payload := map[string]interface{}{
		"ended_at":     time.Now(),
		"is_completed": completed,
		"score":        score,
	}

	err := c.PutWithRetry(endpoint, payload, 3)
	if err != nil {
		return fmt.Errorf("end session: %w", err)
	}

	return nil
}

// RecordCompletedSession records a completed study session with custom duration
// This is used for tracking activity that already happened (e.g., video watching progress)
func (c *UserServiceClient) RecordCompletedSession(userID, sessionType, skillType, resourceID, resourceType string, durationMinutes int) error {
	endpoint := "/api/v1/user/internal/session/record"

	payload := map[string]interface{}{
		"user_id":          userID,
		"session_type":     sessionType,
		"skill_type":       skillType,
		"resource_id":      resourceID,
		"resource_type":    resourceType,
		"duration_minutes": durationMinutes,
		"is_completed":     false, // For video watching, we track progress not completion
	}

	err := c.PostWithRetry(endpoint, payload, 3)
	if err != nil {
		return fmt.Errorf("record completed session: %w", err)
	}

	return nil
}
