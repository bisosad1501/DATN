package service

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"time"

	"github.com/bisosad1501/DATN/services/auth-service/internal/config"
	"github.com/bisosad1501/DATN/services/auth-service/internal/models"
	"github.com/bisosad1501/DATN/services/auth-service/internal/repository"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type GoogleOAuthService interface {
	GetAuthURL(state string) string
	ExchangeCode(code string) (*oauth2.Token, error)
	GetUserInfo(token *oauth2.Token) (*GoogleUserInfo, error)
	AuthenticateUser(googleUser *GoogleUserInfo, ip, userAgent string) (*models.AuthResponse, error)
}

type googleOAuthService struct {
	config      *oauth2.Config
	userRepo    repository.UserRepository
	roleRepo    repository.RoleRepository
	tokenRepo   repository.TokenRepository
	auditRepo   repository.AuditLogRepository
	authService AuthService
	appConfig   *config.Config
}

type GoogleUserInfo struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Picture       string `json:"picture"`
	Locale        string `json:"locale"`
}

func NewGoogleOAuthService(
	cfg *config.Config,
	userRepo repository.UserRepository,
	roleRepo repository.RoleRepository,
	tokenRepo repository.TokenRepository,
	auditRepo repository.AuditLogRepository,
	authService AuthService,
) GoogleOAuthService {
	oauthConfig := &oauth2.Config{
		ClientID:     cfg.GoogleClientID,
		ClientSecret: cfg.GoogleClientSecret,
		RedirectURL:  cfg.GoogleRedirectURL,
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}

	return &googleOAuthService{
		config:      oauthConfig,
		userRepo:    userRepo,
		roleRepo:    roleRepo,
		tokenRepo:   tokenRepo,
		auditRepo:   auditRepo,
		authService: authService,
		appConfig:   cfg,
	}
}

func (s *googleOAuthService) GetAuthURL(state string) string {
	return s.config.AuthCodeURL(state, oauth2.AccessTypeOffline)
}

func (s *googleOAuthService) ExchangeCode(code string) (*oauth2.Token, error) {
	token, err := s.config.Exchange(context.Background(), code)
	if err != nil {
		return nil, fmt.Errorf("failed to exchange code: %w", err)
	}
	return token, nil
}

func (s *googleOAuthService) GetUserInfo(token *oauth2.Token) (*GoogleUserInfo, error) {
	client := s.config.Client(context.Background(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		return nil, fmt.Errorf("failed to get user info: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	var userInfo GoogleUserInfo
	if err := json.Unmarshal(body, &userInfo); err != nil {
		return nil, fmt.Errorf("failed to parse user info: %w", err)
	}

	return &userInfo, nil
}

func (s *googleOAuthService) AuthenticateUser(googleUser *GoogleUserInfo, ip, userAgent string) (*models.AuthResponse, error) {
	// Find or create user by Google ID
	log.Printf("[AuthenticateUser] Finding/creating user for Google ID: %s, Email: %s", googleUser.ID, googleUser.Email)
	user, err := s.userRepo.FindOrCreateByGoogleID(googleUser.ID, googleUser.Email, googleUser.Name)
	if err != nil {
		log.Printf("[AuthenticateUser] ❌ Failed to find/create user: %v", err)
		ipPtr := &ip
		uaPtr := &userAgent
		errMsg := fmt.Sprintf("Failed to find/create user: %v", err)
		s.auditRepo.Create(&models.AuditLog{
			EventType:    "google_login",
			EventStatus:  "failed",
			IPAddress:    ipPtr,
			UserAgent:    uaPtr,
			ErrorMessage: &errMsg,
		})
		return &models.AuthResponse{
			Success: false,
			Error: &models.ErrorData{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to process Google login",
			},
		}, nil
	}
	log.Printf("[AuthenticateUser] ✅ Found/created user: ID=%s, Email=%s, IsActive=%v", user.ID, user.Email, user.IsActive)

	// Check if account is active
	if !user.IsActive {
		ipPtr := &ip
		uaPtr := &userAgent
		errMsg := "account is not active"
		s.auditRepo.Create(&models.AuditLog{
			UserID:       &user.ID,
			EventType:    "google_login",
			EventStatus:  "failed",
			IPAddress:    ipPtr,
			UserAgent:    uaPtr,
			ErrorMessage: &errMsg,
		})
		return &models.AuthResponse{
			Success: false,
			Error: &models.ErrorData{
				Code:    "ACCOUNT_INACTIVE",
				Message: "Account is not active",
			},
		}, nil
	}

	// Get user role
	roles, err := s.roleRepo.FindByUserID(user.ID)
	var role *models.Role
	if err != nil || len(roles) == 0 {
		// Assign default student role for new Google users
		studentRole, err := s.roleRepo.FindByName("student")
		if err != nil {
			return nil, fmt.Errorf("failed to get default role: %w", err)
		}
		if err := s.roleRepo.AssignRoleToUser(user.ID, studentRole.ID, nil); err != nil {
			return nil, fmt.Errorf("failed to assign role: %w", err)
		}
		role = studentRole
	} else {
		role = &roles[0]
	}

	// Generate JWT access token
	expiryDuration, _ := time.ParseDuration(s.appConfig.JWTExpiry)
	expiresAt := time.Now().Add(expiryDuration)

	claims := TokenClaims{
		UserID: user.ID.String(),
		Email:  user.Email,
		Role:   role.Name,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	accessToken, err := token.SignedString([]byte(s.appConfig.JWTSecret))
	if err != nil {
		return nil, fmt.Errorf("failed to sign token: %w", err)
	}

	// Create refresh token
	refreshTokenStr := uuid.New().String()
	refreshTokenHash := hashToken(refreshTokenStr)

	refreshExpiryDuration, _ := time.ParseDuration(s.appConfig.RefreshTokenExpiry)
	refreshExpiresAt := time.Now().Add(refreshExpiryDuration)

	ipPtr := &ip
	uaPtr := &userAgent
	refreshToken := &models.RefreshToken{
		UserID:    user.ID,
		TokenHash: refreshTokenHash,
		ExpiresAt: refreshExpiresAt,
		IPAddress: ipPtr,
		UserAgent: uaPtr,
	}

	if err := s.tokenRepo.CreateRefreshToken(refreshToken); err != nil {
		return nil, fmt.Errorf("failed to create refresh token: %w", err)
	}

	// Update login info
	if err := s.userRepo.UpdateLoginInfo(user.ID, ip); err != nil {
		// Log but don't fail
		fmt.Printf("Failed to update login info: %v\n", err)
	}

	// Reset failed attempts
	if err := s.userRepo.ResetFailedAttempts(user.ID); err != nil {
		fmt.Printf("Failed to reset failed attempts: %v\n", err)
	}

	// Audit log
	s.auditRepo.Create(&models.AuditLog{
		UserID:      &user.ID,
		EventType:   "google_login",
		EventStatus: "success",
		IPAddress:   ipPtr,
		UserAgent:   uaPtr,
	})

	return &models.AuthResponse{
		Success: true,
		Data: &models.AuthData{
			UserID:       user.ID.String(),
			Email:        user.Email,
			Role:         role.Name,
			AccessToken:  accessToken,
			RefreshToken: refreshTokenStr,
			ExpiresIn:    int64(expiryDuration.Seconds()),
		},
	}, nil
}

// Helper function
func hashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}
