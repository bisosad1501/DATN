package config

import (
	"log"
	"os"
)

type Config struct {
	// Server
	ServerPort string

	// Database
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string

	// Auth Service Integration
	AuthServiceURL string
	JWTSecret      string

	// Internal API Authentication
	InternalAPIKey string

	// Service URLs
	NotificationServiceURL string
}

func LoadConfig() *Config {
	config := &Config{
		ServerPort: getEnv("SERVER_PORT", "8082"),

		// Database
		DBHost:     getEnv("DB_HOST", "postgres"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "ielts_admin"),
		DBPassword: getEnv("DB_PASSWORD", "ielts_password_2025"),
		DBName:     getEnv("DB_NAME", "user_db"),

		// Auth Service
		AuthServiceURL: getEnv("AUTH_SERVICE_URL", "http://auth-service:8081"),
		JWTSecret:      getEnv("JWT_SECRET", "your_jwt_secret_key_minimum_32_characters_long"),

		// Internal API Authentication
		InternalAPIKey: getEnv("INTERNAL_API_KEY", "internal_secret_key_ielts_2025_change_in_production"),

		// Service URLs
		NotificationServiceURL: getEnv("NOTIFICATION_SERVICE_URL", "http://notification-service:8085"),
	}

	log.Printf("✅ Configuration loaded successfully")
	log.Printf("📍 Server Port: %s", config.ServerPort)
	log.Printf("🗄️  Database: %s@%s:%s/%s", config.DBUser, config.DBHost, config.DBPort, config.DBName)
	log.Printf("🔐 Auth Service: %s", config.AuthServiceURL)

	return config
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
