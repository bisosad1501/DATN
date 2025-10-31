"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { NotificationList } from "./notification-list"
import { notificationsApi } from "@/lib/api/notifications"
import { Badge } from "@/components/ui/badge"

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [newNotification, setNewNotification] = useState<any>(null)

  useEffect(() => {
    // Use ref to track if component is mounted to avoid stale closures
    const componentId = Math.random().toString(36).substring(7)
    console.log("[NotificationBell]", componentId, "Component mounted, setting up SSE...")
    
    let isMounted = true
    let disconnectSSE: (() => void) | null = null

    // Load initial unread count
    loadUnreadCount()

    // Connect to SSE for realtime notifications (singleton connection)
    // These callbacks are stable and won't change between renders
    const handleNotification = (notification: any) => {
      // New notification received via SSE - update immediately
      if (!isMounted) {
        console.log("[NotificationBell]", componentId, "Component unmounted, ignoring notification")
        return
      }
      
      console.log("[NotificationBell]", componentId, "🔔 New notification received:", notification.title, notification.id)
      
      // Update badge count immediately for real-time feedback
      setUnreadCount((prev) => {
        console.log("[NotificationBell]", componentId, "Updating unread count from", prev, "to", prev + 1)
        return prev + 1
      })
      
      // Pass notification to NotificationList via state update trigger
      setNewNotification(notification)
      
      // Refresh unread count from server to ensure sync (non-blocking)
      setTimeout(() => {
        if (isMounted) {
          loadUnreadCount()
        }
      }, 500)
    }

    const handleError = (error: Event | Error) => {
      if (!isMounted) return
      console.error("[NotificationBell]", componentId, "SSE error:", error)
      loadUnreadCount()
    }
    
    try {
      console.log("[NotificationBell]", componentId, "Calling connectSSE...")
      // connectSSE now always returns a function (never null)
      disconnectSSE = notificationsApi.connectSSE(handleNotification, handleError)
      console.log("[NotificationBell]", componentId, "SSE setup complete, disconnectSSE type:", typeof disconnectSSE)
    } catch (error) {
      console.error("[NotificationBell]", componentId, "Failed to connect SSE:", error)
      // Even on error, set a no-op function to prevent errors
      disconnectSSE = () => {
        console.warn("[NotificationBell]", componentId, "No-op disconnect called due to error")
      }
    }

    // Fallback: Poll every 30 seconds if SSE fails
    const interval = setInterval(() => {
      if (isMounted) {
        loadUnreadCount()
      }
    }, 30000)

    return () => {
      console.log("[NotificationBell]", componentId, "Component unmounting, cleaning up...")
      isMounted = false
      if (disconnectSSE && typeof disconnectSSE === 'function') {
        console.log("[NotificationBell]", componentId, "Calling disconnectSSE...")
        disconnectSSE()
      }
      clearInterval(interval)
    }
  }, []) // Empty deps - only run once on mount

  const loadUnreadCount = async () => {
    try {
      const count = await notificationsApi.getUnreadCount()
      setUnreadCount(count)
    } catch (error) {
      console.error("Failed to load unread count:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead()
      setUnreadCount(0)
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <NotificationList
          onMarkAllAsRead={handleMarkAllAsRead}
          onNotificationRead={() => setUnreadCount((prev) => Math.max(0, prev - 1))}
          newNotification={newNotification}
          onNewNotificationHandled={() => setNewNotification(null)}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
