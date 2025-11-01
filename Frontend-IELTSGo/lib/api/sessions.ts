import { apiClient } from "./apiClient"

interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  error?: {
    code: string
    message: string
  }
}

export interface StudySession {
  id: string
  user_id: string
  session_type: "lesson" | "exercise" | "practice_test"
  skill_type?: string
  resource_id?: string
  resource_type?: string
  started_at: string
  ended_at?: string
  duration_minutes?: number
  is_completed: boolean
  completion_percentage?: number
  score?: number
  device_type?: string
  created_at: string
}

export interface StartSessionRequest {
  session_type: "lesson" | "exercise" | "practice_test"
  skill_type?: string
  resource_id?: string
  resource_type?: string
  device_type?: string
}

export interface EndSessionRequest {
  completion_percentage?: number
  score?: number
}

export const sessionsApi = {
  // Start a new study session
  startSession: async (session: StartSessionRequest): Promise<StudySession> => {
    const response = await apiClient.post<ApiResponse<StudySession>>("/user/sessions", session)
    return response.data.data
  },

  // End an active session
  endSession: async (sessionId: string, data: EndSessionRequest): Promise<StudySession> => {
    const response = await apiClient.post<ApiResponse<StudySession>>(`/user/sessions/${sessionId}/end`, data)
    return response.data.data
  },
}

