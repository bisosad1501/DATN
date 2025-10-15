import { apiClient } from "./apiClient" // Assuming apiClient is imported from another file
import type { PaginatedResponse, SkillType } from "./types" // Assuming PaginatedResponse and SkillType are imported from another file

export const progressApi = {
  // Get user's overall progress summary
  getProgressSummary: async () => {
    const response = await apiClient.get<{
      totalCourses: number
      completedCourses: number
      inProgressCourses: number
      totalExercises: number
      completedExercises: number
      totalStudyTime: number // in minutes
      currentStreak: number // days
      longestStreak: number
      averageScore: number
      skillScores: {
        listening: number
        reading: number
        writing: number
        speaking: number
      }
    }>("/progress/summary")
    return response.data
  },

  // Get detailed progress analytics
  getProgressAnalytics: async (timeRange: "7d" | "30d" | "90d" | "all" = "30d") => {
    const response = await apiClient.get<{
      studyTimeByDay: Array<{ date: string; minutes: number }>
      scoresBySkill: Array<{ skill: string; scores: number[] }>
      completionRate: Array<{ date: string; rate: number }>
      exercisesByType: Array<{ type: string; count: number; avgScore: number }>
    }>(`/progress/analytics?range=${timeRange}`)
    return response.data
  },

  // Get study history/activity log
  getStudyHistory: async (page = 1, pageSize = 20) => {
    const response = await apiClient.get<
      PaginatedResponse<{
        id: string
        type: "course" | "exercise" | "lesson"
        title: string
        completedAt: string
        duration: number // minutes
        score?: number
        skillType?: SkillType
      }>
    >(`/progress/history?page=${page}&pageSize=${pageSize}`)
    return response.data
  },

  // Get course progress details
  getCourseProgress: async (courseId: string) => {
    const response = await apiClient.get<{
      courseId: string
      progress: number
      completedLessons: number
      totalLessons: number
      lastAccessedAt: string
      timeSpent: number
      lessonProgress: Array<{
        lessonId: string
        title: string
        completed: boolean
        progress: number
        lastAccessedAt?: string
      }>
    }>(`/progress/courses/${courseId}`)
    return response.data
  },

  // Update lesson progress
  updateLessonProgress: async (lessonId: string, progress: number) => {
    const response = await apiClient.post(`/progress/lessons/${lessonId}`, {
      progress,
      timestamp: new Date().toISOString(),
    })
    return response.data
  },

  // Mark lesson as completed
  completeLesson: async (lessonId: string) => {
    const response = await apiClient.post(`/progress/lessons/${lessonId}/complete`, {
      completedAt: new Date().toISOString(),
    })
    return response.data
  },

  // Get skill-specific progress
  getSkillProgress: async (skill: SkillType) => {
    const response = await apiClient.get<{
      skill: SkillType
      level: string
      currentScore: number
      targetScore: number
      exercisesCompleted: number
      averageScore: number
      recentScores: Array<{ date: string; score: number }>
      strengths: string[]
      weaknesses: string[]
    }>(`/progress/skills/${skill}`)
    return response.data
  },
}
