package routes

import (
	"github.com/bisosad1501/DATN/services/auth-service/internal/handlers"
	"github.com/bisosad1501/DATN/services/auth-service/internal/middleware"
	"github.com/bisosad1501/DATN/services/auth-service/internal/service"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine, authHandler *handlers.AuthHandler, authService service.AuthService) {
	// Health check
	router.GET("/health", authHandler.HealthCheck)

	// API v1 group
	v1 := router.Group("/api/v1")
	{
		// Auth routes (public)
		auth := v1.Group("/auth")
		{
			// Public endpoints (no authentication required)
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/refresh", authHandler.RefreshToken)
			
			// Google OAuth endpoints
			auth.GET("/google", authHandler.GoogleLogin)
			auth.GET("/google/callback", authHandler.GoogleCallback)

			// Protected endpoints (require authentication)
			protected := auth.Group("")
			protected.Use(middleware.AuthMiddleware(authService))
			{
				protected.GET("/validate", authHandler.ValidateToken)
				protected.POST("/logout", authHandler.Logout)
				protected.POST("/change-password", authHandler.ChangePassword)
			}
		}
	}
}
