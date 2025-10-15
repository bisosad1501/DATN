import { apiClient } from "./apiClient"
import type { Course, Exercise, PaginatedResponse } from "@/types"

export interface InstructorStats {
  totalCourses: number
  publishedCourses: number
  draftCourses: number
  totalExercises: number
  publishedExercises: number
  draftExercises: number
  totalStudents: number
  activeStudents: number
  averageCompletionRate: number
  completionTrend: number
}

export interface InstructorActivity {
  id: string
  type: "enrollment" | "completion" | "review" | "submission"
  action: string
  studentName: string
  studentAvatar?: string
  contentTitle: string
  timestamp: string
}

export const instructorApi = {
  // Dashboard
  async getDashboardStats(): Promise<InstructorStats> {
    const response = await apiClient.get<InstructorStats>("/instructor/dashboard/stats")
    return response.data
  },

  async getRecentActivity(limit = 10): Promise<InstructorActivity[]> {
    const response = await apiClient.get<InstructorActivity[]>(`/instructor/dashboard/activity?limit=${limit}`)
    return response.data
  },

  async getEngagementData(
    days = 30,
  ): Promise<{ date: string; enrollments: number; attempts: number; completions: number }[]> {
    const response = await apiClient.get(`/instructor/analytics/engagement?days=${days}`)
    return response.data
  },

  // Courses
  async getMyCourses(params?: {
    page?: number
    limit?: number
    status?: "draft" | "published" | "archived"
    sort?: string
  }): Promise<PaginatedResponse<Course>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.status) queryParams.append("status", params.status)
    if (params?.sort) queryParams.append("sort", params.sort)

    const response = await apiClient.get<PaginatedResponse<Course>>(`/instructor/courses?${queryParams.toString()}`)
    return response.data
  },

  // Exercises
  async getMyExercises(params?: {
    page?: number
    limit?: number
    type?: string
    difficulty?: string
    status?: string
  }): Promise<PaginatedResponse<Exercise>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.type) queryParams.append("type", params.type)
    if (params?.difficulty) queryParams.append("difficulty", params.difficulty)
    if (params?.status) queryParams.append("status", params.status)

    const response = await apiClient.get<PaginatedResponse<Exercise>>(`/instructor/exercises?${queryParams.toString()}`)
    return response.data
  },
}
