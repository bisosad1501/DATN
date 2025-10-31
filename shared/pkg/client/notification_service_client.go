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
	UserID     string                 `json:"user_id"`
	Title      string                 `json:"title"`
	Message    string                 `json:"message"`
	Type       string                 `json:"type"`     // achievement, reminder, course_update, exercise_graded, system
	Category   string                 `json:"category"` // info, success, warning, alert
	ActionType *string                `json:"action_type,omitempty"`   // navigate_to_course, navigate_to_lesson, external_link
	ActionData map[string]interface{} `json:"action_data,omitempty"`    // {course_id: "...", lesson_id: "...", url: "..."}
	Priority   string                 `json:"priority,omitempty"`       // low, normal, high
	Data       map[string]string      `json:"data,omitempty"`          // Deprecated, use ActionData instead
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
		Title:    "Chào mừng đến với IELTSGo",
		Message:  fmt.Sprintf("Cảm ơn bạn đã tham gia IELTSGo! Bắt đầu hành trình học IELTS của bạn ngay hôm nay.", email),
		Type:     "system",
		Category: "info",
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
		Title:    "Bạn đã đạt được thành tựu mới",
		Message:  fmt.Sprintf("Chúc mừng! Bạn đã đạt được thành tựu '%s'. Tiếp tục phát huy!", achievementName),
		Type:     "achievement",
		Category: "success",
		Priority: "high",
	})
}

// SendGoalCompletionNotification sends goal completion notification
func (c *NotificationServiceClient) SendGoalCompletionNotification(userID, goalTitle string) error {
	return c.SendNotification(SendNotificationRequest{
		UserID:   userID,
		Title:    "Bạn đã hoàn thành mục tiêu",
		Message:  fmt.Sprintf("Chúc mừng! Bạn đã hoàn thành mục tiêu '%s'. Tuyệt vời!", goalTitle),
		Type:     "achievement",
		Category: "success",
		Priority: "high",
	})
}

// SendStreakMilestoneNotification sends streak milestone notification
func (c *NotificationServiceClient) SendStreakMilestoneNotification(userID string, days int) error {
	return c.SendNotification(SendNotificationRequest{
		UserID:   userID,
		Title:    "Bạn đã duy trì chuỗi học tập",
		Message:  fmt.Sprintf("Tuyệt vời! Bạn đã học liên tục %d ngày. Tiếp tục duy trì động lực!", days),
		Type:     "achievement",
		Category: "success",
		Priority: "high",
	})
}

// SendCourseEnrollmentNotification sends course enrollment notification
func (c *NotificationServiceClient) SendCourseEnrollmentNotification(userID, courseTitle string) error {
	actionType := "navigate_to_course"
	return c.SendNotification(SendNotificationRequest{
		UserID:     userID,
		Title:      "Đã đăng ký khóa học thành công",
		Message:    fmt.Sprintf("Bạn đã đăng ký khóa học '%s'. Bắt đầu học ngay để đạt mục tiêu của bạn.", courseTitle),
		Type:       "course_update",
		Category:   "success",
		ActionType: &actionType,
		ActionData: map[string]interface{}{
			"action": "navigate_to_course",
		},
		Priority: "normal",
	})
}

// SendCourseCompletionNotification sends course completion notification
func (c *NotificationServiceClient) SendCourseCompletionNotification(userID, courseTitle string, courseID string) error {
	actionType := "navigate_to_course"
	return c.SendNotification(SendNotificationRequest{
		UserID:     userID,
		Title:      "Chúc mừng! Bạn đã hoàn thành khóa học",
		Message:    fmt.Sprintf("Bạn đã hoàn thành khóa học '%s'. Tiếp tục với các khóa học khác để nâng cao kỹ năng của bạn!", courseTitle),
		Type:       "achievement",
		Category:   "success",
		ActionType: &actionType,
		ActionData: map[string]interface{}{
			"course_id": courseID,
		},
		Priority: "high",
	})
}

// SendNewLessonNotification sends notification when new lesson is added to enrolled course
func (c *NotificationServiceClient) SendNewLessonNotification(userID, courseTitle, lessonTitle, courseID, lessonID string) error {
	actionType := "navigate_to_lesson"
	return c.SendNotification(SendNotificationRequest{
		UserID:     userID,
		Title:      "Bài học mới đã được thêm vào khóa học",
		Message:    fmt.Sprintf("Khóa học '%s' vừa có bài học mới: '%s'. Truy cập để bắt đầu học.", courseTitle, lessonTitle),
		Type:       "course_update",
		Category:   "info",
		ActionType: &actionType,
		ActionData: map[string]interface{}{
			"course_id": courseID,
			"lesson_id": lessonID,
		},
		Priority: "normal",
	})
}

// SendReviewReceivedNotification sends notification to instructor when course receives new review
func (c *NotificationServiceClient) SendReviewReceivedNotification(userID, courseTitle, reviewerName string, rating int, courseID string) error {
	actionType := "navigate_to_course"
	return c.SendNotification(SendNotificationRequest{
		UserID:     userID,
		Title:      "Khóa học của bạn vừa nhận đánh giá mới",
		Message:    fmt.Sprintf("Khóa học '%s' vừa nhận được đánh giá %d sao từ %s. Xem chi tiết đánh giá.", courseTitle, rating, reviewerName),
		Type:       "course_update",
		Category:   "info",
		ActionType: &actionType,
		ActionData: map[string]interface{}{
			"course_id": courseID,
		},
		Priority: "normal",
	})
}
