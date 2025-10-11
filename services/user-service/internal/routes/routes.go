package routes

import (
	"github.com/bisosad1501/DATN/services/user-service/internal/handlers"
	"github.com/bisosad1501/DATN/services/user-service/internal/middleware"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(handler *handlers.UserHandler, internalHandler *handlers.InternalHandler, authMiddleware *middleware.AuthMiddleware) *gin.Engine {
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

			// Study goals
			user.POST("/goals", handler.CreateGoal)
			user.GET("/goals", handler.GetGoals)
			user.GET("/goals/:id", handler.GetGoalByID)
			user.PUT("/goals/:id", handler.UpdateGoal)
			user.POST("/goals/:id/complete", handler.CompleteGoal)
			user.DELETE("/goals/:id", handler.DeleteGoal)

			// Statistics
			user.GET("/statistics", handler.GetStatistics)
			user.GET("/statistics/:skill", handler.GetSkillStatistics)

			// Achievements
			user.GET("/achievements", handler.GetAchievements)
			user.GET("/achievements/earned", handler.GetEarnedAchievements)

			// Preferences
			user.GET("/preferences", handler.GetPreferences)
			user.PUT("/preferences", handler.UpdatePreferences)

			// Study reminders
			user.POST("/reminders", handler.CreateReminder)
			user.GET("/reminders", handler.GetReminders)
			user.PUT("/reminders/:id", handler.UpdateReminder)
			user.DELETE("/reminders/:id", handler.DeleteReminder)
			user.PUT("/reminders/:id/toggle", handler.ToggleReminder)

			// Leaderboard
			user.GET("/leaderboard", handler.GetLeaderboard)
			user.GET("/leaderboard/rank", handler.GetUserRank)
		}

		// Internal routes (service-to-service communication only)
		internal := v1.Group("/user/internal")
		internal.Use(authMiddleware.InternalAuth())
		{
			// Profile management
			internal.POST("/profile/create", internalHandler.CreateProfileInternal)

			// Progress updates
			internal.PUT("/progress/update", internalHandler.UpdateProgressInternal)

			// Skill statistics updates
			internal.PUT("/statistics/:skill/update", internalHandler.UpdateSkillStatisticsInternal)

			// Study session tracking
			internal.POST("/session/start", internalHandler.StartSessionInternal)
			internal.PUT("/session/:session_id/end", internalHandler.EndSessionInternal)
		}
	}

	return router
}
