"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { PageContainer } from "@/components/layout/page-container"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Loader2, 
  BookOpen, 
  Clock, 
  CheckCircle,
  PlayCircle,
  Award,
  Target
} from "lucide-react"
import { coursesApi } from "@/lib/api/courses"
import { useAuth } from "@/lib/contexts/auth-context"
import type { Course, CourseEnrollment } from "@/types"
import { useTranslations } from '@/lib/i18n'

interface EnrolledCourseWithProgress {
  course: Course
  enrollment: CourseEnrollment
}

export default function MyCoursesPage() {

  const t = useTranslations('common')

  const router = useRouter()
  const { user } = useAuth()
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourseWithProgress[]>([])
  const [totalStudyMinutes, setTotalStudyMinutes] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadEnrolledCourses()
    }
  }, [user])

  // Calculate total study time when enrolledCourses changes
  useEffect(() => {
    calculateTotalStudyTime()
  }, [enrolledCourses])

  const loadEnrolledCourses = async () => {
    try {
      setLoading(true)
      const data = await coursesApi.getEnrolledCoursesWithProgress()
      setEnrolledCourses(data)
      console.log('[My Courses] Loaded with progress:', data)
    } catch (error) {
      console.error('[My Courses] Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 📊 Calculate total study time from COURSES ONLY (sum from enrollments)
  // NOTE: This is different from Dashboard which shows ALL study time (lessons + exercises)
  const calculateTotalStudyTime = () => {
    // Sum up time_spent from all course enrollments
    const total = enrolledCourses.reduce(
      (sum, item) => sum + (item.enrollment.total_time_spent_minutes || 0), 
      0
    )
    setTotalStudyMinutes(total)
  }

  if (!user) {
    return (
      <AppLayout>
        <PageContainer className="py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">{t('please_sign_in')}</h1>
          <p className="text-muted-foreground mb-6">
            {t('you_need_to_be_signed_in_to_view_your_cou')}
          </p>
          <Button onClick={() => router.push('/auth/login')}>
            {t('sign_in')}
          </Button>
        </PageContainer>
      </AppLayout>
    )
  }

  // ✅ Filter by progress
  const inProgressCourses = enrolledCourses.filter(
    item => item.enrollment.progress_percentage > 0 && item.enrollment.progress_percentage < 100
  )
  const completedCourses = enrolledCourses.filter(
    item => item.enrollment.progress_percentage >= 100
  )

  // ✅ Format total study time (from all sessions: lessons + exercises)
  const totalStudyHours = Math.floor(totalStudyMinutes / 60)
  const totalStudyMins = totalStudyMinutes % 60

  return (
    <AppLayout>
      <PageContainer maxWidth="7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t('my_learning')}</h1>
          <p className="text-base text-muted-foreground">
            {t('track_your_progress_and_continue_your_ielt')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('total_courses')}</p>
                  <p className="text-3xl font-bold">{enrolledCourses.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('in_progress')}</p>
                  <p className="text-3xl font-bold">{inProgressCourses.length}</p>
                </div>
                <PlayCircle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('completed')}</p>
                  <p className="text-3xl font-bold">{completedCourses.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('total_study_time')}</p>
                  <p className="text-3xl font-bold">
                    {totalStudyHours > 0 ? `${totalStudyHours}h ${totalStudyMins}m` : `${totalStudyMins}m`}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">
              {t('all_courses')} ({enrolledCourses.length})
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              {t('in_progress_tab')} ({inProgressCourses.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              {t('completed_tab')} ({completedCourses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : enrolledCourses.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">{t('no_courses_yet')}</h3>
                  <p className="text-muted-foreground mb-6">
                    {t('start_your_ielts_journey_by_enrolling_in_a')}
                  </p>
                  <Button onClick={() => router.push('/courses')}>
                    {t('browse_courses')}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {enrolledCourses.map((item) => {
                  const { course, enrollment } = item
                  const progressPct = Math.round(enrollment.progress_percentage || 0)
                  
                  return (
                    <Card 
                      key={course.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => router.push(`/courses/${course.id}`)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-6">
                          {/* Thumbnail */}
                          <div className="w-48 h-32 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                            {course.thumbnail_url ? (
                              <img 
                                src={course.thumbnail_url} 
                                alt={course.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="h-12 w-12 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-xl font-bold mb-1">{course.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {course.short_description || course.description}
                                </p>
                              </div>
                              <Badge variant="outline" className="ml-4">
                                {course.skill_type}
                              </Badge>
                            </div>

                            {/* Progress */}
                            <div className="mt-4 space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">{t('progress')}</span>
                                <span className="font-semibold">{progressPct}%</span>
                              </div>
                              <Progress value={progressPct} className="h-2" />
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />
                                <span>{enrollment.lessons_completed || 0}/{course.total_lessons || 0} {t('lessons')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{enrollment.total_time_spent_minutes || 0} {t('minutes')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="h-4 w-4" />
                                <span>{t('band')} {course.target_band_score || '7.0'}</span>
                              </div>
                            </div>

                            {/* Action */}
                            <div className="mt-4">
                              <Button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  router.push(`/courses/${course.id}`)
                                }}
                              >{t('continue_learning')}</Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="in-progress" className="space-y-4">
            {inProgressCourses.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <PlayCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {t('start_learning_to_see_your_progress_here')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {inProgressCourses.map((item) => {
                  const { course, enrollment } = item
                  const progressPct = Math.round(enrollment.progress_percentage || 0)
                  
                  return (
                    <Card 
                      key={course.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => router.push(`/courses/${course.id}`)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-6">
                          <div className="w-48 h-32 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                            {course.thumbnail_url ? (
                              <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="h-12 w-12 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                            <div className="mt-4 space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">{t('progress')}</span>
                                <span className="font-semibold">{progressPct}%</span>
                              </div>
                              <Progress value={progressPct} className="h-2" />
                            </div>
                            <div className="mt-4">
                              <Button size="sm">{t('continue_learning')}</Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedCourses.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {t('complete_your_first_course_to_earn_achiev')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {completedCourses.map((item) => {
                  const { course, enrollment } = item
                  
                  return (
                    <Card 
                      key={course.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => router.push(`/courses/${course.id}`)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-6">
                          <div className="w-48 h-32 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                            {course.thumbnail_url ? (
                              <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="h-12 w-12 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                              <Badge className="bg-green-500">{t('completed')}</Badge>
                            </div>
                              <p className="text-sm text-muted-foreground">
                                {enrollment.lessons_completed} {t('lessons')} • {enrollment.total_time_spent_minutes} {t('minutes')}
                              </p>
                            <div className="mt-4">
                              <Button size="sm" variant="outline">{t('review_course')}</Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </PageContainer>
    </AppLayout>
  )
}

