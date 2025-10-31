import { apiClient } from "./apiClient"

interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

export const userApi = {
  // Upload avatar
  uploadAvatar: async (avatarUrl: string): Promise<{ avatar_url: string }> => {
    const response = await apiClient.post<ApiResponse<{ avatar_url: string }>>("/user/profile/avatar", {
      avatar_url: avatarUrl,
    })
    return response.data.data
  },

  // Get user profile
  getProfile: async (): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>("/user/profile")
    return response.data.data
  },

  // Update user profile
  updateProfile: async (data: {
    full_name?: string
    bio?: string
    target_band_score?: number
  }): Promise<any> => {
    const response = await apiClient.put<ApiResponse<any>>("/user/profile", data)
    return response.data.data
  },
}

