package routes

import (
	"github.com/bisosad1501/ielts-platform/notification-service/internal/handlers"
	"github.com/bisosad1501/ielts-platform/notification-service/internal/middleware"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine, handler *handlers.NotificationHandler, internalHandler *handlers.InternalHandler, authMiddleware *middleware.AuthMiddleware) {
	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "healthy",
			"service": "notification-service",
		})
	})

	// API v1 routes
	v1 := r.Group("/api/v1")

	// Student routes (authenticated)
	student := v1.Group("/notifications")
	student.Use(authMiddleware.Authenticate())
	{
		// Notification CRUD
		student.GET("", handler.GetMyNotifications)          // List with pagination and filters
		student.GET("/unread-count", handler.GetUnreadCount) // Get unread count (must be before /:id)
		student.GET("/:id", handler.GetNotificationByID)     // Get by ID
		student.PUT("/:id/read", handler.MarkAsRead)         // Mark as read
		student.PUT("/mark-all-read", handler.MarkAllAsRead) // Mark all as read
		student.DELETE("/:id", handler.DeleteNotification)   // Delete notification

		// Device management
		student.POST("/devices", handler.RegisterDevice) // Register device token

		// Preferences
		student.GET("/preferences", handler.GetPreferences)          // Get preferences
		student.PUT("/preferences", handler.UpdatePreferences)       // Update preferences
		student.GET("/preferences/timezone", handler.GetTimezone)    // Get timezone
		student.PUT("/preferences/timezone", handler.UpdateTimezone) // Update timezone

		// Scheduled notifications
		student.POST("/scheduled", handler.CreateScheduledNotification)       // Create scheduled notification
		student.GET("/scheduled", handler.GetScheduledNotifications)          // List scheduled notifications
		student.GET("/scheduled/:id", handler.GetScheduledNotificationByID)   // Get scheduled notification by ID
		student.PUT("/scheduled/:id", handler.UpdateScheduledNotification)    // Update scheduled notification
		student.DELETE("/scheduled/:id", handler.DeleteScheduledNotification) // Delete scheduled notification
	}

	// Admin routes
	admin := v1.Group("/admin/notifications")
	admin.Use(authMiddleware.Authenticate())
	admin.Use(authMiddleware.RequireRole("admin", "instructor"))
	{
		admin.POST("", handler.CreateNotification)         // Create notification for a user
		admin.POST("/bulk", handler.SendBulkNotifications) // Send bulk notifications
	}

	// Internal routes (service-to-service)
	internal := v1.Group("/notifications/internal")
	internal.Use(authMiddleware.InternalAuth())
	{
		internal.POST("/send", internalHandler.SendNotificationInternal)     // Send notification from another service
		internal.POST("/bulk", internalHandler.SendBulkNotificationInternal) // Send bulk notifications from another service
	}
}
