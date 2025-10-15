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

export const exercisesApi = {
  // Get all exercises with filters
  getExercises: async (filters?: ExerciseFilters, page = 1, pageSize = 12): Promise<PaginatedResponse<Exercise>> => {
    const params = new URLSearchParams()

    if (filters?.skill?.length) params.append("skill", filters.skill.join(","))
    if (filters?.type?.length) params.append("type", filters.type.join(","))
    if (filters?.difficulty?.length) params.append("difficulty", filters.difficulty.join(","))
    if (filters?.search) params.append("search", filters.search)
    if (filters?.sort) params.append("sort", filters.sort)

    params.append("page", page.toString())
    params.append("pageSize", pageSize.toString())

    const response = await apiClient.get<PaginatedResponse<Exercise>>(`/exercises?${params.toString()}`)
    return response.data
  },

  // Get single exercise by ID
  getExerciseById: async (id: string): Promise<Exercise> => {
    const response = await apiClient.get<Exercise>(`/exercises/${id}`)
    return response.data
  },

  // Submit exercise answers
  submitExercise: async (exerciseId: string, submission: ExerciseSubmission): Promise<ExerciseResult> => {
    const response = await apiClient.post<ExerciseResult>(`/exercises/${exerciseId}/submit`, submission)
    return response.data
  },

  // Get exercise result
  getExerciseResult: async (exerciseId: string, submissionId: string): Promise<ExerciseResult> => {
    const response = await apiClient.get<ExerciseResult>(`/exercises/${exerciseId}/results/${submissionId}`)
    return response.data
  },

  // Get user's exercise history
  getExerciseHistory: async (): Promise<ExerciseResult[]> => {
    const response = await apiClient.get<ExerciseResult[]>("/exercises/history")
    return response.data
  },

  // Get recommended exercises
  getRecommendedExercises: async (): Promise<Exercise[]> => {
    const response = await apiClient.get<Exercise[]>("/exercises/recommended")
    return response.data
  },
}
