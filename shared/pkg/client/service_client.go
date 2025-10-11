package client

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// ServiceClient is a reusable HTTP client for service-to-service communication
type ServiceClient struct {
	baseURL    string
	apiKey     string
	httpClient *http.Client
}

// NewServiceClient creates a new service client
func NewServiceClient(baseURL, apiKey string) *ServiceClient {
	return &ServiceClient{
		baseURL: baseURL,
		apiKey:  apiKey,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
			Transport: &http.Transport{
				MaxIdleConns:        100,
				MaxIdleConnsPerHost: 10,
				IdleConnTimeout:     90 * time.Second,
			},
		},
	}
}

// Post sends a POST request
func (c *ServiceClient) Post(endpoint string, payload interface{}) (*http.Response, error) {
	return c.doRequest("POST", endpoint, payload)
}

// Put sends a PUT request
func (c *ServiceClient) Put(endpoint string, payload interface{}) (*http.Response, error) {
	return c.doRequest("PUT", endpoint, payload)
}

// Get sends a GET request
func (c *ServiceClient) Get(endpoint string) (*http.Response, error) {
	return c.doRequest("GET", endpoint, nil)
}

// Delete sends a DELETE request
func (c *ServiceClient) Delete(endpoint string) (*http.Response, error) {
	return c.doRequest("DELETE", endpoint, nil)
}

// doRequest executes the HTTP request with internal authentication
func (c *ServiceClient) doRequest(method, endpoint string, payload interface{}) (*http.Response, error) {
	var body io.Reader
	if payload != nil {
		jsonData, err := json.Marshal(payload)
		if err != nil {
			return nil, fmt.Errorf("marshal payload: %w", err)
		}
		body = bytes.NewBuffer(jsonData)
	}

	req, err := http.NewRequest(method, c.baseURL+endpoint, body)
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Internal-API-Key", c.apiKey)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("do request: %w", err)
	}

	return resp, nil
}

// PostWithRetry sends a POST request with retry logic
func (c *ServiceClient) PostWithRetry(endpoint string, payload interface{}, maxRetries int) error {
	var lastErr error

	for i := 0; i < maxRetries; i++ {
		resp, err := c.Post(endpoint, payload)
		if err == nil {
			defer resp.Body.Close()
			if resp.StatusCode >= 200 && resp.StatusCode < 300 {
				return nil
			}
			if resp.StatusCode < 500 {
				// Client error, don't retry
				body, _ := io.ReadAll(resp.Body)
				return fmt.Errorf("request failed with status %d: %s", resp.StatusCode, string(body))
			}
			lastErr = fmt.Errorf("server error: %d", resp.StatusCode)
		} else {
			lastErr = err
		}

		if i < maxRetries-1 {
			// Exponential backoff
			time.Sleep(time.Duration(i+1) * 100 * time.Millisecond)
		}
	}

	return fmt.Errorf("max retries exceeded: %w", lastErr)
}

// PutWithRetry sends a PUT request with retry logic
func (c *ServiceClient) PutWithRetry(endpoint string, payload interface{}, maxRetries int) error {
	var lastErr error

	for i := 0; i < maxRetries; i++ {
		resp, err := c.Put(endpoint, payload)
		if err == nil {
			defer resp.Body.Close()
			if resp.StatusCode >= 200 && resp.StatusCode < 300 {
				return nil
			}
			if resp.StatusCode < 500 {
				body, _ := io.ReadAll(resp.Body)
				return fmt.Errorf("request failed with status %d: %s", resp.StatusCode, string(body))
			}
			lastErr = fmt.Errorf("server error: %d", resp.StatusCode)
		} else {
			lastErr = err
		}

		if i < maxRetries-1 {
			time.Sleep(time.Duration(i+1) * 100 * time.Millisecond)
		}
	}

	return fmt.Errorf("max retries exceeded: %w", lastErr)
}

// DecodeResponse decodes JSON response into target struct
func DecodeResponse(resp *http.Response, target interface{}) error {
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("request failed with status %d: %s", resp.StatusCode, string(body))
	}

	if err := json.NewDecoder(resp.Body).Decode(target); err != nil {
		return fmt.Errorf("decode response: %w", err)
	}

	return nil
}
