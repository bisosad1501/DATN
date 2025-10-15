"use client"

import { useState, useEffect } from "react"
import { notificationsApi } from "@/lib/api/notifications"
import type { Notification } from "@/types"
import { NotificationItem } from "./notification-item"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface NotificationListProps {
  onMarkAllAsRead: () => void
  onNotificationRead: () => void
}

export function NotificationList({ onMarkAllAsRead, onNotificationRead }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const response = await notificationsApi.getNotifications(1, 10)
      setNotifications(response.data)
    } catch (error) {
      console.error("Failed to load notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId)
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
      onNotificationRead()
    } catch (error) {
      console.error("Failed to mark as read:", error)
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationsApi.deleteNotification(notificationId)
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  }

  if (loading) {
    return <div className="p-4 text-center text-sm text-muted-foreground">Loading notifications...</div>
  }

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-muted-foreground">No notifications yet</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between p-4">
        <h3 className="font-semibold">Notifications</h3>
        <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
          Mark all as read
        </Button>
      </div>
      <Separator />
      <ScrollArea className="h-[400px]">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
          />
        ))}
      </ScrollArea>
    </div>
  )
}
