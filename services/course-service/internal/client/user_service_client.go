package client

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

type UserServiceClient struct {
	baseURL       string
	internalKey   string
	httpClient    *http.Client
}

type StartSessionRequest struct {
	UserID       string `json:"user_id"`
	SessionType  string `json:"session_type"`
	SkillType    string `json:"skill_type,omitempty"`
	ResourceID   string `json:"resource_id,omitempty"`
	ResourceType string `json:"resource_type,omitempty"`
}

type EndSessionRequest struct {
	SessionID            string   `json:"session_id"`
	CompletionPercentage *float64 `json:"completion_percentage,omitempty"`
	Score                *float64 `json:"score,omitempty"`
}

type UserServiceResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   *ErrorInfo  `json:"error,omitempty"`
}

type ErrorInfo struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Details string `json:"details,omitempty"`
}

func NewUserServiceClient(baseURL, internalKey string) *UserServiceClient {
	return &UserServiceClient{
		baseURL:     baseURL,
		internalKey: internalKey,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// StartSession calls User Service to start a study session
func (c *UserServiceClient) StartSession(req *StartSessionRequest) error {
	url := fmt.Sprintf("%s/api/v1/user/internal/session/start", c.baseURL)
	
	jsonData, err := json.Marshal(req)
	if err != nil {
		return fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("X-Internal-Key", c.internalKey)

	log.Printf("[User Service Client] 📤 Starting session for user %s, type: %s", req.UserID, req.SessionType)

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		log.Printf("[User Service Client] ❌ Request failed: %v", err)
		return fmt.Errorf("failed to call user service: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		var errResp UserServiceResponse
		if err := json.NewDecoder(resp.Body).Decode(&errResp); err == nil && errResp.Error != nil {
			log.Printf("[User Service Client] ❌ API error: %s - %s", errResp.Error.Code, errResp.Error.Message)
			return fmt.Errorf("user service error: %s", errResp.Error.Message)
		}
		return fmt.Errorf("user service returned status %d", resp.StatusCode)
	}

	log.Printf("[User Service Client] ✅ Session started successfully")
	return nil
}

// EndSession calls User Service to end a study session
func (c *UserServiceClient) EndSession(req *EndSessionRequest) error {
	url := fmt.Sprintf("%s/api/v1/user/internal/session/%s/end", c.baseURL, req.SessionID)
	
	jsonData, err := json.Marshal(req)
	if err != nil {
		return fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequest("PUT", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("X-Internal-Key", c.internalKey)

	log.Printf("[User Service Client] 📤 Ending session %s", req.SessionID)

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		log.Printf("[User Service Client] ❌ Request failed: %v", err)
		return fmt.Errorf("failed to call user service: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var errResp UserServiceResponse
		if err := json.NewDecoder(resp.Body).Decode(&errResp); err == nil && errResp.Error != nil {
			log.Printf("[User Service Client] ❌ API error: %s - %s", errResp.Error.Code, errResp.Error.Message)
			return fmt.Errorf("user service error: %s", errResp.Error.Message)
		}
		return fmt.Errorf("user service returned status %d", resp.StatusCode)
	}

	log.Printf("[User Service Client] ✅ Session ended successfully")
	return nil
}


