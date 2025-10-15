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
        const courseData = await coursesApi.getCourseById(params.courseId as string)
        setCourse(courseData)

        const lessonsData = await coursesApi.getCourseLessons(params.courseId as string)
        const groupedModules: Module[] = lessonsData.reduce((acc: Module[], lesson) => {
          const existingModule = acc.find((m) => m.id === lesson.moduleId)
          if (existingModule) {
            existingModule.lessons.push(lesson)
          } else {
            acc.push({
              id: lesson.moduleId,
              courseId: params.id as string,
              title: `Module ${acc.length + 1}`,
              order: acc.length + 1,
              duration: 0,
              lessons: [lesson],
            })
          }
          return acc
        }, [])
        setModules(groupedModules)

        if (user) {
          const enrolledCourses = await coursesApi.getEnrolledCourses()
          setIsEnrolled(enrolledCourses.some((c) => c.id === params.id))
        }
      } catch (error) {
        console.error("[v0] Failed to fetch course:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourseData()
  }, [params.id, user])

  const handleEnroll = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    try {
      setEnrolling(true)
      await coursesApi.enrollCourse(params.id as string)
      setIsEnrolled(true)
    } catch (error) {
      console.error("[v0] Failed to enroll:", error)
    } finally {
      setEnrolling(false)
    }
  }

  const handleStartLearning = () => {
    if (modules.length > 0 && modules[0].lessons.length > 0) {
      router.push(`/courses/${params.id}/lessons/${modules[0].lessons[0].id}`)
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

  const skillColors = {
    LISTENING: "bg-blue-500",
    READING: "bg-green-500",
    WRITING: "bg-orange-500",
    SPEAKING: "bg-purple-500",
  }

  const levelColors = {
    BEGINNER: "bg-emerald-500",
    INTERMEDIATE: "bg-yellow-500",
    ADVANCED: "bg-red-500",
  }

  const contentTypeIcons = {
    VIDEO: PlayCircle,
    ARTICLE: FileText,
    QUIZ: CheckCircle,
  }

  return (
    <AppLayout>
      <div className="bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex gap-3 mb-4">
                <Badge className={skillColors[course.skillType]}>{course.skillType}</Badge>
                <Badge className={levelColors[course.level]} variant="secondary">
                  {course.level}
                </Badge>
              </div>

              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-muted-foreground mb-6">{course.description}</p>

              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{course.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({formatNumber(course.reviewCount)} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <span>{formatNumber(course.enrollmentCount)} students</span>
                </div>
              </div>

              {course.instructor && (
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">{course.instructor.fullName.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Instructor</p>
                    <p className="font-semibold">{course.instructor.fullName}</p>
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
                  {course.enrollmentType === "PAID" && course.price ? (
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-primary">${course.price}</span>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <Badge className="text-lg px-3 py-1">FREE</Badge>
                    </div>
                  )}

                  {isEnrolled ? (
                    <Button className="w-full mb-4" size="lg" onClick={handleStartLearning}>
                      Continue Learning
                    </Button>
                  ) : (
                    <Button className="w-full mb-4" size="lg" onClick={handleEnroll} disabled={enrolling}>
                      {enrolling ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enrolling...
                        </>
                      ) : (
                        "Enroll Now"
                      )}
                    </Button>
                  )}

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{formatDuration(course.duration)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Lessons</span>
                      <span className="font-medium">{course.lessonCount} lessons</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Level</span>
                      <span className="font-medium">{course.level}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Skill</span>
                      <span className="font-medium">{course.skillType}</span>
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
                <CardTitle>Course Curriculum</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {modules.map((module, index) => (
                    <AccordionItem key={module.id} value={`module-${index}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <span className="font-semibold">{module.title}</span>
                          <span className="text-sm text-muted-foreground">{module.lessons.length} lessons</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pt-2">
                          {module.lessons.map((lesson) => {
                            const Icon = contentTypeIcons[lesson.contentType]
                            return (
                              <div
                                key={lesson.id}
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <Icon className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">{lesson.title}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs text-muted-foreground">
                                    {formatDuration(lesson.duration)}
                                  </span>
                                  {lesson.isPreview && <Badge variant="outline">Preview</Badge>}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>About This Course</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p>{course.description}</p>
                  <h3 className="font-semibold mt-6 mb-3">What you'll learn</h3>
                  <ul className="space-y-2">
                    <li>Master essential {course.skillType.toLowerCase()} techniques for IELTS</li>
                    <li>Practice with real IELTS-style questions and exercises</li>
                    <li>Develop strategies to improve your band score</li>
                    <li>Get personalized feedback on your progress</li>
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
