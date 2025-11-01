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

export interface StudyReminder {
  id: string
  user_id: string
  title: string
  message?: string
  reminder_type: "daily" | "weekly" | "custom"
  reminder_time: string // "HH:MM:SS" format
  days_of_week?: string // JSON array string like "[1,2,3,4,5]"
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateReminderRequest {
  title: string
  message?: string
  reminder_type: "daily" | "weekly" | "custom"
  reminder_time: string // "HH:MM:SS" format
  days_of_week?: string // JSON array string for weekly reminders
}

export interface UpdateReminderRequest {
  title?: string
  message?: string
  reminder_time?: string
  days_of_week?: string
  is_active?: boolean
}

export interface RemindersResponse {
  reminders: StudyReminder[]
  count: number
}

export const remindersApi = {
  // Create a new reminder
  createReminder: async (reminder: CreateReminderRequest): Promise<StudyReminder> => {
    const response = await apiClient.post<ApiResponse<StudyReminder>>("/user/reminders", reminder)
    return response.data.data
  },

  // Get all reminders
  getReminders: async (): Promise<RemindersResponse> => {
    const response = await apiClient.get<ApiResponse<RemindersResponse | StudyReminder[]>>("/user/reminders")
    const data = response.data.data
    
    // Handle both {reminders, count} and array response
    if (Array.isArray(data)) {
      return { reminders: data, count: data.length }
    }
    return data as RemindersResponse
  },

  // Update reminder
  updateReminder: async (reminderId: string, updates: UpdateReminderRequest): Promise<StudyReminder> => {
    const response = await apiClient.put<ApiResponse<StudyReminder>>(`/user/reminders/${reminderId}`, updates)
    return response.data.data
  },

  // Toggle reminder active/inactive
  toggleReminder: async (reminderId: string): Promise<StudyReminder> => {
    const response = await apiClient.put<ApiResponse<StudyReminder>>(`/user/reminders/${reminderId}/toggle`, {})
    return response.data.data
  },

  // Delete reminder
  deleteReminder: async (reminderId: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/user/reminders/${reminderId}`)
  },
}

