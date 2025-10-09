package main

import (
	"log"

	"github.com/bisosad1501/ielts-platform/exercise-service/internal/config"
	"github.com/bisosad1501/ielts-platform/exercise-service/internal/database"
	"github.com/bisosad1501/ielts-platform/exercise-service/internal/handlers"
	"github.com/bisosad1501/ielts-platform/exercise-service/internal/middleware"
	"github.com/bisosad1501/ielts-platform/exercise-service/internal/repository"
	"github.com/bisosad1501/ielts-platform/exercise-service/internal/routes"
	"github.com/bisosad1501/ielts-platform/exercise-service/internal/service"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.LoadConfig()

	// Connect to database
	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	log.Println("Connected to database successfully")

	// Initialize layers
	exerciseRepo := repository.NewExerciseRepository(db)
	exerciseService := service.NewExerciseService(exerciseRepo)
	exerciseHandler := handlers.NewExerciseHandler(exerciseService)
	authMiddleware := middleware.NewAuthMiddleware(cfg)

	// Setup Gin
	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()

	// Enable CORS
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Setup routes
	routes.SetupRoutes(router, exerciseHandler, authMiddleware)

	// Start server
	log.Printf("Exercise Service running on port %s", cfg.ServerPort)
	if err := router.Run(":" + cfg.ServerPort); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
