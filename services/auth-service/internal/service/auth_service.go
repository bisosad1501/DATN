package service

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/bisosad1501/DATN/services/auth-service/internal/config"
	"github.com/bisosad1501/DATN/services/auth-service/internal/models"
	"github.com/bisosad1501/DATN/services/auth-service/internal/repository"
	"github.com/go-redis/redis/v8"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AuthService interface {
	Register(req *models.RegisterRequest, ip, userAgent string) (*models.AuthResponse, error)
	Login(req *models.LoginRequest, ip, userAgent string) (*models.AuthResponse, error)
	RefreshToken(req *models.RefreshTokenRequest, ip, userAgent string) (*models.AuthResponse, error)
	Logout(userID uuid.UUID, refreshToken string) error
	ChangePassword(userID uuid.UUID, req *models.ChangePasswordRequest) error
	ValidateToken(tokenString string) (*TokenClaims, error)

	// Password reset
	ForgotPassword(req *models.ForgotPasswordRequest, ip string) error
	ResetPassword(req *models.ResetPasswordRequest, ip string) error

	// Email verification
	VerifyEmail(token string) error
	VerifyEmailByCode(code string) error
	ResendVerification(email string) error

	// Reset password with code
	ResetPasswordByCode(code, newPassword, ip string) error
}

type authService struct {
	userRepo              repository.UserRepository
	roleRepo              repository.RoleRepository
	tokenRepo             repository.TokenRepository
	auditRepo             repository.AuditLogRepository
	passwordResetRepo     repository.PasswordResetRepository
	emailVerificationRepo repository.EmailVerificationRepository
	emailService          EmailService
	redisClient           *redis.Client
	config                *config.Config
}

type TokenClaims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

func NewAuthService(
	userRepo repository.UserRepository,
	roleRepo repository.RoleRepository,
	tokenRepo repository.TokenRepository,
	auditRepo repository.AuditLogRepository,
	passwordResetRepo repository.PasswordResetRepository,
	emailVerificationRepo repository.EmailVerificationRepository,
	emailService EmailService,
	redisClient *redis.Client,
	config *config.Config,
) AuthService {
	return &authService{
		userRepo:              userRepo,
		roleRepo:              roleRepo,
		tokenRepo:             tokenRepo,
		auditRepo:             auditRepo,
		passwordResetRepo:     passwordResetRepo,
		emailVerificationRepo: emailVerificationRepo,
		emailService:          emailService,
		redisClient:           redisClient,
		config:                config,
	}
}

func (s *authService) Register(req *models.RegisterRequest, ip, userAgent string) (*models.AuthResponse, error) {
	// Validate email format
	if !isValidEmail(req.Email) {
		s.logAudit(nil, "register", "failed", ip, userAgent, "invalid email format")
		return &models.AuthResponse{
			Success: false,
			Error: &models.ErrorData{
				Code:    "INVALID_EMAIL",
				Message: "Invalid email format",
			},
		}, nil
	}

	// Check if user already exists
	existingUser, err := s.userRepo.FindByEmail(req.Email)
	if err != nil && err.Error() != "user not found" {
		s.logAudit(nil, "register", "failed", ip, userAgent, fmt.Sprintf("database error: %v", err))
		return nil, fmt.Errorf("failed to check existing user: %w", err)
	}

	if existingUser != nil {
		s.logAudit(nil, "register", "failed", ip, userAgent, "email already exists")
		return &models.AuthResponse{
			Success: false,
			Error: &models.ErrorData{
				Code:    "EMAIL_EXISTS",
				Message: "Email already registered",
			},
		}, nil
	}

	// Validate password strength
	if len(req.Password) < 8 {
		s.logAudit(nil, "register", "failed", ip, userAgent, "password too short")
		return &models.AuthResponse{
			Success: false,
			Error: &models.ErrorData{
				Code:    "WEAK_PASSWORD",
				Message: "Password must be at least 8 characters long",
			},
		}, nil
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), s.config.BcryptRounds)
	if err != nil {
		s.logAudit(nil, "register", "failed", ip, userAgent, fmt.Sprintf("bcrypt error: %v", err))
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Create user
	user := &models.User{
		Email:    req.Email,
		Password: string(hashedPassword),
	}

	if req.Phone != "" {
		user.Phone = &req.Phone
	}

	if err := s.userRepo.Create(user); err != nil {
		s.logAudit(nil, "register", "failed", ip, userAgent, fmt.Sprintf("create user error: %v", err))
		// Check for duplicate phone
		if strings.Contains(err.Error(), "users_phone") || strings.Contains(err.Error(), "duplicate") {
			return &models.AuthResponse{
				Success: false,
				Error: &models.ErrorData{
					Code:    "PHONE_EXISTS",
					Message: "Phone number already registered",
				},
			}, nil
		}
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// Assign role
	role, err := s.roleRepo.FindByName(req.Role)
	if err != nil {
		s.logAudit(&user.ID, "register", "failed", ip, userAgent, fmt.Sprintf("role not found: %v", err))
		return nil, fmt.Errorf("failed to find role '%s': %w", req.Role, err)
	}

	if err := s.roleRepo.AssignRoleToUser(user.ID, role.ID, nil); err != nil {
		return nil, fmt.Errorf("failed to assign role: %w", err)
	}

	// Generate tokens
	accessToken, refreshToken, expiresIn, err := s.generateTokens(user.ID, req.Email, req.Role, ip, userAgent)
	if err != nil {
		return nil, err
	}

	s.logAudit(&user.ID, "register", "success", ip, userAgent, "")

	return &models.AuthResponse{
		Success: true,
		Data: &models.AuthData{
			UserID:       user.ID.String(),
			Email:        user.Email,
			Role:         req.Role,
			AccessToken:  accessToken,
			RefreshToken: refreshToken,
			ExpiresIn:    expiresIn,
		},
	}, nil
}

func (s *authService) Login(req *models.LoginRequest, ip, userAgent string) (*models.AuthResponse, error) {
	// Validate input
	if req.Email == "" || req.Password == "" {
		s.logAudit(nil, "login", "failed", ip, userAgent, "empty email or password")
		return &models.AuthResponse{
			Success: false,
			Error: &models.ErrorData{
				Code:    "INVALID_INPUT",
				Message: "Email and password are required",
			},
		}, nil
	}

	// Find user
	user, err := s.userRepo.FindByEmail(req.Email)
	if err != nil {
		if err.Error() == "user not found" {
			s.logAudit(nil, "login", "failed", ip, userAgent, fmt.Sprintf("user not found: %s", req.Email))
			return &models.AuthResponse{
				Success: false,
				Error: &models.ErrorData{
					Code:    "INVALID_CREDENTIALS",
					Message: "Invalid email or password",
				},
			}, nil
		}
		s.logAudit(nil, "login", "failed", ip, userAgent, fmt.Sprintf("database error: %v", err))
		return nil, fmt.Errorf("failed to find user: %w", err)
	}

	// Check if account is locked
	isLocked, err := s.userRepo.IsAccountLocked(user.ID)
	if err != nil {
		s.logAudit(&user.ID, "login", "failed", ip, userAgent, fmt.Sprintf("lock check error: %v", err))
		return nil, fmt.Errorf("failed to check account lock: %w", err)
	}

	if isLocked {
		s.logAudit(&user.ID, "login", "failed", ip, userAgent, "account locked")
		return &models.AuthResponse{
			Success: false,
			Error: &models.ErrorData{
				Code:    "ACCOUNT_LOCKED",
				Message: "Account is locked due to too many failed login attempts. Please try again later.",
			},
		}, nil
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		// Increment failed attempts
		s.userRepo.IncrementFailedAttempts(user.ID)

		// Check if should lock account
		user, _ := s.userRepo.FindByID(user.ID)
		if user.FailedLoginAttempts >= s.config.MaxLoginAttempts {
			lockDuration := time.Duration(s.config.AccountLockDuration) * time.Minute
			s.userRepo.LockAccount(user.ID, lockDuration)
		}

		s.logAudit(&user.ID, "login", "failed", ip, userAgent, "invalid password")
		return &models.AuthResponse{
			Success: false,
			Error: &models.ErrorData{
				Code:    "INVALID_CREDENTIALS",
				Message: "Invalid email or password",
			},
		}, nil
	}

	// Check if user is active
	if !user.IsActive {
		s.logAudit(&user.ID, "login", "failed", ip, userAgent, "account inactive")
		return &models.AuthResponse{
			Success: false,
			Error: &models.ErrorData{
				Code:    "ACCOUNT_INACTIVE",
				Message: "Account is inactive",
			},
		}, nil
	}

	// Get user roles
	roles, err := s.roleRepo.FindByUserID(user.ID)
	if err != nil || len(roles) == 0 {
		return nil, fmt.Errorf("failed to find user roles: %w", err)
	}

	roleName := roles[0].Name

	// Reset failed attempts
	s.userRepo.ResetFailedAttempts(user.ID)

	// Update login info
	s.userRepo.UpdateLoginInfo(user.ID, ip)

	// Generate tokens
	accessToken, refreshToken, expiresIn, err := s.generateTokens(user.ID, user.Email, roleName, ip, userAgent)
	if err != nil {
		return nil, err
	}

	s.logAudit(&user.ID, "login", "success", ip, userAgent, "")

	return &models.AuthResponse{
		Success: true,
		Data: &models.AuthData{
			UserID:       user.ID.String(),
			Email:        user.Email,
			Role:         roleName,
			AccessToken:  accessToken,
			RefreshToken: refreshToken,
			ExpiresIn:    expiresIn,
		},
	}, nil
}

func (s *authService) RefreshToken(req *models.RefreshTokenRequest, ip, userAgent string) (*models.AuthResponse, error) {
	// Hash the refresh token
	tokenHash := s.hashToken(req.RefreshToken)

	// Find token in database
	token, err := s.tokenRepo.FindRefreshToken(tokenHash)
	if err != nil {
		return &models.AuthResponse{
			Success: false,
			Error: &models.ErrorData{
				Code:    "INVALID_TOKEN",
				Message: "Invalid or expired refresh token",
			},
		}, nil
	}

	// Check if token is expired
	if token.ExpiresAt.Before(time.Now()) {
		return &models.AuthResponse{
			Success: false,
			Error: &models.ErrorData{
				Code:    "TOKEN_EXPIRED",
				Message: "Refresh token has expired",
			},
		}, nil
	}

	// Get user
	user, err := s.userRepo.FindByID(token.UserID)
	if err != nil {
		return nil, fmt.Errorf("failed to find user: %w", err)
	}

	// Get user roles
	roles, err := s.roleRepo.FindByUserID(user.ID)
	if err != nil || len(roles) == 0 {
		return nil, fmt.Errorf("failed to find user roles: %w", err)
	}

	roleName := roles[0].Name

	// Update last used
	s.tokenRepo.UpdateLastUsed(token.ID)

	// Generate new access token
	accessToken, _, expiresIn, err := s.generateTokens(user.ID, user.Email, roleName, ip, userAgent)
	if err != nil {
		return nil, err
	}

	s.logAudit(&user.ID, "refresh_token", "success", ip, userAgent, "")

	return &models.AuthResponse{
		Success: true,
		Data: &models.AuthData{
			UserID:       user.ID.String(),
			Email:        user.Email,
			Role:         roleName,
			AccessToken:  accessToken,
			RefreshToken: req.RefreshToken,
			ExpiresIn:    expiresIn,
		},
	}, nil
}

func (s *authService) Logout(userID uuid.UUID, refreshToken string) error {
	tokenHash := s.hashToken(refreshToken)

	token, err := s.tokenRepo.FindRefreshToken(tokenHash)
	if err != nil {
		return nil // Token not found, already logged out
	}

	return s.tokenRepo.RevokeToken(token.ID, userID, "logout")
}

func (s *authService) ChangePassword(userID uuid.UUID, req *models.ChangePasswordRequest) error {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return fmt.Errorf("user not found")
	}

	// Verify old password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.OldPassword)); err != nil {
		return fmt.Errorf("invalid old password")
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), s.config.BcryptRounds)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	user.Password = string(hashedPassword)

	if err := s.userRepo.Update(user); err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}

	// Revoke all refresh tokens
	s.tokenRepo.RevokeAllUserTokens(userID)

	s.logAudit(&userID, "change_password", "success", "", "", "")

	return nil
}

func (s *authService) ValidateToken(tokenString string) (*TokenClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &TokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(s.config.JWTSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*TokenClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("invalid token")
}

// Helper functions

func (s *authService) generateTokens(userID uuid.UUID, email, role, ip, userAgent string) (string, string, int64, error) {
	// Parse JWT expiry
	expiryDuration, _ := time.ParseDuration(s.config.JWTExpiry)
	expiresAt := time.Now().Add(expiryDuration)

	// Create access token
	claims := TokenClaims{
		UserID: userID.String(),
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	accessToken, err := token.SignedString([]byte(s.config.JWTSecret))
	if err != nil {
		return "", "", 0, fmt.Errorf("failed to sign token: %w", err)
	}

	// Create refresh token
	refreshTokenStr := uuid.New().String()
	refreshTokenHash := s.hashToken(refreshTokenStr)

	refreshExpiryDuration, _ := time.ParseDuration(s.config.RefreshTokenExpiry)
	refreshExpiresAt := time.Now().Add(refreshExpiryDuration)

	refreshToken := &models.RefreshToken{
		UserID:    userID,
		TokenHash: refreshTokenHash,
		ExpiresAt: refreshExpiresAt,
	}

	if ip != "" {
		refreshToken.IPAddress = &ip
	}
	if userAgent != "" {
		refreshToken.UserAgent = &userAgent
	}

	if err := s.tokenRepo.CreateRefreshToken(refreshToken); err != nil {
		return "", "", 0, fmt.Errorf("failed to create refresh token: %w", err)
	}

	return accessToken, refreshTokenStr, int64(expiryDuration.Seconds()), nil
}

func (s *authService) hashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}

func (s *authService) logAudit(userID *uuid.UUID, eventType, status, ip, userAgent, errorMsg string) {
	log := &models.AuditLog{
		UserID:      userID,
		EventType:   eventType,
		EventStatus: status,
	}

	if ip != "" {
		log.IPAddress = &ip
	}
	if userAgent != "" {
		log.UserAgent = &userAgent
	}
	if errorMsg != "" {
		log.ErrorMessage = &errorMsg
	}

	s.auditRepo.Create(log)
}

// Helper function to validate email format
func isValidEmail(email string) bool {
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(email)
}

// ForgotPassword sends a password reset email
func (s *authService) ForgotPassword(req *models.ForgotPasswordRequest, ip string) error {
	// Find user by email
	user, err := s.userRepo.FindByEmail(req.Email)
	if err != nil {
		// Don't reveal if email exists or not for security
		return nil
	}

	// Delete any existing password reset tokens for this user
	s.passwordResetRepo.DeleteByUserID(user.ID)

	// Generate 6-digit code
	code := Generate6DigitCode()

	// Generate reset token for backward compatibility
	tokenStr := uuid.New().String()
	tokenHash := s.hashToken(tokenStr)

	// Create password reset token (expires in 15 minutes)
	token := &models.PasswordResetToken{
		UserID:    user.ID,
		TokenHash: tokenHash,
		Code:      &code,
		ExpiresAt: time.Now().Add(15 * time.Minute),
	}

	if err := s.passwordResetRepo.Create(token); err != nil {
		return fmt.Errorf("failed to create reset token: %w", err)
	}

	// Send email with 6-digit code
	if err := s.emailService.SendPasswordResetEmail(user.Email, code); err != nil {
		fmt.Printf("Failed to send email to %s: %v\n", user.Email, err)
		// Don't fail the request if email fails, but log it
	} else {
		fmt.Printf("Password reset code sent to %s: %s\n", user.Email, code)
	}

	s.logAudit(&user.ID, "forgot_password", "success", ip, "", "")

	return nil
}

// ResetPassword resets user password with token
func (s *authService) ResetPassword(req *models.ResetPasswordRequest, ip string) error {
	// Hash the token
	tokenHash := s.hashToken(req.Token)

	// Find token
	token, err := s.passwordResetRepo.FindByTokenHash(tokenHash)
	if err != nil {
		return fmt.Errorf("invalid or expired token")
	}

	// Validate password strength
	if len(req.NewPassword) < 8 {
		return fmt.Errorf("password must be at least 8 characters long")
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), s.config.BcryptRounds)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	// Update user password
	user, err := s.userRepo.FindByID(token.UserID)
	if err != nil {
		return fmt.Errorf("user not found: %w", err)
	}

	user.Password = string(hashedPassword)
	if err := s.userRepo.Update(user); err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}

	// Mark token as used
	s.passwordResetRepo.MarkAsUsed(token.ID)

	// Revoke all refresh tokens for security
	s.tokenRepo.RevokeAllUserTokens(token.UserID)

	s.logAudit(&token.UserID, "reset_password", "success", ip, "", "")

	return nil
}

// VerifyEmail verifies user email with token
func (s *authService) VerifyEmail(token string) error {
	// Hash the token
	tokenHash := s.hashToken(token)

	// Find token
	verificationToken, err := s.emailVerificationRepo.FindByTokenHash(tokenHash)
	if err != nil {
		return fmt.Errorf("invalid or expired verification token")
	}

	// Get user
	user, err := s.userRepo.FindByID(verificationToken.UserID)
	if err != nil {
		return fmt.Errorf("user not found: %w", err)
	}

	// Mark user as verified
	now := time.Now()
	user.IsVerified = true
	user.EmailVerifiedAt = &now

	if err := s.userRepo.Update(user); err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}

	// Mark token as verified
	s.emailVerificationRepo.MarkAsVerified(verificationToken.ID)

	s.logAudit(&user.ID, "verify_email", "success", "", "", "")

	return nil
}

// ResendVerification resends email verification
func (s *authService) ResendVerification(email string) error {
	// Find user
	user, err := s.userRepo.FindByEmail(email)
	if err != nil {
		// Don't reveal if email exists or not
		return nil
	}

	// Check if already verified
	if user.IsVerified {
		return fmt.Errorf("email already verified")
	}

	// Delete any existing verification tokens
	s.emailVerificationRepo.DeleteByUserID(user.ID)

	// Generate 6-digit code
	code := Generate6DigitCode()

	// Generate verification token for backward compatibility
	tokenStr := uuid.New().String()
	tokenHash := s.hashToken(tokenStr)

	// Create verification token (expires in 24 hours)
	token := &models.EmailVerificationToken{
		UserID:    user.ID,
		TokenHash: tokenHash,
		Code:      &code,
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}

	if err := s.emailVerificationRepo.Create(token); err != nil {
		return fmt.Errorf("failed to create verification token: %w", err)
	}

	// Send email with 6-digit code
	if err := s.emailService.SendVerificationEmail(user.Email, code); err != nil {
		fmt.Printf("Failed to send email to %s: %v\n", user.Email, err)
		// Don't fail the request if email fails
	} else {
		fmt.Printf("Email verification code sent to %s: %s\n", user.Email, code)
	}

	s.logAudit(&user.ID, "resend_verification", "success", "", "", "")

	return nil
}

// VerifyEmailByCode verifies user email with 6-digit code
func (s *authService) VerifyEmailByCode(code string) error {
	// Find token by code
	verificationToken, err := s.emailVerificationRepo.FindByCode(code)
	if err != nil {
		return fmt.Errorf("invalid or expired verification code")
	}

	// Get user
	user, err := s.userRepo.FindByID(verificationToken.UserID)
	if err != nil {
		return fmt.Errorf("user not found: %w", err)
	}

	// Mark user as verified
	now := time.Now()
	user.IsVerified = true
	user.EmailVerifiedAt = &now

	if err := s.userRepo.Update(user); err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}

	// Mark token as verified
	s.emailVerificationRepo.MarkAsVerified(verificationToken.ID)

	s.logAudit(&user.ID, "verify_email_by_code", "success", "", "", "")

	return nil
}

// ResetPasswordByCode resets user password with 6-digit code
func (s *authService) ResetPasswordByCode(code, newPassword, ip string) error {
	// Find token by code
	token, err := s.passwordResetRepo.FindByCode(code)
	if err != nil {
		return fmt.Errorf("invalid or expired code")
	}

	// Validate password strength
	if len(newPassword) < 8 {
		return fmt.Errorf("password must be at least 8 characters long")
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), s.config.BcryptRounds)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	// Update user password
	user, err := s.userRepo.FindByID(token.UserID)
	if err != nil {
		return fmt.Errorf("user not found: %w", err)
	}

	user.Password = string(hashedPassword)
	if err := s.userRepo.Update(user); err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}

	// Mark token as used
	s.passwordResetRepo.MarkAsUsed(token.ID)

	// Revoke all refresh tokens for security
	s.tokenRepo.RevokeAllUserTokens(token.UserID)

	s.logAudit(&token.UserID, "reset_password_by_code", "success", ip, "", "")

	return nil
}
