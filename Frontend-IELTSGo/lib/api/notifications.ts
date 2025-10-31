import { apiClient } from "./apiClient"
import type { Notification, PaginatedResponse } from "@/types"
import { sseManager } from "./sse-manager"

export const notificationsApi = {
  // Get all notifications
  getNotifications: async (page = 1, limit = 20): Promise<{ notifications: Notification[]; pagination: any }> => {
    const response = await apiClient.get<{ notifications: Notification[]; pagination: any }>(
      `/notifications?page=${page}&limit=${limit}`,
    )
    return response.data
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<{ unread_count: number }>("/notifications/unread-count")
    return response.data.unread_count || 0
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<void> => {
    await apiClient.put(`/notifications/${notificationId}/read`)
  },

  // Mark all as read
  markAllAsRead: async (): Promise<void> => {
    await apiClient.put("/notifications/mark-all-read")
  },

  // Delete notification
  deleteNotification: async (notificationId: string): Promise<void> => {
    await apiClient.delete(`/notifications/${notificationId}`)
  },

  // Connect to SSE stream for realtime notifications
  // Uses singleton SSE manager to ensure only one connection
  connectSSE: (
    onNotification: (notification: Notification) => void,
    onError?: (error: Event | Error) => void,
  ): (() => void) => {
    // Use singleton SSE manager to avoid duplicate connections
    // Always returns a function, never null
    try {
      // sseManager.connect() ALWAYS returns a function (guaranteed by implementation)
      const unsubscribe = sseManager.connect(onNotification, onError)
      
      // Debug: Log what we got
      console.log("[Notifications API] connectSSE: sseManager.connect() returned:", typeof unsubscribe, unsubscribe)
      
      // Type guard to ensure we always return a function
      if (typeof unsubscribe !== 'function') {
        console.error("[Notifications API] connectSSE: sseManager.connect() returned non-function:", typeof unsubscribe, unsubscribe)
        // Return no-op function as fallback
        return () => {
          console.warn("[Notifications API] No-op unsubscribe called (sseManager.connect() returned non-function)")
        }
      }
      
      return unsubscribe
    } catch (error) {
      console.error("[Notifications API] Error connecting SSE:", error)
      // Return no-op function on error
      return () => {
        console.warn("[Notifications API] No-op unsubscribe called due to error:", error)
      }
    }
  },

  // Legacy implementation (kept for reference, not used)
  _connectSSELegacy: (
    onNotification: (notification: Notification) => void,
    onError?: (error: Event | Error) => void,
  ): (() => void) | null => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      console.error("[SSE] No token available")
      return null
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"
    const url = `${API_BASE_URL}/notifications/stream`

    let abortController: AbortController | null = null
    let isConnecting = false
    let reconnectTimeout: NodeJS.Timeout | null = null
    let shouldReconnect = true
    let reconnectDelay = 1000 // Start with 1s delay

    const connect = async () => {
      if (isConnecting || !shouldReconnect) return

      isConnecting = true
      abortController = new AbortController()

      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "text/event-stream",
          },
          signal: abortController.signal,
        })

        if (!response.ok) {
          throw new Error(`SSE connection failed: ${response.status} ${response.statusText}`)
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          throw new Error("No reader available")
        }

        let buffer = ""

        console.log("[SSE] ✅ Connected to notification stream")

        // Reset reconnect delay on successful connection
        reconnectDelay = 1000
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            console.log("[SSE] ⚠️ Stream ended, reconnecting in", reconnectDelay, "ms...")
            isConnecting = false
            if (shouldReconnect) {
              reconnectTimeout = setTimeout(() => {
                reconnectDelay = Math.min(reconnectDelay * 2, 30000) // Exponential backoff, max 30s
                connect()
              }, reconnectDelay)
            }
            break
          }

          buffer += decoder.decode(value, { stream: true })
          
          // Process complete events (separated by double newline or single newline for last line)
          while (buffer.includes("\n\n") || (buffer.includes("\n") && buffer.endsWith("\n"))) {
            let eventEndIndex = buffer.indexOf("\n\n")
            if (eventEndIndex === -1 && buffer.endsWith("\n")) {
              eventEndIndex = buffer.length - 1
            }
            
            if (eventEndIndex === -1) break
            
            const eventText = buffer.substring(0, eventEndIndex)
            buffer = buffer.substring(eventEndIndex + 2)

            let eventType = "message"
            let eventData = ""

            const eventLines = eventText.split("\n")
            for (const line of eventLines) {
              if (line.startsWith("event: ")) {
                eventType = line.substring(7).trim()
              } else if (line.startsWith("data: ")) {
                const lineData = line.substring(6).trim()
                // Handle multi-line data (append if already has data)
                if (eventData) {
                  eventData += "\n" + lineData
                } else {
                  eventData = lineData
                }
              }
            }

            // Process event
            if (eventData) {
              if (eventType === "notification") {
                try {
                  const notification = JSON.parse(eventData) as Notification
                  console.log("[SSE] 📬 Received notification:", notification.title, notification.id)
                  // Reset reconnect delay on successful message
                  reconnectDelay = 1000
                  onNotification(notification)
                } catch (error) {
                  console.error("[SSE] ❌ Parse error:", error, eventData)
                }
              } else if (eventType === "connected") {
                console.log("[SSE] ✅ Connected to notification stream")
                reconnectDelay = 1000
              } else if (eventType === "heartbeat") {
                // Ignore heartbeat, just keep connection alive
                reconnectDelay = 1000
              }
            }
          }
        }
      } catch (error: any) {
        isConnecting = false
        if (error.name !== "AbortError") {
          console.error("[SSE] ❌ Connection error:", error)
          if (onError) onError(error)
          // Auto-reconnect on error with exponential backoff
          if (shouldReconnect) {
            reconnectTimeout = setTimeout(() => {
              reconnectDelay = Math.min(reconnectDelay * 2, 30000) // Exponential backoff, max 30s
              connect()
            }, reconnectDelay)
          }
        }
      }
    }

    // Start initial connection
    connect()

    // Return cleanup function
    return () => {
      shouldReconnect = false
      if (abortController) {
        abortController.abort()
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
    }
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
