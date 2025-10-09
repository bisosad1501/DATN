package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/bisosad1501/ielts-platform/notification-service/internal/config"
	"github.com/bisosad1501/ielts-platform/notification-service/internal/database"
	"github.com/bisosad1501/ielts-platform/notification-service/internal/handlers"
	"github.com/bisosad1501/ielts-platform/notification-service/internal/middleware"
	"github.com/bisosad1501/ielts-platform/notification-service/internal/repository"
	"github.com/bisosad1501/ielts-platform/notification-service/internal/routes"
	"github.com/bisosad1501/ielts-platform/notification-service/internal/service"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("❌ Failed to load config: %v", err)
	}

	log.Println("🚀 Starting Notification Service...")
	log.Printf("📝 Server Port: %s", cfg.ServerPort)
	log.Printf("📝 Database: %s", cfg.Database.DBName)

	// Connect to database
	db, err := database.NewDatabase(cfg.GetDBConnectionString())
	if err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Initialize layers
	notificationRepo := repository.NewNotificationRepository(db.DB)
	notificationService := service.NewNotificationService(notificationRepo)
	notificationHandler := handlers.NewNotificationHandler(notificationService)
	authMiddleware := middleware.NewAuthMiddleware(cfg.JWTSecret)

	// Setup Gin
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Setup routes
	routes.SetupRoutes(r, notificationHandler, authMiddleware)

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		if err := r.Run(":" + cfg.ServerPort); err != nil {
			log.Fatalf("❌ Failed to start server: %v", err)
		}
	}()

	log.Printf("✅ Notification Service running on port %s", cfg.ServerPort)

	<-quit
	log.Println("🛑 Shutting down Notification Service...")
}
