"use client"

import { AppLayout } from "@/components/layout/app-layout"
import { PageContainer } from "@/components/layout/page-container"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/lib/contexts/auth-context"
import { usePreferences } from "@/lib/contexts/preferences-context"
import { StatCard } from "@/components/dashboard/stat-card"
import { ProgressChart } from "@/components/dashboard/progress-chart"
import { SkillProgressCard } from "@/components/dashboard/skill-progress-card"
import { ActivityTimeline } from "@/components/dashboard/activity-timeline"
import { BookOpen, CheckCircle, Clock, TrendingUp, Flame, BarChart3, Target } from "lucide-react"
import { useEffect, useState } from "react"
import { progressApi } from "@/lib/api/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useTranslations } from "@/lib/i18n"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const { user } = useAuth()
  const { preferences } = usePreferences()
  const t = useTranslations('dashboard')
  const tCommon = useTranslations('common')
  const showStats = preferences?.show_study_stats ?? true // Default to true for backward compatibility
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d")

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        const [summaryData, analyticsData, historyData] = await Promise.all([
          progressApi.getProgressSummary(),
          progressApi.getProgressAnalytics(timeRange),
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
  }, [timeRange])

  if (loading) {
    return (
      <AppLayout showSidebar={true} showFooter={false}>
        <PageContainer>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">{t('loading')}</p>
            </div>
          </div>
        </PageContainer>
      </AppLayout>
    )
  }

  // Count unique exercises completed from history
  const exerciseAttempts = history.filter(a => a.type === "exercise")
  const uniqueExercises = new Set(exerciseAttempts.map(a => a.title)).size
  const totalAttempts = exerciseAttempts.length

  // Calculate analytics stats
  const calculateStats = () => {
    if (!analytics) return { 
      totalMinutes: 0, 
      totalExercises: 0, 
      avgScore: 0, 
      activeStreak: 0,
      skillScores: { listening: 0, reading: 0, writing: 0, speaking: 0 }
    }
    
    const totalMinutes = analytics.studyTimeByDay?.reduce((sum: number, day: any) => sum + (day.value || 0), 0) || 0
    const totalExercises = analytics.exercisesByType?.reduce((sum: number, type: any) => sum + (type.count || 0), 0) || 0
    const avgScore = analytics.exercisesByType?.length > 0
      ? analytics.exercisesByType.reduce((sum: number, type: any) => sum + (type.avgScore || 0), 0) / analytics.exercisesByType.length
      : 0
    
    // Calculate active streak
    let activeStreak = 0
    const sortedDays = [...(analytics.studyTimeByDay || [])].sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    for (const day of sortedDays) {
      if (day.value > 0) activeStreak++
      else break
    }
    
    // Extract skill scores from exercisesByType
    const skillScores = {
      listening: analytics.exercisesByType?.find((t: any) => t.type.toLowerCase() === 'listening')?.avgScore || 0,
      reading: analytics.exercisesByType?.find((t: any) => t.type.toLowerCase() === 'reading')?.avgScore || 0,
      writing: analytics.exercisesByType?.find((t: any) => t.type.toLowerCase() === 'writing')?.avgScore || 0,
      speaking: analytics.exercisesByType?.find((t: any) => t.type.toLowerCase() === 'speaking')?.avgScore || 0,
    }
    
    return { totalMinutes, totalExercises, avgScore, activeStreak, skillScores }
  }

  const stats = calculateStats()
  
  // Get exercise counts by skill
  const getSkillExerciseCount = (skill: string) => {
    return analytics?.exercisesByType?.find((t: any) => t.type.toLowerCase() === skill.toLowerCase())?.count || 0
  }

  return (
    <AppLayout showSidebar={true} showFooter={false}>
      <PageContainer>
        {/* Header with Time Range Filter */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{t('welcomeBack', { name: user?.fullName?.split(" ")[0] || tCommon('student') })}</h1>
            <p className="text-base text-muted-foreground">
              {t('subtitle')}
              {user?.targetBandScore && ` • ${t('targetBand', { score: user.targetBandScore })}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={timeRange === "7d" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setTimeRange("7d")}
            >
              {t('timeRange.7d')}
            </Button>
            <Button 
              variant={timeRange === "30d" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setTimeRange("30d")}
            >
              {t('timeRange.30d')}
            </Button>
            <Button 
              variant={timeRange === "90d" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setTimeRange("90d")}
            >
              {t('timeRange.90d')}
            </Button>
            <Button 
              variant={timeRange === "all" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setTimeRange("all")}
            >
              {t('timeRange.all')}
            </Button>
          </div>
        </div>

        {/* Stats Grid - Only show if user preference allows */}
        {showStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <StatCard
              title={t('stats.coursesInProgress')}
              value={summary?.inProgressCourses || 0}
              description={t('stats.coursesCompleted', { count: summary?.completedCourses || 0 })}
              icon={BookOpen}
            />
            <StatCard
              title={t('stats.exercisesCompleted')}
              value={uniqueExercises}
              description={t('stats.exercisesDescription', { exercises: uniqueExercises, attempts: totalAttempts })}
              icon={CheckCircle}
            />
            <StatCard
              title={t('stats.studyTime')}
              value={`${Math.floor(stats.totalMinutes / 60)}h ${stats.totalMinutes % 60}m`}
              description={t('stats.studyTimeDescription', { period: t(`timeRange.${timeRange}`) })}
              icon={Clock}
            />
            <StatCard
              title={t('stats.averageScore')}
              value={stats.avgScore > 0 ? stats.avgScore.toFixed(1) : (summary?.averageScore?.toFixed(1) || "0.0")}
              description={t('stats.bandScore')}
              icon={Target}
            />
            <StatCard
              title={t('stats.currentStreak')}
              value={t('stats.days', { count: stats.activeStreak || summary?.currentStreak || 0 })}
              description={t('stats.longestStreak', { count: summary?.longestStreak || 0 })}
              icon={Flame}
            />
          </div>
        )}

        {/* Tabs for different views */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className={cn(
            "grid w-full max-w-md",
            showStats ? "grid-cols-3" : "grid-cols-1"
          )}>
            <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
            {showStats && <TabsTrigger value="analytics">{t('tabs.analytics')}</TabsTrigger>}
            {showStats && <TabsTrigger value="skills">{t('tabs.skills')}</TabsTrigger>}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {showStats && (
              <>
                <ProgressChart
                  title={t('charts.studyTime', { period: t(`timeRange.${timeRange}`) })}
                  data={analytics?.studyTimeByDay || []}
                  color="#ED372A"
                  valueLabel={t('charts.minutes')}
                />
              </>
            )}
            <ActivityTimeline activities={history} />
          </TabsContent>

          {/* Analytics Tab - Only show if user preference allows */}
          {showStats && (
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid gap-6">
                <ProgressChart
                  title={t('charts.dailyStudyTime', { period: t(`timeRange.${timeRange}`) })}
                  data={analytics?.studyTimeByDay || []}
                  color="#ED372A"
                  valueLabel={t('charts.minutes')}
                />
                <ProgressChart
                  title={t('charts.completionRate', { period: t(`timeRange.${timeRange}`) })}
                  data={analytics?.completionRate || []}
                  color="#10B981"
                  valueLabel="%"
                />
                <div>
                  <h3 className="text-lg font-semibold mb-4">{t('exerciseBreakdown')}</h3>
                  {analytics?.exercisesByType?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {analytics.exercisesByType.map((item: any) => (
                        <Card key={item.type}>
                          <CardHeader>
                            <CardTitle className="text-base">{item.type}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">{t('completed')}</span>
                                <span className="font-bold">{item.count}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">{t('avgScore')}</span>
                                <span className="font-bold">{item.avgScore.toFixed(1)}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">
                          {t('noExercisesCompleted')}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
          )}

          {/* Skills Tab - Only show if user preference allows */}
          {showStats && (
            <TabsContent value="skills" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SkillProgressCard
                  skill="LISTENING"
                  currentScore={stats.skillScores.listening}
                  targetScore={user?.targetBandScore || 9}
                  exercisesCompleted={getSkillExerciseCount('listening')}
                />
                <SkillProgressCard
                  skill="READING"
                  currentScore={stats.skillScores.reading}
                  targetScore={user?.targetBandScore || 9}
                  exercisesCompleted={getSkillExerciseCount('reading')}
                />
                <SkillProgressCard
                  skill="WRITING"
                  currentScore={stats.skillScores.writing}
                  targetScore={user?.targetBandScore || 9}
                  exercisesCompleted={getSkillExerciseCount('writing')}
                />
                <SkillProgressCard
                  skill="SPEAKING"
                  currentScore={stats.skillScores.speaking}
                  targetScore={user?.targetBandScore || 9}
                  exercisesCompleted={getSkillExerciseCount('speaking')}
                />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </PageContainer>
    </AppLayout>
  )
}
