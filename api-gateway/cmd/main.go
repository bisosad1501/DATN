package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/bisosad1501/ielts-platform/api-gateway/internal/config"
	"github.com/bisosad1501/ielts-platform/api-gateway/internal/middleware"
	"github.com/bisosad1501/ielts-platform/api-gateway/internal/routes"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("❌ Failed to load config: %v", err)
	}

	log.Println("🚀 Starting API Gateway...")
	log.Printf("📝 Gateway Port: %s", cfg.ServerPort)
	log.Printf("📝 Auth Service: %s", cfg.Services.AuthService)
	log.Printf("📝 User Service: %s", cfg.Services.UserService)
	log.Printf("📝 Course Service: %s", cfg.Services.CourseService)
	log.Printf("📝 Exercise Service: %s", cfg.Services.ExerciseService)
	log.Printf("📝 Notification Service: %s", cfg.Services.NotificationService)

	// Setup Gin
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()

	// Global middleware
	r.Use(gin.Recovery()) // Panic recovery
	r.Use(middleware.CORS())
	r.Use(middleware.RequestLogger())

	// Initialize auth middleware
	authMiddleware := middleware.NewAuthMiddleware(cfg.JWTSecret)

	// Setup all routes
	routes.SetupRoutes(r, cfg, authMiddleware)

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		if err := r.Run(":" + cfg.ServerPort); err != nil {
			log.Fatalf("❌ Failed to start gateway: %v", err)
		}
	}()

	log.Printf("✅ API Gateway running on http://localhost:%s", cfg.ServerPort)
	log.Println("📚 Visit http://localhost:" + cfg.ServerPort + " for API documentation")

	<-quit
	log.Println("🛑 Shutting down API Gateway...")
}
