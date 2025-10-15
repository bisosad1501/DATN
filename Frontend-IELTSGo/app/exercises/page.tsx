"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { ExerciseCard } from "@/components/exercises/exercise-card"
import { ExerciseFiltersComponent } from "@/components/exercises/exercise-filters"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { exercisesApi, type ExerciseFilters } from "@/lib/api/exercises"
import type { Exercise } from "@/types"

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ExerciseFilters>({})
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchExercises = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await exercisesApi.getExercises(filters, page, 12)
      setExercises(Array.isArray(response.data) ? response.data : [])
      setTotalPages(response.totalPages || 1)
    } catch (error) {
      console.error("[v0] Failed to fetch exercises:", error)
      setError("Failed to load exercises. Please try again later.")
      setExercises([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExercises()
  }, [filters, page])

  const handleFiltersChange = (newFilters: ExerciseFilters) => {
    setFilters(newFilters)
    setPage(1)
  }

  const handleSearch = (search: string) => {
    setFilters({ ...filters, search })
    setPage(1)
  }

  return (
    <AppLayout showFooter={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Practice Exercises</h1>
          <p className="text-muted-foreground">Improve your IELTS skills with targeted practice exercises</p>
        </div>

        <ExerciseFiltersComponent filters={filters} onFiltersChange={handleFiltersChange} onSearch={handleSearch} />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive text-lg mb-4">{error}</p>
            <Button variant="outline" className="bg-transparent" onClick={fetchExercises}>
              Try Again
            </Button>
          </div>
        ) : exercises.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No exercises found matching your criteria</p>
            <Button variant="outline" className="mt-4 bg-transparent" onClick={() => handleFiltersChange({})}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {exercises.map((exercise) => (
                <ExerciseCard key={exercise.id} exercise={exercise} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="bg-transparent"
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="bg-transparent"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}
