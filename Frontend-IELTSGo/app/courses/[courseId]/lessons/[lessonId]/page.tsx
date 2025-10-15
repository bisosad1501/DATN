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
} from "lucide-react"
import { coursesApi } from "@/lib/api/courses"
import type { Lesson, Module } from "@/types"
import { formatDuration } from "@/lib/utils/format"

export default function LessonPlayerPage() {
  const params = useParams()
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [note, setNote] = useState("")
  const [notes, setNotes] = useState<Array<{ id: string; content: string; timestamp?: number; createdAt: string }>>([])

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        setLoading(true)
        const lessonData = await coursesApi.getLessonById(params.courseId as string, params.lessonId as string)
        setLesson(lessonData)

        const lessonsData = await coursesApi.getCourseLessons(params.courseId as string)
        const groupedModules: Module[] = lessonsData.reduce((acc: Module[], lesson) => {
          const existingModule = acc.find((m) => m.id === lesson.moduleId)
          if (existingModule) {
            existingModule.lessons.push(lesson)
          } else {
            acc.push({
              id: lesson.moduleId,
              courseId: params.courseId as string,
              title: `Module ${acc.length + 1}`,
              order: acc.length + 1,
              duration: 0,
              lessons: [lesson],
            })
          }
          return acc
        }, [])
        setModules(groupedModules)

        const lessonNotes = await coursesApi.getLessonNotes(params.courseId as string, params.lessonId as string)
        setNotes(lessonNotes)
      } catch (error) {
        console.error("[v0] Failed to fetch lesson:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLessonData()
  }, [params.courseId, params.lessonId])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => setCurrentTime(video.currentTime)
    const handleLoadedMetadata = () => setDuration(video.duration)
    const handlePlay = () => setIsPlaying(true)
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
  }, [])

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

  const handleCompleteLesson = async () => {
    try {
      await coursesApi.completLesson(params.courseId as string, params.lessonId as string)
      handleNextLesson()
    } catch (error) {
      console.error("[v0] Failed to complete lesson:", error)
    }
  }

  const handleNextLesson = () => {
    const allLessons = modules.flatMap((m) => m.lessons)
    const currentIndex = allLessons.findIndex((l) => l.id === params.lessonId)
    if (currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1]
      router.push(`/courses/${params.courseId}/lessons/${nextLesson.id}`)
    } else {
      router.push(`/courses/${params.courseId}`)
    }
  }

  const handlePreviousLesson = () => {
    const allLessons = modules.flatMap((m) => m.lessons)
    const currentIndex = allLessons.findIndex((l) => l.id === params.lessonId)
    if (currentIndex > 0) {
      const prevLesson = allLessons[currentIndex - 1]
      router.push(`/courses/${params.courseId}/lessons/${prevLesson.id}`)
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

  const allLessons = modules.flatMap((m) => m.lessons)
  const currentIndex = allLessons.findIndex((l) => l.id === params.lessonId)
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < allLessons.length - 1

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.push(`/courses/${params.courseId}`)}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Course
            </Button>
            <h1 className="text-lg font-semibold">{lesson.title}</h1>
            <Button onClick={handleCompleteLesson}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete & Continue
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {lesson.contentType === "VIDEO" && lesson.contentUrl && (
              <Card>
                <CardContent className="p-0">
                  <div className="relative bg-black aspect-video">
                    <video ref={videoRef} src={lesson.contentUrl} className="w-full h-full" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <div className="flex items-center gap-4">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={togglePlay}
                          className="text-white hover:bg-white/20"
                        >
                          {isPlaying ? <PauseCircle className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
                        </Button>
                        <div className="flex-1">
                          <div className="h-1 bg-white/30 rounded-full cursor-pointer" onClick={handleProgressClick}>
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${(currentTime / duration) * 100}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-white mt-1">
                            <span>{formatDuration(Math.floor(currentTime))}</span>
                            <span>{formatDuration(Math.floor(duration))}</span>
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={toggleMute}
                          className="text-white hover:bg-white/20"
                        >
                          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => videoRef.current?.requestFullscreen()}
                          className="text-white hover:bg-white/20"
                        >
                          <Maximize className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {lesson.contentType === "ARTICLE" && (
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

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousLesson}
                disabled={!hasPrevious}
                className="bg-transparent"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous Lesson
              </Button>
              <Button onClick={handleNextLesson} disabled={!hasNext}>
                Next Lesson
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {modules.map((module) => (
                    <div key={module.id}>
                      <h4 className="font-semibold text-sm mb-2">{module.title}</h4>
                      <div className="space-y-1">
                        {module.lessons.map((l) => (
                          <button
                            key={l.id}
                            onClick={() => router.push(`/courses/${params.courseId}/lessons/${l.id}`)}
                            className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                              l.id === params.lessonId ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {l.contentType === "VIDEO" && <PlayCircle className="w-4 h-4" />}
                              {l.contentType === "ARTICLE" && <FileText className="w-4 h-4" />}
                              {l.contentType === "QUIZ" && <CheckCircle className="w-4 h-4" />}
                              <span className="flex-1 truncate">{l.title}</span>
                              <span className="text-xs opacity-70">{formatDuration(l.duration)}</span>
                            </div>
                          </button>
                        ))}
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
