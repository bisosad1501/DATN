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
}

func LoadConfig() *Config {
	config := &Config{
		ServerPort: getEnv("SERVER_PORT", "8084"),
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "ielts_admin"),
		DBPassword: getEnv("DB_PASSWORD", ""),
		DBName:     getEnv("DB_NAME", "exercise_db"),
		JWTSecret:  getEnv("JWT_SECRET", ""),
	}

	if config.DBPassword == "" {
		log.Fatal("DB_PASSWORD is required")
	}

	if config.JWTSecret == "" {
		log.Fatal("JWT_SECRET is required")
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
