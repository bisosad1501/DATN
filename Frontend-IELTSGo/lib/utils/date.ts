/**
 * Format date to readable string
 */
export function formatDate(date: string | Date, format: "short" | "long" = "short"): string {
  const d = new Date(date)

  if (format === "short") {
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export function formatRelative(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "just now"
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? "week" : "weeks"} ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`
  }

  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears} ${diffInYears === 1 ? "year" : "years"} ago`
}

/**
 * Format date to distance from now (e.g., "2 hours ago")
 * Alias for formatRelative
 */
export function formatDistanceToNow(date: string | Date): string {
  return formatRelative(date)
}

/**
 * Check if date is today
 */
export function isToday(date: string | Date): boolean {
  const d = new Date(date)
  const today = new Date()
  return d.toDateString() === today.toDateString()
}

/**
 * Check if date is yesterday
 */
export function isYesterday(date: string | Date): boolean {
  const d = new Date(date)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return d.toDateString() === yesterday.toDateString()
}

/**
 * Get date range label
 */
export function getDateRangeLabel(startDate: Date, endDate: Date): string {
  const start = formatDate(startDate, "short")
  const end = formatDate(endDate, "short")
  return `${start} - ${end}`
}
