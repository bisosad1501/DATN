// User Types
export interface User {
  id: string
  email: string
  fullName: string
  avatar?: string
  role: "student" | "instructor" | "admin"
  targetBandScore?: number
  bio?: string
  createdAt: string
  updatedAt: string
}

// Auth Types (matching backend structure)
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  phone?: string
  role: "student" | "instructor"
}

export interface AuthResponse {
  success: boolean
  data?: AuthData
  error?: ErrorData
}

export interface AuthData {
  user_id: string
  email: string
  role: "student" | "instructor" | "admin"
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface ErrorData {
  code: string
  message: string
  details?: Record<string, any>
}

export interface GoogleAuthResponse {
  success: boolean
  data?: {
    url: string
    state: string
  }
  error?: ErrorData
}

export interface UserPreferences {
  language: "en" | "vi"
  theme: "light" | "dark" | "auto"
  fontSize: "small" | "medium" | "large"
  timezone: string
  autoPlayNextLesson: boolean
  showAnswerExplanations: boolean
  playbackSpeed: number
}

// Course Types (matching backend)
export interface Course {
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
  
  // Legacy support for frontend components
  thumbnail?: string
  skillType?: string
  enrollmentType?: "FREE" | "PAID"
  rating?: number
  reviewCount?: number
  enrollmentCount?: number
  duration?: number
  lessonCount?: number
}

export interface Module {
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

export interface Lesson {
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
  
  // Legacy support
  moduleId?: string
  contentType?: "VIDEO" | "ARTICLE" | "QUIZ"
  contentUrl?: string
  duration?: number
  order?: number
  isPreview?: boolean
}

// Exercise Types
export interface Exercise {
  id: string
  title: string
  description: string
  skillType: SkillType
  difficulty: Difficulty
  type: "PRACTICE" | "MOCK_TEST" | "QUESTION_BANK"
  questionCount: number
  sectionCount: number
  timeLimit: number
  passingScore: number
  tags: string[]
  averageScore?: number
  attemptCount?: number
  createdAt: string
}

export interface Question {
  id: string
  exerciseId: string
  sectionId: string
  type: QuestionType
  text: string
  options?: string[]
  correctAnswer: string | string[]
  explanation?: string
  order: number
  points: number
}

export interface Submission {
  id: string
  exerciseId: string
  userId: string
  startedAt: string
  submittedAt?: string
  score?: number
  timeSpent?: number
  status: "IN_PROGRESS" | "COMPLETED" | "ABANDONED"
  answers: Answer[]
}

export interface Answer {
  questionId: string
  answer: string | string[]
  isCorrect?: boolean
  timeSpent?: number
}

// Progress Types
export interface Progress {
  userId: string
  courseId?: string
  lessonId?: string
  exerciseId?: string
  completionPercentage: number
  lastAccessedAt: string
  isCompleted: boolean
}

export interface CourseProgress {
  courseId: string
  userId: string
  completedLessons: string[]
  totalLessons: number
  completionPercentage: number
  lastAccessedLessonId?: string
  totalTimeSpent: number
  startedAt: string
  completedAt?: string
}

export interface LessonProgress {
  lessonId: string
  userId: string
  courseId: string
  isCompleted: boolean
  timeSpent: number
  lastPosition?: number
  notes?: Array<{
    id: string
    content: string
    timestamp?: number
    createdAt: string
  }>
  completedAt?: string
}

export interface Statistics {
  totalStudyTime: number
  exercisesCompleted: number
  averageScore: number
  currentStreak: number
  skillScores: {
    listening: number
    reading: number
    writing: number
    speaking: number
  }
}

// Notification Types
export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  actionUrl?: string
  createdAt: string
}

// Achievement Types
export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY"
  category: string
  requirement: string
  earnedAt?: string
  progress?: number
}

// Leaderboard Types
export interface LeaderboardEntry {
  rank: number
  userId: string
  user: User
  points: number
  achievementCount: number
  studyHours: number
  currentStreak: number
}

// Enum Types
export type SkillType = "LISTENING" | "READING" | "WRITING" | "SPEAKING"
export type Level = "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
export type Difficulty = "EASY" | "MEDIUM" | "HARD"
export type QuestionType =
  | "MULTIPLE_CHOICE"
  | "MULTIPLE_SELECT"
  | "FILL_BLANK"
  | "MATCHING"
  | "TRUE_FALSE_NOT_GIVEN"
  | "SHORT_ANSWER"
export type NotificationType = "COURSE_UPDATE" | "EXERCISE_REMINDER" | "ACHIEVEMENT" | "STREAK" | "SYSTEM"

// API Response Types
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiError {
  message: string
  code?: string
  details?: any
}

// Authentication Types
export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  email: string
  password: string
  fullName: string
  targetBandScore?: number
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: User
}
