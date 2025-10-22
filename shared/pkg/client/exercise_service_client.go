package client

import (
	"encoding/json"
	"fmt"
	"io"
)

// ExerciseServiceClient handles communication with Exercise Service
type ExerciseServiceClient struct {
	*ServiceClient
}

// NewExerciseServiceClient creates a new exercise service client
func NewExerciseServiceClient(baseURL, apiKey string) *ExerciseServiceClient {
	return &ExerciseServiceClient{
		ServiceClient: NewServiceClient(baseURL, apiKey),
	}
}

// ExerciseSummary represents a summary of an exercise
type ExerciseSummary struct {
	ID             string   `json:"id"`
	Title          string   `json:"title"`
	Slug           string   `json:"slug"`
	Description    *string  `json:"description,omitempty"`
	ExerciseType   string   `json:"exercise_type"`
	SkillType      string   `json:"skill_type"`
	Difficulty     string   `json:"difficulty"`
	TotalQuestions int      `json:"total_questions"`
	TotalSections  int      `json:"total_sections"`
	TimeLimitMins  *int     `json:"time_limit_minutes,omitempty"`
	PassingScore   *float64 `json:"passing_score,omitempty"`
	DisplayOrder   int      `json:"display_order"`
}

// GetExercisesByModuleID retrieves exercises for a specific module
func (c *ExerciseServiceClient) GetExercisesByModuleID(moduleID string) ([]ExerciseSummary, error) {
	endpoint := fmt.Sprintf("/api/v1/exercises?module_id=%s", moduleID)

	resp, err := c.Get(endpoint)
	if err != nil {
		return nil, fmt.Errorf("get exercises by module: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("get exercises failed with status %d: %s", resp.StatusCode, string(body))
	}

	// Parse response
	var result struct {
		Success bool `json:"success"`
		Data    struct {
			Exercises []ExerciseSummary `json:"exercises"`
		} `json:"data"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("decode response: %w", err)
	}

	if !result.Success {
		return nil, fmt.Errorf("exercise service returned success=false")
	}

	return result.Data.Exercises, nil
}

// GetExercisesByCourseID retrieves exercises for a specific course
func (c *ExerciseServiceClient) GetExercisesByCourseID(courseID string) ([]ExerciseSummary, error) {
	endpoint := fmt.Sprintf("/api/v1/exercises?course_id=%s", courseID)

	resp, err := c.Get(endpoint)
	if err != nil {
		return nil, fmt.Errorf("get exercises by course: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("get exercises failed with status %d: %s", resp.StatusCode, string(body))
	}

	// Parse response
	var result struct {
		Success bool `json:"success"`
		Data    struct {
			Exercises []ExerciseSummary `json:"exercises"`
		} `json:"data"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("decode response: %w", err)
	}

	if !result.Success {
		return nil, fmt.Errorf("exercise service returned success=false")
	}

	return result.Data.Exercises, nil
}

