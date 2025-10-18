"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Star, BookOpen, PlayCircle, FileText, CheckCircle, Loader2 } from "lucide-react"
import { coursesApi } from "@/lib/api/courses"
import { useAuth } from "@/lib/contexts/auth-context"
import type { Course, Module } from "@/types"
import { formatDuration, formatNumber } from "@/lib/utils/format"

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true)
        const courseDetail = await coursesApi.getCourseById(params.courseId as string)
        
        // Backend returns { course, modules, is_enrolled, enrollment_details }
        setCourse(courseDetail.course)
        setIsEnrolled(courseDetail.is_enrolled || false)
        
        // Use modules from backend response
        if (courseDetail.modules && Array.isArray(courseDetail.modules)) {
          const formattedModules = courseDetail.modules.map((moduleData) => ({
            ...moduleData.module,
            lessons: moduleData.lessons || []
          }))
          setModules(formattedModules)
          console.log('[DEBUG] Loaded modules:', formattedModules)
        } else {
          console.warn('[DEBUG] No modules in course detail response')
        }
      } catch (error) {
        console.error("[v0] Failed to fetch course:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourseData()
  }, [params.courseId, user])

  const handleEnroll = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    try {
      setEnrolling(true)
      // Get courseId and ensure it's a string
      const courseId = Array.isArray(params.courseId) ? params.courseId[0] : params.courseId
      console.log('[DEBUG] Full params:', params)
      console.log('[DEBUG] Enrolling in course:', courseId)
      console.log('[DEBUG] CourseId type:', typeof courseId)
      
      if (!courseId) {
        throw new Error('Course ID is missing')
      }
      
      await coursesApi.enrollCourse(courseId)
      setIsEnrolled(true)
      console.log('[DEBUG] Enrollment successful')
    } catch (error: any) {
      console.error("[v0] Failed to enroll:", error)
      console.error("[DEBUG] Error response:", error.response?.data)
      
      const errorData = error.response?.data?.error
      let errorMessage = "Không thể đăng ký khóa học"
      
      if (errorData?.details === "this course requires payment") {
        errorMessage = "Khóa học này yêu cầu thanh toán. Vui lòng mua khóa học trước khi đăng ký."
      } else if (errorData?.message) {
        errorMessage = errorData.message
      }
      
      alert(errorMessage)
    } finally {
      setEnrolling(false)
    }
  }

  const handleStartLearning = () => {
    console.log('[DEBUG] handleStartLearning called', {
      modulesLength: modules.length,
      modulesWithLessons: modules.filter(m => m.lessons && m.lessons.length > 0).length
    })
    
    // Find first module that has lessons
    const moduleWithLessons = modules.find(m => m.lessons && m.lessons.length > 0)
    
    if (moduleWithLessons && moduleWithLessons.lessons && moduleWithLessons.lessons.length > 0) {
      const lessonId = moduleWithLessons.lessons[0].id
      console.log('[DEBUG] Navigating to lesson:', lessonId, 'in module:', moduleWithLessons.title)
      router.push(`/courses/${params.courseId}/lessons/${lessonId}`)
    } else {
      console.warn('[DEBUG] No lessons available to start')
      // Show a toast or alert that no lessons are available
      alert('Chưa có bài học nào. Nội dung đang được cập nhật.')
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    )
  }

  if (!course) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          <Button onClick={() => router.push("/courses")}>Back to Courses</Button>
        </div>
      </AppLayout>
    )
  }

  const skillColors: Record<string, string> = {
    LISTENING: "bg-blue-500",
    READING: "bg-green-500",
    WRITING: "bg-orange-500",
    SPEAKING: "bg-purple-500",
    GENERAL: "bg-gray-500",
  }

  const levelColors: Record<string, string> = {
    BEGINNER: "bg-emerald-500",
    INTERMEDIATE: "bg-yellow-500",
    ADVANCED: "bg-red-500",
  }

  const contentTypeIcons: Record<string, any> = {
    VIDEO: PlayCircle,
    video: PlayCircle,
    ARTICLE: FileText,
    article: FileText,
    QUIZ: CheckCircle,
    quiz: CheckCircle,
    exercise: CheckCircle,
  }

  return (
    <AppLayout>
      <div className="bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex gap-3 mb-4">
                <Badge className={skillColors[(course.skill_type || course.skillType || 'listening').toUpperCase()]}>
                  {(course.skill_type || course.skillType || 'listening').toUpperCase()}
                </Badge>
                <Badge className={levelColors[(course.level || 'beginner').toUpperCase()]} variant="secondary">
                  {(course.level || 'beginner').toUpperCase()}
                </Badge>
              </div>

              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-muted-foreground mb-6">{course.short_description || course.description}</p>

              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{(course.average_rating || course.rating || 0).toFixed(1)}</span>
                  <span className="text-muted-foreground">({formatNumber(course.total_reviews || course.reviewCount || 0)} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <span>{formatNumber(course.total_enrollments || course.enrollmentCount || 0)} students</span>
                </div>
              </div>

              {course.instructor_name && (
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">{course.instructor_name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Instructor</p>
                    <p className="font-semibold">{course.instructor_name}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <div className="relative aspect-video">
                  {course.thumbnail ? (
                    <Image
                      src={course.thumbnail || "/placeholder.svg"}
                      alt={course.title}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-lg">
                      <BookOpen className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  {/* Check both old and new field names */}
                  {((course.enrollment_type || course.enrollmentType) === "premium" || 
                    (course.enrollment_type || course.enrollmentType) === "paid") && course.price ? (
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-primary">
                        {course.price.toLocaleString()} {course.currency || "VND"}
                      </span>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <Badge className="text-lg px-3 py-1">MIỄN PHÍ</Badge>
                    </div>
                  )}

                  {isEnrolled ? (
                    modules.length > 0 && modules.some(m => m.lessons && m.lessons.length > 0) ? (
                      <Button className="w-full mb-4" size="lg" onClick={handleStartLearning}>
                        Tiếp tục học
                      </Button>
                    ) : (
                      <Button className="w-full mb-4" size="lg" disabled variant="secondary">
                        Nội dung đang cập nhật
                      </Button>
                    )
                  ) : ((course.enrollment_type || course.enrollmentType) === "premium" || 
                       (course.enrollment_type || course.enrollmentType) === "paid") ? (
                    <Button className="w-full mb-4" size="lg" onClick={handleEnroll} disabled={true}>
                      Yêu cầu thanh toán
                    </Button>
                  ) : (
                    <Button className="w-full mb-4" size="lg" onClick={handleEnroll} disabled={enrolling}>
                      {enrolling ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Đang đăng ký...
                        </>
                      ) : (
                        "Đăng ký ngay"
                      )}
                    </Button>
                  )}

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{formatDuration((course.duration_hours || course.duration || 0) * 60)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Lessons</span>
                      <span className="font-medium">{course.total_lessons || course.lessonCount || 0} lessons</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Level</span>
                      <span className="font-medium">{course.level}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Skill</span>
                      <span className="font-medium capitalize">{course.skill_type || course.skillType}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="curriculum" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="curriculum" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Nội dung khóa học</CardTitle>
              </CardHeader>
              <CardContent>
                {modules.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-semibold mb-2">Nội dung đang được cập nhật</p>
                    <p className="text-sm text-muted-foreground">
                      Khóa học này sẽ có {course.total_lessons || course.lessonCount || 0} bài học. 
                      Nội dung đang được chuẩn bị và sẽ sớm được cập nhật.
                    </p>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {modules.map((module, index) => (
                      <AccordionItem key={module.id} value={`module-${index}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <span className="font-semibold">{module.title}</span>
                            <span className="text-sm text-muted-foreground">{module.lessons?.length || 0} bài học</span>
                          </div>
                        </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pt-2">
                          {module.lessons?.map((lesson) => {
                            const contentType = (lesson.content_type || lesson.contentType || 'video').toUpperCase()
                            const Icon = contentTypeIcons[contentType] || PlayCircle
                            const isPreview = lesson.is_free || lesson.isPreview || false
                            
                            // Prioritize video duration_seconds for accurate display
                            const videoDurationSeconds = (lesson as any).videos?.[0]?.duration_seconds || 0
                            const durationMinutes = lesson.duration_minutes || lesson.duration || 0
                            const durationSeconds = videoDurationSeconds > 0 ? videoDurationSeconds : durationMinutes * 60
                            
                            const handleLessonClick = () => {
                              // Check if user is enrolled or if lesson is free/preview
                              if (isEnrolled || isPreview) {
                                router.push(`/courses/${params.courseId}/lessons/${lesson.id}`)
                              } else {
                                // Show enroll prompt or error
                                alert('Vui lòng đăng ký khóa học để xem bài học này')
                              }
                            }
                            
                            return (
                              <button
                                key={lesson.id}
                                onClick={handleLessonClick}
                                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer text-left"
                              >
                                <div className="flex items-center gap-3">
                                  <Icon className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">{lesson.title}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs text-muted-foreground">
                                    {durationSeconds > 0 ? formatDuration(durationSeconds) : ''}
                                  </span>
                                  {isPreview && <Badge variant="outline">Preview</Badge>}
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Về khóa học này</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p>{course.description || course.short_description}</p>
                  <h3 className="font-semibold mt-6 mb-3">Bạn sẽ học được gì</h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li>Nắm vững các kỹ thuật {(course.skill_type || course.skillType || 'IELTS').toLowerCase()} cần thiết cho IELTS</li>
                    <li>Thực hành với tài liệu chính thống</li>
                    <li>Nhận phản hồi chi tiết</li>
                    <li>Theo dõi tiến trình học tập</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
