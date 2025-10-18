"use client"

import Image from "next/image"
import Link from "next/link"
import { Clock, Users, Star, BookOpen } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Course } from "@/types"
import { formatDuration, formatNumber } from "@/lib/utils/format"

interface CourseCardProps {
  course: Course
  showProgress?: boolean
  progress?: number
}

export function CourseCard({ course, showProgress, progress }: CourseCardProps) {
  const skillColors: Record<string, string> = {
    listening: "bg-blue-500",
    reading: "bg-green-500",
    writing: "bg-orange-500",
    speaking: "bg-purple-500",
    general: "bg-gray-500",
  }

  const levelColors: Record<string, string> = {
    beginner: "bg-emerald-500",
    intermediate: "bg-yellow-500",
    advanced: "bg-red-500",
  }

  const skillType = course.skill_type || course.skillType || ''
  const level = course.level || 'beginner'
  const thumbnail = course.thumbnail_url || course.thumbnail
  const enrollmentType = course.enrollment_type || course.enrollmentType
  const instructorName = course.instructor_name

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/courses/${course.id}`}>
        <div className="relative aspect-video overflow-hidden bg-muted">
          {thumbnail ? (
            <Image
              src={thumbnail || "/placeholder.svg"}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
              <BookOpen className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className={skillColors[skillType.toLowerCase()] || skillColors.general}>
              {skillType.toUpperCase()}
            </Badge>
            <Badge className={levelColors[level.toLowerCase()] || levelColors.beginner} variant="secondary">
              {level.toUpperCase()}
            </Badge>
          </div>
          {(enrollmentType === "premium" || enrollmentType === "PAID") && course.price > 0 && (
            <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="font-bold text-primary">${course.price}</span>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/courses/${course.id}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {course.short_description || course.description}
        </p>

        {instructorName && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">{instructorName.charAt(0)}</span>
            </div>
            <span className="text-sm text-muted-foreground">{instructorName}</span>
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{(course.average_rating || course.rating || 0).toFixed(1)}</span>
            <span>({formatNumber(course.total_reviews || course.reviewCount || 0)})</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{formatNumber(course.total_enrollments || course.enrollmentCount || 0)}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{course.total_lessons || course.lessonCount || 0} lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{formatDuration((course.duration_hours || course.duration || 0) * 60)}</span>
          </div>
        </div>

        {showProgress && progress !== undefined && (
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link href={`/courses/${course.id}`}>{showProgress ? "Continue Learning" : "View Course"}</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
