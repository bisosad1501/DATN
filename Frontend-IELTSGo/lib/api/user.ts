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
    // Build request payload - only include fields that are provided
    const payload: any = {}
    
    if (data.full_name !== undefined) {
      payload.full_name = data.full_name.trim() || null
    }
    
    if (data.bio !== undefined) {
      // Send null if empty string, otherwise send the value
      payload.bio = data.bio.trim() || null
    }
    
    if (data.target_band_score !== undefined && data.target_band_score !== null) {
      payload.target_band_score = Number(data.target_band_score)
    }
    
    const response = await apiClient.put<ApiResponse<any>>("/user/profile", payload)
    return response.data.data
  },
}

