import { apiClient } from "./apiClient"
import type { Exercise, ExerciseSubmission, ExerciseResult } from "@/types"

export interface ExerciseFilters {
  skill?: string[]
  type?: string[]
  difficulty?: string[]
  search?: string
  sort?: "newest" | "popular" | "difficulty"
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Backend response structure
interface BackendExerciseResponse {
  success: boolean
  data: {
    exercises: Exercise[]
    total: number
    page: number
    limit: number
  }
}

export const exercisesApi = {
  // Get all exercises with filters
  getExercises: async (filters?: ExerciseFilters, page = 1, pageSize = 12): Promise<PaginatedResponse<Exercise>> => {
    const params = new URLSearchParams()

    if (filters?.skill?.length) params.append("skill_type", filters.skill.join(","))
    if (filters?.type?.length) params.append("exercise_type", filters.type.join(","))
    if (filters?.difficulty?.length) params.append("difficulty", filters.difficulty.join(","))
    if (filters?.search) params.append("search", filters.search)
    if (filters?.sort) params.append("sort", filters.sort)

    params.append("page", page.toString())
    params.append("limit", pageSize.toString())

    const response = await apiClient.get<BackendExerciseResponse>(`/exercises?${params.toString()}`)
    
    // Transform backend response to match frontend expectation
    const backendData = response.data.data
    const totalPages = Math.ceil(backendData.total / pageSize)
    
    return {
      data: backendData.exercises || [],
      total: backendData.total || 0,
      page: backendData.page || 1,
      pageSize: backendData.limit || pageSize,
      totalPages
    }
  },

  // Get single exercise by ID with sections and questions
  getExerciseById: async (id: string): Promise<import("@/types").ExerciseDetailResponse> => {
    const response = await apiClient.get<{ 
      success: boolean
      data: import("@/types").ExerciseDetailResponse 
    }>(`/exercises/${id}`)
    return response.data.data
  },

  // Start exercise (create submission)
  startExercise: async (exerciseId: string): Promise<{ id: string; started_at: string }> => {
    const response = await apiClient.post<{
      success: boolean
      data: { id: string; started_at: string }
    }>(`/submissions`, { exercise_id: exerciseId })
    return response.data.data
  },

  // Submit answers for a submission
  submitAnswers: async (submissionId: string, answers: Array<{
    question_id: string
    selected_option_id?: string
    text_answer?: string
    time_spent_seconds?: number
  }>): Promise<void> => {
    await apiClient.put(`/submissions/${submissionId}/answers`, { answers })
  },

  // Get submission result
  getSubmissionResult: async (submissionId: string): Promise<any> => {
    const response = await apiClient.get<{
      success: boolean
      data: any
    }>(`/submissions/${submissionId}/result`)
    return response.data.data
  },

  // Get user's submissions
  getMySubmissions: async (page = 1, limit = 20): Promise<{ submissions: any[]; total: number }> => {
    const response = await apiClient.get<{
      success: boolean
      data: { submissions: any[]; total: number }
    }>(`/submissions/my?page=${page}&limit=${limit}`)
    return response.data.data
  },
}
