"use client"

import { useState, useEffect, useMemo } from "react"
import { notificationsApi } from "@/lib/api/notifications"
import type { Notification } from "@/types"
import { NotificationItem } from "./notification-item"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { isToday, isYesterday, isThisWeek } from "date-fns"
import { cn } from "@/lib/utils"

interface NotificationListProps {
  onMarkAllAsRead: () => void
  onNotificationRead: () => void
  newNotification?: any
  onNewNotificationHandled?: () => void
}

type NotificationGroup = {
  label: string
  notifications: Notification[]
}

export function NotificationList({ onMarkAllAsRead, onNotificationRead, newNotification, onNewNotificationHandled }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only load notifications when component mounts or when explicitly refreshed
    // SSE connection is handled by NotificationBell to avoid duplicates
    loadNotifications()

    // Fallback: Refresh every 30 seconds
    const interval = setInterval(loadNotifications, 30000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  // Handle new notification from SSE (sent from NotificationBell)
  useEffect(() => {
    if (newNotification && newNotification.id) {
      console.log("[NotificationList] 🔔 Adding new notification from SSE:", newNotification.title, newNotification.id, "current list length:", notifications.length)
      
      // Update notifications list immediately, avoid duplicates
      setNotifications((prev) => {
        // Check if notification already exists
        const exists = prev.some(n => n.id === newNotification.id)
        if (exists) {
          console.log("[NotificationList] ⚠️ Notification already exists, skipping duplicate")
          return prev
        }
        
        console.log("[NotificationList] ✅ Adding new notification, new list length will be:", prev.length + 1)
        // Add to beginning of list
        return [newNotification, ...prev]
      })
      
      // Update unread count callback
      if (onNotificationRead) {
        onNotificationRead()
      }
      
      // Notify parent that we handled the notification (but don't clear it immediately)
      // Only clear after a delay to ensure UI updates
      setTimeout(() => {
        if (onNewNotificationHandled) {
          onNewNotificationHandled()
        }
      }, 100)
    }
  }, [newNotification, onNotificationRead, onNewNotificationHandled])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const response = await notificationsApi.getNotifications(1, 50)
      setNotifications(response.notifications || [])
    } catch (error) {
      console.error("[NotificationList] Failed to load notifications:", error)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId)
      setNotifications((prev) => prev.map((n) => 
        n.id === notificationId 
          ? { ...n, read: true, isRead: true, is_read: true } 
          : n
      ))
      onNotificationRead()
    } catch (error) {
      console.error("Failed to mark as read:", error)
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationsApi.deleteNotification(notificationId)
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      onNotificationRead()
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  }

  // Group notifications by date (giống Udemy/Coursera)
  const groupedNotifications = useMemo(() => {
    const groups: NotificationGroup[] = []
    const today: Notification[] = []
    const yesterday: Notification[] = []
    const thisWeek: Notification[] = []
    const older: Notification[] = []

    notifications.forEach((notification) => {
      const createdAt = notification.createdAt || notification.created_at
      if (!createdAt) {
        older.push(notification)
        return
      }
      
      try {
        const date = new Date(createdAt)
        if (isNaN(date.getTime())) {
          older.push(notification)
          return
        }
        
        if (isToday(date)) {
          today.push(notification)
        } else if (isYesterday(date)) {
          yesterday.push(notification)
        } else if (isThisWeek(date)) {
          thisWeek.push(notification)
        } else {
          older.push(notification)
        }
      } catch {
        older.push(notification)
      }
    })

    if (today.length > 0) {
      groups.push({ label: "Hôm nay", notifications: today })
    }
    if (yesterday.length > 0) {
      groups.push({ label: "Hôm qua", notifications: yesterday })
    }
    if (thisWeek.length > 0) {
      groups.push({ label: "Tuần này", notifications: thisWeek })
    }
    if (older.length > 0) {
      groups.push({ label: "Trước đó", notifications: older })
    }

    return groups
  }, [notifications])

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 dark:border-gray-600 dark:border-t-gray-100"></div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">Đang tải thông báo...</p>
      </div>
    )
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">Chưa có thông báo nào</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col bg-white dark:bg-gray-900 h-full">
      {/* Header - sticky */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10 shrink-0">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Thông báo</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onMarkAllAsRead}
          disabled={notifications.length === 0}
          className={cn(
            "text-xs font-medium h-auto py-1.5 px-3 rounded-md transition-colors duration-200",
            "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100",
            "hover:bg-gray-100 dark:hover:bg-gray-800",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          Đọc tất cả
        </Button>
      </div>

      {/* Notifications list - fixed max height with scroll */}
      <ScrollArea className="max-h-[500px] min-h-[200px]">
        <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
          {groupedNotifications.map((group) => (
            <div key={group.label}>
              {/* Date header */}
              <div className="px-5 py-2.5 bg-gray-50/80 dark:bg-gray-900/80 border-b border-gray-100 dark:border-gray-800/50 sticky top-0 z-5 backdrop-blur-sm">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {group.label}
                </h4>
              </div>
              
              {/* Notification items */}
              <div>
                {group.notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
