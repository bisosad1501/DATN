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
      try {
        setLoading(true)
        
        // TODO: Uncomment when backend progress API is implemented
        // const [summaryData, analyticsData, historyData] = await Promise.all([
        //   progressApi.getProgressSummary(),
        //   progressApi.getProgressAnalytics("30d"),
        //   progressApi.getStudyHistory(1, 10),
        // ])
        // setSummary(summaryData)
        // setAnalytics(analyticsData)
        // setHistory(historyData.data || [])
        
        // Using mock data until backend is ready
        throw new Error("Using mock data")
      } catch (error) {
        // Use mock data for demo purposes
        // Set mock data for demo purposes
        setSummary({
          totalCourses: 5,
          completedCourses: 2,
          inProgressCourses: 3,
          totalExercises: 50,
          completedExercises: 47,
          totalStudyTime: 1470, // 24.5 hours
          currentStreak: 7,
          longestStreak: 14,
          averageScore: 7.5,
          skillScores: {
            listening: 7.0,
            reading: 8.0,
            writing: 7.0,
            speaking: 7.5,
          },
        })

        setAnalytics({
          studyTimeByDay: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
            minutes: Math.floor(Math.random() * 120) + 30,
          })),
          scoresBySkill: [],
          completionRate: [],
          exercisesByType: [],
        })

        setHistory([
          {
            id: "1",
            type: "exercise" as const,
            title: "IELTS Reading Practice Test 5",
            completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            duration: 45,
            score: 8.0,
            skillType: "reading" as const,
          },
          {
            id: "2",
            type: "lesson" as const,
            title: "Writing Task 2: Opinion Essays",
            completedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            duration: 30,
          },
          {
            id: "3",
            type: "exercise" as const,
            title: "Listening Mock Test 3",
            completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            duration: 60,
            score: 7.5,
            skillType: "listening" as const,
          },
        ])
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
            value={summary?.completedExercises || 0}
            description={`${summary?.totalExercises || 0} total`}
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
              exercisesCompleted={12}
            />
            <SkillProgressCard
              skill="READING"
              currentScore={summary?.skillScores?.reading || 0}
              targetScore={user?.targetBandScore || 9}
              exercisesCompleted={15}
            />
            <SkillProgressCard
              skill="WRITING"
              currentScore={summary?.skillScores?.writing || 0}
              targetScore={user?.targetBandScore || 9}
              exercisesCompleted={10}
            />
            <SkillProgressCard
              skill="SPEAKING"
              currentScore={summary?.skillScores?.speaking || 0}
              targetScore={user?.targetBandScore || 9}
              exercisesCompleted={10}
            />
          </div>
        </div>

        {/* Activity Timeline */}
        <ActivityTimeline activities={history} />
      </div>
    </AppLayout>
  )
}
