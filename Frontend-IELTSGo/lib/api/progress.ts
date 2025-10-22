import { apiClient } from "./apiClient"
import type { PaginatedResponse, SkillType } from "./types"

interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

export const progressApi = {
  // Get user's overall progress summary
  // Uses: GET /api/v1/user/progress (User Service)
  getProgressSummary: async () => {
    const response = await apiClient.get<ApiResponse<{
      profile: any
      progress: {
        user_id: string
        total_study_hours: number
        total_lessons_completed: number
        total_exercises_completed: number
        listening_progress: number
        reading_progress: number
        writing_progress: number
        speaking_progress: number
        listening_score?: number
        reading_score?: number
        writing_score?: number
        speaking_score?: number
        overall_score?: number
        current_streak_days: number
        longest_streak_days: number
        last_study_date?: string
      }
      recent_sessions: any[]
      achievements: any[]
      total_points: number
    }>>("/user/progress")

    // Transform to match frontend expectations
    const data = response.data.data.progress
    return {
      totalCourses: 0, // Not available in current backend
      completedCourses: 0, // Not available in current backend
      inProgressCourses: 0, // Not available in current backend
      totalExercises: data.total_exercises_completed,
      completedExercises: data.total_exercises_completed,
      totalStudyTime: Math.round(data.total_study_hours * 60), // Convert hours to minutes
      currentStreak: data.current_streak_days,
      longestStreak: data.longest_streak_days,
      averageScore: data.overall_score || 0,
      skillScores: {
        listening: data.listening_score || 0,
        reading: data.reading_score || 0,
        writing: data.writing_score || 0,
        speaking: data.speaking_score || 0,
      }
    }
  },

  // Get detailed progress analytics
  // Uses: GET /api/v1/user/progress/history (User Service)
  getProgressAnalytics: async (timeRange: "7d" | "30d" | "90d" | "all" = "30d") => {
    const response = await apiClient.get<ApiResponse<{
      count: number
      sessions: Array<{
        id: string
        session_type: string
        resource_id: string
        skill_type?: string
        duration_minutes: number
        score?: number
        created_at: string
      }>
    }>>(`/user/progress/history?page=1&page_size=100`)

    console.log('[Progress API] Raw response:', response.data)

    const history = response.data.data.sessions || []
    console.log('[Progress API] Sessions count:', history.length)

    // Transform to analytics format
    const studyTimeByDay: { [key: string]: number } = {}
    const scoresBySkill: { [key: string]: number[] } = {
      listening: [],
      reading: [],
      writing: [],
      speaking: []
    }

    history.forEach(item => {
      const date = item.created_at.split('T')[0]
      studyTimeByDay[date] = (studyTimeByDay[date] || 0) + item.duration_minutes

      if (item.skill_type && item.score) {
        scoresBySkill[item.skill_type]?.push(item.score)
      }
    })

    const result = {
      studyTimeByDay: Object.entries(studyTimeByDay).map(([date, minutes]) => ({ date, minutes })),
      scoresBySkill: Object.entries(scoresBySkill).map(([skill, scores]) => ({ skill, scores })),
      completionRate: [], // Not available in current backend
      exercisesByType: [] // Not available in current backend
    }

    console.log('[Progress API] Transformed result:', result)

    return result
  },

  // Get study history/activity log
  // Uses: GET /api/v1/user/progress/history (User Service)
  getStudyHistory: async (page = 1, pageSize = 20) => {
    const response = await apiClient.get<ApiResponse<{
      count: number
      sessions: Array<{
        id: string
        session_type: string
        resource_id: string
        skill_type?: string
        duration_minutes: number
        score?: number
        created_at: string
      }>
    }>>(`/user/progress/history?page=${page}&page_size=${pageSize}`)

    const historyData = response.data.data

    return {
      data: historyData.sessions.map(item => ({
        id: item.id,
        type: item.session_type as "course" | "exercise" | "lesson",
        title: `${item.session_type} - ${item.resource_id.substring(0, 8)}`,
        completedAt: item.created_at,
        duration: item.duration_minutes,
        score: item.score,
        skillType: item.skill_type as SkillType | undefined
      })),
      total: historyData.count,
      page: page,
      pageSize: pageSize,
      totalPages: Math.ceil(historyData.count / pageSize)
    }
  },

  // Get course progress details
  // Note: This endpoint doesn't exist in backend yet
  // Using enrollment progress as fallback
  getCourseProgress: async (courseId: string) => {
    // This would need to be implemented in backend
    // For now, return mock data
    console.warn('[Progress API] getCourseProgress not implemented in backend')
    return {
      courseId,
      progress: 0,
      completedLessons: 0,
      totalLessons: 0,
      lastAccessedAt: new Date().toISOString(),
      timeSpent: 0,
      lessonProgress: []
    }
  },

  // Update lesson progress - DEPRECATED
  // Use coursesApi.updateLessonProgress instead
  updateLessonProgress: async (lessonId: string, progress: number) => {
    console.warn('[Progress API] Use coursesApi.updateLessonProgress instead')
    const response = await apiClient.put(`/progress/lessons/${lessonId}`, {
      progress_percentage: progress,
    })
    return response.data
  },

  // Mark lesson as completed - DEPRECATED
  // Use coursesApi.completeLesson instead
  completeLesson: async (lessonId: string) => {
    console.warn('[Progress API] Use coursesApi.completeLesson instead')
    const response = await apiClient.put(`/progress/lessons/${lessonId}`, {
      is_completed: true,
    })
    return response.data
  },

  // Get skill-specific progress
  // Uses: GET /api/v1/user/statistics/:skill (User Service)
  getSkillProgress: async (skill: SkillType) => {
    const response = await apiClient.get<ApiResponse<{
      skill_type: string
      total_practices: number
      total_time_minutes: number
      average_score?: number
      best_score?: number
      recent_scores: Array<{
        score: number
        created_at: string
      }>
      strengths: string[]
      weaknesses: string[]
    }>>(`/user/statistics/${skill}`)

    const data = response.data.data

    return {
      skill: skill,
      level: data.average_score ? (data.average_score >= 7 ? 'Advanced' : data.average_score >= 5 ? 'Intermediate' : 'Beginner') : 'Beginner',
      currentScore: data.average_score || 0,
      targetScore: 7.0, // Default target, should come from user profile
      exercisesCompleted: data.total_practices,
      averageScore: data.average_score || 0,
      recentScores: data.recent_scores.map(s => ({
        date: s.created_at,
        score: s.score
      })),
      strengths: data.strengths || [],
      weaknesses: data.weaknesses || []
    }
  },
}
