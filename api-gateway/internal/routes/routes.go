package routes

import (
	"net/http"

	"github.com/bisosad1501/ielts-platform/api-gateway/internal/config"
	"github.com/bisosad1501/ielts-platform/api-gateway/internal/middleware"
	"github.com/bisosad1501/ielts-platform/api-gateway/internal/proxy"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine, cfg *config.Config, authMiddleware *middleware.AuthMiddleware) {
	// Health check for gateway itself
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"service": "api-gateway",
			"version": "1.0.0",
		})
	})

	// Gateway info endpoint
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"service": "IELTS Platform API Gateway",
			"version": "1.0.0",
			"endpoints": gin.H{
				"health":        "/health",
				"auth":          "/api/v1/auth/*",
				"users":         "/api/v1/users/*",
				"courses":       "/api/v1/courses/*",
				"exercises":     "/api/v1/exercises/*",
				"submissions":   "/api/v1/submissions/*",
				"notifications": "/api/v1/notifications/*",
				"admin":         "/api/v1/admin/*",
			},
		})
	})

	// API v1 routes
	v1 := r.Group("/api/v1")

	// ============================================
	// AUTH SERVICE - No auth required (public routes)
	// ============================================
	authGroup := v1.Group("/auth")
	{
		// Public auth endpoints (no token required)
		authGroup.POST("/register", proxy.ReverseProxy(cfg.Services.AuthService))
		authGroup.POST("/login", proxy.ReverseProxy(cfg.Services.AuthService))
		authGroup.POST("/refresh", proxy.ReverseProxy(cfg.Services.AuthService))
		authGroup.POST("/logout", proxy.ReverseProxy(cfg.Services.AuthService))
		authGroup.POST("/verify-email", proxy.ReverseProxy(cfg.Services.AuthService))
		authGroup.POST("/resend-verification", proxy.ReverseProxy(cfg.Services.AuthService))
		authGroup.POST("/forgot-password", proxy.ReverseProxy(cfg.Services.AuthService))
		authGroup.POST("/reset-password", proxy.ReverseProxy(cfg.Services.AuthService))

		// Protected auth endpoints (require token)
		authProtected := authGroup.Group("")
		authProtected.Use(authMiddleware.ValidateToken())
		{
			authProtected.POST("/change-password", proxy.ReverseProxy(cfg.Services.AuthService))
			authProtected.GET("/me", proxy.ReverseProxy(cfg.Services.AuthService))
		}
	}

	// ============================================
	// USER SERVICE - Most require auth
	// ============================================
	userGroup := v1.Group("/users")
	userGroup.Use(authMiddleware.ValidateToken())
	{
		userGroup.GET("/me", proxy.ReverseProxy(cfg.Services.UserService))
		userGroup.PUT("/me", proxy.ReverseProxy(cfg.Services.UserService))
		userGroup.GET("/me/profile", proxy.ReverseProxy(cfg.Services.UserService))
		userGroup.PUT("/me/profile", proxy.ReverseProxy(cfg.Services.UserService))
		userGroup.GET("/me/progress", proxy.ReverseProxy(cfg.Services.UserService))
		userGroup.GET("/me/statistics", proxy.ReverseProxy(cfg.Services.UserService))
		userGroup.GET("/me/achievements", proxy.ReverseProxy(cfg.Services.UserService))
	}

	// ============================================
	// COURSE SERVICE - Mixed auth (some public, some protected)
	// ============================================
	courseGroup := v1.Group("/courses")
	{
		// Public endpoints (browsing courses)
		courseGroup.GET("", authMiddleware.OptionalAuth(), proxy.ReverseProxy(cfg.Services.CourseService))
		courseGroup.GET("/:id", authMiddleware.OptionalAuth(), proxy.ReverseProxy(cfg.Services.CourseService))
		courseGroup.GET("/:id/modules", authMiddleware.OptionalAuth(), proxy.ReverseProxy(cfg.Services.CourseService))
		courseGroup.GET("/:id/modules/:module_id/lessons", authMiddleware.OptionalAuth(), proxy.ReverseProxy(cfg.Services.CourseService))

		// Protected endpoints (enrollment, progress)
		courseProtected := courseGroup.Group("")
		courseProtected.Use(authMiddleware.ValidateToken())
		{
			courseProtected.POST("/:id/enroll", proxy.ReverseProxy(cfg.Services.CourseService))
			courseProtected.GET("/my-courses", proxy.ReverseProxy(cfg.Services.CourseService))
			courseProtected.GET("/:id/progress", proxy.ReverseProxy(cfg.Services.CourseService))
			courseProtected.POST("/:id/lessons/:lesson_id/complete", proxy.ReverseProxy(cfg.Services.CourseService))
		}
	}

	// ============================================
	// EXERCISE SERVICE - Mixed auth
	// ============================================
	exerciseGroup := v1.Group("/exercises")
	{
		// Public browsing
		exerciseGroup.GET("", authMiddleware.OptionalAuth(), proxy.ReverseProxy(cfg.Services.ExerciseService))
		exerciseGroup.GET("/:id", authMiddleware.OptionalAuth(), proxy.ReverseProxy(cfg.Services.ExerciseService))

		// Protected (requires login)
		exerciseProtected := exerciseGroup.Group("")
		exerciseProtected.Use(authMiddleware.ValidateToken())
		{
			exerciseProtected.POST("/start", proxy.ReverseProxy(cfg.Services.ExerciseService))
		}
	}

	// Submissions (all protected)
	submissionGroup := v1.Group("/submissions")
	submissionGroup.Use(authMiddleware.ValidateToken())
	{
		submissionGroup.PUT("/:id/answers", proxy.ReverseProxy(cfg.Services.ExerciseService))
		submissionGroup.GET("/:id/result", proxy.ReverseProxy(cfg.Services.ExerciseService))
		submissionGroup.GET("/my", proxy.ReverseProxy(cfg.Services.ExerciseService))
	}

	// ============================================
	// NOTIFICATION SERVICE - All protected
	// ============================================
	notificationGroup := v1.Group("/notifications")
	notificationGroup.Use(authMiddleware.ValidateToken())
	{
		notificationGroup.GET("", proxy.ReverseProxy(cfg.Services.NotificationService))
		notificationGroup.GET("/unread-count", proxy.ReverseProxy(cfg.Services.NotificationService))
		notificationGroup.GET("/:id", proxy.ReverseProxy(cfg.Services.NotificationService))
		notificationGroup.PUT("/:id/read", proxy.ReverseProxy(cfg.Services.NotificationService))
		notificationGroup.PUT("/mark-all-read", proxy.ReverseProxy(cfg.Services.NotificationService))
		notificationGroup.DELETE("/:id", proxy.ReverseProxy(cfg.Services.NotificationService))
		notificationGroup.POST("/devices", proxy.ReverseProxy(cfg.Services.NotificationService))
		notificationGroup.GET("/preferences", proxy.ReverseProxy(cfg.Services.NotificationService))
		notificationGroup.PUT("/preferences", proxy.ReverseProxy(cfg.Services.NotificationService))
	}

	// ============================================
	// ADMIN ROUTES - Require admin/instructor role
	// ============================================
	adminGroup := v1.Group("/admin")
	adminGroup.Use(authMiddleware.ValidateToken())
	{
		// Course management
		adminGroup.POST("/courses", proxy.ReverseProxy(cfg.Services.CourseService))
		adminGroup.PUT("/courses/:id", proxy.ReverseProxy(cfg.Services.CourseService))
		adminGroup.DELETE("/courses/:id", proxy.ReverseProxy(cfg.Services.CourseService))
		adminGroup.POST("/courses/:id/modules", proxy.ReverseProxy(cfg.Services.CourseService))
		adminGroup.POST("/modules/:id/lessons", proxy.ReverseProxy(cfg.Services.CourseService))

		// Exercise management
		adminGroup.POST("/exercises", proxy.ReverseProxy(cfg.Services.ExerciseService))
		adminGroup.PUT("/exercises/:id", proxy.ReverseProxy(cfg.Services.ExerciseService))
		adminGroup.DELETE("/exercises/:id", proxy.ReverseProxy(cfg.Services.ExerciseService))
		adminGroup.POST("/exercises/:id/sections", proxy.ReverseProxy(cfg.Services.ExerciseService))
		adminGroup.POST("/questions", proxy.ReverseProxy(cfg.Services.ExerciseService))
		adminGroup.POST("/questions/:id/options", proxy.ReverseProxy(cfg.Services.ExerciseService))
		adminGroup.POST("/questions/:id/answer", proxy.ReverseProxy(cfg.Services.ExerciseService))

		// Notification management
		adminGroup.POST("/notifications", proxy.ReverseProxy(cfg.Services.NotificationService))
		adminGroup.POST("/notifications/bulk", proxy.ReverseProxy(cfg.Services.NotificationService))
	}

	// ============================================
	// Fallback for undefined routes
	// ============================================
	r.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "route_not_found",
			"message": "The requested endpoint does not exist",
			"path":    c.Request.URL.Path,
		})
	})
}
