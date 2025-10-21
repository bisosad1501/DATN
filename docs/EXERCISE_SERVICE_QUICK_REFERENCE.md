# 📝 Exercise Service - Quick Reference

## 🔗 API Endpoints Summary

### Student Endpoints (Public/Authenticated)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/exercises` | List exercises with filters | Optional |
| GET | `/api/v1/exercises/:id` | Get exercise detail | Optional |
| POST | `/api/v1/submissions` | Start exercise | ✅ Required |
| PUT | `/api/v1/submissions/:id/answers` | Submit answers | ✅ Required |
| GET | `/api/v1/submissions/:id/result` | Get result | ✅ Required |
| GET | `/api/v1/submissions/my` | Get my submissions | ✅ Required |
| GET | `/api/v1/tags` | Get all tags | No |
| GET | `/api/v1/exercises/:id/tags` | Get exercise tags | No |

### Admin/Instructor Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/admin/exercises` | Create exercise |
| PUT | `/api/v1/admin/exercises/:id` | Update exercise |
| DELETE | `/api/v1/admin/exercises/:id` | Delete exercise |
| POST | `/api/v1/admin/exercises/:id/publish` | Publish exercise |
| POST | `/api/v1/admin/exercises/:id/unpublish` | Unpublish exercise |
| POST | `/api/v1/admin/exercises/:id/sections` | Create section |
| POST | `/api/v1/admin/questions` | Create question |
| POST | `/api/v1/admin/questions/:id/options` | Add option |
| POST | `/api/v1/admin/questions/:id/answer` | Add answer |
| GET | `/api/v1/admin/exercises/:id/analytics` | Get analytics |
| GET | `/api/v1/admin/question-bank` | List bank questions |
| POST | `/api/v1/admin/question-bank` | Create bank question |
| PUT | `/api/v1/admin/question-bank/:id` | Update bank question |
| DELETE | `/api/v1/admin/question-bank/:id` | Delete bank question |
| POST | `/api/v1/admin/tags` | Create tag |
| POST | `/api/v1/admin/exercises/:id/tags` | Add tag to exercise |
| DELETE | `/api/v1/admin/exercises/:id/tags/:tag_id` | Remove tag |

---

## 📊 Key Data Models

### Exercise
```typescript
{
  id: string
  title: string
  slug: string
  exercise_type: 'practice' | 'mock_test' | 'full_test' | 'mini_test'
  skill_type: 'listening' | 'reading'
  difficulty: 'easy' | 'medium' | 'hard'
  total_questions: number
  total_sections: number
  time_limit_minutes?: number
  is_free: boolean
  is_published: boolean
}
```

### Question Types
- `multiple_choice` - Trắc nghiệm A, B, C, D
- `true_false_not_given` - True/False/Not Given
- `matching` - Matching headings/information
- `fill_in_blank` - Điền từ vào chỗ trống
- `sentence_completion` - Hoàn thành câu
- `diagram_labeling` - Gắn nhãn sơ đồ

### Submission Status
- `in_progress` - Đang làm bài
- `completed` - Đã hoàn thành
- `abandoned` - Đã bỏ dở

---

## 🔄 Student Flow

### 1. Browse Exercises
```typescript
GET /api/v1/exercises?skill_type=listening&difficulty=medium&page=1&limit=20
```

### 2. View Exercise Detail
```typescript
GET /api/v1/exercises/{id}
// Returns: exercise + sections + questions
```

### 3. Start Exercise
```typescript
POST /api/v1/submissions
Body: { exercise_id: "uuid", device_type: "web" }
// Returns: submission with id
```

### 4. Submit Answers
```typescript
PUT /api/v1/submissions/{id}/answers
Body: {
  answers: [
    { question_id: "uuid", selected_option_id: "uuid" },
    { question_id: "uuid", text_answer: "answer" }
  ]
}
```

### 5. View Result
```typescript
GET /api/v1/submissions/{id}/result
// Returns: submission + exercise + answers + performance
```

---

## 🎨 Frontend Pages Structure

```
app/exercises/
├── page.tsx                          # Exercise list with filters
├── [id]/
│   ├── page.tsx                      # Exercise detail & start
│   ├── take/
│   │   └── [submissionId]/
│   │       └── page.tsx              # Taking exercise
│   └── result/
│       └── [submissionId]/
│           └── page.tsx              # View result
└── history/
    └── page.tsx                      # My submissions history
```

---

## 🛠️ Common Query Parameters

### GET /exercises
- `skill_type`: listening, reading
- `difficulty`: easy, medium, hard
- `exercise_type`: practice, mock_test, full_test, mini_test
- `is_free`: true, false
- `course_id`: UUID
- `lesson_id`: UUID
- `search`: text search
- `page`: page number (default: 1)
- `limit`: items per page (default: 20)

### GET /submissions/my
- `page`: page number
- `limit`: items per page

---

## 📝 Response Format

All API responses follow this structure:

```typescript
{
  success: boolean
  data?: any
  error?: {
    code: string
    message: string
    details?: any
  }
}
```

### Success Response Example
```json
{
  "success": true,
  "data": {
    "exercises": [...],
    "total": 45,
    "page": 1,
    "limit": 20
  }
}
```

### Error Response Example
```json
{
  "success": false,
  "error": {
    "code": "EXERCISE_NOT_FOUND",
    "message": "Exercise not found"
  }
}
```

---

## 🎯 Important Notes

### 1. Field Naming Convention
- **Backend uses `snake_case`**: `exercise_type`, `skill_type`, `total_questions`
- **Frontend should match**: Use same naming in TypeScript types

### 2. UUID Format
- All IDs are UUID v4 strings
- Example: `"550e8400-e29b-41d4-a716-446655440000"`

### 3. Optional Fields
- Fields with `?` in Go are optional
- Can be `null` or omitted in JSON
- Use `?: type | undefined` in TypeScript

### 4. Timestamps
- Format: ISO 8601 string
- Example: `"2025-01-21T10:00:00Z"`
- Use `new Date(timestamp)` to parse

### 5. Pagination
- Default page: 1
- Default limit: 20
- Max limit: 100

### 6. Authentication
- Use JWT token in `Authorization: Bearer {token}` header
- Token stored in localStorage as `access_token`
- Auto-refresh on 401 error

---

## 🔍 Testing Checklist

- [ ] List exercises with different filters
- [ ] View exercise detail
- [ ] Start exercise and get submission ID
- [ ] Submit answers (both multiple choice and text)
- [ ] View result with correct/incorrect answers
- [ ] View submission history
- [ ] Test pagination
- [ ] Test error handling (404, 401, 500)
- [ ] Test with expired token (auto-refresh)
- [ ] Test timer functionality
- [ ] Test question navigation

---

## 🚀 Quick Start Code

### Fetch Exercises
```typescript
const { data } = await apiClient.get('/exercises?skill_type=listening')
const exercises = data.data.exercises
```

### Start Exercise
```typescript
const { data } = await apiClient.post('/submissions', {
  exercise_id: exerciseId,
  device_type: 'web'
})
const submissionId = data.data.id
```

### Submit Answers
```typescript
await apiClient.put(`/submissions/${submissionId}/answers`, {
  answers: [
    { question_id: 'q1', selected_option_id: 'opt1' },
    { question_id: 'q2', text_answer: 'answer' }
  ]
})
```

### Get Result
```typescript
const { data } = await apiClient.get(`/submissions/${submissionId}/result`)
const { submission, performance, answers } = data.data
```

---

## 📚 Related Documentation

- **Full Guide**: `EXERCISE_SERVICE_FRONTEND_GUIDE.md`
- **API Endpoints**: `API_ENDPOINTS.md`
- **Database Schema**: `database/schemas/04_exercise_service.sql`
- **Backend Code**: `services/exercise-service/`

---

**Last Updated**: 2025-01-21

