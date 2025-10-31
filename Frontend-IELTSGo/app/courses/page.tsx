"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { CourseCard } from "@/components/courses/course-card"
import { CourseFiltersComponent } from "@/components/courses/course-filters"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { coursesApi, type CourseFilters } from "@/lib/api/courses"
import type { Course } from "@/types"

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<CourseFilters>({})
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await coursesApi.getCourses(filters, page, 12)
      setCourses(Array.isArray(response.data) ? response.data : [])
      setTotalPages(response.totalPages || 1)
    } catch (error) {
      console.error("[v0] Failed to fetch courses:", error)
      setError("Failed to load courses. Please try again later.")
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [filters, page])

  const handleFiltersChange = (newFilters: CourseFilters) => {
    // Remove undefined and empty values to ensure clean filter state
    const cleanFilters: CourseFilters = {}
    if (newFilters.search && newFilters.search.trim()) {
      cleanFilters.search = newFilters.search.trim()
    }
    if (newFilters.skill_type) {
      cleanFilters.skill_type = newFilters.skill_type
    }
    if (newFilters.level) {
      cleanFilters.level = newFilters.level
    }
    if (newFilters.enrollment_type) {
      cleanFilters.enrollment_type = newFilters.enrollment_type
    }
    if (newFilters.is_featured !== undefined && newFilters.is_featured !== false) {
      cleanFilters.is_featured = newFilters.is_featured
    }
    // Always set to clean object (even if empty) to clear all filters
    setFilters(cleanFilters)
    setPage(1)
  }

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search: search || undefined }))
    setPage(1)
  }

  return (
    <AppLayout showFooter={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Explore Courses</h1>
          <p className="text-base text-muted-foreground">
            Discover IELTS courses designed by experts to help you achieve your goals
          </p>
        </div>

        <CourseFiltersComponent filters={filters} onFiltersChange={handleFiltersChange} onSearch={handleSearch} />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive text-lg mb-4">{error}</p>
            <Button variant="outline" className="bg-transparent" onClick={fetchCourses}>
              Try Again
            </Button>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No courses found matching your criteria</p>
            <Button variant="outline" className="mt-4 bg-transparent" onClick={() => handleFiltersChange({})}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
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
