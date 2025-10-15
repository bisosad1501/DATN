"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Clock, ChevronLeft, ChevronRight, Flag } from "lucide-react"
import { exercisesApi } from "@/lib/api/exercises"
import type { Exercise, ExerciseSubmission } from "@/types"

export default function ExercisePlayerPage() {
  const params = useParams()
  const router = useRouter()
  const exerciseId = params.exerciseId as string

  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const data = await exercisesApi.getExerciseById(exerciseId)
        setExercise(data)
        setTimeRemaining(data.duration * 60) // Convert minutes to seconds
      } catch (error) {
        console.error("[v0] Failed to fetch exercise:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchExercise()
  }, [exerciseId])

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining])

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = async () => {
    if (!exercise) return

    setSubmitting(true)
    try {
      const submission: ExerciseSubmission = {
        exerciseId: exercise.id,
        answers,
        timeSpent: exercise.duration * 60 - timeRemaining,
        submittedAt: new Date().toISOString(),
      }

      const result = await exercisesApi.submitExercise(exerciseId, submission)
      router.push(`/exercises/${exerciseId}/results/${result.id}`)
    } catch (error) {
      console.error("[v0] Failed to submit exercise:", error)
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
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

  if (!exercise) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-lg text-muted-foreground">Exercise not found</p>
          <Button className="mt-4" onClick={() => router.push("/exercises")}>
            Back to Exercises
          </Button>
        </div>
      </AppLayout>
    )
  }

  const question = exercise.questions?.[currentQuestion]
  const progress = ((currentQuestion + 1) / (exercise.questions?.length || 1)) * 100

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{exercise.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">{exercise.skill}</Badge>
                <Badge>{exercise.difficulty}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="w-5 h-5" />
              <span className={timeRemaining < 60 ? "text-destructive" : ""}>{formatTime(timeRemaining)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Question {currentQuestion + 1} of {exercise.questions?.length || 0}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} />
          </div>
        </div>

        {/* Question Card */}
        {question && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Question {currentQuestion + 1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-base leading-relaxed">{question.question}</p>

              {/* Multiple Choice */}
              {question.type === "multiple-choice" && (
                <RadioGroup
                  value={answers[question.id]}
                  onValueChange={(value) => handleAnswerChange(question.id, value)}
                >
                  {question.options?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {/* Multiple Select */}
              {question.type === "multiple-select" && (
                <div className="space-y-2">
                  {question.options?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted">
                      <Checkbox
                        id={`option-${index}`}
                        checked={answers[question.id]?.includes(option)}
                        onCheckedChange={(checked) => {
                          const current = answers[question.id] || []
                          const updated = checked ? [...current, option] : current.filter((o: string) => o !== option)
                          handleAnswerChange(question.id, updated)
                        }}
                      />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              )}

              {/* Fill in the Blank */}
              {question.type === "fill-blank" && (
                <Input
                  placeholder="Type your answer here..."
                  value={answers[question.id] || ""}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                />
              )}

              {/* Essay/Long Answer */}
              {(question.type === "essay" || question.type === "long-answer") && (
                <Textarea
                  placeholder="Write your answer here..."
                  value={answers[question.id] || ""}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  rows={8}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="bg-transparent"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {currentQuestion === (exercise.questions?.length || 0) - 1 ? (
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Flag className="w-4 h-4 mr-2" />
                    Submit Exercise
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestion((prev) => Math.min((exercise.questions?.length || 1) - 1, prev + 1))}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
