"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { PageContainer } from "@/components/layout/page-container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Clock, Target, TrendingUp, Eye, Calendar } from "lucide-react"
import { exercisesApi } from "@/lib/api/exercises"
import type { Submission, Exercise } from "@/types"

interface SubmissionWithExercise {
  submission: Submission
  exercise: Exercise
}

export default function ExerciseHistoryPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<SubmissionWithExercise[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchSubmissions()
  }, [page])

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const data = await exercisesApi.getMySubmissions(page, 20)
      setSubmissions(data.submissions || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error("Failed to fetch submissions:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "abandoned":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }

  return (
    <AppLayout>
      <PageContainer>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Exercise History</h1>
          <p className="text-muted-foreground">
            View all your completed and in-progress exercises
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Attempts</p>
                  <p className="text-2xl font-bold">{total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">
                    {submissions.filter((s) => s.submission.status === "completed").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">
                    {submissions.filter((s) => s.submission.status === "in_progress").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                  <p className="text-2xl font-bold">
                    {submissions.length > 0
                      ? (
                          submissions
                            .filter((s) => s.submission.score !== undefined)
                            .reduce((sum, s) => sum + (s.submission.score || 0), 0) /
                          submissions.filter((s) => s.submission.score !== undefined).length
                        ).toFixed(1)
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions List */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : submissions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                You haven't attempted any exercises yet.
              </p>
              <Button onClick={() => router.push("/exercises/list")}>Browse Exercises</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {submissions.map(({ submission, exercise }) => {
              const percentage = submission.total_questions
                ? (submission.correct_answers / submission.total_questions) * 100
                : 0

              return (
                <Card
                  key={submission.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => {
                    if (submission.status === "completed") {
                      router.push(`/exercises/${exercise.id}/result/${submission.id}`)
                    } else {
                      router.push(`/exercises/${exercise.id}/take/${submission.id}`)
                    }
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{exercise.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {formatDate(submission.started_at)}
                          {submission.completed_at && (
                            <span className="ml-2">
                              • Completed: {formatDate(submission.completed_at)}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(submission.status)}>
                        {submission.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {/* Attempt Number */}
                      <div>
                        <p className="text-sm text-muted-foreground">Attempt</p>
                        <p className="text-lg font-semibold">#{submission.attempt_number}</p>
                      </div>

                      {/* Score */}
                      {submission.status === "completed" && submission.score !== undefined ? (
                        <div>
                          <p className="text-sm text-muted-foreground">Score</p>
                          <p className={`text-lg font-semibold ${getScoreColor(percentage)}`}>
                            {submission.score}/{submission.total_questions}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-muted-foreground">Progress</p>
                          <p className="text-lg font-semibold">
                            {submission.questions_answered}/{submission.total_questions}
                          </p>
                        </div>
                      )}

                      {/* Percentage */}
                      {submission.status === "completed" && (
                        <div>
                          <p className="text-sm text-muted-foreground">Percentage</p>
                          <p className={`text-lg font-semibold ${getScoreColor(percentage)}`}>
                            {percentage.toFixed(1)}%
                          </p>
                        </div>
                      )}

                      {/* Band Score */}
                      {submission.band_score && (
                        <div>
                          <p className="text-sm text-muted-foreground">Band Score</p>
                          <p className="text-lg font-semibold text-primary">
                            {submission.band_score}
                          </p>
                        </div>
                      )}

                      {/* Time Spent */}
                      <div>
                        <p className="text-sm text-muted-foreground">Time Spent</p>
                        <p className="text-lg font-semibold">
                          {formatTime(submission.time_spent_seconds)}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (submission.status === "completed") {
                            router.push(`/exercises/${exercise.id}/result/${submission.id}`)
                          } else {
                            router.push(`/exercises/${exercise.id}/take/${submission.id}`)
                          }
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {submission.status === "completed" ? "View Results" : "Continue"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="mt-8 flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4">
              Page {page} of {Math.ceil(total / 20)}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / 20)}
            >
              Next
            </Button>
          </div>
        )}
      </PageContainer>
    </AppLayout>
  )
}

