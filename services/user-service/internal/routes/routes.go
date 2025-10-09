package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/bisosad1501/DATN/services/user-service/internal/handlers"
	"github.com/bisosad1501/DATN/services/user-service/internal/middleware"
)

func SetupRoutes(handler *handlers.UserHandler, authMiddleware *middleware.AuthMiddleware) *gin.Engine {
	router := gin.Default()

	// Health check
	router.GET("/health", handler.HealthCheck)

	// API v1
	v1 := router.Group("/api/v1")
	{
		// User routes (protected)
		user := v1.Group("/user")
		user.Use(authMiddleware.AuthRequired())
		{
			// Profile management
			user.GET("/profile", handler.GetProfile)
			user.PUT("/profile", handler.UpdateProfile)
			user.POST("/profile/avatar", handler.UpdateAvatar)

			// Progress and statistics
			user.GET("/progress", handler.GetProgress)
			user.GET("/progress/history", handler.GetHistory)

			// Study sessions
			user.POST("/sessions", handler.StartSession)
			user.POST("/sessions/:id/end", handler.EndSession)
		}
	}

	return router
}
