"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { X, ChevronDown, ChevronUp } from "lucide-react"
import type { Notification } from "@/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

export function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)
  const isRead = notification.read ?? notification.isRead ?? notification.is_read ?? false
  const createdAt = notification.createdAt || notification.created_at
  
  // Check if message is long (more than 100 characters)
  const isLongMessage = notification.message && notification.message.length > 100
  const displayMessage = isExpanded || !isLongMessage 
    ? notification.message 
    : notification.message.substring(0, 100) + "..."

  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking expand button or delete button
    if ((e.target as HTMLElement).closest('button')) {
      return
    }

    if (!isRead) {
      onMarkAsRead(notification.id)
    }

    // Handle action navigation (giống Udemy/Coursera)
    if (notification.action_type && notification.action_data) {
      if (notification.action_type === "navigate_to_course" && notification.action_data.course_id) {
        router.push(`/courses/${notification.action_data.course_id}`)
      } else if (notification.action_type === "navigate_to_lesson" && notification.action_data.course_id && notification.action_data.lesson_id) {
        router.push(`/courses/${notification.action_data.course_id}/lessons/${notification.action_data.lesson_id}`)
      } else if (notification.action_type === "external_link" && notification.action_data.url) {
        window.open(notification.action_data.url, "_blank")
      } else if (notification.actionUrl) {
        router.push(notification.actionUrl)
      }
    } else if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
  }

  const formatTime = () => {
    if (!createdAt) return "Vừa xong"
    try {
      const date = new Date(createdAt)
      if (isNaN(date.getTime())) {
        return "Vừa xong"
      }
      return formatDistanceToNow(date, { addSuffix: true, locale: vi })
    } catch {
      return "Vừa xong"
    }
  }

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800",
        !isRead && "bg-primary/5 dark:bg-primary/10"
      )}
      onClick={handleClick}
    >
      {/* Unread indicator - subtle left border với màu chủ đạo */}
      {!isRead && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
      )}

      {/* Content - no icon, clean text layout */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2",
              !isRead && "font-semibold"
            )}>
              {notification.title}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {displayMessage}
              {isLongMessage && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsExpanded(!isExpanded)
                  }}
                  className="ml-1 text-primary hover:underline font-medium"
                >
                  {isExpanded ? "Thu gọn" : "Xem thêm"}
                </button>
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {formatTime()}
            </p>
          </div>

          {/* Delete button - only show on hover */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
              "hover:bg-transparent"
            )}
            onClick={(e) => {
              e.stopPropagation()
              onDelete(notification.id)
            }}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
