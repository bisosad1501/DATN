package main

import (
	"log"
	"os"

	"github.com/bisosad1501/DATN/services/auth-service/internal/config"
	"github.com/bisosad1501/DATN/services/auth-service/internal/database"
	"github.com/bisosad1501/DATN/services/auth-service/internal/handlers"
	"github.com/bisosad1501/DATN/services/auth-service/internal/repository"
	"github.com/bisosad1501/DATN/services/auth-service/internal/routes"
	"github.com/bisosad1501/DATN/services/auth-service/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Load configuration
	cfg := config.Load()

	// Initialize database connection
	db, err := database.NewPostgresConnection(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Initialize Redis connection
	redisClient := database.NewRedisClient(cfg)
	defer redisClient.Close()

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	roleRepo := repository.NewRoleRepository(db)
	tokenRepo := repository.NewTokenRepository(db)
	auditRepo := repository.NewAuditLogRepository(db)

	// Initialize services
	authService := service.NewAuthService(userRepo, roleRepo, tokenRepo, auditRepo, redisClient, cfg)
	googleOAuthService := service.NewGoogleOAuthService(cfg, userRepo, roleRepo, tokenRepo, auditRepo, authService)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService, googleOAuthService)

	// Setup Gin router
	if cfg.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}
	router := gin.Default()

	// Setup routes
	routes.SetupRoutes(router, authHandler, authService)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	log.Printf("Auth Service starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
