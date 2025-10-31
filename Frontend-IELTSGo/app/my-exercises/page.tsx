"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Loader2, 
  Target, 
  Clock, 
  CheckCircle,
  PlayCircle,
  Award,
  TrendingUp,
  BookOpen
} from "lucide-react"
import { exercisesApi } from "@/lib/api/exercises"
import { useAuth } from "@/lib/contexts/auth-context"
import type { SubmissionWithExercise } from "@/types"

export default function MyExercisesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState<SubmissionWithExercise[]>([])
  const [totalSubmissions, setTotalSubmissions] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadSubmissions()
    }
  }, [user])

  const loadSubmissions = async () => {
    try {
      setLoading(true)
      const data = await exercisesApi.getMySubmissions(1, 100) // Load all for stats calculation
      setSubmissions(data.submissions || [])
      setTotalSubmissions(data.total || 0)
    } catch (error) {
      console.error('[My Exercises] Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-muted-foreground mb-6">
            You need to be signed in to view your exercises
          </p>
          <Button onClick={() => router.push('/auth/login')}>
            Sign In
          </Button>
        </div>
      </AppLayout>
    )
  }

  // Filter by status
  const completedSubmissions = submissions.filter(
    item => item.submission.status === 'completed'
  )
  const inProgressSubmissions = submissions.filter(
    item => item.submission.status === 'in_progress'
  )

  // Calculate average score (only for completed)
  // If score is not available, calculate from correct_answers / total_questions
  const calculateScore = (submission: SubmissionWithExercise['submission']): number => {
    if (submission.score !== undefined && submission.score !== null && submission.score > 0) {
      return submission.score
    }
    // Calculate percentage from correct answers
    if (submission.total_questions > 0 && submission.correct_answers !== undefined) {
      return (submission.correct_answers / submission.total_questions) * 100
    }
    return 0
  }

  const completedWithScore = completedSubmissions.filter(
    item => item.submission.total_questions > 0
  )
  const averageScore = completedWithScore.length > 0
    ? completedWithScore.reduce((sum, item) => sum + calculateScore(item.submission), 0) / completedWithScore.length
    : 0

  // Calculate total time spent (all submissions)
  const totalTimeSeconds = submissions.reduce(
    (sum, item) => sum + (item.submission.time_spent_seconds || 0),
    0
  )
  const totalTimeMinutes = Math.floor(totalTimeSeconds / 60)

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatScore = (score?: number) => {
    if (score === undefined || score === null) return "N/A"
    return `${score.toFixed(1)}%`
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Exercises</h1>
          <p className="text-base text-muted-foreground">
            Track your practice progress and improve your IELTS skills
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Attempts</p>
                  <p className="text-3xl font-bold">{totalSubmissions}</p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">In Progress</p>
                  <p className="text-3xl font-bold">{inProgressSubmissions.length}</p>
                </div>
                <PlayCircle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Completed</p>
                  <p className="text-3xl font-bold">{completedSubmissions.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Average Score</p>
                  <p className="text-3xl font-bold">
                    {completedWithScore.length > 0 ? formatScore(averageScore) : "N/A"}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exercises Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">
              All Exercises ({submissions.length})
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              In Progress ({inProgressSubmissions.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedSubmissions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : submissions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Exercises Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start practicing by attempting an exercise
                  </p>
                  <Button onClick={() => router.push('/exercises/list')}>
                    Browse Exercises
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {submissions.map((item) => {
                  const { submission, exercise } = item
                  const progressPct = submission.total_questions > 0
                    ? Math.round((submission.questions_answered / submission.total_questions) * 100)
                    : 0
                  const scorePct = submission.total_questions > 0 && submission.correct_answers !== undefined
                    ? Math.round((submission.correct_answers / submission.total_questions) * 100)
                    : 0
                  
                  return (
                    <Card 
                      key={submission.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => {
                        if (submission.status === 'completed') {
                          router.push(`/exercises/${exercise.id}/result/${submission.id}`)
                        } else {
                          router.push(`/exercises/${exercise.id}/take/${submission.id}`)
                        }
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-6">
                          {/* Thumbnail */}
                          <div className="w-48 h-32 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                            {exercise.thumbnail_url ? (
                              <img 
                                src={exercise.thumbnail_url} 
                                alt={exercise.title}
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
                                <h3 className="text-xl font-bold mb-1">{exercise.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {exercise.description || "No description available"}
                                </p>
                              </div>
                              <div className="flex flex-col gap-2 ml-4">
                                <Badge variant="outline" className="capitalize">
                                  {exercise.skill_type}
                                </Badge>
                                <Badge 
                                  className={
                                    submission.status === 'completed' 
                                      ? 'bg-green-500' 
                                      : submission.status === 'in_progress'
                                      ? 'bg-orange-500'
                                      : 'bg-gray-500'
                                  }
                                >
                                  {submission.status.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>

                            {/* Progress */}
                            <div className="mt-4 space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-semibold">
                                  {submission.questions_answered}/{submission.total_questions} questions
                                </span>
                              </div>
                              <Progress value={progressPct} className="h-2" />
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                              {submission.status === 'completed' && submission.score !== undefined && (
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="h-4 w-4" />
                                  <span className="font-medium">{formatScore(submission.score)}</span>
                                </div>
                              )}
                              {submission.status === 'completed' && submission.band_score && (
                                <div className="flex items-center gap-1">
                                  <Award className="h-4 w-4" />
                                  <span>Band {submission.band_score.toFixed(1)}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{formatTime(Math.floor(submission.time_spent_seconds / 60))}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="h-4 w-4" />
                                <span>Attempt #{submission.attempt_number}</span>
                              </div>
                            </div>

                            {/* Action */}
                            <div className="mt-4">
                              <Button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (submission.status === 'completed') {
                                    router.push(`/exercises/${exercise.id}/result/${submission.id}`)
                                  } else {
                                    router.push(`/exercises/${exercise.id}/take/${submission.id}`)
                                  }
                                }}
                              >
                                {submission.status === 'completed' ? 'View Results' : 'Continue Practice'}
                              </Button>
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
            {inProgressSubmissions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <PlayCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Start practicing to see your progress here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {inProgressSubmissions.map((item) => {
                  const { submission, exercise } = item
                  const progressPct = submission.total_questions > 0
                    ? Math.round((submission.questions_answered / submission.total_questions) * 100)
                    : 0
                  
                  return (
                    <Card 
                      key={submission.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => router.push(`/exercises/${exercise.id}/take/${submission.id}`)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-6">
                          <div className="w-48 h-32 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                            {exercise.thumbnail_url ? (
                              <img src={exercise.thumbnail_url} alt={exercise.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="h-12 w-12 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2">{exercise.title}</h3>
                            <div className="mt-4 space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-semibold">{progressPct}%</span>
                              </div>
                              <Progress value={progressPct} className="h-2" />
                            </div>
                            <div className="mt-4">
                              <Button size="sm">Continue Practice</Button>
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
            {completedSubmissions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Complete your first exercise to see results here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {completedSubmissions.map((item) => {
                  const { submission, exercise } = item
                  const scorePct = submission.total_questions > 0 && submission.correct_answers !== undefined
                    ? Math.round((submission.correct_answers / submission.total_questions) * 100)
                    : 0
                  
                  return (
                    <Card 
                      key={submission.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => router.push(`/exercises/${exercise.id}/result/${submission.id}`)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-6">
                          <div className="w-48 h-32 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                            {exercise.thumbnail_url ? (
                              <img src={exercise.thumbnail_url} alt={exercise.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="h-12 w-12 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <h3 className="text-xl font-bold mb-2">{exercise.title}</h3>
                              <Badge className="bg-green-500">Completed</Badge>
                            </div>
                            {submission.score !== undefined && (
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                <span className="font-semibold text-foreground">
                                  Score: {formatScore(submission.score)}
                                </span>
                                {submission.band_score && (
                                  <span className="font-semibold text-foreground">
                                    Band: {submission.band_score.toFixed(1)}
                                  </span>
                                )}
                                <span>
                                  {formatTime(Math.floor(submission.time_spent_seconds / 60))}
                                </span>
                              </div>
                            )}
                            <div className="mt-4">
                              <Button size="sm" variant="outline">View Results</Button>
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
      </div>
    </AppLayout>
  )
}

