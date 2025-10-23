package config

import (
	"os"
	"strconv"
)

type Config struct {
	// Application
	AppEnv string
	Port   string

	// Database
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string

	// Redis
	RedisURL string

	// JWT
	JWTSecret          string
	JWTExpiry          string
	RefreshTokenExpiry string
	BcryptRounds       int

	// Security
	MaxLoginAttempts    int
	AccountLockDuration int // minutes

	// Google OAuth
	GoogleClientID     string
	GoogleClientSecret string
	GoogleRedirectURL  string

	// SMTP Email
	SMTPHost      string
	SMTPPort      string
	SMTPUsername  string
	SMTPPassword  string
	SMTPFromEmail string
	SMTPFromName  string

	// Service URLs
	UserServiceURL         string
	NotificationServiceURL string
	InternalAPIKey         string
}

func Load() *Config {
	bcryptRounds, _ := strconv.Atoi(getEnv("BCRYPT_ROUNDS", "12"))
	maxLoginAttempts, _ := strconv.Atoi(getEnv("MAX_LOGIN_ATTEMPTS", "5"))
	lockDuration, _ := strconv.Atoi(getEnv("ACCOUNT_LOCK_DURATION", "30"))

	return &Config{
		AppEnv: getEnv("APP_ENV", "development"),
		Port:   getEnv("PORT", "8081"),

		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "ielts_admin"),
		DBPassword: getEnv("DB_PASSWORD", "ielts_password_2025"),
		DBName:     getEnv("DB_NAME", "auth_db"),

		RedisURL: getEnv("REDIS_URL", "redis://:ielts_redis_password@localhost:6379"),

		JWTSecret:          getEnv("JWT_SECRET", "your_jwt_secret_key_change_in_production"),
		JWTExpiry:          getEnv("JWT_EXPIRY", "24h"),
		RefreshTokenExpiry: getEnv("REFRESH_TOKEN_EXPIRY", "168h"),
		BcryptRounds:       bcryptRounds,

		MaxLoginAttempts:    maxLoginAttempts,
		AccountLockDuration: lockDuration,

		GoogleClientID:     getEnv("GOOGLE_CLIENT_ID", ""),
		GoogleClientSecret: getEnv("GOOGLE_CLIENT_SECRET", ""),
		GoogleRedirectURL:  getEnv("GOOGLE_REDIRECT_URL", "http://localhost:8080/api/v1/auth/google/callback"),

		SMTPHost:      getEnv("SMTP_HOST", "smtp.gmail.com"),
		SMTPPort:      getEnv("SMTP_PORT", "587"),
		SMTPUsername:  getEnv("SMTP_USERNAME", ""),
		SMTPPassword:  getEnv("SMTP_PASSWORD", ""),
		SMTPFromEmail: getEnv("SMTP_FROM_EMAIL", "noreply@ieltsplatform.com"),
		SMTPFromName:  getEnv("SMTP_FROM_NAME", "IELTS Learning Platform"),

		UserServiceURL:         getEnv("USER_SERVICE_URL", "http://user-service:8082"),
		NotificationServiceURL: getEnv("NOTIFICATION_SERVICE_URL", "http://notification-service:8085"),
		InternalAPIKey:         getEnv("INTERNAL_API_KEY", "internal_secret_key_ielts_2025_change_in_production"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
