package handlers

import (
	"net/http"

	"github.com/bisosad1501/ielts-platform/course-service/internal/models"
	"github.com/bisosad1501/ielts-platform/course-service/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CourseHandler struct {
	service *service.CourseService
}

func NewCourseHandler(service *service.CourseService) *CourseHandler {
	return &CourseHandler{service: service}
}

type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   *ErrorInfo  `json:"error,omitempty"`
}

type ErrorInfo struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Details string `json:"details,omitempty"`
}

// HealthCheck checks service health
func (h *CourseHandler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, Response{
		Success: true,
		Data: map[string]string{
			"service": "course-service",
			"status":  "healthy",
		},
	})
}

// GetCourses retrieves courses with filters
func (h *CourseHandler) GetCourses(c *gin.Context) {
	var query models.CourseListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "INVALID_QUERY",
				Message: "Invalid query parameters",
				Details: err.Error(),
			},
		})
		return
	}

	courses, err := h.service.GetCourses(&query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to get courses",
				Details: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, Response{
		Success: true,
		Data: map[string]interface{}{
			"courses": courses,
			"count":   len(courses),
		},
	})
}

// GetCourseDetail retrieves detailed course information
func (h *CourseHandler) GetCourseDetail(c *gin.Context) {
	courseIDStr := c.Param("id")
	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "INVALID_COURSE_ID",
				Message: "Invalid course ID format",
			},
		})
		return
	}

	// Get user ID if authenticated (optional)
	var userID *uuid.UUID
	if userIDVal, exists := c.Get("user_id"); exists {
		if userIDStr, ok := userIDVal.(string); ok {
			parsedID, err := uuid.Parse(userIDStr)
			if err == nil {
				userID = &parsedID
			}
		}
	}

	courseDetail, err := h.service.GetCourseDetail(courseID, userID)
	if err != nil {
		statusCode := http.StatusInternalServerError
		if err.Error() == "course not found" {
			statusCode = http.StatusNotFound
		}
		c.JSON(statusCode, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "COURSE_NOT_FOUND",
				Message: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, Response{
		Success: true,
		Data:    courseDetail,
	})
}

// GetLessonDetail retrieves detailed lesson information
func (h *CourseHandler) GetLessonDetail(c *gin.Context) {
	lessonIDStr := c.Param("id")
	lessonID, err := uuid.Parse(lessonIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "INVALID_LESSON_ID",
				Message: "Invalid lesson ID format",
			},
		})
		return
	}

	// Get user ID if authenticated (optional)
	var userID *uuid.UUID
	if userIDVal, exists := c.Get("user_id"); exists {
		if userIDStr, ok := userIDVal.(string); ok {
			parsedID, err := uuid.Parse(userIDStr)
			if err == nil {
				userID = &parsedID
			}
		}
	}

	lessonDetail, err := h.service.GetLessonDetail(lessonID, userID)
	if err != nil {
		statusCode := http.StatusInternalServerError
		if err.Error() == "lesson not found" {
			statusCode = http.StatusNotFound
		}
		c.JSON(statusCode, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "LESSON_NOT_FOUND",
				Message: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, Response{
		Success: true,
		Data:    lessonDetail,
	})
}

// EnrollCourse enrolls user in a course
func (h *CourseHandler) EnrollCourse(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "UNAUTHORIZED",
				Message: "User not authenticated",
			},
		})
		return
	}

	userIDStr := userIDVal.(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "INVALID_USER_ID",
				Message: "Invalid user ID",
			},
		})
		return
	}

	var req models.EnrollmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "VALIDATION_ERROR",
				Message: "Invalid request data",
				Details: err.Error(),
			},
		})
		return
	}

	enrollment, err := h.service.EnrollCourse(userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "ENROLLMENT_FAILED",
				Message: "Failed to enroll in course",
				Details: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusCreated, Response{
		Success: true,
		Message: "Successfully enrolled in course",
		Data:    enrollment,
	})
}

// GetMyEnrollments retrieves user's enrollments
func (h *CourseHandler) GetMyEnrollments(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "UNAUTHORIZED",
				Message: "User not authenticated",
			},
		})
		return
	}

	userIDStr := userIDVal.(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "INVALID_USER_ID",
				Message: "Invalid user ID",
			},
		})
		return
	}

	enrollments, err := h.service.GetMyEnrollments(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to get enrollments",
				Details: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, Response{
		Success: true,
		Data:    enrollments,
	})
}

// UpdateLessonProgress updates lesson progress
func (h *CourseHandler) UpdateLessonProgress(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "UNAUTHORIZED",
				Message: "User not authenticated",
			},
		})
		return
	}

	userIDStr := userIDVal.(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "INVALID_USER_ID",
				Message: "Invalid user ID",
			},
		})
		return
	}

	lessonIDStr := c.Param("id")
	lessonID, err := uuid.Parse(lessonIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "INVALID_LESSON_ID",
				Message: "Invalid lesson ID format",
			},
		})
		return
	}

	var req models.UpdateLessonProgressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "VALIDATION_ERROR",
				Message: "Invalid request data",
				Details: err.Error(),
			},
		})
		return
	}

	progress, err := h.service.UpdateLessonProgress(userID, lessonID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "UPDATE_FAILED",
				Message: "Failed to update lesson progress",
				Details: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, Response{
		Success: true,
		Message: "Lesson progress updated successfully",
		Data:    progress,
	})
}

// GetEnrollmentProgress retrieves enrollment progress
func (h *CourseHandler) GetEnrollmentProgress(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "UNAUTHORIZED",
				Message: "User not authenticated",
			},
		})
		return
	}

	userIDStr := userIDVal.(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "INVALID_USER_ID",
				Message: "Invalid user ID",
			},
		})
		return
	}

	courseIDStr := c.Param("id")
	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "INVALID_COURSE_ID",
				Message: "Invalid course ID format",
			},
		})
		return
	}

	progress, err := h.service.GetEnrollmentProgress(userID, courseID)
	if err != nil {
		statusCode := http.StatusInternalServerError
		if err.Error() == "not enrolled in this course" {
			statusCode = http.StatusForbidden
		}
		c.JSON(statusCode, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "PROGRESS_ERROR",
				Message: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, Response{
		Success: true,
		Data:    progress,
	})
}

// CreateCourse creates a new course (Admin/Instructor only)
func (h *CourseHandler) CreateCourse(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "UNAUTHORIZED",
				Message: "User not authenticated",
			},
		})
		return
	}

	userIDStr := userIDVal.(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "INVALID_USER_ID",
				Message: "Invalid user ID",
			},
		})
		return
	}

	// Get user email for instructor name
	email := ""
	if emailVal, exists := c.Get("email"); exists {
		email = emailVal.(string)
	}

	var req models.CreateCourseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "VALIDATION_ERROR",
				Message: "Invalid request data",
				Details: err.Error(),
			},
		})
		return
	}

	course, err := h.service.CreateCourse(userID, email, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "CREATION_FAILED",
				Message: "Failed to create course",
				Details: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusCreated, Response{
		Success: true,
		Message: "Course created successfully",
		Data:    course,
	})
}

// UpdateCourse updates a course (Admin/Instructor only with ownership check)
func (h *CourseHandler) UpdateCourse(c *gin.Context) {
	// Get user info from JWT
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "UNAUTHORIZED",
				Message: "User not authenticated",
			},
		})
		return
	}

	userIDStr := userIDVal.(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "INVALID_USER_ID",
				Message: "Invalid user ID",
			},
		})
		return
	}

	userRole := ""
	if roleVal, exists := c.Get("role"); exists {
		userRole = roleVal.(string)
	}

	courseIDStr := c.Param("id")
	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "INVALID_COURSE_ID",
				Message: "Invalid course ID format",
			},
		})
		return
	}

	var req models.UpdateCourseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "VALIDATION_ERROR",
				Message: "Invalid request data",
				Details: err.Error(),
			},
		})
		return
	}

	course, err := h.service.UpdateCourse(courseID, userID, userRole, &req)
	if err != nil {
		statusCode := http.StatusBadRequest
		if err.Error() == "you don't have permission to update this course" {
			statusCode = http.StatusForbidden
		}
		c.JSON(statusCode, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "UPDATE_FAILED",
				Message: "Failed to update course",
				Details: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, Response{
		Success: true,
		Message: "Course updated successfully",
		Data:    course,
	})
}

// DeleteCourse deletes a course (Admin only)
func (h *CourseHandler) DeleteCourse(c *gin.Context) {
	courseIDStr := c.Param("id")
	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "INVALID_COURSE_ID",
				Message: "Invalid course ID format",
			},
		})
		return
	}

	err = h.service.DeleteCourse(courseID)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "DELETE_FAILED",
				Message: "Failed to delete course",
				Details: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, Response{
		Success: true,
		Message: "Course deleted successfully",
	})
}

// CreateModule creates a new module (Admin/Instructor only with ownership check)
func (h *CourseHandler) CreateModule(c *gin.Context) {
	// Get user info from JWT
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "UNAUTHORIZED",
				Message: "User not authenticated",
			},
		})
		return
	}

	userIDStr := userIDVal.(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "INVALID_USER_ID",
				Message: "Invalid user ID",
			},
		})
		return
	}

	userRole := ""
	if roleVal, exists := c.Get("role"); exists {
		userRole = roleVal.(string)
	}

	var req models.CreateModuleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "VALIDATION_ERROR",
				Message: "Invalid request data",
				Details: err.Error(),
			},
		})
		return
	}

	module, err := h.service.CreateModule(userID, userRole, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "CREATION_FAILED",
				Message: "Failed to create module",
				Details: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusCreated, Response{
		Success: true,
		Message: "Module created successfully",
		Data:    module,
	})
}

// CreateLesson creates a new lesson (Admin/Instructor only with ownership check)
func (h *CourseHandler) CreateLesson(c *gin.Context) {
	// Get user info from JWT
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "UNAUTHORIZED",
				Message: "User not authenticated",
			},
		})
		return
	}

	userIDStr := userIDVal.(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "INVALID_USER_ID",
				Message: "Invalid user ID",
			},
		})
		return
	}

	userRole := ""
	if roleVal, exists := c.Get("role"); exists {
		userRole = roleVal.(string)
	}

	var req models.CreateLessonRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "VALIDATION_ERROR",
				Message: "Invalid request data",
				Details: err.Error(),
			},
		})
		return
	}

	lesson, err := h.service.CreateLesson(userID, userRole, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "CREATION_FAILED",
				Message: "Failed to create lesson",
				Details: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusCreated, Response{
		Success: true,
		Message: "Lesson created successfully",
		Data:    lesson,
	})
}

// PublishCourse publishes a draft course (Admin/Instructor with ownership check)
func (h *CourseHandler) PublishCourse(c *gin.Context) {
	// Get user info from JWT
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "UNAUTHORIZED",
				Message: "User not authenticated",
			},
		})
		return
	}

	userIDStr := userIDVal.(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "INVALID_USER_ID",
				Message: "Invalid user ID",
			},
		})
		return
	}

	userRole := ""
	if roleVal, exists := c.Get("role"); exists {
		userRole = roleVal.(string)
	}

	courseIDStr := c.Param("id")
	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "INVALID_COURSE_ID",
				Message: "Invalid course ID format",
			},
		})
		return
	}

	err = h.service.PublishCourse(courseID, userID, userRole)
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    "PUBLISH_FAILED",
				Message: "Failed to publish course",
				Details: err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, Response{
		Success: true,
		Message: "Course published successfully",
	})
}
