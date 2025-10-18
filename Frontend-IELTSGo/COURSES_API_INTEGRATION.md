# Courses Page - Backend API Integration

## Tóm tắt
Đã tích hợp API backend thật vào trang `/courses` của frontend.

## Các thay đổi

### 1. API Client (`lib/api/courses.ts`)
**Thay đổi:**
- ✅ Cập nhật `CourseFilters` interface để match với backend:
  - `skill_type`: string (listening, reading, writing, speaking, general)
  - `level`: string (beginner, intermediate, advanced)
  - `enrollment_type`: string (free, premium)
  - `is_featured`: boolean
  - `search`: string

- ✅ Thêm `ApiResponse<T>` interface để handle response format từ backend:
  ```typescript
  interface ApiResponse<T> {
    success: boolean
    data: T
    message?: string
    error?: { code: string, message: string, details?: string }
  }
  ```

- ✅ Cập nhật `getCourses()`:
  - Backend endpoint: `GET /api/v1/courses?skill_type=listening&level=beginner&enrollment_type=free&is_featured=true&search=xxx&page=1&limit=12`
  - Response format: `{ success: true, data: { courses: Course[], count: number } }`
  - Transform response to frontend `PaginatedResponse` format

- ✅ Cập nhật `getCourseById()`:
  - Backend endpoint: `GET /api/v1/courses/:id`
  - Response: `{ course, modules, is_enrolled, enrollment_details }`

- ✅ Cập nhật `getLessonById()`:
  - Backend endpoint: `GET /api/v1/lessons/:id`

- ✅ Cập nhật `enrollCourse()`:
  - Backend endpoint: `POST /api/v1/enrollments` với body `{ course_id }`

- ✅ Cập nhật `getEnrolledCourses()`:
  - Backend endpoint: `GET /api/v1/enrollments/my`

- ✅ Cập nhật `updateLessonProgress()`:
  - Backend endpoint: `PUT /api/v1/progress/lessons/:lessonId`

### 2. Types (`types/index.ts`)
**Thay đổi:**
- ✅ Cập nhật `Course` interface để match với backend schema:
  ```typescript
  interface Course {
    id: string
    title: string
    slug: string
    description?: string
    short_description?: string
    skill_type: string // listening, reading, writing, speaking, general
    level: string // beginner, intermediate, advanced
    target_band_score?: number
    thumbnail_url?: string
    preview_video_url?: string
    instructor_id: string
    instructor_name?: string
    duration_hours?: number
    total_lessons: number
    total_videos: number
    enrollment_type: string // free, premium, subscription
    price: number
    currency: string
    status: string // draft, published, archived
    is_featured: boolean
    is_recommended: boolean
    total_enrollments: number
    average_rating: number
    total_reviews: number
    display_order: number
    published_at?: string
    created_at: string
    updated_at: string
    
    // Legacy support for old components
    thumbnail?: string
    skillType?: string
    enrollmentType?: "FREE" | "PAID"
    rating?: number
    reviewCount?: number
    enrollmentCount?: number
    duration?: number
    lessonCount?: number
  }
  ```

- ✅ Cập nhật `Module` interface:
  ```typescript
  interface Module {
    id: string
    course_id: string
    title: string
    description?: string
    duration_hours?: number
    total_lessons: number
    display_order: number
    is_published: boolean
    created_at: string
    updated_at: string
    lessons?: Lesson[]
  }
  ```

- ✅ Cập nhật `Lesson` interface:
  ```typescript
  interface Lesson {
    id: string
    module_id: string
    course_id: string
    title: string
    description?: string
    content_type: string // video, article, quiz, exercise
    duration_minutes?: number
    display_order: number
    is_free: boolean
    is_published: boolean
    total_completions: number
    average_time_spent?: number
    created_at: string
    updated_at: string
  }
  ```

### 3. CourseCard Component (`components/courses/course-card.tsx`)
**Thay đổi:**
- ✅ Cập nhật để đọc cả field mới (snake_case) và cũ (camelCase):
  ```typescript
  const skillType = course.skill_type || course.skillType || ''
  const level = course.level || 'beginner'
  const thumbnail = course.thumbnail_url || course.thumbnail
  const enrollmentType = course.enrollment_type || course.enrollmentType
  const instructorName = course.instructor_name
  ```

- ✅ Cập nhật skill colors để support lowercase values:
  ```typescript
  const skillColors: Record<string, string> = {
    listening: "bg-blue-500",
    reading: "bg-green-500",
    writing: "bg-orange-500",
    speaking: "bg-purple-500",
    general: "bg-gray-500",
  }
  ```

- ✅ Cập nhật hiển thị stats với fallback:
  ```typescript
  average_rating || rating || 0
  total_reviews || reviewCount || 0
  total_enrollments || enrollmentCount || 0
  total_lessons || lessonCount || 0
  duration_hours || duration || 0
  ```

### 4. CourseFilters Component (`components/courses/course-filters.tsx`)
**Thay đổi:**
- ✅ Đổi từ multiple selection sang single selection:
  - Backend chỉ support 1 skill_type, 1 level, 1 enrollment_type tại một thời điểm
  - Không còn dùng array cho filters

- ✅ Thêm filter cho `enrollment_type`:
  ```typescript
  const ENROLLMENT_TYPE_OPTIONS = [
    { value: "free", label: "Free" },
    { value: "premium", label: "Premium" },
  ]
  ```

- ✅ Thêm checkbox cho `is_featured`

- ✅ Xóa filters không còn dùng:
  - ❌ `duration` (backend không hỗ trợ)
  - ❌ `sort` (có thể thêm sau)

- ✅ Cập nhật active filter badges để hiển thị đúng

### 5. Courses Page (`app/courses/page.tsx`)
**Không thay đổi** - Component này đã sử dụng `coursesApi` nên sẽ tự động hoạt động với API mới.

## Backend Endpoints được sử dụng

### Public Endpoints (no auth required, optional auth for enrollment status)
```
GET  /api/v1/courses                     # List courses with filters
GET  /api/v1/courses/:id                 # Get course detail
GET  /api/v1/lessons/:id                 # Get lesson detail
GET  /api/v1/categories                  # Get all categories
GET  /api/v1/courses/:id/reviews         # Get course reviews
```

### Protected Endpoints (auth required)
```
POST /api/v1/enrollments                 # Enroll in course
GET  /api/v1/enrollments/my              # Get my enrollments
GET  /api/v1/enrollments/:id/progress    # Get enrollment progress
PUT  /api/v1/progress/lessons/:id        # Update lesson progress
POST /api/v1/courses/:id/reviews         # Create course review
POST /api/v1/videos/track                # Track video progress
```

## Query Parameters Supported

### GET /api/v1/courses
- `skill_type`: listening | reading | writing | speaking | general
- `level`: beginner | intermediate | advanced
- `enrollment_type`: free | premium
- `is_featured`: true | false
- `search`: text search in title, description
- `page`: page number (default: 1)
- `limit`: items per page (default: 12)

## Testing

### Test với data thật:
1. Start backend services:
   ```bash
   cd /Users/bisosad/DATN
   make up
   ```

2. Start frontend:
   ```bash
   cd Frontend-IELTSGo
   pnpm dev
   ```

3. Navigate to: http://localhost:3000/courses

4. Test filters:
   - Filter by skill type (Listening, Reading, Writing, Speaking)
   - Filter by level (Beginner, Intermediate, Advanced)
   - Filter by enrollment type (Free, Premium)
   - Filter by featured courses
   - Search by keyword

### Expected behavior:
- ✅ Courses list loads from backend
- ✅ Filters work and update the list
- ✅ Search works
- ✅ Course cards display correct information
- ✅ Clicking on a course navigates to detail page
- ✅ Pagination works (if have enough courses)

## Notes

- Backend API Gateway runs on port 8080
- Course Service runs on port 8085 (proxied through gateway)
- Frontend uses `/api/v1` prefix for all API calls
- All timestamps are in ISO 8601 format
- Prices are in USD by default
- Images should be uploaded to CDN (bunny.net or similar)

## Next Steps

1. **Seed database** với sample courses để test
2. **Upload course thumbnails** to CDN
3. **Implement course detail page** (`/courses/[id]`)
4. **Implement enrollment flow**
5. **Add sorting** options (most popular, newest, highest rated)
6. **Add pagination controls** to UI
