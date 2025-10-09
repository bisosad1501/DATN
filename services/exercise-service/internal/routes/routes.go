package routes

import (
	"github.com/bisosad1501/ielts-platform/exercise-service/internal/handlers"
	"github.com/bisosad1501/ielts-platform/exercise-service/internal/middleware"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine, handler *handlers.ExerciseHandler, authMiddleware *middleware.AuthMiddleware) {
	// Health check
	router.GET("/health", handler.HealthCheck)

	// API routes
	api := router.Group("/api/v1")
	{
		// Public routes (optional auth)
		exercises := api.Group("/exercises")
		exercises.Use(authMiddleware.OptionalAuth())
		{
			exercises.GET("", handler.GetExercises)        // List exercises with filters
			exercises.GET("/:id", handler.GetExerciseByID) // Get exercise detail
		}

		// Student routes (auth required)
		submissions := api.Group("/submissions")
		submissions.Use(authMiddleware.AuthRequired())
		{
			submissions.POST("", handler.StartExercise)                 // Start new exercise
			submissions.PUT("/:id/answers", handler.SubmitAnswers)      // Submit answers
			submissions.GET("/:id/result", handler.GetSubmissionResult) // Get result
			submissions.GET("/my", handler.GetMySubmissions)            // Get my submissions
		}

		// Admin routes (instructor/admin only)
		admin := api.Group("/admin")
		admin.Use(authMiddleware.AuthRequired())
		admin.Use(authMiddleware.RequireRole("instructor", "admin"))
		{
			// Exercise management
			admin.POST("/exercises", handler.CreateExercise)             // Create exercise
			admin.PUT("/exercises/:id", handler.UpdateExercise)          // Update exercise
			admin.DELETE("/exercises/:id", handler.DeleteExercise)       // Delete exercise
			admin.POST("/exercises/:id/sections", handler.CreateSection) // Create section

			// Question management
			admin.POST("/questions", handler.CreateQuestion)                   // Create question
			admin.POST("/questions/:id/options", handler.CreateQuestionOption) // Add option
			admin.POST("/questions/:id/answer", handler.CreateQuestionAnswer)  // Add answer
		}
	}
}
