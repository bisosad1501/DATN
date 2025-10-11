package config

import (
	"log"
	"os"
)

type Config struct {
	ServerPort string
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	JWTSecret  string

	// Service-to-Service Communication
	UserServiceURL         string
	NotificationServiceURL string
	InternalAPIKey         string
}

func LoadConfig() *Config {
	config := &Config{
		ServerPort: getEnv("SERVER_PORT", "8083"),
		DBHost:     getEnv("DB_HOST", "postgres"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "ielts_admin"),
		DBPassword: getEnv("DB_PASSWORD", ""),
		DBName:     getEnv("DB_NAME", "course_db"),
		JWTSecret:  getEnv("JWT_SECRET", ""),

		// Service URLs for internal communication
		UserServiceURL:         getEnv("USER_SERVICE_URL", "http://user-service:8082"),
		NotificationServiceURL: getEnv("NOTIFICATION_SERVICE_URL", "http://notification-service:8085"),
		InternalAPIKey:         getEnv("INTERNAL_API_KEY", "internal_secret_key_ielts_2025_change_in_production"),
	}

	if config.DBPassword == "" {
		log.Fatal("❌ DB_PASSWORD is required")
	}

	if config.JWTSecret == "" {
		log.Fatal("❌ JWT_SECRET is required")
	}

	log.Println("✅ Configuration loaded successfully")
	return config
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
