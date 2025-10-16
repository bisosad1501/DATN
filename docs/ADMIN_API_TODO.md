# 📋 Admin API Implementation TODO

## 🎯 Overview
Backend chưa có các admin endpoints để quản lý hệ thống. Document này list các API cần implement.

---

## ✅ APIs Đã Có Sẵn

### User Service (`/api/v1/user/*`)
- ✅ `GET /user/statistics` - Thống kê user hiện tại
- ✅ `GET /user/leaderboard` - Bảng xếp hạng
- ✅ `GET /user/progress` - Tiến độ học tập
- ✅ `GET /user/progress/history` - Lịch sử học tập

### Exercise Service (`/api/v1/admin/exercises/*`)
- ✅ `POST /admin/exercises` - Tạo exercise
- ✅ `PUT /admin/exercises/:id` - Cập nhật exercise
- ✅ `DELETE /admin/exercises/:id` - Xóa exercise
- ✅ `GET /admin/exercises/:id/analytics` - Analytics của exercise

### Course Service (`/api/v1/*`)
- ✅ `GET /courses` - List courses
- ✅ `GET /courses/:id` - Chi tiết course
- ✅ `POST /enrollments` - Đăng ký course
- ✅ `GET /enrollments/my` - Courses đã đăng ký

---

## ❌ APIs Cần Implement

### 1. Admin Dashboard Analytics

#### Auth Service - User Management
```go
// GET /api/v1/admin/users
// List all users with filters
{
  "page": 1,
  "limit": 20,
  "role": "student|instructor|admin",
  "status": "active|inactive|locked",
  "search": "email or name"
}

Response:
{
  "data": [
    {
      "id": "uuid",
      "email": "string",
      "role": "student",
      "is_active": true,
      "created_at": "timestamp",
      "last_login": "timestamp"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

```go
// GET /api/v1/admin/analytics/overview
// Overall system statistics
Response:
{
  "total_users": 1000,
  "active_users_today": 250,
  "new_users_this_month": 150,
  "total_courses": 50,
  "total_exercises": 500,
  "total_enrollments": 5000
}
```

```go
// GET /api/v1/admin/analytics/users?days=30
// User growth analytics
Response:
{
  "new_users": [
    {
      "date": "2025-10-01",
      "count": 15
    }
  ],
  "active_users": [
    {
      "date": "2025-10-01", 
      "count": 250
    }
  ]
}
```

```go
// GET /api/v1/admin/activities?limit=20
// Recent system activities
Response:
[
  {
    "id": "uuid",
    "user_email": "user@example.com",
    "action": "enrolled_course",
    "resource": "Course: IELTS Writing",
    "timestamp": "2025-10-15T10:30:00Z"
  }
]
```

```go
// PUT /api/v1/admin/users/:id/lock
// Lock user account
Response:
{
  "success": true,
  "message": "User locked successfully"
}
```

```go
// PUT /api/v1/admin/users/:id/unlock
// Unlock user account
Response:
{
  "success": true,
  "message": "User unlocked successfully"
}
```

```go
// DELETE /api/v1/admin/users/:id
// Delete user (soft delete)
Response:
{
  "success": true,
  "message": "User deleted successfully"
}
```

#### Course Service - Course Management

```go
// GET /api/v1/admin/analytics/enrollments?days=7
// Enrollment analytics
Response:
{
  "enrollments": [
    {
      "date": "2025-10-15",
      "count": 25
    }
  ],
  "top_courses": [
    {
      "course_id": "uuid",
      "course_title": "IELTS Writing Mastery",
      "enrollment_count": 150
    }
  ]
}
```

```go
// GET /api/v1/admin/courses/:id/analytics
// Detailed course analytics
Response:
{
  "course_id": "uuid",
  "total_enrollments": 150,
  "active_students": 100,
  "completion_rate": 65.5,
  "average_progress": 45.2,
  "revenue": 15000000
}
```

#### Exercise Service

```go
// GET /api/v1/admin/exercises/analytics
// Overall exercise analytics
Response:
{
  "total_exercises": 500,
  "total_attempts": 25000,
  "average_score": 7.2,
  "completion_rate": 78.5
}
```

### 2. Admin Content Management

```go
// POST /api/v1/admin/courses
// Create new course
Body:
{
  "title": "string",
  "description": "string",
  "difficulty": "beginner|intermediate|advanced",
  "price": 0,
  "thumbnail_url": "string"
}
```

```go
// PUT /api/v1/admin/courses/:id
// Update course
```

```go
// DELETE /api/v1/admin/courses/:id
// Delete course
```

```go
// POST /api/v1/admin/courses/:id/publish
// Publish course
```

```go
// POST /api/v1/admin/courses/:id/unpublish
// Unpublish course
```

### 3. Admin Notifications

```go
// POST /api/v1/admin/notifications/broadcast
// Send broadcast notification
Body:
{
  "title": "string",
  "message": "string",
  "target": "all|students|instructors",
  "priority": "low|medium|high"
}
```

```go
// GET /api/v1/admin/notifications/stats
// Notification statistics
Response:
{
  "total_sent": 1000,
  "total_read": 650,
  "read_rate": 65.0,
  "recent_notifications": [...]
}
```

### 4. Admin Settings

```go
// GET /api/v1/admin/settings
// Get system settings
Response:
{
  "maintenance_mode": false,
  "registration_enabled": true,
  "email_verification_required": true,
  "max_upload_size_mb": 10
}
```

```go
// PUT /api/v1/admin/settings
// Update system settings
```

---

## 🔧 Implementation Steps

### Phase 1: Basic Admin APIs (High Priority)
1. ✅ User listing with pagination and filters
2. ✅ Overview analytics (total counts)
3. ✅ User management (lock/unlock/delete)

### Phase 2: Analytics APIs (Medium Priority)
4. ✅ User growth analytics
5. ✅ Enrollment analytics
6. ✅ Course analytics
7. ✅ Exercise analytics

### Phase 3: Content Management (Medium Priority)
8. ✅ Course CRUD operations
9. ✅ Course publish/unpublish
10. ✅ Lesson management

### Phase 4: Advanced Features (Low Priority)
11. ✅ Broadcast notifications
12. ✅ System settings management
13. ✅ Activity logs
14. ✅ Reports and exports

---

## 📝 Database Schema Requirements

### Activity Logs Table
```sql
CREATE TABLE admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_user ON admin_activity_logs(user_id);
CREATE INDEX idx_activity_created ON admin_activity_logs(created_at DESC);
```

### System Settings Table
```sql
CREATE TABLE system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);
```

---

## 🚀 Workaround hiện tại

Trong khi chờ backend implement, frontend đang dùng:
- **Mock data** cho admin dashboard
- **Console error suppression** cho 404 errors
- **Available endpoints** như leaderboard, statistics

## 📚 Related Documents

- `GOOGLE_OAUTH_SETUP.md` - OAuth configuration
- `ROLES_AND_PERMISSIONS.md` - User roles and permissions
- Frontend admin pages: `Frontend-IELTSGo/app/admin/`

---

**Last Updated:** October 16, 2025
