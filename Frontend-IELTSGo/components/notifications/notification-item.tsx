"use client"

import { formatDistanceToNow } from "date-fns"
import { X, CheckCircle, Award, BookOpen, TrendingUp } from "lucide-react"
import type { Notification } from "@/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

const notificationIcons = {
  achievement: Award,
  course: BookOpen,
  progress: TrendingUp,
  system: CheckCircle,
}

export function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const Icon = notificationIcons[notification.type as keyof typeof notificationIcons] || CheckCircle

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 hover:bg-accent/50 cursor-pointer transition-colors border-b",
        !notification.read && "bg-accent/30",
      )}
      onClick={handleClick}
    >
      <div
        className={cn(
          "rounded-full p-2",
          notification.type === "achievement" && "bg-yellow-100 text-yellow-600",
          notification.type === "course" && "bg-blue-100 text-blue-600",
          notification.type === "progress" && "bg-green-100 text-green-600",
          notification.type === "system" && "bg-gray-100 text-gray-600",
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{notification.title}</p>
        <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0"
        onClick={(e) => {
          e.stopPropagation()
          onDelete(notification.id)
        }}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
