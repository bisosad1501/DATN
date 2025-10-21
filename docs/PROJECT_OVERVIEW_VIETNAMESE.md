# 🎓 IELTS Learning Platform - Tổng quan Dự án

## 📋 Mục lục
1. [Giới thiệu](#giới-thiệu)
2. [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
3. [Tech Stack](#tech-stack)
4. [Các Services](#các-services)
5. [Database Design](#database-design)
6. [API Structure](#api-structure)
7. [Frontend Structure](#frontend-structure)
8. [Workflow](#workflow)

---

## 🎯 Giới thiệu

**IELTS Learning Platform** là nền tảng học IELTS trực tuyến hoàn chỉnh với:
- 📚 Khóa học video 4 kỹ năng (Listening, Reading, Writing, Speaking)
- 📝 Hệ thống bài tập tự động chấm điểm
- 🤖 AI chấm bài Writing & Speaking
- 📊 Theo dõi tiến độ học tập
- 🏆 Leaderboard và achievements
- 🔔 Hệ thống thông báo

---

## 🏗️ Kiến trúc hệ thống

### Microservices Architecture

```
┌─────────────────────────────────────────────────────────┐
│              API Gateway (Port 8080)                     │
│              - Routing                                   │
│              - Authentication                            │
│              - Rate Limiting                             │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┬─────────────┐
        │                 │                 │             │
┌───────▼────────┐ ┌─────▼──────┐ ┌────────▼────┐ ┌─────▼──────┐
│  Auth Service  │ │User Service│ │Course Service│ │Exercise Srv│
│   Port 8081    │ │ Port 8082  │ │  Port 8083   │ │ Port 8084  │
└────────────────┘ └────────────┘ └──────────────┘ └────────────┘
        │                 │                 │             │
┌───────▼────────┐ ┌─────▼──────┐
│Notification Srv│ │ AI Service │
│   Port 8085    │ │ Port 8086  │
└────────────────┘ └────────────┘
```

### Database per Service Pattern

Mỗi service có database riêng biệt:
- `auth_db` - Authentication & Authorization
- `user_db` - User profiles & Progress
- `course_db` - Courses, Lessons, Videos
- `exercise_db` - Exercises & Submissions
- `notification_db` - Notifications
- `ai_db` - AI Evaluations (future)

---

## 🛠️ Tech Stack

### Backend
- **Language**: Go 1.21+
- **Framework**: Gin (HTTP router)
- **Database**: PostgreSQL 15
- **Cache**: Redis
- **Message Queue**: RabbitMQ
- **Auth**: JWT
- **Container**: Docker & Docker Compose

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS v4
- **UI Library**: Shadcn/UI (Radix UI)
- **HTTP Client**: Axios
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Icons**: Lucide React

### Infrastructure
- **Orchestration**: Docker Compose
- **Database**: PostgreSQL (6 databases)
- **Cache**: Redis
- **Message Queue**: RabbitMQ
- **Admin UI**: PgAdmin

---

## 📦 Các Services

### 1. 🔐 Auth Service (Port 8081)
**Chức năng:**
- Đăng ký/Đăng nhập (Email/Password)
- Google OAuth 2.0
- JWT token generation & validation
- Password reset
- Role-based access control (Student/Instructor/Admin)

**Database**: `auth_db` (9 tables)

**Key Endpoints:**
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/auth/google/url`
- `POST /api/v1/auth/google/token`

---

### 2. 👤 User Service (Port 8082)
**Chức năng:**
- Quản lý profile người dùng
- Theo dõi tiến độ học tập
- Study goals & reminders
- Achievements & badges
- Leaderboard

**Database**: `user_db` (10 tables)

**Key Endpoints:**
- `GET /api/v1/user/profile`
- `PUT /api/v1/user/profile`
- `GET /api/v1/user/progress`
- `GET /api/v1/user/leaderboard`
- `GET /api/v1/user/achievements`

---

### 3. 📚 Course Service (Port 8083)
**Chức năng:**
- Quản lý courses, modules, lessons
- Video lectures (YouTube integration)
- Learning materials
- Course enrollment
- Reviews & ratings

**Database**: `course_db` (12 tables)

**Key Endpoints:**
- `GET /api/v1/courses`
- `GET /api/v1/courses/:id`
- `POST /api/v1/enrollments`
- `GET /api/v1/lessons/:id`
- `POST /api/v1/progress`

**Features:**
- 4 kỹ năng: Listening, Reading, Writing, Speaking
- YouTube video integration
- Auto-sync video duration
- Course categories
- Enrollment management

---

### 4. 📝 Exercise Service (Port 8084)
**Chức năng:**
- Quản lý bài tập (Listening & Reading)
- Question bank
- Auto-grading
- Submission history
- Band score calculation

**Database**: `exercise_db` (11 tables)

**Key Endpoints:**
- `GET /api/v1/exercises`
- `GET /api/v1/exercises/:id`
- `POST /api/v1/submissions`
- `PUT /api/v1/submissions/:id/answers`
- `GET /api/v1/submissions/:id/result`

**Question Types:**
- Multiple Choice
- True/False/Not Given
- Matching
- Fill in the Blank
- Sentence Completion
- Diagram Labeling

---

### 5. 🔔 Notification Service (Port 8085)
**Chức năng:**
- Push notifications
- Email notifications
- In-app notifications
- Study reminders
- Scheduled notifications

**Database**: `notification_db` (8 tables)

**Key Endpoints:**
- `GET /api/v1/notifications`
- `PUT /api/v1/notifications/:id/read`
- `POST /api/v1/notifications/devices`
- `GET /api/v1/notifications/preferences`

---

### 6. 🤖 AI Service (Port 8086) - Future
**Chức năng:**
- Writing evaluation (Task 1 & 2)
- Speaking evaluation (Speech-to-Text)
- Pronunciation analysis
- Detailed feedback
- Band score prediction

---

## 🗄️ Database Design

### Tổng quan
- **Total**: 60 tables across 6 databases
- **Pattern**: Database per Service
- **DBMS**: PostgreSQL 15

### Key Tables

#### Auth Service (auth_db)
- `users` - User accounts
- `roles` - User roles
- `permissions` - Role permissions
- `refresh_tokens` - JWT refresh tokens
- `password_reset_tokens`
- `email_verification_tokens`
- `oauth_providers`
- `oauth_accounts`
- `audit_logs`

#### User Service (user_db)
- `user_profiles`
- `user_progress`
- `study_goals`
- `study_reminders`
- `achievements`
- `user_achievements`
- `leaderboard_entries`
- `study_sessions`
- `user_statistics`
- `user_preferences`

#### Course Service (course_db)
- `courses`
- `course_categories`
- `course_modules`
- `lessons`
- `lesson_videos`
- `lesson_materials`
- `course_enrollments`
- `lesson_progress`
- `video_watch_progress`
- `course_reviews`
- `course_ratings`
- `material_downloads`

#### Exercise Service (exercise_db)
- `exercises`
- `exercise_sections`
- `questions`
- `question_options`
- `question_answers`
- `user_exercise_attempts` (submissions)
- `user_answers`
- `exercise_tags`
- `exercise_tag_mappings`
- `question_bank`
- `exercise_analytics`

#### Notification Service (notification_db)
- `notifications`
- `notification_preferences`
- `device_tokens`
- `scheduled_notifications`
- `notification_templates`
- `notification_delivery_logs`
- `notification_batches`
- `notification_statistics`

---

## 🔗 API Structure

### Base URL
- **Development**: `http://localhost:8080/api/v1`
- **Production**: `https://api.ieltsgo.com/api/v1`

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": { ... }
  }
}
```

### Authentication
```
Authorization: Bearer {JWT_TOKEN}
```

### Pagination
```
?page=1&limit=20
```

---

## 🎨 Frontend Structure

```
Frontend-IELTSGo/
├── app/                          # Next.js App Router
│   ├── (public)/                # Public pages
│   │   ├── page.tsx             # Landing page
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/               # Student dashboard
│   ├── courses/                 # Course pages
│   ├── exercises/               # Exercise pages
│   ├── progress/                # Progress tracking
│   ├── profile/                 # User profile
│   ├── leaderboard/             # Leaderboard
│   ├── instructor/              # Instructor pages
│   └── admin/                   # Admin pages
│
├── components/                  # React components
│   ├── ui/                      # Shadcn/UI components
│   ├── layout/                  # Layout components
│   └── shared/                  # Shared components
│
├── lib/                         # Utilities
│   ├── api/                     # API clients
│   │   ├── apiClient.ts
│   │   ├── auth.ts
│   │   ├── courses.ts
│   │   ├── exercises.ts
│   │   ├── notifications.ts
│   │   └── progress.ts
│   ├── contexts/                # React contexts
│   ├── hooks/                   # Custom hooks
│   └── utils/                   # Helper functions
│
└── types/                       # TypeScript types
    ├── index.ts
    ├── auth.ts
    └── admin.ts
```

---

## 🔄 Workflow

### Student Learning Flow

1. **Đăng ký/Đăng nhập**
   - Email/Password hoặc Google OAuth
   - Nhận JWT token

2. **Browse Courses**
   - Xem danh sách khóa học
   - Filter theo skill, level
   - Xem chi tiết khóa học

3. **Enroll Course**
   - Đăng ký khóa học (free/paid)
   - Truy cập lessons

4. **Learn Lessons**
   - Xem video lectures
   - Download materials
   - Track progress

5. **Practice Exercises**
   - Browse exercises
   - Start exercise
   - Submit answers
   - View results

6. **Track Progress**
   - View dashboard
   - Check statistics
   - See leaderboard

### Admin/Instructor Flow

1. **Login as Admin/Instructor**

2. **Manage Courses**
   - Create/Edit/Delete courses
   - Add modules & lessons
   - Upload videos
   - Manage enrollments

3. **Manage Exercises**
   - Create exercises
   - Add sections & questions
   - Set correct answers
   - Publish exercises

4. **View Analytics**
   - Student progress
   - Exercise statistics
   - Course performance

5. **Send Notifications**
   - Create notifications
   - Schedule reminders
   - Bulk notifications

---

## 📊 Key Features

### ✅ Implemented
- Authentication & Authorization (JWT + Google OAuth)
- Course Management (CRUD)
- Video Integration (YouTube)
- Exercise System (Listening & Reading)
- Auto-grading
- Progress Tracking
- Notification System
- Leaderboard
- Admin Dashboard
- Instructor Dashboard

### 🔄 In Progress
- AI Writing Evaluation
- AI Speaking Evaluation
- Payment Integration

### ⏳ Planned
- Mobile App (Android)
- Live Classes
- Community Forum
- Certificate Generation

---

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for frontend)
- pnpm (recommended)

### Backend Setup
```bash
cd DATN
chmod +x setup.sh
./setup.sh
```

### Frontend Setup
```bash
cd Frontend-IELTSGo
./setup-team.sh
```

### Access
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **PgAdmin**: http://localhost:5050

---

## 📚 Documentation

- **Quick Start**: `QUICK_START.md`
- **Team Setup**: `TEAM_SETUP.md`
- **Frontend Guide**: `FRONTEND_MASTER_GUIDE.md`
- **API Endpoints**: `docs/API_ENDPOINTS.md`
- **Exercise Service**: `docs/EXERCISE_SERVICE_FRONTEND_GUIDE.md`
- **Database Schema**: `database/README.md`

---

**Last Updated**: 2025-01-21
**Version**: 1.0.0

