"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, CheckCircle2, XCircle, Clock, Target, TrendingUp, Home } from "lucide-react"
import { exercisesApi } from "@/lib/api/exercises"
import type { ExerciseResult } from "@/types"

export default function ExerciseResultsPage() {
  const params = useParams()
  const router = useRouter()
  const exerciseId = params.exerciseId as string
  const resultId = params.resultId as string

  const [result, setResult] = useState<ExerciseResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await exercisesApi.getExerciseResult(exerciseId, resultId)
        setResult(data)
      } catch (error) {
        console.error("[v0] Failed to fetch result:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchResult()
  }, [exerciseId, resultId])

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    )
  }

  if (!result) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-lg text-muted-foreground">Results not found</p>
          <Button className="mt-4" onClick={() => router.push("/exercises")}>
            Back to Exercises
          </Button>
        </div>
      </AppLayout>
    )
  }

  const scorePercentage = (result.score / result.totalScore) * 100
  const isPassed = scorePercentage >= 60

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Results Header */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {isPassed ? (
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              ) : (
                <XCircle className="w-16 h-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-3xl mb-2">{isPassed ? "Congratulations!" : "Keep Practicing!"}</CardTitle>
            <p className="text-muted-foreground">
              {isPassed ? "You've successfully completed this exercise" : "Don't worry, practice makes perfect"}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Score Display */}
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">
                  {result.score}/{result.totalScore}
                </div>
                <Progress value={scorePercentage} className="h-3 mb-2" />
                <p className="text-sm text-muted-foreground">{Math.round(scorePercentage)}% Score</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                  <Target className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Correct Answers</p>
                    <p className="text-xl font-semibold">
                      {result.correctAnswers}/{result.totalQuestions}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                  <Clock className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time Spent</p>
                    <p className="text-xl font-semibold">{Math.round(result.timeSpent / 60)} mins</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                  <TrendingUp className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                    <p className="text-xl font-semibold">{Math.round(scorePercentage)}%</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Feedback */}
        {result.feedback && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{result.feedback}</p>
            </CardContent>
          </Card>
        )}

        {/* Question Review */}
        {result.answers && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Answer Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.answers.map((answer, index) => (
                <div key={index} className="p-4 rounded-lg border">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium">Question {index + 1}</p>
                    {answer.isCorrect ? (
                      <Badge className="bg-green-500/10 text-green-700">Correct</Badge>
                    ) : (
                      <Badge className="bg-red-500/10 text-red-700">Incorrect</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{answer.question}</p>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Your answer:</span> {answer.userAnswer || "Not answered"}
                    </p>
                    {!answer.isCorrect && (
                      <p className="text-green-600">
                        <span className="font-medium">Correct answer:</span> {answer.correctAnswer}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" onClick={() => router.push("/exercises")} className="bg-transparent">
            <Home className="w-4 h-4 mr-2" />
            Back to Exercises
          </Button>
          <Button onClick={() => router.push(`/exercises/${exerciseId}`)}>Try Again</Button>
        </div>
      </div>
    </AppLayout>
  )
}
