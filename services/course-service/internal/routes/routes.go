package routes

import (
	"github.com/bisosad1501/ielts-platform/course-service/internal/handlers"
	"github.com/bisosad1501/ielts-platform/course-service/internal/middleware"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(
	router *gin.Engine,
	handler *handlers.CourseHandler,
	authMiddleware *middleware.AuthMiddleware,
) {
	// Health check
	router.GET("/health", handler.HealthCheck)

	// API v1
	v1 := router.Group("/api/v1")
	{
		// Public course endpoints (optional auth to check enrollment status)
		courses := v1.Group("/courses")
		courses.Use(authMiddleware.OptionalAuth())
		{
			courses.GET("", handler.GetCourses)          // List courses with filters
			courses.GET("/:id", handler.GetCourseDetail) // Get course detail
		}

		// Public lesson endpoints
		lessons := v1.Group("/lessons")
		lessons.Use(authMiddleware.OptionalAuth())
		{
			lessons.GET("/:id", handler.GetLessonDetail) // Get lesson detail
		}

		// Protected enrollment endpoints
		enrollments := v1.Group("/enrollments")
		enrollments.Use(authMiddleware.AuthRequired())
		{
			enrollments.POST("", handler.EnrollCourse)                      // Enroll in course
			enrollments.GET("/my", handler.GetMyEnrollments)                // Get my enrollments
			enrollments.GET("/:id/progress", handler.GetEnrollmentProgress) // Get enrollment progress
		}

		// Protected lesson progress endpoints
		progress := v1.Group("/progress")
		progress.Use(authMiddleware.AuthRequired())
		{
			progress.PUT("/lessons/:id", handler.UpdateLessonProgress) // Update lesson progress
		}

		// Admin routes (protected - instructor and admin only)
		admin := v1.Group("/admin")
		admin.Use(authMiddleware.AuthRequired())
		{
			// Course management (instructor and admin)
			admin.POST("/courses", authMiddleware.RequireRole("instructor", "admin"), handler.CreateCourse)
			admin.PUT("/courses/:id", authMiddleware.RequireRole("instructor", "admin"), handler.UpdateCourse)
			admin.POST("/courses/:id/publish", authMiddleware.RequireRole("instructor", "admin"), handler.PublishCourse)

			// Course deletion (admin only)
			admin.DELETE("/courses/:id", authMiddleware.RequireRole("admin"), handler.DeleteCourse)

			// Module and lesson management (instructor and admin)
			admin.POST("/modules", authMiddleware.RequireRole("instructor", "admin"), handler.CreateModule)
			admin.POST("/lessons", authMiddleware.RequireRole("instructor", "admin"), handler.CreateLesson)
		}
	}
}
