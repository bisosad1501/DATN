"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  Volume2,
  VolumeX,
  Maximize,
  FileText,
  Loader2,
  PenTool,
  Target,
} from "lucide-react"
import { coursesApi } from "@/lib/api/courses"
import type { Lesson, Module } from "@/types"
import { formatDuration } from "@/lib/utils/format"

export default function LessonPlayerPage() {
  const params = useParams()
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [videos, setVideos] = useState<any[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [note, setNote] = useState("")
  const [notes, setNotes] = useState<Array<{ id: string; content: string; timestamp?: number; createdAt: string }>>([])
  const [watchStartTime, setWatchStartTime] = useState<number>(Date.now())
  const [totalWatchedSeconds, setTotalWatchedSeconds] = useState<number>(0)
  const [lastProgressUpdate, setLastProgressUpdate] = useState<number>(0)

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        setLoading(true)
        // Fix: getLessonById only takes lessonId, not courseId
        const lessonData = await coursesApi.getLessonById(params.lessonId as string)
        setLesson(lessonData.lesson)
        setVideos(lessonData.videos || [])

        // Get course detail with modules and lessons (including videos)
        const courseDetail = await coursesApi.getCourseById(params.courseId as string)
        
        // Transform the modules data to match our Module type
        // UPDATED: Include exercises from API
        const transformedModules: Module[] = courseDetail.modules.map((moduleData: any, index: number) => ({
          id: moduleData.module.id,
          course_id: params.courseId as string,
          title: moduleData.module.title || `Module ${index + 1}`,
          display_order: moduleData.module.display_order || index + 1,
          total_lessons: moduleData.lessons?.length || 0,
          total_exercises: moduleData.exercises?.length || 0,  // NEW
          is_published: true,
          created_at: moduleData.module.created_at || new Date().toISOString(),
          updated_at: moduleData.module.updated_at || new Date().toISOString(),
          lessons: moduleData.lessons || [],
          exercises: moduleData.exercises || [],  // NEW
        }))
        
        setModules(transformedModules)

        // TODO: Backend notes endpoint not implemented yet
        // const lessonNotes = await coursesApi.getLessonNotes(params.courseId as string, params.lessonId as string)
        // setNotes(lessonNotes)
      } catch (error) {
        console.error("[v0] Failed to fetch lesson:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLessonData()
  }, [params.courseId, params.lessonId])

  // Track video progress and update backend
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = async () => {
      const currentTime = video.currentTime
      setCurrentTime(currentTime)

      // Update progress every 30 seconds
      const now = Date.now()
      if (now - lastProgressUpdate > 30000 && duration > 0) {
        const progressPercentage = (currentTime / duration) * 100
        const timeSpentMinutes = Math.floor((now - watchStartTime) / 60000)

        try {
          await coursesApi.updateLessonProgress(params.lessonId as string, {
            progress_percentage: Math.min(progressPercentage, 100),
            video_watched_seconds: Math.floor(currentTime),
            video_total_seconds: Math.floor(duration),
            time_spent_minutes: timeSpentMinutes
          })
          setLastProgressUpdate(now)
          console.log('[Lesson Player] Progress updated:', {
            progress: progressPercentage.toFixed(1),
            watched: Math.floor(currentTime),
            total: Math.floor(duration),
            timeSpent: timeSpentMinutes
          })
        } catch (error) {
          console.error('[Lesson Player] Failed to update progress:', error)
        }
      }
    }

    const handleLoadedMetadata = () => setDuration(video.duration)
    const handlePlay = () => {
      setIsPlaying(true)
      setWatchStartTime(Date.now())
    }
    const handlePause = () => setIsPlaying(false)

    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
    }
  }, [duration, lastProgressUpdate, watchStartTime, params.lessonId])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect()
      const pos = (e.clientX - rect.left) / rect.width
      videoRef.current.currentTime = pos * duration
    }
  }

  // TODO: Backend notes feature not implemented yet
  /*
  const handleAddNote = async () => {
    if (!note.trim()) return

    try {
      await coursesApi.addLessonNote(params.courseId as string, params.lessonId as string, {
        content: note,
        timestamp: Math.floor(currentTime),
      })
      const updatedNotes = await coursesApi.getLessonNotes(params.courseId as string, params.lessonId as string)
      setNotes(updatedNotes)
      setNote("")
    } catch (error) {
      console.error("[v0] Failed to add note:", error)
    }
  }
  */


  const handleCompleteLesson = async () => {
    try {
      // TODO: Backend progress endpoint not implemented yet
      // await coursesApi.completLesson(params.lessonId as string)
      handleNextLesson()
    } catch (error) {
      console.error("[v0] Failed to complete lesson:", error)
    }
  }

  const handleNextLesson = () => {
    const allLessons = modules.flatMap((m) => m.lessons || [])
    const currentIndex = allLessons.findIndex((l) => l?.id === params.lessonId)
    if (currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1]
      if (nextLesson?.id) {
        router.push(`/courses/${params.courseId}/lessons/${nextLesson.id}`)
      }
    } else {
      router.push(`/courses/${params.courseId}`)
    }
  }

  const handlePreviousLesson = () => {
    const allLessons = modules.flatMap((m) => m.lessons || [])
    const currentIndex = allLessons.findIndex((l) => l?.id === params.lessonId)
    if (currentIndex > 0) {
      const prevLesson = allLessons[currentIndex - 1]
      if (prevLesson?.id) {
        router.push(`/courses/${params.courseId}/lessons/${prevLesson.id}`)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Lesson not found</h1>
        <Button onClick={() => router.push(`/courses/${params.courseId}`)}>Back to Course</Button>
      </div>
    )
  }

  const allLessons = modules.flatMap((m) => m.lessons || [])
  const currentIndex = allLessons.findIndex((l) => l?.id === params.lessonId)
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < allLessons.length - 1

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push(`/courses/${params.courseId}`)}
              className="flex-shrink-0"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Quay lại
            </Button>
            
            <h1 className="text-base md:text-lg font-semibold truncate flex-1 text-center px-4">
              {lesson.title}
            </h1>
            
            <Button 
              onClick={handleCompleteLesson}
              size="sm"
              className="flex-shrink-0"
              disabled={!hasNext}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Tiếp theo
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Video Content - Show if videos exist, regardless of content_type */}
            {videos.length > 0 && (
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative bg-black aspect-video">
                    {videos[0].video_provider === "youtube" && videos[0].video_id ? (
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube-nocookie.com/embed/${videos[0].video_id}?rel=0&modestbranding=1&fs=1&iv_load_policy=3&cc_load_policy=0&playsinline=1&controls=1`}
                        title={lesson.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        referrerPolicy="strict-origin-when-cross-origin"
                        frameBorder="0"
                      />
                    ) : (
                      <video
                        ref={videoRef}
                        src={videos[0].video_url}
                        className="absolute inset-0 w-full h-full object-contain"
                        controls
                        controlsList="nodownload"
                      />
                    )}
                  </div>
                </CardContent>
                
                {/* Video Info */}
                <CardHeader className="border-t">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{lesson.title}</CardTitle>
                      {lesson.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {lesson.description}
                        </p>
                      )}
                    </div>
                    {/* Show actual video duration if available, fallback to lesson duration */}
                    {(videos[0]?.duration_seconds || lesson.duration_minutes) && (
                      <div className="ml-4 text-sm text-muted-foreground whitespace-nowrap">
                        {videos[0]?.duration_seconds 
                          ? formatDuration(videos[0].duration_seconds)
                          : lesson.duration_minutes 
                            ? `${lesson.duration_minutes} phút`
                            : ''
                        }
                      </div>
                    )}
                  </div>
                </CardHeader>
              </Card>
            )}

            {/* Lesson Navigation */}
            <div className="flex justify-between items-center gap-4 py-4">
              <Button
                variant="outline"
                onClick={handlePreviousLesson}
                disabled={!hasPrevious}
                className="flex-1 max-w-[200px]"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Bài trước
              </Button>
              
              <div className="text-sm text-muted-foreground">
                Bài {currentIndex + 1} / {allLessons.length}
              </div>
              
              <Button
                onClick={handleNextLesson}
                disabled={!hasNext}
                className="flex-1 max-w-[200px]"
              >
                Bài sau
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {(lesson.content_type === "article" || lesson.contentType === "ARTICLE") && (
              <Card>
                <CardHeader>
                  <CardTitle>{lesson.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p>{lesson.description}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TODO: Backend notes feature not implemented yet
            <Card>
              <CardHeader>
                <CardTitle>Lesson Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="add">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="add">Add Note</TabsTrigger>
                    <TabsTrigger value="view">View Notes ({notes.length})</TabsTrigger>
                  </TabsList>
                  <TabsContent value="add" className="space-y-4">
                    <Textarea
                      placeholder="Write your notes here..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={4}
                    />
                    <Button onClick={handleAddNote}>Save Note</Button>
                  </TabsContent>
                  <TabsContent value="view">
                    {notes.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No notes yet</p>
                    ) : (
                      <div className="space-y-3">
                        {notes.map((n) => (
                          <div key={n.id} className="p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              {n.timestamp !== undefined && (
                                <span className="text-xs text-muted-foreground">{formatDuration(n.timestamp)}</span>
                              )}
                            </div>
                            <p className="text-sm">{n.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            */}
          </div>

          {/* Sidebar - Course Content */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Nội dung khóa học</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                  {modules.map((module) => (
                    <div key={module.id} className="border-b last:border-b-0">
                      <div className="p-4 bg-muted/50">
                        <h4 className="font-semibold text-sm">{module.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {module.lessons?.length || 0} bài học
                          {(module.exercises?.length || 0) > 0 && (
                            <span className="text-pink-600 dark:text-pink-400"> • {module.exercises?.length || 0} bài tập</span>
                          )}
                        </p>
                      </div>
                      <div className="divide-y">
                        {/* Lessons */}
                        {module.lessons?.map((l, index) => {
                          const contentType = (l.content_type || l.contentType || 'video').toLowerCase()

                          // Prioritize video duration_seconds for accurate display
                          const videoDurationSeconds = (l as any).videos?.[0]?.duration_seconds || 0
                          const durationMinutes = l.duration_minutes || l.duration || 0
                          const durationSeconds = videoDurationSeconds > 0 ? videoDurationSeconds : durationMinutes * 60

                          const isActive = l.id === params.lessonId

                          return (
                            <button
                              key={l.id}
                              onClick={() => router.push(`/courses/${params.courseId}/lessons/${l.id}`)}
                              className={`w-full text-left p-3 transition-all ${
                                isActive
                                  ? "bg-primary/10 border-l-4 border-primary"
                                  : "hover:bg-muted/50 border-l-4 border-transparent"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                  isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                                }`}>
                                  {index + 1}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium truncate ${
                                    isActive ? "text-primary" : ""
                                  }`}>
                                    {l.title}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    {contentType === "video" && (
                                      <>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                          <PlayCircle className="w-3 h-3" />
                                          Video
                                        </span>
                                        {durationSeconds > 0 && (
                                          <span className="text-xs text-muted-foreground">
                                            • {formatDuration(durationSeconds)}
                                          </span>
                                        )}
                                      </>
                                    )}
                                    {contentType === "article" && (
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <FileText className="w-3 h-3" />
                                        Bài đọc
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </button>
                          )
                        })}

                        {/* Exercises - NEW */}
                        {module.exercises?.map((ex, index) => {
                          return (
                            <button
                              key={ex.id}
                              onClick={() => router.push(`/exercises/${ex.id}`)}
                              className="w-full text-left p-3 transition-all bg-pink-50/50 dark:bg-pink-950/10 hover:bg-pink-100 dark:hover:bg-pink-950/20 border-l-4 border-transparent hover:border-pink-500"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium bg-pink-200 dark:bg-pink-900 text-pink-700 dark:text-pink-300">
                                  <Target className="w-3 h-3" />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate text-pink-700 dark:text-pink-300">
                                    {ex.title}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-pink-600 dark:text-pink-400 flex items-center gap-1 font-medium">
                                      <PenTool className="w-3 h-3" />
                                      {ex.total_questions} câu hỏi
                                    </span>
                                    {ex.time_limit_minutes && (
                                      <span className="text-xs text-pink-600 dark:text-pink-400">
                                        • {ex.time_limit_minutes}m
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
