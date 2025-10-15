export interface DashboardStats {
  totalUsers: number
  totalStudents: number
  totalInstructors: number
  totalAdmins: number
  userGrowth: number // percentage
  totalCourses: number
  activeCourses: number
  draftCourses: number
  totalExercises: number
  submissionsToday: number
  averageCompletionRate: number
  systemHealth: "healthy" | "warning" | "critical"
  cpuUsage: number
  memoryUsage: number
}

export interface Activity {
  id: string
  type: "user" | "course" | "exercise" | "review"
  action: string
  actorName: string
  actorAvatar?: string
  timestamp: string
}

export interface UserAnalytics {
  totalUsers: number
  newUsers: number
  activeUsers: number
  churnRate: number
  growthData: { date: string; count: number }[]
  distribution: { role: string; count: number; percentage: number }[]
}

export interface ContentAnalytics {
  topCourses: {
    id: string
    title: string
    enrollments: number
    completionRate: number
    avgRating: number
  }[]
  topExercises: {
    id: string
    title: string
    attempts: number
    avgScore: number
  }[]
}

export interface EngagementMetrics {
  dailyActiveUsers: number
  weeklyActiveUsers: number
  monthlyActiveUsers: number
  averageSessionDuration: number
}

export interface SystemHealth {
  status: "healthy" | "degraded" | "down"
  uptime: number
  lastIncident: string | null
  services: ServiceStatus[]
  metrics: {
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
  }
}

export interface ServiceStatus {
  name: string
  port: number
  status: "up" | "down" | "degraded"
  responseTime: number
  requestsPerMinute: number
  successRate: number
}

export interface LogEntry {
  id: string
  timestamp: string
  service: string
  level: "error" | "warning" | "info"
  message: string
  details?: string
}

export interface NotificationPayload {
  recipientType: "all" | "role" | "course" | "custom"
  recipientRoles?: ("student" | "instructor" | "admin")[]
  recipientCourseIds?: string[]
  recipientUserIds?: string[]
  type: "info" | "success" | "warning" | "error" | "announcement"
  title: string
  message: string
  actionButton?: {
    text: string
    url: string
  }
  icon?: string
  priority: "low" | "normal" | "high" | "urgent"
  scheduledFor?: string
  expiresAfterHours?: number
}

export interface NotificationStats {
  id: string
  totalSent: number
  delivered: number
  read: number
  failed: number
  clickedAction: number
  averageTimeToRead: number
}
