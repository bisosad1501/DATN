import { apiClient } from "./apiClient"
import type { Notification, PaginatedResponse } from "@/types"

export const notificationsApi = {
  // Get all notifications
  getNotifications: async (page = 1, pageSize = 20): Promise<PaginatedResponse<Notification>> => {
    const response = await apiClient.get<PaginatedResponse<Notification>>(
      `/notifications?page=${page}&pageSize=${pageSize}`,
    )
    return response.data
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<{ count: number }>("/notifications/unread-count")
    return response.data.count
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<void> => {
    await apiClient.patch(`/notifications/${notificationId}/read`)
  },

  // Mark all as read
  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch("/notifications/read-all")
  },

  // Delete notification
  deleteNotification: async (notificationId: string): Promise<void> => {
    await apiClient.delete(`/notifications/${notificationId}`)
  },
}

export const leaderboardApi = {
  // Get leaderboard
  getLeaderboard: async (
    period: "daily" | "weekly" | "monthly" | "all-time" = "weekly",
    page = 1,
    pageSize = 50,
  ): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get<PaginatedResponse<any>>(
      `/leaderboard?period=${period}&page=${page}&pageSize=${pageSize}`,
    )
    return response.data
  },

  // Get user rank
  getUserRank: async (userId: string, period: "daily" | "weekly" | "monthly" | "all-time" = "weekly"): Promise<any> => {
    const response = await apiClient.get(`/leaderboard/user/${userId}?period=${period}`)
    return response.data
  },
}

export const socialApi = {
  // Get user profile
  getUserProfile: async (userId: string): Promise<any> => {
    const response = await apiClient.get(`/users/${userId}/profile`)
    return response.data
  },

  // Get user achievements
  getUserAchievements: async (userId: string): Promise<any[]> => {
    const response = await apiClient.get(`/users/${userId}/achievements`)
    return response.data
  },

  // Follow user
  followUser: async (userId: string): Promise<void> => {
    await apiClient.post(`/users/${userId}/follow`)
  },

  // Unfollow user
  unfollowUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/users/${userId}/follow`)
  },

  // Get followers
  getFollowers: async (userId: string, page = 1, pageSize = 20): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get<PaginatedResponse<any>>(
      `/users/${userId}/followers?page=${page}&pageSize=${pageSize}`,
    )
    return response.data
  },

  // Get following
  getFollowing: async (userId: string, page = 1, pageSize = 20): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get<PaginatedResponse<any>>(
      `/users/${userId}/following?page=${page}&pageSize=${pageSize}`,
    )
    return response.data
  },
}
