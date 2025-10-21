"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Clock, Target, TrendingUp, Search, Loader2 } from "lucide-react"
import { exercisesApi, type ExerciseFilters } from "@/lib/api/exercises"
import type { Exercise } from "@/types"

export default function ExercisesListPage() {
  const router = useRouter()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ExerciseFilters>({
    skill: [],
    type: [],
    difficulty: [],
    search: "",
  })
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    fetchExercises()
  }, [filters, page])

  const fetchExercises = async () => {
    try {
      setLoading(true)
      const response = await exercisesApi.getExercises(filters, page, 12)
      setExercises(response.data)
      setTotal(response.total)
      setTotalPages(response.totalPages)
    } catch (error) {
      console.error("Failed to fetch exercises:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof ExerciseFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value && value !== "all" ? [value] : [],
    }))
    setPage(1)
  }

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      search: value,
    }))
    setPage(1)
  }

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const getSkillIcon = (skill?: string) => {
    switch (skill) {
      case "listening":
        return "🎧"
      case "reading":
        return "📖"
      case "writing":
        return "✍️"
      case "speaking":
        return "🗣️"
      default:
        return "📚"
    }
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">IELTS Exercises</h1>
          <p className="text-muted-foreground">
            Practice with our comprehensive collection of IELTS exercises
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search exercises..."
                    value={filters.search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Skill Filter */}
              <Select
                value={filters.skill?.[0] || "all"}
                onValueChange={(value) => handleFilterChange("skill", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Skills" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  <SelectItem value="listening">🎧 Listening</SelectItem>
                  <SelectItem value="reading">📖 Reading</SelectItem>
                  <SelectItem value="writing">✍️ Writing</SelectItem>
                  <SelectItem value="speaking">🗣️ Speaking</SelectItem>
                </SelectContent>
              </Select>

              {/* Difficulty Filter */}
              <Select
                value={filters.difficulty?.[0] || "all"}
                onValueChange={(value) => handleFilterChange("difficulty", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {exercises.length} of {total} exercises
        </div>

        {/* Exercise Grid */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : exercises.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No exercises found. Try adjusting your filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.map((exercise) => (
              <Card
                key={exercise.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/exercises/${exercise.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl">{getSkillIcon(exercise.skill_type)}</span>
                    <Badge className={getDifficultyColor(exercise.difficulty)}>
                      {exercise.difficulty || "N/A"}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{exercise.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {exercise.description || "No description available"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <span>{exercise.total_questions || 0} questions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{exercise.time_limit_minutes || "No"} mins</span>
                      </div>
                      {exercise.total_sections && (
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-muted-foreground" />
                          <span>{exercise.total_sections} sections</span>
                        </div>
                      )}
                      {exercise.average_score && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-muted-foreground" />
                          <span>{exercise.average_score.toFixed(0)}% avg</span>
                        </div>
                      )}
                    </div>

                    {/* Type Badge */}
                    {exercise.exercise_type && (
                      <Badge variant="outline" className="capitalize">
                        {exercise.exercise_type.replace("_", " ")}
                      </Badge>
                    )}

                    {/* Free Badge */}
                    {exercise.is_free && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 ml-2">
                        Free
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= page - 1 && pageNum <= page + 1)
                ) {
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      onClick={() => setPage(pageNum)}
                      size="sm"
                    >
                      {pageNum}
                    </Button>
                  )
                } else if (pageNum === page - 2 || pageNum === page + 2) {
                  return <span key={pageNum}>...</span>
                }
                return null
              })}
            </div>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

