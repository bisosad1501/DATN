package handlers

import (
	"log"
	"net/http"

	"github.com/bisosad1501/DATN/services/auth-service/internal/models"
	"github.com/bisosad1501/DATN/services/auth-service/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AuthHandler struct {
	authService        service.AuthService
	googleOAuthService service.GoogleOAuthService
}

func NewAuthHandler(authService service.AuthService, googleOAuthService service.GoogleOAuthService) *AuthHandler {
	return &AuthHandler{
		authService:        authService,
		googleOAuthService: googleOAuthService,
	}
}

// Register godoc
// @Summary Register a new user
// @Description Register a new user account
// @Tags auth
// @Accept json
// @Produce json
// @Param request body models.RegisterRequest true "Registration request"
// @Success 201 {object} models.AuthResponse
// @Failure 400 {object} models.ErrorResponse
// @Router /auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error: &models.ErrorData{
				Code:    "VALIDATION_ERROR",
				Message: err.Error(),
			},
		})
		return
	}

	ip := c.ClientIP()
	userAgent := c.Request.UserAgent()

	log.Printf("[Register] Request from IP: %s, Email: %s, Role: %s", ip, req.Email, req.Role)

	response, err := h.authService.Register(&req, ip, userAgent)
	if err != nil {
		log.Printf("[Register] ERROR: %v (email: %s, ip: %s)", err, req.Email, ip)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Success: false,
			Error: &models.ErrorData{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to register user. Please try again later.",
				Details: map[string]interface{}{
					"error": err.Error(),
				},
			},
		})
		return
	}

	if !response.Success {
		c.JSON(http.StatusBadRequest, response)
		return
	}

	c.JSON(http.StatusCreated, response)
}

// Login godoc
// @Summary Login
// @Description Authenticate user and get tokens
// @Tags auth
// @Accept json
// @Produce json
// @Param request body models.LoginRequest true "Login request"
// @Success 200 {object} models.AuthResponse
// @Failure 400 {object} models.ErrorResponse
// @Router /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[Login] Validation error: %v", err)
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error: &models.ErrorData{
				Code:    "VALIDATION_ERROR",
				Message: "Invalid request format",
				Details: map[string]interface{}{
					"error": err.Error(),
				},
			},
		})
		return
	}

	ip := c.ClientIP()
	userAgent := c.Request.UserAgent()

	log.Printf("[Login] Request from IP: %s, Email: %s", ip, req.Email)

	response, err := h.authService.Login(&req, ip, userAgent)
	if err != nil {
		log.Printf("[Login] ERROR: %v (email: %s, ip: %s)", err, req.Email, ip)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Success: false,
			Error: &models.ErrorData{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to login. Please try again later.",
				Details: map[string]interface{}{
					"error": err.Error(),
				},
			},
		})
		return
	}

	if !response.Success {
		log.Printf("[Login] Failed: %s (email: %s)", response.Error.Code, req.Email)
		// Determine appropriate status code based on error
		statusCode := http.StatusUnauthorized
		if response.Error.Code == "ACCOUNT_LOCKED" {
			statusCode = http.StatusLocked
		} else if response.Error.Code == "ACCOUNT_INACTIVE" {
			statusCode = http.StatusForbidden
		}
		c.JSON(statusCode, response)
		return
	}

	log.Printf("[Login] Success: email=%s", req.Email)

	c.JSON(http.StatusOK, response)
}

// RefreshToken godoc
// @Summary Refresh access token
// @Description Get a new access token using refresh token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body models.RefreshTokenRequest true "Refresh token request"
// @Success 200 {object} models.AuthResponse
// @Failure 400 {object} models.ErrorResponse
// @Router /auth/refresh [post]
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req models.RefreshTokenRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error: &models.ErrorData{
				Code:    "VALIDATION_ERROR",
				Message: err.Error(),
			},
		})
		return
	}

	ip := c.ClientIP()
	userAgent := c.Request.UserAgent()

	response, err := h.authService.RefreshToken(&req, ip, userAgent)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Success: false,
			Error: &models.ErrorData{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to refresh token",
			},
		})
		return
	}

	if !response.Success {
		c.JSON(http.StatusUnauthorized, response)
		return
	}

	c.JSON(http.StatusOK, response)
}

// Logout godoc
// @Summary Logout
// @Description Revoke refresh token
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body models.RefreshTokenRequest true "Refresh token to revoke"
// @Success 200 {object} models.SuccessResponse
// @Failure 401 {object} models.ErrorResponse
// @Router /auth/logout [post]
func (h *AuthHandler) Logout(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Success: false,
			Error: &models.ErrorData{
				Code:    "UNAUTHORIZED",
				Message: "User not authenticated",
			},
		})
		return
	}

	var req models.RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error: &models.ErrorData{
				Code:    "VALIDATION_ERROR",
				Message: err.Error(),
			},
		})
		return
	}

	userUUID, _ := uuid.Parse(userID.(string))

	if err := h.authService.Logout(userUUID, req.RefreshToken); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Success: false,
			Error: &models.ErrorData{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to logout",
			},
		})
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse{
		Success: true,
		Message: "Logged out successfully",
	})
}

// ChangePassword godoc
// @Summary Change password
// @Description Change user password
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body models.ChangePasswordRequest true "Change password request"
// @Success 200 {object} models.SuccessResponse
// @Failure 400 {object} models.ErrorResponse
// @Router /auth/change-password [post]
func (h *AuthHandler) ChangePassword(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Success: false,
			Error: &models.ErrorData{
				Code:    "UNAUTHORIZED",
				Message: "User not authenticated",
			},
		})
		return
	}

	var req models.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error: &models.ErrorData{
				Code:    "VALIDATION_ERROR",
				Message: err.Error(),
			},
		})
		return
	}

	userUUID, _ := uuid.Parse(userID.(string))

	if err := h.authService.ChangePassword(userUUID, &req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error: &models.ErrorData{
				Code:    "CHANGE_PASSWORD_FAILED",
				Message: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse{
		Success: true,
		Message: "Password changed successfully",
	})
}

// ValidateToken godoc
// @Summary Validate token
// @Description Validate access token
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.SuccessResponse
// @Failure 401 {object} models.ErrorResponse
// @Router /auth/validate [get]
func (h *AuthHandler) ValidateToken(c *gin.Context) {
	// Middleware already validated token and set user info in context
	userID, _ := c.Get("user_id")
	email, _ := c.Get("email")
	role, _ := c.Get("role")

	c.JSON(http.StatusOK, models.SuccessResponse{
		Success: true,
		Data: map[string]interface{}{
			"user_id": userID,
			"email":   email,
			"role":    role,
		},
		Message: "Token is valid",
	})
}

// HealthCheck godoc
// @Summary Health check
// @Description Check if service is running
// @Tags health
// @Produce json
// @Success 200 {object} models.SuccessResponse
// @Router /health [get]
func (h *AuthHandler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, models.SuccessResponse{
		Success: true,
		Data: map[string]interface{}{
			"status":  "healthy",
			"service": "auth-service",
		},
	})
}

// GetGoogleAuthURL godoc
// @Summary Get Google OAuth URL
// @Description Get Google OAuth authorization URL for API clients
// @Tags auth
// @Produce json
// @Success 200 {object} map[string]interface{} "OAuth URL and state"
// @Router /auth/google/url [get]
func (h *AuthHandler) GetGoogleAuthURL(c *gin.Context) {
	// Generate random state for CSRF protection
	state := uuid.New().String()

	// Get authorization URL
	url := h.googleOAuthService.GetAuthURL(state)

	// Return JSON response for API clients
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"url":   url,
			"state": state,
		},
	})
}

// GetGoogleOAuthURL godoc
// @Summary Get Google OAuth URL
// @Description Get Google OAuth authorization URL (for API clients)
// @Tags auth
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /auth/google/url [get]
func (h *AuthHandler) GetGoogleOAuthURL(c *gin.Context) {
	// Generate random state for CSRF protection
	state := uuid.New().String()

	// Store state in session or cookie (simplified here)
	c.SetCookie("oauth_state", state, 600, "/", "", false, true)

	// Get authorization URL
	url := h.googleOAuthService.GetAuthURL(state)

	// Return JSON response with URL
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"url":   url,
			"state": state,
		},
	})
}

// GoogleLogin godoc
// @Summary Initiate Google OAuth login
// @Description Redirect user to Google OAuth consent screen (for web browsers)
// @Tags auth
// @Produce json
// @Success 302 {string} string "Redirect to Google"
// @Router /auth/google [get]
func (h *AuthHandler) GoogleLogin(c *gin.Context) {
	// Generate random state for CSRF protection
	state := uuid.New().String()

	// Store state in session or cookie (simplified here)
	c.SetCookie("oauth_state", state, 600, "/", "", false, true)

	// Get authorization URL
	url := h.googleOAuthService.GetAuthURL(state)

	// Redirect to Google
	c.Redirect(http.StatusTemporaryRedirect, url)
}

// GoogleCallback godoc
// @Summary Handle Google OAuth callback
// @Description Process Google OAuth callback and authenticate user
// @Tags auth
// @Produce json
// @Param code query string true "Authorization code"
// @Param state query string true "State parameter"
// @Success 200 {object} models.AuthResponse
// @Failure 400 {object} models.ErrorResponse
// @Router /auth/google/callback [get]
func (h *AuthHandler) GoogleCallback(c *gin.Context) {
	// Verify state for CSRF protection (skip in development if cookie not found)
	state := c.Query("state")
	storedState, err := c.Cookie("oauth_state")

	// Only verify state if cookie exists (for proper OAuth flow from /auth/google)
	// Skip verification if cookie doesn't exist (for direct URL access in testing)
	if err == nil && state != storedState {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error: &models.ErrorData{
				Code:    "INVALID_STATE",
				Message: "Invalid state parameter",
			},
		})
		return
	}

	// Clear state cookie if it exists
	if err == nil {
		c.SetCookie("oauth_state", "", -1, "/", "", false, true)
	}

	// Get authorization code
	code := c.Query("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error: &models.ErrorData{
				Code:    "MISSING_CODE",
				Message: "Authorization code is required",
			},
		})
		return
	}

	// Exchange code for token
	token, err := h.googleOAuthService.ExchangeCode(code)
	if err != nil {
		log.Printf("[GoogleCallback] Failed to exchange code: %v", err)
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error: &models.ErrorData{
				Code:    "EXCHANGE_FAILED",
				Message: "Failed to exchange authorization code",
			},
		})
		return
	}

	// Get user info from Google
	googleUser, err := h.googleOAuthService.GetUserInfo(token)
	if err != nil {
		log.Printf("[GoogleCallback] Failed to get user info: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Success: false,
			Error: &models.ErrorData{
				Code:    "USER_INFO_FAILED",
				Message: "Failed to get user information from Google",
			},
		})
		return
	}

	// Authenticate or create user
	ip := c.ClientIP()
	userAgent := c.GetHeader("User-Agent")

	authResp, err := h.googleOAuthService.AuthenticateUser(googleUser, ip, userAgent)
	if err != nil {
		log.Printf("[GoogleCallback] Failed to authenticate user: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Success: false,
			Error: &models.ErrorData{
				Code:    "AUTH_FAILED",
				Message: "Failed to authenticate user",
			},
		})
		return
	}

	// Return response
	if authResp.Success {
		c.JSON(http.StatusOK, authResp)
	} else {
		// Handle specific error cases
		statusCode := http.StatusBadRequest
		if authResp.Error.Code == "ACCOUNT_INACTIVE" {
			statusCode = http.StatusForbidden
		}
		c.JSON(statusCode, authResp)
	}
}

// GoogleExchangeToken handles Google OAuth token exchange for mobile/API clients
// Mobile app flow:
// 1. Mobile gets URL from GET /auth/google/url
// 2. Mobile opens URL in WebView/Browser
// 3. User logs in with Google
// 4. Mobile captures redirect URL with code parameter
// 5. Mobile sends code to this endpoint
// 6. Backend exchanges code for tokens and returns to mobile
func (h *AuthHandler) GoogleExchangeToken(c *gin.Context) {
	var req struct {
		Code  string `json:"code" binding:"required"`
		State string `json:"state"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error: &models.ErrorData{
				Code:    "VALIDATION_ERROR",
				Message: "Code is required",
			},
		})
		return
	}

	// Exchange code for token
	token, err := h.googleOAuthService.ExchangeCode(req.Code)
	if err != nil {
		log.Printf("[GoogleExchangeToken] Failed to exchange code: %v", err)
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Error: &models.ErrorData{
				Code:    "EXCHANGE_FAILED",
				Message: "Failed to exchange authorization code. Code may be expired or invalid.",
			},
		})
		return
	}

	// Get user info from Google
	googleUser, err := h.googleOAuthService.GetUserInfo(token)
	if err != nil {
		log.Printf("[GoogleExchangeToken] Failed to get user info: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Success: false,
			Error: &models.ErrorData{
				Code:    "USER_INFO_FAILED",
				Message: "Failed to get user information from Google",
			},
		})
		return
	}

	// Authenticate or create user
	ip := c.ClientIP()
	userAgent := c.GetHeader("User-Agent")

	authResp, err := h.googleOAuthService.AuthenticateUser(googleUser, ip, userAgent)
	if err != nil {
		log.Printf("[GoogleExchangeToken] Failed to authenticate user: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Success: false,
			Error: &models.ErrorData{
				Code:    "AUTH_FAILED",
				Message: "Failed to authenticate user",
			},
		})
		return
	}

	// Return response
	if authResp.Success {
		c.JSON(http.StatusOK, authResp)
	} else {
		// Handle specific error cases
		statusCode := http.StatusBadRequest
		if authResp.Error.Code == "ACCOUNT_INACTIVE" {
			statusCode = http.StatusForbidden
		}
		c.JSON(statusCode, authResp)
	}
}
