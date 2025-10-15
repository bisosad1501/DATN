import { apiClient } from "./apiClient"
import type { Course, Lesson, CourseProgress, LessonProgress } from "@/types"

export interface CourseFilters {
  level?: string[]
  skill?: string[]
  duration?: string
  price?: string
  search?: string
  sort?: "popular" | "newest" | "rating" | "price-low" | "price-high"
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export const coursesApi = {
  // Get all courses with filters
  getCourses: async (filters?: CourseFilters, page = 1, pageSize = 12): Promise<PaginatedResponse<Course>> => {
    const params = new URLSearchParams()

    if (filters?.level?.length) params.append("level", filters.level.join(","))
    if (filters?.skill?.length) params.append("skill", filters.skill.join(","))
    if (filters?.duration) params.append("duration", filters.duration)
    if (filters?.price) params.append("price", filters.price)
    if (filters?.search) params.append("search", filters.search)
    if (filters?.sort) params.append("sort", filters.sort)

    params.append("page", page.toString())
    params.append("pageSize", pageSize.toString())

    const response = await apiClient.get<PaginatedResponse<Course>>(`/courses?${params.toString()}`)
    return response.data
  },

  // Get single course by ID
  getCourseById: async (id: string): Promise<Course> => {
    const response = await apiClient.get<Course>(`/courses/${id}`)
    return response.data
  },

  // Get course curriculum (lessons)
  getCourseLessons: async (courseId: string): Promise<Lesson[]> => {
    const response = await apiClient.get<Lesson[]>(`/courses/${courseId}/lessons`)
    return response.data
  },

  // Get single lesson
  getLessonById: async (courseId: string, lessonId: string): Promise<Lesson> => {
    const response = await apiClient.get<Lesson>(`/courses/${courseId}/lessons/${lessonId}`)
    return response.data
  },

  // Enroll in course
  enrollCourse: async (courseId: string): Promise<void> => {
    await apiClient.post(`/courses/${courseId}/enroll`)
  },

  // Get user's enrolled courses
  getEnrolledCourses: async (): Promise<Course[]> => {
    const response = await apiClient.get<Course[]>("/courses/enrolled")
    return response.data
  },

  // Get course progress
  getCourseProgress: async (courseId: string): Promise<CourseProgress> => {
    const response = await apiClient.get<CourseProgress>(`/courses/${courseId}/progress`)
    return response.data
  },

  // Update lesson progress
  updateLessonProgress: async (
    courseId: string,
    lessonId: string,
    progress: Partial<LessonProgress>,
  ): Promise<LessonProgress> => {
    const response = await apiClient.put<LessonProgress>(`/courses/${courseId}/lessons/${lessonId}/progress`, progress)
    return response.data
  },

  // Mark lesson as completed
  completLesson: async (courseId: string, lessonId: string): Promise<void> => {
    await apiClient.post(`/courses/${courseId}/lessons/${lessonId}/complete`)
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
