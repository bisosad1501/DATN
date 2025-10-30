"use client"

import { AppLayout } from "@/components/layout/app-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/lib/contexts/auth-context"
import { StatCard } from "@/components/dashboard/stat-card"
import { ProgressChart } from "@/components/dashboard/progress-chart"
import { SkillProgressCard } from "@/components/dashboard/skill-progress-card"
import { ActivityTimeline } from "@/components/dashboard/activity-timeline"
import { BookOpen, CheckCircle, Clock, TrendingUp, Flame } from "lucide-react"
import { useEffect, useState } from "react"
import { progressApi } from "@/lib/api/progress"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        const [summaryData, analyticsData, historyData] = await Promise.all([
          progressApi.getProgressSummary(),
          progressApi.getProgressAnalytics("30d"),
          progressApi.getStudyHistory(1, 10),
        ])
        setSummary(summaryData)
        setAnalytics(analyticsData)
        setHistory(historyData.data || [])
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <AppLayout showSidebar={true} showFooter={false}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  // Count unique exercises completed from history
  // Count unique exercises and total attempts
  const exerciseAttempts = history.filter(a => a.type === "exercise")
  const uniqueExercises = new Set(exerciseAttempts.map(a => a.title)).size
  const totalAttempts = exerciseAttempts.length
  return (
    <AppLayout showSidebar={true} showFooter={false}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.fullName?.split(" ")[0] || "Student"}!</h1>
          <p className="text-muted-foreground">
            Here's your learning progress overview
            {user?.targetBandScore && ` - Target: Band ${user.targetBandScore}`}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Courses in Progress"
            value={summary?.inProgressCourses || 0}
            description={`${summary?.completedCourses || 0} completed`}
            icon={BookOpen}
          />
          <StatCard
            title="Exercises Completed"
            value={uniqueExercises}
            description={`${uniqueExercises} bài, ${totalAttempts} lần làm`}
            icon={CheckCircle}
          />
          <StatCard
            title="Study Time"
            value={`${Math.floor((summary?.totalStudyTime || 0) / 60)}h`}
            description="This month"
            icon={Clock}
          />
          <StatCard
            title="Average Score"
            value={summary?.averageScore?.toFixed(1) || "0.0"}
            description="Band score"
            icon={TrendingUp}
          />
          <StatCard
            title="Current Streak"
            value={`${summary?.currentStreak || 0} days`}
            description={`Longest: ${summary?.longestStreak || 0} days`}
            icon={Flame}
          />
        </div>

        {/* Study Time Chart */}
        <div className="mb-8">
          <ProgressChart
            title="Study Time (Last 30 Days)"
            data={analytics?.studyTimeByDay || []}
            color="#ED372A"
            valueLabel="minutes"
          />
        </div>

        {/* Skills Progress */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Skills Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SkillProgressCard
              skill="LISTENING"
              currentScore={summary?.skillScores?.listening || 0}
              targetScore={user?.targetBandScore || 9}
              exercisesCompleted={summary?.listeningProgress || 0}
            />
            <SkillProgressCard
              skill="READING"
              currentScore={summary?.skillScores?.reading || 0}
              targetScore={user?.targetBandScore || 9}
              exercisesCompleted={summary?.readingProgress || 0}
            />
            <SkillProgressCard
              skill="WRITING"
              currentScore={summary?.skillScores?.writing || 0}
              targetScore={user?.targetBandScore || 9}
              exercisesCompleted={summary?.writingProgress || 0}
            />
            <SkillProgressCard
              skill="SPEAKING"
              currentScore={summary?.skillScores?.speaking || 0}
              targetScore={user?.targetBandScore || 9}
              exercisesCompleted={summary?.speakingProgress || 0}
            />
          </div>
        </div>

        {/* Activity Timeline */}
        <ActivityTimeline activities={history} />
      </div>
    </AppLayout>
  )
}
