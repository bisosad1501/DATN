"use client"

import { useState, useRef, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { vi, enUS } from "date-fns/locale"
import { useLocale } from "@/lib/i18n"
import { X } from "lucide-react"
import type { Notification } from "@/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useTranslations } from "@/lib/i18n"

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

export function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const router = useRouter()
  const t = useTranslations()
  const { locale } = useLocale()
  const tNotif = useTranslations('notifications')
  const [isExpanded, setIsExpanded] = useState(false)
  const [needsTruncation, setNeedsTruncation] = useState(false)
  const messageRef = useRef<HTMLParagraphElement>(null)
  const isRead = notification.read ?? notification.isRead ?? notification.is_read ?? false
  const createdAt = notification.createdAt || notification.created_at

  // Translate notification title and message if they are translation keys
  const getTranslatedTitle = (): string => {
    const title = notification.title
    // Check if title is a translation key (starts with "notifications.")
    if (title.startsWith("notifications.")) {
      try {
        const translated = t(title)
        // If translation returns the same key, it means translation not found, use original
        return translated !== title ? translated : title
      } catch {
        return title
      }
    }
    return title
  }

  const getTranslatedMessage = (): string => {
    const message = notification.message
    // Check if message is a translation key (starts with "notifications.")
    if (message.startsWith("notifications.")) {
      try {
        // Get translation with template replacement
        const params: Record<string, string> = {}
        
        // Extract params from action_data for template replacement
        if (notification.action_data) {
          if (notification.action_data.follower_name) {
            params.name = notification.action_data.follower_name as string
          }
        }
        
        const translated = t(message, params)
        // If translation returns the same key, it means translation not found, use original
        return translated !== message ? translated : message
      } catch {
        return message
      }
    }
    return message
  }

  const translatedTitle = getTranslatedTitle()
  const translatedMessage = getTranslatedMessage()
  
  // Check if message actually needs truncation by comparing heights
  // Wait for DOM to render before checking
  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is fully rendered
    const checkTruncation = () => {
      if (messageRef.current && !isExpanded) {
        // Temporarily remove line-clamp to get full height
        const originalClasses = messageRef.current.className
        messageRef.current.classList.remove('line-clamp-2')
        const fullHeight = messageRef.current.scrollHeight
        
        // Restore line-clamp
        messageRef.current.className = originalClasses
        
        // Get line height and calculate max height for 2 lines
        const lineHeight = parseFloat(getComputedStyle(messageRef.current).lineHeight) || 20
        const maxHeight = lineHeight * 2 + 2 // 2 lines with small buffer
        
        // Only show "Xem thêm" if content actually exceeds 2 lines
        setNeedsTruncation(fullHeight > maxHeight)
      } else {
        setNeedsTruncation(false)
      }
    }
    
    // Small delay to ensure DOM is rendered
    const timeoutId = setTimeout(checkTruncation, 10)
    return () => clearTimeout(timeoutId)
  }, [translatedMessage, isExpanded])

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
      } else if (notification.action_type === "navigate_to_user_profile" && notification.action_data.user_id) {
        router.push(`/users/${notification.action_data.user_id}`)
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
    if (!createdAt) return tNotif('just_now')
    try {
      const date = new Date(createdAt)
      if (isNaN(date.getTime())) {
        return tNotif('just_now')
      }
      // Use locale based on current user locale
      const dateFnsLocale = locale === 'vi' ? vi : enUS
      return formatDistanceToNow(date, { addSuffix: true, locale: dateFnsLocale })
    } catch {
      return tNotif('just_now')
    }
  }

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 cursor-pointer",
        "transition-all duration-200 border-b border-gray-100/80 dark:border-gray-800/50 last:border-b-0",
        !isRead && "bg-primary/5 dark:bg-primary/10"
      )}
      onClick={handleClick}
    >
      {/* Unread indicator - subtle left border với màu chủ đạo */}
      {!isRead && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
      )}

      {/* Content - clean text layout */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-sm font-semibold text-gray-900 dark:text-gray-100 leading-5 mb-1.5",
              !isRead && "text-gray-900 dark:text-gray-50"
            )}>
              {translatedTitle}
            </p>
            <div className="space-y-1.5">
              <div className="relative">
                {/* Message with gradient fade (professional approach like Udemy/Coursera) */}
                <div className="relative">
                  <p 
                    ref={messageRef}
                    className={cn(
                      "text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap break-words",
                      "transition-all duration-300 ease-in-out",
                      !isExpanded && needsTruncation && "line-clamp-2"
                    )}
                  >
                    {translatedMessage}
                  </p>
                  
                  {/* Gradient fade overlay when truncated (subtle, professional) */}
                  {/* Matches notification background: white/gray-50 for read, primary/5 for unread */}
                  {!isExpanded && needsTruncation && (
                    <>
                      {/* Light mode - white background */}
                      <div 
                        className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none dark:hidden"
                        style={{
                          background: isRead 
                            ? 'linear-gradient(to bottom, transparent, white)' 
                            : 'linear-gradient(to bottom, transparent, rgba(237, 55, 42, 0.05))',
                        }}
                      />
                      {/* Dark mode - gray-900 background */}
                      <div 
                        className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none hidden dark:block"
                        style={{
                          background: isRead
                            ? 'linear-gradient(to bottom, transparent, rgb(17 24 39))'
                            : 'linear-gradient(to bottom, transparent, rgba(237, 55, 42, 0.1))',
                        }}
                      />
                    </>
                  )}
                </div>
                
                {/* Subtle inline "Xem thêm" button (professional style) */}
                {needsTruncation && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsExpanded(!isExpanded)
                    }}
                    className={cn(
                      "inline-flex items-center text-xs text-primary/70 hover:text-primary",
                      "transition-all duration-200 font-normal",
                      "mt-1 -ml-0.5 px-0.5 py-0",
                      "focus:outline-none focus:underline"
                    )}
                  >
                    {isExpanded ? (
                      <span className="underline">Thu gọn</span>
                    ) : (
                      <span>... Xem thêm</span>
                    )}
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2.5">
              {formatTime()}
            </p>
          </div>

          {/* Delete button - only show on hover */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200",
              "text-gray-400 hover:text-gray-700 dark:hover:text-gray-200",
              "hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
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
