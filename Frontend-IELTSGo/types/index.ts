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
  fullName?: string
  targetBandScore?: number
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

// User Preferences - matches backend UserPreferences struct
export interface UserPreferences {
  user_id: string
  email_notifications: boolean
  push_notifications: boolean
  study_reminders: boolean
  weekly_report: boolean
  theme: "light" | "dark" | "auto"
  font_size: "small" | "medium" | "large"
  locale: "vi" | "en"
  auto_play_next_lesson: boolean
  show_answer_explanation: boolean
  playback_speed: number // 0.75, 1.0, 1.25, 1.5, 2.0
  profile_visibility: "public" | "friends" | "private"
  show_study_stats: boolean
  updated_at: string
}

// Notification Preferences (from Notification Service)
export interface NotificationPreferences {
  push_enabled: boolean
  push_achievements: boolean
  push_reminders: boolean
  push_course_updates: boolean
  push_exercise_graded: boolean
  email_enabled: boolean
  email_weekly_report: boolean
  email_course_updates: boolean
  email_marketing: boolean
  in_app_enabled: boolean
  quiet_hours_enabled: boolean
  quiet_hours_start?: string | null // "22:00:00"
  quiet_hours_end?: string | null   // "08:00:00"
  max_notifications_per_day: number
  timezone: string
  updated_at: string
}

// Update Notification Preferences Request
export interface UpdateNotificationPreferencesRequest {
  push_enabled?: boolean
  push_achievements?: boolean
  push_reminders?: boolean
  push_course_updates?: boolean
  push_exercise_graded?: boolean
  email_enabled?: boolean
  email_weekly_report?: boolean
  email_course_updates?: boolean
  email_marketing?: boolean
  in_app_enabled?: boolean
  quiet_hours_enabled?: boolean
  quiet_hours_start?: string | null // "22:00:00"
  quiet_hours_end?: string | null   // "08:00:00"
  max_notifications_per_day?: number
  timezone?: string
}

// Update Preferences Request - all fields optional for partial updates
export interface UpdatePreferencesRequest {
  email_notifications?: boolean
  push_notifications?: boolean
  study_reminders?: boolean
  weekly_report?: boolean
  theme?: "light" | "dark" | "auto"
  font_size?: "small" | "medium" | "large"
  locale?: "vi" | "en"
  auto_play_next_lesson?: boolean
  show_answer_explanation?: boolean
  playback_speed?: number
  profile_visibility?: "public" | "friends" | "private"
  show_study_stats?: boolean
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
  total_exercises: number  // NEW: Separate count for exercises
  display_order: number
  is_published: boolean
  created_at: string
  updated_at: string
  lessons?: Lesson[]
  exercises?: ExerciseSummary[]  // NEW: Exercises array
}

export interface Lesson {
  id: string
  module_id: string
  course_id: string
  title: string
  description?: string
  content_type: 'video' | 'article' | 'quiz'  // UPDATED: Removed 'exercise'
  duration_minutes?: number
  display_order: number
  is_free: boolean
  is_published: boolean
  // completion_criteria removed - no longer needed
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

// NEW: Exercise summary for course detail response
export interface ExerciseSummary {
  id: string
  title: string
  slug: string
  description?: string
  exercise_type: string  // practice, mock_test
  skill_type: string
  difficulty: string
  total_questions: number
  total_sections: number
  time_limit_minutes?: number
  passing_score?: number
  display_order: number
}

// Exercise Types
export interface Exercise {
  id: string
  title: string
  slug?: string
  description?: string
  // Backend uses snake_case
  exercise_type?: string  // practice, mock_test, full_test
  skill_type?: string     // listening, reading, writing, speaking
  difficulty?: string     // easy, medium, hard
  difficulty_level?: string  // alias for difficulty
  ielts_level?: string
  total_questions?: number
  total_sections?: number
  time_limit_minutes?: number
  thumbnail_url?: string
  audio_url?: string
  audio_duration_seconds?: number
  audio_transcript?: string
  passage_count?: number
  course_id?: string      // NEW: Link to course (not lesson)
  module_id?: string      // NEW: Link to module (not lesson)
  // lesson_id removed - exercises no longer linked to lessons
  passing_score?: number
  max_score?: number
  total_points?: number
  is_free?: boolean
  is_published?: boolean
  is_official?: boolean
  target_band_score?: number
  instructions?: string
  total_attempts?: number
  average_score?: number
  average_completion_time?: number
  display_order?: number
  created_by?: string
  published_at?: string
  created_at?: string
  updated_at?: string

  // Legacy camelCase support (for backward compatibility)
  skillType?: SkillType
  type?: "PRACTICE" | "MOCK_TEST" | "QUESTION_BANK"
  questionCount?: number
  sectionCount?: number
  timeLimit?: number
  duration?: number
  passingScore?: number
  tags?: string[]
  attemptCount?: number
  createdAt?: string
}

// Exercise stats
export interface ExerciseStats {
  total_attempts: number
  average_score?: number
  best_score?: number
  completion_rate?: number
}

// Section with details (flattened structure from API)
export interface ExerciseSectionWithDetails {
  id: string
  exercise_id: string
  title: string
  description?: string
  section_number: number
  question_count: number
  max_score?: number
  audio_url?: string
  audio_start_time?: number
  audio_end_time?: number
  transcript?: string
  passage_title?: string
  passage_content?: string
  passage_word_count?: number
  instructions?: string
  total_questions?: number
  time_limit_minutes?: number
  display_order: number
  created_at: string
  updated_at: string
}

// Exercise detail response with sections and questions
export interface ExerciseDetailResponse {
  exercise: Exercise
  sections: ExerciseSection[]  // Backend returns array of {section, questions}
  stats?: ExerciseStats
}

// Section with nested structure (for questions list)
export interface ExerciseSection {
  section: {
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
  questions: QuestionWithOptions[]
}

export interface QuestionOption {
  id: string
  question_id: string
  option_label: string  // A, B, C, D
  option_text: string
  option_image_url?: string
  is_correct: boolean
  display_order: number
  created_at: string
}

export interface QuestionWithOptions {
  question: Question
  options?: QuestionOption[]
}

export interface Question {
  id: string
  exercise_id: string
  section_id?: string
  question_number: number
  question_text: string
  question_type: string  // multiple_choice, true_false_not_given, matching, fill_in_blank, etc.
  audio_url?: string
  image_url?: string
  context_text?: string
  points: number
  difficulty?: string
  explanation?: string
  tips?: string
  display_order: number
  created_at: string
  updated_at: string
  
  // Legacy support
  exerciseId?: string
  sectionId?: string
  type?: QuestionType
  text?: string
  options?: string[]
  correctAnswer?: string | string[]
  order?: number
}

export interface QuestionOption {
  id: string
  question_id: string
  option_label: string  // A, B, C, D
  option_text: string
  option_image_url?: string
  is_correct: boolean
  display_order: number
  created_at: string
}

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

export interface SubmissionWithExercise {
  submission: Submission
  exercise: Exercise
}

export interface SubmissionAnswer {
  id: string
  attempt_id: string
  question_id: string
  user_id: string
  answer_text?: string
  selected_option_id?: string
  is_correct?: boolean
  points_earned?: number
  time_spent_seconds?: number
  answered_at: string
}

export interface SubmissionResult {
  submission: Submission
  exercise: Exercise
  answers: Array<{
    answer: SubmissionAnswer
    question: Question
    correct_answer: string | QuestionOption
  }>
  performance: {
    total_questions: number
    correct_answers: number
    incorrect_answers: number
    skipped_answers: number
    accuracy: number
    score: number
    percentage: number
    band_score?: number
    is_passed: boolean
    time_spent_seconds: number
    average_time_per_question: number
  }
}

// Legacy support
export interface Answer {
  questionId: string
  answer: string | string[]
  isCorrect?: boolean
  timeSpent?: number
}

export interface ExerciseResult {
  id: string
  exerciseId: string
  score: number
  totalScore: number
  correctAnswers: number
  totalQuestions: number
  timeSpent: number
  feedback?: string
  answers?: Array<{
    question: string
    userAnswer: string
    correctAnswer: string
    isCorrect: boolean
  }>
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

// Lesson Progress - matches Backend schema
export interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  course_id: string
  status: 'not_started' | 'in_progress' | 'completed'
  progress_percentage: number
  video_watched_seconds: number
  video_total_seconds?: number
  // video_watch_percentage REMOVED - Migration 011 (redundant with progress_percentage)
  // time_spent_minutes REMOVED - Migration 013 (SOURCE OF TRUTH: last_position_seconds)
  last_position_seconds: number // For resume watching & time calculation
  completed_at?: string
  first_accessed_at: string
  last_accessed_at: string
}

// Update Lesson Progress Request
export interface UpdateLessonProgressRequest {
  progress_percentage?: number
  video_watched_seconds?: number
  video_total_seconds?: number
  is_completed?: boolean
}

// Enrollment Progress Response
export interface EnrollmentProgressResponse {
  enrollment: CourseEnrollment
  course: Course
  modules_progress: ModuleProgress[]
  recent_lessons: LessonWithProgress[]
}

export interface ModuleProgress {
  module: Module
  total_lessons: number
  completed_lessons: number
  progress_percentage: number
}

export interface LessonWithProgress {
  lesson: Lesson
  progress: LessonProgress
}

// Course Enrollment - matches Backend schema
export interface CourseEnrollment {
  id: string
  user_id: string
  course_id: string
  enrollment_date: string
  enrollment_type: 'free' | 'purchased' | 'subscription'
  payment_id?: string
  amount_paid?: number
  currency?: string
  progress_percentage: number
  lessons_completed: number
  total_time_spent_minutes: number
  status: 'active' | 'completed' | 'expired' | 'cancelled'
  completed_at?: string
  certificate_issued: boolean
  certificate_url?: string
  expires_at?: string
  last_accessed_at?: string
  created_at: string
  updated_at: string
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
  userId?: string
  user_id?: string
  type: string // achievement, reminder, course_update, exercise_graded, system (not strict NotificationType)
  category?: "info" | "success" | "warning" | "alert"
  title: string
  message: string
  isRead?: boolean
  is_read?: boolean // Backend format
  read?: boolean // Alias for isRead
  actionUrl?: string
  action_type?: string // navigate_to_course, navigate_to_lesson, external_link
  action_data?: {
    course_id?: string
    lesson_id?: string
    url?: string
    user_id?: string
    [key: string]: any
  }
  createdAt?: string
  created_at?: string // Backend format (ISO8601)
  readAt?: string
  read_at?: string // Backend format
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

// Authentication Types (duplicate removed - see RegisterData above)
export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}
