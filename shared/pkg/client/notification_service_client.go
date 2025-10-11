package client

import (
	"fmt"
)

// NotificationServiceClient handles communication with Notification Service
type NotificationServiceClient struct {
	*ServiceClient
}

// NewNotificationServiceClient creates a new notification service client
func NewNotificationServiceClient(baseURL, apiKey string) *NotificationServiceClient {
	return &NotificationServiceClient{
		ServiceClient: NewServiceClient(baseURL, apiKey),
	}
}

// SendNotificationRequest represents notification send request
type SendNotificationRequest struct {
	UserID   string            `json:"user_id"`
	Title    string            `json:"title"`
	Message  string            `json:"message"`
	Type     string            `json:"type"`     // info, success, warning, error
	Category string            `json:"category"` // system, course, exercise, achievement
	Data     map[string]string `json:"data,omitempty"`
	Priority string            `json:"priority,omitempty"` // low, normal, high
}

// SendNotification sends a notification to a user
func (c *NotificationServiceClient) SendNotification(req SendNotificationRequest) error {
	endpoint := "/api/v1/notifications/internal/send"

	// Set defaults
	if req.Type == "" {
		req.Type = "info"
	}
	if req.Priority == "" {
		req.Priority = "normal"
	}

	err := c.PostWithRetry(endpoint, req, 3)
	if err != nil {
		return fmt.Errorf("send notification: %w", err)
	}

	return nil
}

// SendBulkNotification sends notifications to multiple users
func (c *NotificationServiceClient) SendBulkNotification(userIDs []string, title, message, notifType, category string) error {
	endpoint := "/api/v1/notifications/internal/bulk"

	payload := map[string]interface{}{
		"user_ids": userIDs,
		"title":    title,
		"message":  message,
		"type":     notifType,
		"category": category,
	}

	err := c.PostWithRetry(endpoint, payload, 3)
	if err != nil {
		return fmt.Errorf("send bulk notification: %w", err)
	}

	return nil
}

// Helper functions for common notification types

// SendWelcomeNotification sends welcome notification to new user
func (c *NotificationServiceClient) SendWelcomeNotification(userID, email string) error {
	return c.SendNotification(SendNotificationRequest{
		UserID:   userID,
		Title:    "Chào mừng đến với IELTS Platform!",
		Message:  fmt.Sprintf("Xin chào %s! Chúc bạn học tập hiệu quả.", email),
		Type:     "system",  // Type: achievement, reminder, course_update, exercise_graded, system
		Category: "success", // Category: info, success, warning, alert
		Priority: "normal",
	})
}

// SendLessonCompletionNotification sends lesson completion notification
func (c *NotificationServiceClient) SendLessonCompletionNotification(userID, lessonTitle string, progress int) error {
	return c.SendNotification(SendNotificationRequest{
		UserID:   userID,
		Title:    "Hoàn thành bài học!",
		Message:  fmt.Sprintf("Bạn đã hoàn thành bài học '%s'. Tiến độ hiện tại: %d%%", lessonTitle, progress),
		Type:     "course_update", // Type must be: achievement, reminder, course_update, exercise_graded, system
		Category: "success",       // Category must be: info, success, warning, alert
		Priority: "normal",
	})
}

// SendExerciseResultNotification sends exercise result notification
func (c *NotificationServiceClient) SendExerciseResultNotification(userID, exerciseTitle string, score float64) error {
	category := "success"
	if score < 5.0 {
		category = "warning"
	}

	return c.SendNotification(SendNotificationRequest{
		UserID:   userID,
		Title:    "Kết quả bài tập",
		Message:  fmt.Sprintf("Bạn đã hoàn thành bài tập '%s' với điểm %.1f", exerciseTitle, score),
		Type:     "exercise_graded", // Type must be: achievement, reminder, course_update, exercise_graded, system
		Category: category,          // Category: info, success, warning, alert
		Priority: "normal",
	})
}

// SendAchievementNotification sends achievement earned notification
func (c *NotificationServiceClient) SendAchievementNotification(userID, achievementName string) error {
	return c.SendNotification(SendNotificationRequest{
		UserID:   userID,
		Title:    "🎉 Thành tựu mới!",
		Message:  fmt.Sprintf("Chúc mừng! Bạn đã đạt được thành tựu '%s'", achievementName),
		Type:     "achievement", // Type must be: achievement, reminder, course_update, exercise_graded, system
		Category: "success",     // Category: info, success, warning, alert
		Priority: "high",
	})
}

// SendGoalCompletionNotification sends goal completion notification
func (c *NotificationServiceClient) SendGoalCompletionNotification(userID, goalTitle string) error {
	return c.SendNotification(SendNotificationRequest{
		UserID:   userID,
		Title:    "✅ Hoàn thành mục tiêu!",
		Message:  fmt.Sprintf("Bạn đã hoàn thành mục tiêu '%s'. Tuyệt vời!", goalTitle),
		Type:     "achievement", // Type must be: achievement, reminder, course_update, exercise_graded, system
		Category: "success",     // Category: info, success, warning, alert
		Priority: "high",
	})
}

// SendStreakMilestoneNotification sends streak milestone notification
func (c *NotificationServiceClient) SendStreakMilestoneNotification(userID string, days int) error {
	return c.SendNotification(SendNotificationRequest{
		UserID:   userID,
		Title:    "🔥 Chuỗi học tập!",
		Message:  fmt.Sprintf("Tuyệt vời! Bạn đã học liên tục %d ngày. Tiếp tục duy trì!", days),
		Type:     "achievement", // Type must be: achievement, reminder, course_update, exercise_graded, system
		Category: "success",     // Category: info, success, warning, alert
		Priority: "high",
	})
}

// SendCourseEnrollmentNotification sends course enrollment notification
func (c *NotificationServiceClient) SendCourseEnrollmentNotification(userID, courseTitle string) error {
	return c.SendNotification(SendNotificationRequest{
		UserID:   userID,
		Title:    "Đăng ký khóa học thành công",
		Message:  fmt.Sprintf("Bạn đã đăng ký khóa học '%s'. Chúc bạn học tập hiệu quả!", courseTitle),
		Type:     "course_update", // Type must be: achievement, reminder, course_update, exercise_graded, system
		Category: "info",          // Category: info, success, warning, alert
		Priority: "normal",
	})
}
