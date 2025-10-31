"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, Clock, BookOpen, FileText, PlayCircle, Award, Target, CheckCircle, ChevronLeft } from "lucide-react"
import { exercisesApi } from "@/lib/api/exercises"
import type { ExerciseDetailResponse } from "@/types"
import { useAuth } from "@/lib/contexts/auth-context"

export default function ExerciseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const exerciseId = params.exerciseId as string

  // Get lesson context from URL params (optional, fallback to API data)
  const lessonId = searchParams.get('lessonId')

  const [exerciseData, setExerciseData] = useState<ExerciseDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        setLoading(true)
        const data = await exercisesApi.getExerciseById(exerciseId)
        setExerciseData(data)
        console.log('[Exercise Detail] Loaded:', data)
      } catch (error) {
        console.error('[Exercise Detail] Failed to load:', error)
      } finally {
        setLoading(false)
      }
    }

    if (exerciseId) {
      fetchExercise()
    }
  }, [exerciseId])

  const handleStartExercise = async () => {
    if (!user) {
      console.log('[Exercise Detail] User not logged in, redirecting to login')
      router.push('/login')
      return
    }

    try {
      setStarting(true)
      console.log('[Exercise Detail] Starting exercise:', exerciseId)
      console.log('[Exercise Detail] User:', user)
      console.log('[Exercise Detail] Token:', localStorage.getItem('access_token') ? 'exists' : 'missing')

      const submission = await exercisesApi.startExercise(exerciseId)
      console.log('[Exercise Detail] Started submission:', submission)

      router.push(`/exercises/${exerciseId}/take/${submission.id}`)
    } catch (error: any) {
      console.error('[Exercise Detail] Failed to start:', error)
      console.error('[Exercise Detail] Error response:', error.response?.data)
      console.error('[Exercise Detail] Error status:', error.response?.status)

      // Better error messages
      if (error.response?.status === 401) {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
        router.push('/login')
      } else if (error.response?.status === 404) {
        alert('Không tìm thấy bài tập. Vui lòng thử lại.')
      } else {
        const errorMsg = error.response?.data?.error?.message || error.message || 'Không thể bắt đầu bài tập'
        alert(errorMsg + '. Vui lòng thử lại.')
      }
    } finally {
      setStarting(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    )
  }

  if (!exerciseData) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Không tìm thấy bài tập</h2>
          <Button onClick={() => router.back()} className="mt-4">
            Quay lại
          </Button>
        </div>
      </AppLayout>
    )
  }

  const { exercise, sections } = exerciseData
  // Backend returns sections as array of {section, questions}
  const totalQuestions = sections?.reduce((sum, sectionData) => {
    return sum + (sectionData.section?.total_questions || 0)
  }, 0) || 0

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back to Lesson Button - Only show if exercise is linked to a lesson */}
        {exercise.lesson_id && (
          <Button
            variant="ghost"
            onClick={() => router.push(`/lessons/${lessonId || exercise.lesson_id}`)}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Quay lại bài học
          </Button>
        )}

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Badge className="capitalize">
              {exercise.skill_type === 'listening' && '🎧 Listening'}
              {exercise.skill_type === 'reading' && '📖 Reading'}
              {exercise.skill_type === 'writing' && '✍️ Writing'}
              {exercise.skill_type === 'speaking' && '🗣️ Speaking'}
            </Badge>
            <Badge variant="outline" className="capitalize">{exercise.difficulty_level}</Badge>
            {exercise.is_official && (
              <Badge variant="secondary">
                <Award className="w-3 h-3 mr-1" />
                Official
              </Badge>
            )}
          </div>

          <h1 className="text-3xl font-bold tracking-tight mb-2">{exercise.title}</h1>
          {exercise.description && (
            <p className="text-base text-muted-foreground">{exercise.description}</p>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin bài tập</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Thời gian</p>
                      <p className="font-medium">
                        {exercise.time_limit_minutes ? `${exercise.time_limit_minutes} phút` : 'Không giới hạn'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Số câu hỏi</p>
                      <p className="font-medium">{totalQuestions} câu</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Điểm tối đa</p>
                      <p className="font-medium">
                        {exercise.total_points || exercise.max_score || totalQuestions} điểm
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Số phần</p>
                      <p className="font-medium">{sections.length} phần</p>
                    </div>
                  </div>
                </div>

                {exercise.instructions && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Hướng dẫn</h4>
                      <div 
                        className="prose prose-sm max-w-none text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: exercise.instructions }}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cấu trúc bài tập</CardTitle>
                <CardDescription>
                  {sections.length} phần với tổng {totalQuestions} câu hỏi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sections && sections.length > 0 ? (
                    sections.map((sectionData, index) => {
                      const section = sectionData.section
                      const questionCount = sectionData.questions?.length || section?.total_questions || 0
                      return (
                        <div
                          key={section?.id || `section-${index}`}
                          className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium">{section?.title}</h4>
                              {section?.description && (
                                <p className="text-sm text-muted-foreground">{section.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{questionCount} câu</span>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Chưa có phần nào
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lưu ý khi làm bài</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-green-500" />
                    <span>Đọc kỹ hướng dẫn của từng phần trước khi bắt đầu</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-green-500" />
                    <span>Quản lý thời gian hợp lý cho từng phần</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-green-500" />
                    <span>Kiểm tra lại câu trả lời trước khi nộp bài</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-green-500" />
                    <span>Bạn có thể lưu nháp và tiếp tục sau</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bắt đầu làm bài</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleStartExercise} 
                  disabled={starting}
                  className="w-full"
                  size="lg"
                >
                  {starting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang chuẩn bị...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Bắt đầu làm bài
                    </>
                  )}
                </Button>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Thời gian: {exercise.time_limit_minutes ? `${exercise.time_limit_minutes} phút` : 'Không giới hạn'}</p>
                  <p>• Số câu: {totalQuestions} câu hỏi</p>
                  <p>• Có thể làm lại nhiều lần</p>
                </div>
              </CardContent>
            </Card>

            {(exercise.total_attempts || exercise.average_score) && (
              <Card>
                <CardHeader>
                  <CardTitle>Thống kê</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {exercise.total_attempts !== null && exercise.total_attempts !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Số lượt làm</span>
                      <span className="font-semibold">{exercise.total_attempts}</span>
                    </div>
                  )}

                  {exercise.average_score !== null && exercise.average_score !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Điểm trung bình</span>
                      <span className="font-semibold text-primary">
                        {exercise.average_score.toFixed(1)}/{exercise.total_points || totalQuestions}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Thông tin chi tiết</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Loại kỹ năng:</span>
                  <span className="font-medium">{exercise.skill_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Độ khó:</span>
                  <span className="font-medium">{exercise.difficulty_level}</span>
                </div>
                {exercise.target_band_score && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Band điểm:</span>
                    <span className="font-medium">{exercise.target_band_score}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trạng thái:</span>
                  <Badge variant={exercise.is_published ? "default" : "secondary"}>
                    {exercise.is_published ? "Đã xuất bản" : "Nháp"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}