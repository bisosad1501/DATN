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
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { BookOpen, CheckCircle, Clock, TrendingUp, Flame, BarChart3, Target, ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
  const router = useRouter()
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
      <AppLayout showSidebar={true} showFooter={false} hideNavbar={true}>
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
    <AppLayout showSidebar={true} showFooter={false} hideNavbar={true} hideTopBar={true}>
      {/* Integrated Dashboard Header */}
      <DashboardHeader
        welcomeMessage={t('welcomeBack', { name: user?.fullName?.split(" ")[0] || tCommon('student') })}
        subtitle={`${t('subtitle')}${user?.targetBandScore ? ` • ${t('targetBand', { score: user.targetBandScore })}` : ''}`}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        timeRangeLabels={{
          "7d": t('timeRange.7d'),
          "30d": t('timeRange.30d'),
          "90d": t('timeRange.90d'),
          "all": t('timeRange.all'),
        }}
      />

      <PageContainer className="py-6">

        {/* Quick Actions - Refined design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card 
            className="group relative overflow-hidden border hover:border-primary/30 transition-all duration-200 cursor-pointer bg-gradient-to-br from-white to-blue-50/50 dark:from-card dark:to-blue-950/10 hover:shadow-lg hover:shadow-blue-500/10" 
            onClick={() => router.push("/courses")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/5 group-hover:from-blue-500/5 group-hover:via-blue-500/5 group-hover:to-blue-500/10 transition-all duration-200" />
            <CardContent className="p-5 relative">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/40 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/60 transition-all duration-200 shadow-sm group-hover:shadow-md">
                  <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">{tCommon('courses')}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tCommon('explore_courses') || "Khám phá khóa học"}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-1" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="group relative overflow-hidden border hover:border-primary/30 transition-all duration-200 cursor-pointer bg-gradient-to-br from-white to-green-50/50 dark:from-card dark:to-green-950/10 hover:shadow-lg hover:shadow-green-500/10" 
            onClick={() => router.push("/exercises")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 via-green-500/0 to-green-500/5 group-hover:from-green-500/5 group-hover:via-green-500/5 group-hover:to-green-500/10 transition-all duration-200" />
            <CardContent className="p-5 relative">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/40 group-hover:bg-green-200 dark:group-hover:bg-green-900/60 transition-all duration-200 shadow-sm group-hover:shadow-md">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">{tCommon('exercises')}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tCommon('practice_exercises') || "Luyện tập bài tập"}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-1" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="group relative overflow-hidden border hover:border-primary/30 transition-all duration-200 cursor-pointer bg-gradient-to-br from-white to-purple-50/50 dark:from-card dark:to-purple-950/10 hover:shadow-lg hover:shadow-purple-500/10" 
            onClick={() => router.push("/goals")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/0 to-purple-500/5 group-hover:from-purple-500/5 group-hover:via-purple-500/5 group-hover:to-purple-500/10 transition-all duration-200" />
            <CardContent className="p-5 relative">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/40 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/60 transition-all duration-200 shadow-sm group-hover:shadow-md">
                  <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">{t('goals')}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t('set_and_track_goals') || "Đặt và theo dõi mục tiêu"}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-1" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid - Only show if user preference allows */}
        {showStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
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
            "grid w-full max-w-md bg-muted/50 p-1 h-auto",
            showStats ? "grid-cols-3" : "grid-cols-1"
          )}>
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
            >
              {t('tabs.overview')}
            </TabsTrigger>
            {showStats && (
              <TabsTrigger 
                value="analytics"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                {t('tabs.analytics')}
              </TabsTrigger>
            )}
            {showStats && (
              <TabsTrigger 
                value="skills"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                {t('tabs.skills')}
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
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
