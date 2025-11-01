"use client"

import { useState, useEffect } from "react"
import { InstructorLayout } from "@/components/instructor/instructor-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { instructorApi } from "@/lib/api/instructor"
import type { Course } from "@/types"
import { Plus, Search, Edit, Trash2, Eye, Users, BookOpen } from "lucide-react"
import Link from "next/link"
import { useTranslations } from '@/lib/i18n'

export default function InstructorCoursesPage() {

  const t = useTranslations('common')

  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const data = await instructorApi.getCourses()
      setCourses(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to load courses:", error)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('are_you_sure_delete_course'))) return

    try {
      await instructorApi.deleteCourse(id)
      setCourses(courses.filter((c) => c.id !== id))
    } catch (error) {
      console.error("Failed to delete course:", error)
    }
  }

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <InstructorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">{t('loading_courses')}</div>
        </div>
      </InstructorLayout>
    )
  }

  return (
    <InstructorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('my_courses')}</h1>
            <p className="text-muted-foreground mt-1">{t('manage_your_courses_and_curriculum')}</p>
          </div>
          <Link href="/instructor/courses/create">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              {t('create_course')}
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('search_courses')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Course Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground line-clamp-2">{course.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{course.description}</p>
                  </div>
                  <Badge variant={course.status === "published" ? "default" : "secondary"}>{course.status}</Badge>
                </div>

                {/* Course Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{course.enrolledCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.lessonCount || 0} {t('lessons')}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Link href={`/instructor/courses/${course.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      <Edit className="w-4 h-4 mr-2" />
                      {t('edit')}
                    </Button>
                  </Link>
                  <Link href={`/courses/${course.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(course.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">{t('no_courses_found')}</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? t('try_adjusting_your_search') : t('create_your_first_course_to_get_started')}
            </p>
            {!searchQuery && (
              <Link href="/instructor/courses/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('create_course')}
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </InstructorLayout>
  )
}
