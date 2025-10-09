# API Endpoints Documentation

## Base URL
- Development: `http://localhost:8080/api/v1`
- Production: `https://api.ielts-platform.com/api/v1`

---

## 🔐 Authentication Service (Port: 8081)

### Public Endpoints

#### POST `/auth/register`
**Đăng ký tài khoản mới**

Request:
```json
{
  "email": "student@example.com",
  "password": "SecurePassword123!",
  "phone": "+84901234567",
  "role": "student"
}
```

Response (201):
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "email": "student@example.com",
    "role": "student",
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_in": 86400
  }
}
```

---

#### POST `/auth/login`
**Đăng nhập**

Request:
```json
{
  "email": "student@example.com",
  "password": "SecurePassword123!"
}
```

Response (200):
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "email": "student@example.com",
    "role": "student",
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_in": 86400
  }
}
```

---

#### POST `/auth/refresh`
**Refresh access token**

Request:
```json
{
  "refresh_token": "refresh_token_here"
}
```

---

#### POST `/auth/logout`
**Đăng xuất**

Headers: `Authorization: Bearer {token}`

---

#### POST `/auth/forgot-password`
**Quên mật khẩu - Gửi mã xác thực 6 số qua email**

Request:
```json
{
  "email": "student@example.com"
}
```

Response (200):
```json
{
  "success": true,
  "message": "If this email exists, a password reset code has been sent"
}
```

**Notes:**
- Gửi mã 6 số qua email (ví dụ: 123456)
- Mã có hiệu lực 15 phút
- Trả về thông báo chung để tránh email enumeration

---

#### POST `/auth/reset-password-by-code`
**Reset mật khẩu bằng mã 6 số (Khuyên dùng)**

Request:
```json
{
  "code": "123456",
  "new_password": "NewSecurePassword123!"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Notes:**
- Sử dụng mã 6 số nhận từ email
- Mã hết hiệu lực sau 15 phút
- Thu hồi tất cả refresh tokens để bảo mật

---

#### POST `/auth/reset-password`
**Reset mật khẩu bằng token (Legacy - Tương thích ngược)**

Request:
```json
{
  "token": "long_reset_token_from_email_link",
  "new_password": "NewSecurePassword123!"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Notes:**
- Endpoint cũ để tương thích với email link
- Khuyên dùng `/auth/reset-password-by-code` thay thế

---

#### POST `/auth/verify-email-by-code`
**Xác thực email bằng mã 6 số (Khuyên dùng)**

Request:
```json
{
  "code": "123456"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Notes:**
- Sử dụng mã 6 số nhận từ email
- Mã có hiệu lực 24 giờ
- Đánh dấu email đã được xác thực

---

#### GET `/auth/verify-email?token={token}`
**Xác thực email bằng token (Legacy - Tương thích ngược)**

Query Parameters:
- `token` (required): Token nhận từ email link

Response (200):
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Notes:**
- Endpoint cũ để tương thích với email link
- Khuyên dùng `/auth/verify-email-by-code` thay thế

---

#### POST `/auth/resend-verification`
**Gửi lại mã xác thực email**

Request:
```json
{
  "email": "student@example.com"
}
```

Response (200):
```json
{
  "success": true,
  "message": "If this email exists and is unverified, a verification code has been sent"
}
```

**Notes:**
- Gửi mã 6 số mới qua email
- Mã có hiệu lực 24 giờ
- Trả về thông báo chung để tránh email enumeration

---

## 👤 User Service (Port: 8082)

### GET `/users/profile`
**Lấy thông tin profile**

Headers: `Authorization: Bearer {token}`

Response (200):
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "email": "student@example.com",
    "first_name": "Nguyen",
    "last_name": "Van A",
    "avatar_url": "https://...",
    "current_level": "intermediate",
    "target_band_score": 7.0,
    "target_exam_date": "2025-12-31"
  }
}
```

---

### PUT `/users/profile`
**Cập nhật profile**

Request:
```json
{
  "first_name": "Nguyen",
  "last_name": "Van A",
  "date_of_birth": "2000-01-01",
  "current_level": "intermediate",
  "target_band_score": 7.5
}
```

---

### GET `/users/progress`
**Lấy tiến trình học tập**

Response (200):
```json
{
  "success": true,
  "data": {
    "total_study_hours": 45.5,
    "total_lessons_completed": 32,
    "total_exercises_completed": 28,
    "current_streak_days": 7,
    "longest_streak_days": 15,
    "skill_progress": {
      "listening": {
        "progress": 65.5,
        "current_score": 6.5,
        "total_practices": 15
      },
      "reading": {
        "progress": 70.0,
        "current_score": 7.0,
        "total_practices": 18
      },
      "writing": {
        "progress": 50.0,
        "current_score": 6.0,
        "total_practices": 10
      },
      "speaking": {
        "progress": 45.0,
        "current_score": 6.0,
        "total_practices": 8
      }
    }
  }
}
```

---

### GET `/users/achievements`
**Lấy danh sách thành tựu**

---

### POST `/users/goals`
**Tạo mục tiêu học tập**

Request:
```json
{
  "goal_type": "weekly",
  "title": "Hoàn thành 5 bài Listening",
  "target_value": 5,
  "target_unit": "exercises",
  "skill_type": "listening",
  "start_date": "2025-10-08",
  "end_date": "2025-10-14"
}
```

---

## 📚 Course Service (Port: 8083)

### GET `/courses`
**Lấy danh sách khóa học**

Query params:
- `skill_type`: listening, reading, writing, speaking, general
- `level`: beginner, intermediate, advanced
- `page`: 1
- `limit`: 20

Response (200):
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "uuid",
        "title": "IELTS Listening Band 6.0-7.0",
        "slug": "ielts-listening-band-6-7",
        "description": "Khóa học...",
        "skill_type": "listening",
        "level": "intermediate",
        "thumbnail_url": "https://...",
        "instructor_name": "Nguyen Van B",
        "total_lessons": 30,
        "duration_hours": 15.5,
        "enrollment_type": "free",
        "average_rating": 4.5,
        "total_enrollments": 1250
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "total_pages": 3
    }
  }
}
```

---

### GET `/courses/:id`
**Chi tiết khóa học**

Response (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "IELTS Listening Band 6.0-7.0",
    "description": "...",
    "modules": [
      {
        "id": "uuid",
        "title": "Module 1: Introduction",
        "lessons": [
          {
            "id": "uuid",
            "title": "Lesson 1: Getting Started",
            "content_type": "video",
            "duration_minutes": 15,
            "is_free": true,
            "is_completed": false
          }
        ]
      }
    ]
  }
}
```

---

### POST `/courses/:id/enroll`
**Đăng ký khóa học**

Headers: `Authorization: Bearer {token}`

---

### GET `/courses/:courseId/lessons/:lessonId`
**Xem bài học**

Response (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Lesson 1: Getting Started",
    "description": "...",
    "videos": [
      {
        "id": "uuid",
        "title": "Introduction Video",
        "video_url": "https://...",
        "duration_seconds": 900,
        "subtitles": [
          {"language": "vi", "url": "..."},
          {"language": "en", "url": "..."}
        ]
      }
    ],
    "materials": [
      {
        "id": "uuid",
        "title": "Study Guide PDF",
        "file_url": "...",
        "file_type": "pdf"
      }
    ]
  }
}
```

---

### POST `/courses/:courseId/lessons/:lessonId/progress`
**Cập nhật tiến trình bài học**

Request:
```json
{
  "progress_percentage": 75,
  "video_watched_seconds": 675,
  "video_total_seconds": 900,
  "status": "in_progress"
}
```

---

## 📝 Exercise Service (Port: 8084)

### GET `/exercises`
**Lấy danh sách bài tập**

Query params:
- `skill_type`: listening, reading
- `difficulty`: easy, medium, hard
- `exercise_type`: practice, mock_test
- `page`: 1
- `limit`: 20

---

### GET `/exercises/:id`
**Chi tiết bài tập**

Response (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "IELTS Listening Practice Test 1",
    "skill_type": "listening",
    "exercise_type": "practice",
    "total_questions": 40,
    "time_limit_minutes": 30,
    "audio_url": "https://...",
    "sections": [
      {
        "id": "uuid",
        "title": "Part 1: Conversation",
        "section_number": 1,
        "audio_url": "...",
        "questions": [
          {
            "id": "uuid",
            "question_number": 1,
            "question_text": "What is the man's name?",
            "question_type": "multiple_choice",
            "options": [
              {"label": "A", "text": "John"},
              {"label": "B", "text": "Jack"},
              {"label": "C", "text": "James"},
              {"label": "D", "text": "Joe"}
            ]
          }
        ]
      }
    ]
  }
}
```

---

### POST `/exercises/:id/start`
**Bắt đầu làm bài**

Response (201):
```json
{
  "success": true,
  "data": {
    "attempt_id": "uuid",
    "started_at": "2025-10-08T10:00:00Z",
    "time_limit_minutes": 30
  }
}
```

---

### POST `/exercises/attempts/:attemptId/answers`
**Nộp câu trả lời**

Request:
```json
{
  "question_id": "uuid",
  "answer_text": "A",
  "selected_option_id": "uuid",
  "time_spent_seconds": 30
}
```

---

### POST `/exercises/attempts/:attemptId/submit`
**Nộp bài tập**

Response (200):
```json
{
  "success": true,
  "data": {
    "attempt_id": "uuid",
    "total_questions": 40,
    "correct_answers": 32,
    "score": 80.0,
    "band_score": 7.0,
    "time_spent_seconds": 1650,
    "answers": [
      {
        "question_id": "uuid",
        "question_number": 1,
        "user_answer": "A",
        "correct_answer": "A",
        "is_correct": true,
        "explanation": "..."
      }
    ]
  }
}
```

---

## 🤖 AI Service (Port: 8085)

### POST `/ai/writing/submit`
**Nộp bài Writing để AI chấm**

Request:
```json
{
  "task_type": "task2",
  "task_prompt_text": "Some people think...",
  "essay_text": "In recent years...",
  "word_count": 280,
  "time_spent_seconds": 2400
}
```

Response (202):
```json
{
  "success": true,
  "data": {
    "submission_id": "uuid",
    "status": "pending",
    "message": "Your essay is being evaluated. This may take 30-60 seconds."
  }
}
```

---

### GET `/ai/writing/submissions/:id`
**Lấy kết quả chấm Writing**

Response (200):
```json
{
  "success": true,
  "data": {
    "submission_id": "uuid",
    "status": "completed",
    "evaluation": {
      "overall_band_score": 6.5,
      "task_achievement_score": 6.0,
      "coherence_cohesion_score": 7.0,
      "lexical_resource_score": 6.5,
      "grammar_accuracy_score": 6.5,
      "strengths": [
        "Good paragraph structure",
        "Clear introduction and conclusion",
        "Relevant examples provided"
      ],
      "weaknesses": [
        "Limited range of vocabulary",
        "Some grammatical errors",
        "Ideas could be developed more"
      ],
      "grammar_errors": [
        {
          "type": "subject-verb agreement",
          "example": "People is...",
          "correction": "People are..."
        }
      ],
      "detailed_feedback": "Your essay shows...",
      "improvement_suggestions": [
        "Use more linking words",
        "Vary sentence structures",
        "Expand your vocabulary"
      ]
    }
  }
}
```

---

### POST `/ai/speaking/submit`
**Nộp bài Speaking để AI chấm**

Request (multipart/form-data):
- `audio_file`: File (mp3, wav, m4a)
- `part_number`: 1, 2, or 3
- `task_prompt_text`: String

Response (202):
```json
{
  "success": true,
  "data": {
    "submission_id": "uuid",
    "status": "pending",
    "message": "Your speaking is being transcribed and evaluated. This may take 1-2 minutes."
  }
}
```

---

### GET `/ai/speaking/submissions/:id`
**Lấy kết quả chấm Speaking**

Response (200):
```json
{
  "success": true,
  "data": {
    "submission_id": "uuid",
    "status": "completed",
    "transcript": "Well, I think that...",
    "evaluation": {
      "overall_band_score": 7.0,
      "fluency_coherence_score": 7.0,
      "lexical_resource_score": 7.5,
      "grammar_accuracy_score": 6.5,
      "pronunciation_score": 7.0,
      "pronunciation_accuracy": 85.5,
      "speech_rate_wpm": 140,
      "filler_words_count": 3,
      "strengths": [
        "Clear pronunciation",
        "Good vocabulary range",
        "Natural speaking pace"
      ],
      "weaknesses": [
        "Some grammatical errors",
        "Occasional hesitation"
      ],
      "detailed_feedback": "Your speaking shows...",
      "improvement_suggestions": [
        "Practice complex grammar structures",
        "Reduce filler words",
        "Work on intonation"
      ]
    }
  }
}
```

---

### GET `/ai/prompts/writing`
**Lấy danh sách đề Writing**

Query params:
- `task_type`: task1, task2
- `difficulty`: easy, medium, hard
- `topic`: education, technology, environment

---

### GET `/ai/prompts/speaking`
**Lấy danh sách đề Speaking**

Query params:
- `part_number`: 1, 2, 3
- `difficulty`: easy, medium, hard
- `topic_category`: family, hobbies, work

---

## 🔔 Notification Service (Port: 8086)

### GET `/notifications`
**Lấy danh sách thông báo**

Headers: `Authorization: Bearer {token}`

Query params:
- `is_read`: true, false
- `type`: achievement, reminder, course_update, exercise_graded
- `page`: 1
- `limit`: 20

Response (200):
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "achievement",
        "category": "success",
        "title": "Chúc mừng! 🎉",
        "message": "Bạn đã đạt được thành tựu '7 ngày liên tiếp'",
        "is_read": false,
        "created_at": "2025-10-08T10:00:00Z"
      }
    ],
    "unread_count": 5
  }
}
```

---

### PUT `/notifications/:id/read`
**Đánh dấu đã đọc**

---

### POST `/notifications/register-device`
**Đăng ký device token cho push notification**

Request:
```json
{
  "device_token": "fcm_token_here",
  "device_type": "android",
  "device_name": "Samsung Galaxy S21"
}
```

---

### PUT `/notifications/preferences`
**Cập nhật tùy chọn thông báo**

Request:
```json
{
  "push_enabled": true,
  "push_reminders": true,
  "email_enabled": true,
  "email_weekly_report": true,
  "quiet_hours_enabled": true,
  "quiet_hours_start": "22:00",
  "quiet_hours_end": "08:00"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Common Error Codes

- `400` - Bad Request
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., email already exists)
- `422` - Validation Error
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error
- `503` - Service Unavailable

---

## Rate Limiting

- **Default**: 60 requests/minute per IP
- **Authenticated**: 1000 requests/hour per user
- **AI Services**: 10 requests/minute (due to processing time)

Headers:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1633701600
```

---

## Pagination

All list endpoints support pagination:

Query params:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

Response includes:
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

---

## Authentication

Most endpoints require JWT authentication:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token expires in 24 hours. Use `/auth/refresh` to get new token.

---

## Next Steps

1. ✅ API documentation hoàn thiện
2. 🔄 Implement services với Golang
3. 🔄 Setup Swagger/OpenAPI docs
4. 🔄 Write integration tests
5. 🔄 Deploy to staging environment
