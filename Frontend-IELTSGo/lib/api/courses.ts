import { apiClient } from "./apiClient"
import type {
  Course,
  Lesson,
  CourseProgress,
  LessonProgress,
  UpdateLessonProgressRequest,
  EnrollmentProgressResponse,
  CourseEnrollment
} from "@/types"

export interface CourseFilters {
  level?: string
  skill_type?: string
  enrollment_type?: string
  is_featured?: boolean
  search?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: {
    code: string
    message: string
    details?: string
  }
}

export const coursesApi = {
  // Get all courses with filters
  getCourses: async (filters?: CourseFilters, page = 1, limit = 12): Promise<PaginatedResponse<Course>> => {
    const params = new URLSearchParams()

    // Backend uses: skill_type, level, enrollment_type, is_featured, search, page, limit
    if (filters?.level) params.append("level", filters.level)
    if (filters?.skill_type) params.append("skill_type", filters.skill_type)
    if (filters?.enrollment_type) params.append("enrollment_type", filters.enrollment_type)
    if (filters?.is_featured !== undefined) params.append("is_featured", String(filters.is_featured))
    if (filters?.search) params.append("search", filters.search)

    params.append("page", page.toString())
    params.append("limit", limit.toString())

    const response = await apiClient.get<ApiResponse<{ courses: Course[]; count: number }>>(`/courses?${params.toString()}`)
    
    // Transform backend response to frontend format
    return {
      data: response.data.data.courses || [],
      total: response.data.data.count || 0,
      page: page,
      pageSize: limit,
      totalPages: Math.ceil((response.data.data.count || 0) / limit),
    }
  },

  // Get single course by ID with full details (modules and lessons)
  getCourseById: async (id: string): Promise<{
    course: Course
    modules: Array<{
      module: any
      lessons: Lesson[]
    }>
    is_enrolled: boolean
    enrollment_details?: any
  }> => {
    const response = await apiClient.get<ApiResponse<any>>(`/courses/${id}`)
    return response.data.data
  },

  // Alias for getCourseById (for consistency)
  getCourseDetail: async (id: string) => {
    return coursesApi.getCourseById(id)
  },

  // Get course curriculum (lessons) - using course detail endpoint
  getCourseLessons: async (courseId: string): Promise<Lesson[]> => {
    const courseDetail = await coursesApi.getCourseById(courseId)
    // Flatten all lessons from all modules
    const allLessons: Lesson[] = []
    if (courseDetail.modules && Array.isArray(courseDetail.modules)) {
      courseDetail.modules.forEach(moduleData => {
        if (moduleData.lessons && Array.isArray(moduleData.lessons)) {
          allLessons.push(...moduleData.lessons)
        }
      })
    }
    return allLessons
  },

  // Get single lesson
  getLessonById: async (
    lessonId: string
  ): Promise<{
    lesson: Lesson
    videos: any[]
    materials: any[]
  }> => {
    try {
      const response = await apiClient.get<
        ApiResponse<{
          lesson: Lesson
          videos: any[]
          materials: any[]
        }>
      >(`/lessons/${lessonId}`)

      if (response.data.success && response.data.data) {
        return {
          lesson: response.data.data.lesson,
          videos: response.data.data.videos || [],
          materials: response.data.data.materials || [],
        }
      }

      throw new Error('Failed to fetch lesson')
    } catch (error) {
      console.error('Error fetching lesson:', error)
      throw error
    }
  },

  // Enroll in course
  enrollCourse: async (courseId: string): Promise<void> => {
    console.log('[DEBUG API] Enrolling with courseId:', courseId)
    console.log('[DEBUG API] Payload:', { course_id: courseId })
    const response = await apiClient.post(`/enrollments`, { course_id: courseId })
    console.log('[DEBUG API] Enrollment response:', response.data)
  },

  // Get user's enrolled courses
  getEnrolledCourses: async (): Promise<Course[]> => {
    const response = await apiClient.get<ApiResponse<{ enrollments: any[]; total: number }>>("/enrollments/my")
    // Backend returns { enrollments: [...], total: number }
    // Each enrollment has { enrollment: {...}, course: {...} }
    if (!response.data.data.enrollments || !Array.isArray(response.data.data.enrollments)) {
      return []
    }
    return response.data.data.enrollments.map((item: any) => item.course)
  },

  // Get enrollment progress (detailed progress with modules)
  getEnrollmentProgress: async (enrollmentId: string): Promise<EnrollmentProgressResponse> => {
    const response = await apiClient.get<ApiResponse<EnrollmentProgressResponse>>(`/enrollments/${enrollmentId}/progress`)
    return response.data.data
  },

  // Get course progress (simple progress percentage)
  getCourseProgress: async (enrollmentId: string): Promise<CourseProgress> => {
    const response = await apiClient.get<ApiResponse<CourseProgress>>(`/enrollments/${enrollmentId}/progress`)
    return response.data.data
  },

  // Update lesson progress
  updateLessonProgress: async (
    lessonId: string,
    progress: UpdateLessonProgressRequest,
  ): Promise<LessonProgress> => {
    const response = await apiClient.put<ApiResponse<LessonProgress>>(`/progress/lessons/${lessonId}`, progress)
    return response.data.data
  },

  // Mark lesson as completed
  completeLesson: async (lessonId: string): Promise<LessonProgress> => {
    const response = await apiClient.put<ApiResponse<LessonProgress>>(`/progress/lessons/${lessonId}`, {
      is_completed: true
    })
    return response.data.data
  },

  // Add lesson note
  addLessonNote: async (
    courseId: string,
    lessonId: string,
    note: { content: string; timestamp?: number },
  ): Promise<void> => {
    await apiClient.post(`/courses/${courseId}/lessons/${lessonId}/notes`, note)
  },

  // Get lesson notes
  getLessonNotes: async (
    courseId: string,
    lessonId: string,
  ): Promise<Array<{ id: string; content: string; timestamp?: number; createdAt: string }>> => {
    const response = await apiClient.get(`/courses/${courseId}/lessons/${lessonId}/notes`)
    return response.data
  },
}
