# 📝 Exercise Service - Frontend Integration Guide

## 🎯 Mục đích
Tài liệu này hướng dẫn chi tiết cách làm Frontend match với Backend Exercise Service.

---

## 📊 Tổng quan Exercise Service

### Backend Structure
- **Service**: Exercise Service (Port 8084)
- **Database**: `exercise_db` (PostgreSQL)
- **API Gateway**: Proxy qua port 8080
- **Base URL**: `http://localhost:8080/api/v1`

### Core Features
1. **Exercise Management** - Quản lý bài tập (Listening & Reading)
2. **Submission System** - Hệ thống nộp bài và chấm điểm
3. **Question Bank** - Ngân hàng câu hỏi
4. **Analytics** - Thống kê và phân tích

---

## 🗂️ Data Models (Backend → Frontend Mapping)

### 1. Exercise Model

**Backend (Go):**
```go
type Exercise struct {
    ID                    uuid.UUID  `json:"id"`
    Title                 string     `json:"title"`
    Slug                  string     `json:"slug"`
    Description           *string    `json:"description,omitempty"`
    ExerciseType          string     `json:"exercise_type"` // practice, mock_test, full_test, mini_test
    SkillType             string     `json:"skill_type"`    // listening, reading
    Difficulty            string     `json:"difficulty"`    // easy, medium, hard
    IELTSLevel            *string    `json:"ielts_level,omitempty"`
    TotalQuestions        int        `json:"total_questions"`
    TotalSections         int        `json:"total_sections"`
    TimeLimitMinutes      *int       `json:"time_limit_minutes,omitempty"`
    ThumbnailURL          *string    `json:"thumbnail_url,omitempty"`
    AudioURL              *string    `json:"audio_url,omitempty"`
    AudioDurationSeconds  *int       `json:"audio_duration_seconds,omitempty"`
    AudioTranscript       *string    `json:"audio_transcript,omitempty"`
    PassageCount          *int       `json:"passage_count,omitempty"`
    CourseID              *uuid.UUID `json:"course_id,omitempty"`
    LessonID              *uuid.UUID `json:"lesson_id,omitempty"`
    PassingScore          *float64   `json:"passing_score,omitempty"`
    TotalPoints           *float64   `json:"total_points,omitempty"`
    IsFree                bool       `json:"is_free"`
    IsPublished           bool       `json:"is_published"`
    TotalAttempts         int        `json:"total_attempts"`
    AverageScore          *float64   `json:"average_score,omitempty"`
    AverageCompletionTime *int       `json:"average_completion_time,omitempty"`
    DisplayOrder          int        `json:"display_order"`
    CreatedBy             uuid.UUID  `json:"created_by"`
    PublishedAt           *time.Time `json:"published_at,omitempty"`
    CreatedAt             time.Time  `json:"created_at"`
    UpdatedAt             time.Time  `json:"updated_at"`
}
```

**Frontend (TypeScript):**
```typescript
export interface Exercise {
  id: string
  title: string
  slug: string
  description?: string
  exercise_type: 'practice' | 'mock_test' | 'full_test' | 'mini_test'
  skill_type: 'listening' | 'reading'
  difficulty: 'easy' | 'medium' | 'hard'
  ielts_level?: string
  total_questions: number
  total_sections: number
  time_limit_minutes?: number
  thumbnail_url?: string
  audio_url?: string
  audio_duration_seconds?: number
  audio_transcript?: string
  passage_count?: number
  course_id?: string
  lesson_id?: string
  passing_score?: number
  total_points?: number
  is_free: boolean
  is_published: boolean
  total_attempts: number
  average_score?: number
  average_completion_time?: number
  display_order: number
  created_by: string
  published_at?: string
  created_at: string
  updated_at: string
}
```

### 2. Exercise Section Model

**Backend:**
```go
type ExerciseSection struct {
    ID               uuid.UUID `json:"id"`
    ExerciseID       uuid.UUID `json:"exercise_id"`
    Title            string    `json:"title"`
    Description      *string   `json:"description,omitempty"`
    SectionNumber    int       `json:"section_number"`
    AudioURL         *string   `json:"audio_url,omitempty"`
    AudioStartTime   *int      `json:"audio_start_time,omitempty"`
    AudioEndTime     *int      `json:"audio_end_time,omitempty"`
    Transcript       *string   `json:"transcript,omitempty"`
    PassageTitle     *string   `json:"passage_title,omitempty"`
    PassageContent   *string   `json:"passage_content,omitempty"`
    PassageWordCount *int      `json:"passage_word_count,omitempty"`
    Instructions     *string   `json:"instructions,omitempty"`
    TotalQuestions   int       `json:"total_questions"`
    TimeLimitMinutes *int      `json:"time_limit_minutes,omitempty"`
    DisplayOrder     int       `json:"display_order"`
    CreatedAt        time.Time `json:"created_at"`
    UpdatedAt        time.Time `json:"updated_at"`
}
```

**Frontend:**
```typescript
export interface ExerciseSection {
  id: string
  exercise_id: string
  title: string
  description?: string
  section_number: number
  audio_url?: string
  audio_start_time?: number
  audio_end_time?: number
  transcript?: string
  passage_title?: string
  passage_content?: string
  passage_word_count?: number
  instructions?: string
  total_questions: number
  time_limit_minutes?: number
  display_order: number
  created_at: string
  updated_at: string
}
```

### 3. Question Model

**Backend:**
```go
type Question struct {
    ID             uuid.UUID  `json:"id"`
    ExerciseID     uuid.UUID  `json:"exercise_id"`
    SectionID      *uuid.UUID `json:"section_id,omitempty"`
    QuestionNumber int        `json:"question_number"`
    QuestionText   string     `json:"question_text"`
    QuestionType   string     `json:"question_type"` // multiple_choice, true_false_not_given, matching, fill_in_blank, etc.
    AudioURL       *string    `json:"audio_url,omitempty"`
    ImageURL       *string    `json:"image_url,omitempty"`
    ContextText    *string    `json:"context_text,omitempty"`
    Points         float64    `json:"points"`
    Difficulty     *string    `json:"difficulty,omitempty"`
    Explanation    *string    `json:"explanation,omitempty"`
    Tips           *string    `json:"tips,omitempty"`
    DisplayOrder   int        `json:"display_order"`
    CreatedAt      time.Time  `json:"created_at"`
    UpdatedAt      time.Time  `json:"updated_at"`
}
```

**Frontend:**
```typescript
export interface Question {
  id: string
  exercise_id: string
  section_id?: string
  question_number: number
  question_text: string
  question_type: 'multiple_choice' | 'true_false_not_given' | 'matching' | 'fill_in_blank' | 'sentence_completion' | 'diagram_labeling'
  audio_url?: string
  image_url?: string
  context_text?: string
  points: number
  difficulty?: 'easy' | 'medium' | 'hard'
  explanation?: string
  tips?: string
  display_order: number
  created_at: string
  updated_at: string
}
```

### 4. Question Option Model

**Backend:**
```go
type QuestionOption struct {
    ID             uuid.UUID `json:"id"`
    QuestionID     uuid.UUID `json:"question_id"`
    OptionLabel    string    `json:"option_label"` // A, B, C, D
    OptionText     string    `json:"option_text"`
    OptionImageURL *string   `json:"option_image_url,omitempty"`
    IsCorrect      bool      `json:"is_correct"`
    DisplayOrder   int       `json:"display_order"`
    CreatedAt      time.Time `json:"created_at"`
}
```

**Frontend:**
```typescript
export interface QuestionOption {
  id: string
  question_id: string
  option_label: string  // A, B, C, D
  option_text: string
  option_image_url?: string
  is_correct: boolean  // Only visible after submission
  display_order: number
  created_at: string
}
```

### 5. Submission Model

**Backend:**
```go
type Submission struct {
    ID                uuid.UUID  `json:"id"`
    UserID            uuid.UUID  `json:"user_id"`
    ExerciseID        uuid.UUID  `json:"exercise_id"`
    AttemptNumber     int        `json:"attempt_number"`
    Status            string     `json:"status"` // in_progress, completed, abandoned
    TotalQuestions    int        `json:"total_questions"`
    QuestionsAnswered int        `json:"questions_answered"`
    CorrectAnswers    int        `json:"correct_answers"`
    Score             *float64   `json:"score,omitempty"`
    BandScore         *float64   `json:"band_score,omitempty"`
    TimeLimitMinutes  *int       `json:"time_limit_minutes,omitempty"`
    TimeSpentSeconds  int        `json:"time_spent_seconds"`
    StartedAt         time.Time  `json:"started_at"`
    CompletedAt       *time.Time `json:"completed_at,omitempty"`
    DeviceType        *string    `json:"device_type,omitempty"`
    CreatedAt         time.Time  `json:"created_at"`
    UpdatedAt         time.Time  `json:"updated_at"`
}
```

**Frontend:**
```typescript
export interface Submission {
  id: string
  user_id: string
  exercise_id: string
  attempt_number: number
  status: 'in_progress' | 'completed' | 'abandoned'
  total_questions: number
  questions_answered: number
  correct_answers: number
  score?: number
  band_score?: number
  time_limit_minutes?: number
  time_spent_seconds: number
  started_at: string
  completed_at?: string
  device_type?: 'web' | 'android' | 'ios'
  created_at: string
  updated_at: string
}
```

---

## 🔌 API Endpoints & Usage

### Student Endpoints

#### 1. Get Exercises List
```typescript
// GET /api/v1/exercises
const getExercises = async (filters?: {
  skill_type?: 'listening' | 'reading'
  difficulty?: 'easy' | 'medium' | 'hard'
  exercise_type?: 'practice' | 'mock_test' | 'full_test'
  is_free?: boolean
  course_id?: string
  lesson_id?: string
  search?: string
  page?: number
  limit?: number
}) => {
  const params = new URLSearchParams()
  if (filters?.skill_type) params.append('skill_type', filters.skill_type)
  if (filters?.difficulty) params.append('difficulty', filters.difficulty)
  if (filters?.exercise_type) params.append('exercise_type', filters.exercise_type)
  if (filters?.is_free !== undefined) params.append('is_free', String(filters.is_free))
  if (filters?.course_id) params.append('course_id', filters.course_id)
  if (filters?.lesson_id) params.append('lesson_id', filters.lesson_id)
  if (filters?.search) params.append('search', filters.search)
  params.append('page', String(filters?.page || 1))
  params.append('limit', String(filters?.limit || 20))

  const response = await apiClient.get(`/exercises?${params}`)
  return response.data
}

// Response:
{
  "success": true,
  "data": {
    "exercises": Exercise[],
    "total": number,
    "page": number,
    "limit": number
  }
}
```

#### 2. Get Exercise Detail (with Sections & Questions)
```typescript
// GET /api/v1/exercises/:id
const getExerciseById = async (id: string) => {
  const response = await apiClient.get(`/exercises/${id}`)
  return response.data
}

// Response:
{
  "success": true,
  "data": {
    "exercise": Exercise,
    "sections": [
      {
        "section": ExerciseSection,
        "questions": [
          {
            "question": Question,
            "options": QuestionOption[]  // Only for multiple_choice
          }
        ]
      }
    ]
  }
}
```

#### 3. Start Exercise (Create Submission)
```typescript
// POST /api/v1/submissions
// OR POST /api/v1/exercises/:id/start (proxied by gateway)
const startExercise = async (exerciseId: string, deviceType?: string) => {
  const response = await apiClient.post('/submissions', {
    exercise_id: exerciseId,
    device_type: deviceType || 'web'
  })
  return response.data
}

// Response:
{
  "success": true,
  "data": {
    "id": "submission-uuid",
    "user_id": "user-uuid",
    "exercise_id": "exercise-uuid",
    "attempt_number": 1,
    "status": "in_progress",
    "total_questions": 40,
    "questions_answered": 0,
    "correct_answers": 0,
    "time_limit_minutes": 60,
    "time_spent_seconds": 0,
    "started_at": "2025-01-21T10:00:00Z",
    "created_at": "2025-01-21T10:00:00Z",
    "updated_at": "2025-01-21T10:00:00Z"
  }
}
```

#### 4. Submit Answers
```typescript
// PUT /api/v1/submissions/:id/answers
const submitAnswers = async (submissionId: string, answers: Array<{
  question_id: string
  selected_option_id?: string  // For multiple_choice
  text_answer?: string         // For fill_in_blank, etc.
  time_spent_seconds?: number
}>) => {
  const response = await apiClient.put(`/submissions/${submissionId}/answers`, {
    answers
  })
  return response.data
}

// Request Body Example:
{
  "answers": [
    {
      "question_id": "q1-uuid",
      "selected_option_id": "option-a-uuid",
      "time_spent_seconds": 30
    },
    {
      "question_id": "q2-uuid",
      "text_answer": "photosynthesis",
      "time_spent_seconds": 45
    }
  ]
}

// Response:
{
  "success": true,
  "data": {
    "message": "Answers submitted and graded successfully"
  }
}
```

#### 5. Get Submission Result
```typescript
// GET /api/v1/submissions/:id/result
const getSubmissionResult = async (submissionId: string) => {
  const response = await apiClient.get(`/submissions/${submissionId}/result`)
  return response.data
}

// Response:
{
  "success": true,
  "data": {
    "submission": Submission,
    "exercise": Exercise,
    "answers": [
      {
        "answer": {
          "id": "answer-uuid",
          "attempt_id": "submission-uuid",
          "question_id": "question-uuid",
          "user_id": "user-uuid",
          "answer_text": "photosynthesis",
          "selected_option_id": null,
          "is_correct": true,
          "points_earned": 1.0,
          "time_spent_seconds": 45,
          "answered_at": "2025-01-21T10:05:00Z"
        },
        "question": Question,
        "correct_answer": "photosynthesis" | QuestionOption
      }
    ],
    "performance": {
      "total_questions": 40,
      "correct_answers": 32,
      "incorrect_answers": 6,
      "skipped_answers": 2,
      "accuracy": 80.0,
      "score": 32.0,
      "percentage": 80.0,
      "band_score": 7.0,
      "is_passed": true,
      "time_spent_seconds": 3600,
      "average_time_per_question": 90.0
    }
  }
}
```

#### 6. Get My Submissions
```typescript
// GET /api/v1/submissions/my
const getMySubmissions = async (page = 1, limit = 20) => {
  const response = await apiClient.get(`/submissions/my?page=${page}&limit=${limit}`)
  return response.data
}

// Response:
{
  "success": true,
  "data": {
    "submissions": [
      {
        "submission": Submission,
        "exercise": Exercise
      }
    ],
    "total": number
  }
}
```

#### 7. Get All Tags
```typescript
// GET /api/v1/tags
const getAllTags = async () => {
  const response = await apiClient.get('/tags')
  return response.data
}

// Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "IELTS Academic",
      "slug": "ielts-academic",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### 8. Get Exercise Tags
```typescript
// GET /api/v1/exercises/:id/tags
const getExerciseTags = async (exerciseId: string) => {
  const response = await apiClient.get(`/exercises/${exerciseId}/tags`)
  return response.data
}
```

---

### Admin/Instructor Endpoints

#### 1. Create Exercise
```typescript
// POST /api/v1/admin/exercises
const createExercise = async (data: {
  title: string
  slug: string
  description?: string
  exercise_type: 'practice' | 'mock_test' | 'full_test' | 'mini_test'
  skill_type: 'listening' | 'reading'
  difficulty: 'easy' | 'medium' | 'hard'
  ielts_level?: string
  time_limit_minutes?: number
  thumbnail_url?: string
  audio_url?: string
  audio_duration_seconds?: number
  passage_count?: number
  course_id?: string
  lesson_id?: string
  passing_score?: number
  is_free?: boolean
}) => {
  const response = await apiClient.post('/admin/exercises', data)
  return response.data
}
```

#### 2. Update Exercise
```typescript
// PUT /api/v1/admin/exercises/:id
const updateExercise = async (id: string, data: {
  title?: string
  description?: string
  difficulty?: string
  time_limit_minutes?: number
  thumbnail_url?: string
  passing_score?: number
  is_free?: boolean
  is_published?: boolean
}) => {
  const response = await apiClient.put(`/admin/exercises/${id}`, data)
  return response.data
}
```

#### 3. Delete Exercise
```typescript
// DELETE /api/v1/admin/exercises/:id
const deleteExercise = async (id: string) => {
  const response = await apiClient.delete(`/admin/exercises/${id}`)
  return response.data
}
```

#### 4. Publish/Unpublish Exercise
```typescript
// POST /api/v1/admin/exercises/:id/publish
const publishExercise = async (id: string) => {
  const response = await apiClient.post(`/admin/exercises/${id}/publish`)
  return response.data
}

// POST /api/v1/admin/exercises/:id/unpublish
const unpublishExercise = async (id: string) => {
  const response = await apiClient.post(`/admin/exercises/${id}/unpublish`)
  return response.data
}
```

#### 5. Create Section
```typescript
// POST /api/v1/admin/exercises/:id/sections
const createSection = async (exerciseId: string, data: {
  title: string
  description?: string
  section_number: number
  audio_url?: string
  audio_start_time?: number
  audio_end_time?: number
  transcript?: string
  passage_title?: string
  passage_content?: string
  passage_word_count?: number
  instructions?: string
  time_limit_minutes?: number
  display_order: number
}) => {
  const response = await apiClient.post(`/admin/exercises/${exerciseId}/sections`, data)
  return response.data
}
```

#### 6. Create Question
```typescript
// POST /api/v1/admin/questions
const createQuestion = async (data: {
  exercise_id: string
  section_id?: string
  question_number: number
  question_text: string
  question_type: string
  audio_url?: string
  image_url?: string
  context_text?: string
  points?: number
  difficulty?: string
  explanation?: string
  tips?: string
  display_order: number
}) => {
  const response = await apiClient.post('/admin/questions', data)
  return response.data
}
```

#### 7. Create Question Option (for Multiple Choice)
```typescript
// POST /api/v1/admin/questions/:id/options
const createQuestionOption = async (questionId: string, data: {
  option_label: string  // A, B, C, D
  option_text: string
  option_image_url?: string
  is_correct: boolean
  display_order: number
}) => {
  const response = await apiClient.post(`/admin/questions/${questionId}/options`, data)
  return response.data
}
```

#### 8. Create Question Answer (for Fill-in-blank, etc.)
```typescript
// POST /api/v1/admin/questions/:id/answer
const createQuestionAnswer = async (questionId: string, data: {
  answer_text: string
  alternative_answers?: string[]
  is_case_sensitive: boolean
  matching_order?: number
}) => {
  const response = await apiClient.post(`/admin/questions/${questionId}/answer`, data)
  return response.data
}
```

#### 9. Get Exercise Analytics
```typescript
// GET /api/v1/admin/exercises/:id/analytics
const getExerciseAnalytics = async (id: string) => {
  const response = await apiClient.get(`/admin/exercises/${id}/analytics`)
  return response.data
}

// Response:
{
  "success": true,
  "data": {
    "exercise_id": "uuid",
    "total_attempts": 150,
    "completed_attempts": 120,
    "abandoned_attempts": 30,
    "average_score": 75.5,
    "median_score": 78.0,
    "highest_score": 98.0,
    "lowest_score": 45.0,
    "average_completion_time": 3600,
    "median_completion_time": 3500,
    "actual_difficulty": "medium",
    "question_statistics": {...},
    "updated_at": "2025-01-21T10:00:00Z"
  }
}
```

#### 10. Question Bank Management
```typescript
// GET /api/v1/admin/question-bank
const getBankQuestions = async (filters?: {
  skill_type?: string
  question_type?: string
  page?: number
  limit?: number
}) => {
  const params = new URLSearchParams()
  if (filters?.skill_type) params.append('skill_type', filters.skill_type)
  if (filters?.question_type) params.append('question_type', filters.question_type)
  params.append('page', String(filters?.page || 1))
  params.append('limit', String(filters?.limit || 20))

  const response = await apiClient.get(`/admin/question-bank?${params}`)
  return response.data
}

// POST /api/v1/admin/question-bank
const createBankQuestion = async (data: {
  title?: string
  skill_type: string
  question_type: string
  difficulty?: string
  topic?: string
  question_text: string
  context_text?: string
  audio_url?: string
  image_url?: string
  answer_data: object
  tags?: string[]
}) => {
  const response = await apiClient.post('/admin/question-bank', data)
  return response.data
}

// PUT /api/v1/admin/question-bank/:id
const updateBankQuestion = async (id: string, data: any) => {
  const response = await apiClient.put(`/admin/question-bank/${id}`, data)
  return response.data
}

// DELETE /api/v1/admin/question-bank/:id
const deleteBankQuestion = async (id: string) => {
  const response = await apiClient.delete(`/admin/question-bank/${id}`)
  return response.data
}
```

---

## 🎨 Frontend Implementation Examples

### 1. Exercise List Page

```typescript
// app/exercises/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { exercisesApi } from '@/lib/api/exercises'
import type { Exercise } from '@/types'

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    skill_type: '',
    difficulty: '',
    exercise_type: '',
    search: ''
  })
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchExercises()
  }, [filters, page])

  const fetchExercises = async () => {
    try {
      setLoading(true)
      const response = await exercisesApi.getExercises(filters, page, 12)
      setExercises(response.data)
      setTotal(response.total)
    } catch (error) {
      console.error('Failed to fetch exercises:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          value={filters.skill_type}
          onChange={(e) => setFilters({...filters, skill_type: e.target.value})}
        >
          <option value="">All Skills</option>
          <option value="listening">Listening</option>
          <option value="reading">Reading</option>
        </select>

        <select
          value={filters.difficulty}
          onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        page={page}
        total={total}
        pageSize={12}
        onPageChange={setPage}
      />
    </div>
  )
}
```

### 2. Exercise Detail & Start Page

```typescript
// app/exercises/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { exercisesApi } from '@/lib/api/exercises'
import type { ExerciseDetailResponse } from '@/types'

export default function ExerciseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const exerciseId = params.id as string

  const [exerciseData, setExerciseData] = useState<ExerciseDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    fetchExerciseDetail()
  }, [exerciseId])

  const fetchExerciseDetail = async () => {
    try {
      setLoading(true)
      const data = await exercisesApi.getExerciseById(exerciseId)
      setExerciseData(data)
    } catch (error) {
      console.error('Failed to fetch exercise:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartExercise = async () => {
    try {
      setStarting(true)
      const submission = await exercisesApi.startExercise(exerciseId)
      // Navigate to exercise taking page
      router.push(`/exercises/${exerciseId}/take/${submission.id}`)
    } catch (error) {
      console.error('Failed to start exercise:', error)
    } finally {
      setStarting(false)
    }
  }

  if (loading || !exerciseData) {
    return <div>Loading...</div>
  }

  const { exercise, sections } = exerciseData

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Exercise Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{exercise.title}</h1>
        <p className="text-gray-600 mb-4">{exercise.description}</p>

        <div className="flex gap-4 mb-6">
          <Badge>{exercise.skill_type}</Badge>
          <Badge>{exercise.difficulty}</Badge>
          <Badge>{exercise.exercise_type}</Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Questions</p>
            <p className="text-xl font-semibold">{exercise.total_questions}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Sections</p>
            <p className="text-xl font-semibold">{exercise.total_sections}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Time Limit</p>
            <p className="text-xl font-semibold">
              {exercise.time_limit_minutes ? `${exercise.time_limit_minutes} mins` : 'No limit'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Passing Score</p>
            <p className="text-xl font-semibold">
              {exercise.passing_score ? `${exercise.passing_score}%` : 'N/A'}
            </p>
          </div>
        </div>

        <Button
          onClick={handleStartExercise}
          disabled={starting}
          size="lg"
        >
          {starting ? 'Starting...' : 'Start Exercise'}
        </Button>
      </div>

      {/* Sections Preview */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Sections</h2>
        {sections.map((sectionData, index) => (
          <Card key={sectionData.section.id}>
            <CardHeader>
              <CardTitle>
                Section {sectionData.section.section_number}: {sectionData.section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{sectionData.section.description}</p>
              <p className="text-sm text-gray-500">
                {sectionData.questions.length} questions
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

### 3. Exercise Taking Page (with Timer & Question Navigation)

```typescript
// app/exercises/[id]/take/[submissionId]/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { exercisesApi } from '@/lib/api/exercises'
import type { ExerciseDetailResponse, QuestionWithOptions } from '@/types'

export default function TakeExercisePage() {
  const params = useParams()
  const router = useRouter()
  const exerciseId = params.id as string
  const submissionId = params.submissionId as string

  const [exerciseData, setExerciseData] = useState<ExerciseDetailResponse | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Map<string, any>>(new Map())
  const [timeSpent, setTimeSpent] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch exercise data
  useEffect(() => {
    fetchExerciseData()
  }, [exerciseId])

  const fetchExerciseData = async () => {
    try {
      const data = await exercisesApi.getExerciseById(exerciseId)
      setExerciseData(data)
    } catch (error) {
      console.error('Failed to fetch exercise:', error)
    }
  }

  // Get all questions flattened
  const allQuestions = exerciseData?.sections.flatMap(s => s.questions) || []
  const currentQuestion = allQuestions[currentQuestionIndex]

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(new Map(answers.set(questionId, answer)))
  }

  const handleNext = () => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)

      // Format answers for API
      const formattedAnswers = Array.from(answers.entries()).map(([questionId, answer]) => {
        const question = allQuestions.find(q => q.question.id === questionId)

        if (question?.question.question_type === 'multiple_choice') {
          return {
            question_id: questionId,
            selected_option_id: answer,
            time_spent_seconds: Math.floor(timeSpent / allQuestions.length)
          }
        } else {
          return {
            question_id: questionId,
            text_answer: answer,
            time_spent_seconds: Math.floor(timeSpent / allQuestions.length)
          }
        }
      })

      // Submit answers
      await exercisesApi.submitAnswers(submissionId, formattedAnswers)

      // Navigate to result page
      router.push(`/exercises/${exerciseId}/result/${submissionId}`)
    } catch (error) {
      console.error('Failed to submit answers:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (!exerciseData || !currentQuestion) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header with Timer */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">
            Question {currentQuestionIndex + 1} of {allQuestions.length}
          </h2>
        </div>
        <div className="text-lg font-mono">
          Time: {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestionIndex + 1) / allQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="mb-6">
            <p className="text-lg font-medium mb-4">
              {currentQuestion.question.question_text}
            </p>

            {currentQuestion.question.context_text && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-700">
                  {currentQuestion.question.context_text}
                </p>
              </div>
            )}

            {currentQuestion.question.image_url && (
              <img
                src={currentQuestion.question.image_url}
                alt="Question"
                className="mb-4 rounded-lg"
              />
            )}
          </div>

          {/* Answer Input */}
          {currentQuestion.question.question_type === 'multiple_choice' ? (
            <div className="space-y-3">
              {currentQuestion.options?.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.question.id}`}
                    value={option.id}
                    checked={answers.get(currentQuestion.question.id) === option.id}
                    onChange={(e) => handleAnswerChange(currentQuestion.question.id, e.target.value)}
                    className="mr-3"
                  />
                  <span>{option.option_label}. {option.option_text}</span>
                </label>
              ))}
            </div>
          ) : (
            <input
              type="text"
              value={answers.get(currentQuestion.question.id) || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.question.id, e.target.value)}
              placeholder="Type your answer here..."
              className="w-full p-3 border rounded-lg"
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          variant="outline"
        >
          Previous
        </Button>

        {currentQuestionIndex === allQuestions.length - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Exercise'}
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Next
          </Button>
        )}
      </div>

      {/* Question Navigator */}
      <div className="mt-8">
        <h3 className="text-sm font-medium mb-3">Question Navigator</h3>
        <div className="grid grid-cols-10 gap-2">
          {allQuestions.map((q, index) => (
            <button
              key={q.question.id}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`
                p-2 rounded text-sm font-medium
                ${index === currentQuestionIndex ? 'bg-primary text-white' : ''}
                ${answers.has(q.question.id) ? 'bg-green-100 text-green-700' : 'bg-gray-100'}
              `}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### 4. Exercise Result Page

```typescript
// app/exercises/[id]/result/[submissionId]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { exercisesApi } from '@/lib/api/exercises'

export default function ExerciseResultPage() {
  const params = useParams()
  const router = useRouter()
  const exerciseId = params.id as string
  const submissionId = params.submissionId as string

  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResult()
  }, [submissionId])

  const fetchResult = async () => {
    try {
      setLoading(true)
      const data = await exercisesApi.getSubmissionResult(submissionId)
      setResult(data)
    } catch (error) {
      console.error('Failed to fetch result:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !result) {
    return <div>Loading...</div>
  }

  const { submission, exercise, answers, performance } = result
  const isPassed = performance.is_passed

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Result Header */}
      <Card className="mb-8">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {isPassed ? (
              <CheckCircle className="w-16 h-16 text-green-500" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-3xl mb-2">
            {isPassed ? 'Congratulations!' : 'Keep Practicing!'}
          </CardTitle>
          <p className="text-gray-600">
            {isPassed ? "You've passed this exercise" : "Don't give up, practice makes perfect"}
          </p>
        </CardHeader>
        <CardContent>
          {/* Score Display */}
          <div className="text-center mb-6">
            <div className="text-5xl font-bold mb-2">
              {performance.score}/{performance.total_questions}
            </div>
            <Progress value={performance.percentage} className="h-3 mb-2" />
            <p className="text-sm text-gray-500">{performance.percentage.toFixed(1)}% Score</p>
            {performance.band_score && (
              <p className="text-lg font-semibold mt-2">
                IELTS Band Score: {performance.band_score}
              </p>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Correct</p>
              <p className="text-2xl font-bold text-green-600">
                {performance.correct_answers}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Incorrect</p>
              <p className="text-2xl font-bold text-red-600">
                {performance.incorrect_answers}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Skipped</p>
              <p className="text-2xl font-bold text-gray-600">
                {performance.skipped_answers}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Time Spent</p>
              <p className="text-2xl font-bold">
                {Math.floor(performance.time_spent_seconds / 60)}m
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answer Review */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Answer Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {answers.map((answerData: any, index: number) => {
            const { answer, question, correct_answer } = answerData
            const isCorrect = answer.is_correct

            return (
              <div key={answer.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium">
                    Question {question.question_number}
                  </p>
                  <Badge className={isCorrect ? 'bg-green-500' : 'bg-red-500'}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </Badge>
                </div>

                <p className="text-sm text-gray-700 mb-3">
                  {question.question_text}
                </p>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Your answer: </span>
                    <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                      {answer.answer_text || answer.selected_option_id || 'Not answered'}
                    </span>
                  </div>

                  {!isCorrect && (
                    <div>
                      <span className="font-medium">Correct answer: </span>
                      <span className="text-green-600">
                        {typeof correct_answer === 'string'
                          ? correct_answer
                          : correct_answer?.option_text}
                      </span>
                    </div>
                  )}

                  {question.explanation && (
                    <div className="mt-3 p-3 bg-blue-50 rounded">
                      <p className="font-medium text-blue-900 mb-1">Explanation:</p>
                      <p className="text-blue-800 text-sm">{question.explanation}</p>
                    </div>
                  )}

                  {question.tips && (
                    <div className="mt-2 p-3 bg-yellow-50 rounded">
                      <p className="font-medium text-yellow-900 mb-1">Tips:</p>
                      <p className="text-yellow-800 text-sm">{question.tips}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <Button variant="outline" onClick={() => router.push('/exercises')}>
          Back to Exercises
        </Button>
        <Button onClick={() => router.push(`/exercises/${exerciseId}`)}>
          Try Again
        </Button>
      </div>
    </div>
  )
}
```

---

## 📋 Complete API Client Implementation

```typescript
// lib/api/exercises.ts
import { apiClient } from './apiClient'
import type {
  Exercise,
  ExerciseDetailResponse,
  Submission,
  QuestionOption
} from '@/types'

export interface ExerciseFilters {
  skill_type?: 'listening' | 'reading'
  difficulty?: 'easy' | 'medium' | 'hard'
  exercise_type?: 'practice' | 'mock_test' | 'full_test' | 'mini_test'
  is_free?: boolean
  course_id?: string
  lesson_id?: string
  search?: string
}

export const exercisesApi = {
  // ========== Student APIs ==========

  // Get exercises list with filters
  getExercises: async (
    filters?: ExerciseFilters,
    page = 1,
    limit = 20
  ) => {
    const params = new URLSearchParams()

    if (filters?.skill_type) params.append('skill_type', filters.skill_type)
    if (filters?.difficulty) params.append('difficulty', filters.difficulty)
    if (filters?.exercise_type) params.append('exercise_type', filters.exercise_type)
    if (filters?.is_free !== undefined) params.append('is_free', String(filters.is_free))
    if (filters?.course_id) params.append('course_id', filters.course_id)
    if (filters?.lesson_id) params.append('lesson_id', filters.lesson_id)
    if (filters?.search) params.append('search', filters.search)
    params.append('page', String(page))
    params.append('limit', String(limit))

    const response = await apiClient.get<{
      success: boolean
      data: {
        exercises: Exercise[]
        total: number
        page: number
        limit: number
      }
    }>(`/exercises?${params}`)

    return response.data.data
  },

  // Get exercise detail with sections and questions
  getExerciseById: async (id: string) => {
    const response = await apiClient.get<{
      success: boolean
      data: ExerciseDetailResponse
    }>(`/exercises/${id}`)

    return response.data.data
  },

  // Start exercise (create submission)
  startExercise: async (exerciseId: string, deviceType = 'web') => {
    const response = await apiClient.post<{
      success: boolean
      data: Submission
    }>('/submissions', {
      exercise_id: exerciseId,
      device_type: deviceType
    })

    return response.data.data
  },

  // Submit answers
  submitAnswers: async (
    submissionId: string,
    answers: Array<{
      question_id: string
      selected_option_id?: string
      text_answer?: string
      time_spent_seconds?: number
    }>
  ) => {
    const response = await apiClient.put<{
      success: boolean
      data: { message: string }
    }>(`/submissions/${submissionId}/answers`, { answers })

    return response.data.data
  },

  // Get submission result
  getSubmissionResult: async (submissionId: string) => {
    const response = await apiClient.get<{
      success: boolean
      data: any
    }>(`/submissions/${submissionId}/result`)

    return response.data.data
  },

  // Get my submissions
  getMySubmissions: async (page = 1, limit = 20) => {
    const response = await apiClient.get<{
      success: boolean
      data: {
        submissions: any[]
        total: number
      }
    }>(`/submissions/my?page=${page}&limit=${limit}`)

    return response.data.data
  },

  // Get all tags
  getAllTags: async () => {
    const response = await apiClient.get<{
      success: boolean
      data: any[]
    }>('/tags')

    return response.data.data
  },

  // Get exercise tags
  getExerciseTags: async (exerciseId: string) => {
    const response = await apiClient.get<{
      success: boolean
      data: any[]
    }>(`/exercises/${exerciseId}/tags`)

    return response.data.data
  },

  // ========== Admin/Instructor APIs ==========

  // Create exercise
  createExercise: async (data: any) => {
    const response = await apiClient.post<{
      success: boolean
      data: Exercise
    }>('/admin/exercises', data)

    return response.data.data
  },

  // Update exercise
  updateExercise: async (id: string, data: any) => {
    const response = await apiClient.put<{
      success: boolean
      data: { message: string }
    }>(`/admin/exercises/${id}`, data)

    return response.data.data
  },

  // Delete exercise
  deleteExercise: async (id: string) => {
    const response = await apiClient.delete<{
      success: boolean
      data: { message: string }
    }>(`/admin/exercises/${id}`)

    return response.data.data
  },

  // Publish exercise
  publishExercise: async (id: string) => {
    const response = await apiClient.post<{
      success: boolean
      data: { message: string }
    }>(`/admin/exercises/${id}/publish`)

    return response.data.data
  },

  // Unpublish exercise
  unpublishExercise: async (id: string) => {
    const response = await apiClient.post<{
      success: boolean
      data: { message: string }
    }>(`/admin/exercises/${id}/unpublish`)

    return response.data.data
  },

  // Create section
  createSection: async (exerciseId: string, data: any) => {
    const response = await apiClient.post<{
      success: boolean
      data: any
    }>(`/admin/exercises/${exerciseId}/sections`, data)

    return response.data.data
  },

  // Create question
  createQuestion: async (data: any) => {
    const response = await apiClient.post<{
      success: boolean
      data: any
    }>('/admin/questions', data)

    return response.data.data
  },

  // Create question option
  createQuestionOption: async (questionId: string, data: any) => {
    const response = await apiClient.post<{
      success: boolean
      data: QuestionOption
    }>(`/admin/questions/${questionId}/options`, data)

    return response.data.data
  },

  // Create question answer
  createQuestionAnswer: async (questionId: string, data: any) => {
    const response = await apiClient.post<{
      success: boolean
      data: any
    }>(`/admin/questions/${questionId}/answer`, data)

    return response.data.data
  },

  // Get exercise analytics
  getExerciseAnalytics: async (id: string) => {
    const response = await apiClient.get<{
      success: boolean
      data: any
    }>(`/admin/exercises/${id}/analytics`)

    return response.data.data
  },

  // Question Bank APIs
  getBankQuestions: async (filters?: any, page = 1, limit = 20) => {
    const params = new URLSearchParams()
    if (filters?.skill_type) params.append('skill_type', filters.skill_type)
    if (filters?.question_type) params.append('question_type', filters.question_type)
    params.append('page', String(page))
    params.append('limit', String(limit))

    const response = await apiClient.get<{
      success: boolean
      data: any
    }>(`/admin/question-bank?${params}`)

    return response.data.data
  },

  createBankQuestion: async (data: any) => {
    const response = await apiClient.post<{
      success: boolean
      data: any
    }>('/admin/question-bank', data)

    return response.data.data
  },

  updateBankQuestion: async (id: string, data: any) => {
    const response = await apiClient.put<{
      success: boolean
      data: { message: string }
    }>(`/admin/question-bank/${id}`, data)

    return response.data.data
  },

  deleteBankQuestion: async (id: string) => {
    const response = await apiClient.delete<{
      success: boolean
      data: { message: string }
    }>(`/admin/question-bank/${id}`)

    return response.data.data
  },

  // Tag management
  createTag: async (name: string, slug: string) => {
    const response = await apiClient.post<{
      success: boolean
      data: any
    }>('/admin/tags', { name, slug })

    return response.data.data
  },

  addTagToExercise: async (exerciseId: string, tagId: number) => {
    const response = await apiClient.post<{
      success: boolean
      data: { message: string }
    }>(`/admin/exercises/${exerciseId}/tags`, { tag_id: tagId })

    return response.data.data
  },

  removeTagFromExercise: async (exerciseId: string, tagId: number) => {
    const response = await apiClient.delete<{
      success: boolean
      data: { message: string }
    }>(`/admin/exercises/${exerciseId}/tags/${tagId}`)

    return response.data.data
  },
}
```

---

## ✅ Checklist để làm FE match với BE

### Data Models
- [ ] Update TypeScript types trong `types/index.ts` để match với Backend models
- [ ] Sử dụng `snake_case` cho field names (match với JSON từ API)
- [ ] Handle optional fields với `?` và `| undefined`
- [ ] Đảm bảo UUID fields là `string` type

### API Integration
- [ ] Implement tất cả endpoints trong `lib/api/exercises.ts`
- [ ] Handle response structure: `{ success: boolean, data: any, error?: any }`
- [ ] Add proper error handling và loading states
- [ ] Implement pagination cho list endpoints

### UI Components
- [ ] Exercise List Page với filters (skill, difficulty, type)
- [ ] Exercise Detail Page với sections preview
- [ ] Exercise Taking Page với timer và question navigation
- [ ] Exercise Result Page với detailed feedback
- [ ] Admin Exercise Management Pages

### Features
- [ ] Timer cho timed exercises
- [ ] Question navigator (grid view)
- [ ] Answer persistence (save to state)
- [ ] Progress indicator
- [ ] Review mode (show correct answers after submission)
- [ ] Analytics dashboard (admin)

### Testing
- [ ] Test với real API endpoints
- [ ] Test error cases (network errors, validation errors)
- [ ] Test pagination
- [ ] Test filters
- [ ] Test submission flow end-to-end

---

## 🎯 Next Steps

1. **Update Types**: Cập nhật file `types/index.ts` với các types từ tài liệu này
2. **Update API Client**: Cập nhật file `lib/api/exercises.ts` với complete implementation
3. **Build UI Components**: Tạo các pages theo examples trên
4. **Test Integration**: Test với backend đang chạy
5. **Handle Edge Cases**: Xử lý các trường hợp đặc biệt (timeout, errors, etc.)

---

**Happy Coding! 🚀**


