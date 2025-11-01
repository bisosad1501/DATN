"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { PageContainer } from "@/components/layout/page-container"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, Clock, ChevronLeft, ChevronRight, Flag, Eye, EyeOff } from "lucide-react"
import { exercisesApi } from "@/lib/api/exercises"
import type { ExerciseSection, QuestionWithOptions } from "@/types"
import { useTranslations } from '@/lib/i18n'

interface ExerciseData {
  exercise: {
    id: string
    title: string
    time_limit_minutes?: number
  }
  sections: ExerciseSection[]
}

export default function TakeExercisePage() {

  const t = useTranslations('exercises')

  const params = useParams()
  const router = useRouter()
  const exerciseId = params.exerciseId as string
  const submissionId = params.submissionId as string

  const [exerciseData, setExerciseData] = useState<ExerciseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Map<string, any>>(new Map())
  const [timeSpent, setTimeSpent] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [showSectionContent, setShowSectionContent] = useState(true) // Show passage/audio

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch exercise data
  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const data = await exercisesApi.getExerciseById(exerciseId)
        setExerciseData(data)
      } catch (error) {
        console.error("Failed to fetch exercise:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchExercise()
  }, [exerciseId])

  // Get all questions flattened with section info
  const allQuestions: (QuestionWithOptions & { sectionId: string; sectionData: any })[] =
    exerciseData?.sections.flatMap((sectionData) =>
      (sectionData.questions || []).map((q) => ({
        ...q,
        sectionId: sectionData.section?.id || '',
        sectionData: sectionData.section
      }))
    ) || []
  const currentQuestion = allQuestions[currentQuestionIndex]

  // Get current section
  const currentSection = currentQuestion?.sectionData

  // Debug logging
  useEffect(() => {
    if (currentSection) {
      console.log('[Take Exercise] Current Section:', currentSection)
      console.log('[Take Exercise] Has audio_url:', !!currentSection.audio_url)
      console.log('[Take Exercise] Has passage_content:', !!currentSection.passage_content)
      console.log('[Take Exercise] Has instructions:', !!currentSection.instructions)
    }
  }, [currentSection])

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(new Map(answers.set(questionId, answer)))
  }

  const handleNext = () => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      const nextQuestion = allQuestions[currentQuestionIndex + 1]
      const currentSectionId = currentQuestion?.sectionId
      const nextSectionId = nextQuestion?.sectionId

      // Show section content if moving to a new section
      if (currentSectionId !== nextSectionId) {
        setShowSectionContent(true)
      }

      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      const prevQuestion = allQuestions[currentQuestionIndex - 1]
      const currentSectionId = currentQuestion?.sectionId
      const prevSectionId = prevQuestion?.sectionId

      // Show section content if moving to a new section
      if (currentSectionId !== prevSectionId) {
        setShowSectionContent(true)
      }

      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (!confirm(t('are_you_sure_you_want_to_submit_you_cann'))) {
      return
    }

    try {
      setSubmitting(true)

      // Format answers for API
      const formattedAnswers = Array.from(answers.entries()).map(([questionId, answer]) => {
        const question = allQuestions.find((q) => q.question.id === questionId)

        if (question?.question.question_type === "multiple_choice") {
          return {
            question_id: questionId,
            selected_option_id: answer,
            time_spent_seconds: Math.floor(timeSpent / allQuestions.length),
          }
        } else {
          return {
            question_id: questionId,
            text_answer: answer,
            time_spent_seconds: Math.floor(timeSpent / allQuestions.length),
          }
        }
      })

      // Submit answers
      await exercisesApi.submitAnswers(submissionId, formattedAnswers)

      // Navigate to result page
      router.push(`/exercises/${exerciseId}/result/${submissionId}`)
    } catch (error) {
      console.error("Failed to submit answers:", error)
      alert(t('failed_to_submit_answers_please_try_agai'))
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  if (loading || !exerciseData || !currentQuestion) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    )
  }

  const progress = ((currentQuestionIndex + 1) / allQuestions.length) * 100
  const answeredCount = answers.size

  return (
    <AppLayout>
      <PageContainer maxWidth="5xl" className="py-4">
        {/* Header with Timer */}
        <Card className="mb-4">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{exerciseData.exercise.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {t('question_of', { current: (currentQuestionIndex + 1).toString(), total: allQuestions.length.toString() })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono text-lg">{formatTime(timeSpent)}</span>
                </div>
                <Badge variant="outline">
                  {answeredCount}/{allQuestions.length} {t('answered')}
                </Badge>
              </div>
            </div>
            <Progress value={progress} className="mt-3 h-2" />
          </CardContent>
        </Card>

        {/* Section Content (Passage for Reading, Audio for Listening) */}
        {currentSection && (currentSection.passage_content || currentSection.audio_url || currentSection.instructions) && (
          <div className="mb-4">
            {/* Toggle Button */}
            <div className="flex justify-end mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSectionContent(!showSectionContent)}
              >
                {showSectionContent ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    {t('hide_section_content')}
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    {t('show_section_content')}
                  </>
                )}
              </Button>
            </div>

            {showSectionContent && (
              <>
                {/* Section Instructions */}
                {currentSection.instructions && (
                  <Card className="mb-4 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        📋 {t('instructions')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: currentSection.instructions }}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Reading Passage */}
                {currentSection.passage_content && (
                  <Card className="mb-4">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        📖 {currentSection.passage_title || t('reading_passage_label')}
                      </CardTitle>
                      {currentSection.passage_word_count && (
                        <p className="text-sm text-muted-foreground">
                          {t('word_count', { count: currentSection.passage_word_count.toString() })}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div
                        className="prose prose-sm max-w-none leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: currentSection.passage_content }}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Listening Audio */}
                {currentSection.audio_url && (
                  <Card className="mb-4 border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        🎧 {t('audio')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <audio
                        controls
                        className="w-full"
                        src={currentSection.audio_url}
                      >
                        {t('browser_no_audio_support')}
                      </audio>
                      {currentSection.transcript && (
                        <details className="mt-4">
                          <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                            {t('view_transcript')}
                          </summary>
                          <div className="mt-2 p-3 bg-muted rounded-lg text-sm">
                            {currentSection.transcript}
                          </div>
                        </details>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        )}

        {/* Question */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-xl">
              {t('question')} {currentQuestion.question.question_number}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Question Text */}
            <div className="text-lg">{currentQuestion.question.question_text}</div>

            {/* Context */}
            {currentQuestion.question.context_text && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">{currentQuestion.question.context_text}</p>
              </div>
            )}

            {/* Image */}
            {currentQuestion.question.image_url && (
              <img
                src={currentQuestion.question.image_url}
                alt="Question"
                className="max-w-full rounded-lg"
              />
            )}

            {/* Answer Input */}
            <div className="mt-6">
              {currentQuestion.question.question_type === "multiple_choice" ? (
                <div className="space-y-3">
                  {currentQuestion.options?.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        answers.get(currentQuestion.question.id) === option.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.question.id}`}
                        value={option.id}
                        checked={answers.get(currentQuestion.question.id) === option.id}
                        onChange={(e) =>
                          handleAnswerChange(currentQuestion.question.id, e.target.value)
                        }
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <span className="font-medium mr-2">{option.option_label}.</span>
                        <span>{option.option_text}</span>
                        {option.option_image_url && (
                          <img
                            src={option.option_image_url}
                            alt={option.option_label}
                            className="mt-2 max-w-xs rounded"
                          />
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  value={answers.get(currentQuestion.question.id) || ""}
                  onChange={(e) =>
                    handleAnswerChange(currentQuestion.question.id, e.target.value)
                  }
                  placeholder={t('type_your_answer_here')}
                  className="w-full p-3 border-2 rounded-lg focus:border-primary outline-none"
                />
              )}
            </div>

            {/* Tips */}
            {currentQuestion.question.tips && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">💡 {t('tip')}:</p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {currentQuestion.question.tips}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mb-6">
          <Button onClick={handlePrevious} disabled={currentQuestionIndex === 0} variant="outline">
            <ChevronLeft className="w-4 h-4 mr-2" />
            {t('previous')}
          </Button>

          {currentQuestionIndex === allQuestions.length - 1 ? (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('submitting')}
                </>
              ) : (
                <>
                  <Flag className="w-4 h-4 mr-2" />
                  {t('submit_exercise')}
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              {t('next')}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Question Navigator */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('question_navigator')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 gap-2">
              {allQuestions.map((q, index) => (
                <button
                  key={q.question.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`
                    p-2 rounded text-sm font-medium transition-all
                    ${index === currentQuestionIndex ? "bg-primary text-primary-foreground" : ""}
                    ${
                      answers.has(q.question.id)
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                        : "bg-muted hover:bg-muted/80"
                    }
                  `}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    </AppLayout>
  )
}

