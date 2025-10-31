"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Target, TrendingUp, GraduationCap, Zap, BookOpen } from "lucide-react"
import type { Exercise } from "@/types"

interface ExerciseCardProps {
  exercise: Exercise
  showCourseLink?: boolean
}

export function ExerciseCard({ exercise, showCourseLink = true }: ExerciseCardProps) {
  // Support both snake_case (backend) and camelCase (legacy)
  const skillType = exercise.skill_type || exercise.skillType || 'reading'
  const difficulty = exercise.difficulty || 'medium'
  const questionCount = exercise.total_questions || exercise.questionCount || 0
  const timeLimit = exercise.time_limit_minutes || exercise.timeLimit || 0
  const isFromCourse = !!(exercise.module_id && exercise.course_id)
  
  const skillColors: Record<string, string> = {
    listening: "bg-blue-500",
    reading: "bg-green-500",
    writing: "bg-orange-500",
    speaking: "bg-purple-500",
  }

  const levelColors: Record<string, string> = {
    easy: "bg-emerald-500",
    medium: "bg-yellow-500",
    hard: "bg-red-500",
    beginner: "bg-emerald-500",
    intermediate: "bg-yellow-500",
    advanced: "bg-red-500",
  }

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow p-0">
      <Link href={`/exercises/${exercise.id}`}>
        <div className="relative aspect-video overflow-hidden bg-muted flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            <BookOpen className="w-16 h-16 text-muted-foreground" />
          </div>
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className={skillColors[skillType.toLowerCase()] || "bg-gray-500"}>
              {skillType.toUpperCase()}
            </Badge>
            <Badge className={levelColors[difficulty.toLowerCase()] || levelColors.easy} variant="secondary">
              {difficulty.toUpperCase()}
            </Badge>
          </div>
          {isFromCourse ? (
            <div className="absolute top-3 right-3">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300">
                <GraduationCap className="w-3 h-3 mr-1" />
                Course
              </Badge>
            </div>
          ) : (
            <div className="absolute top-3 right-3">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300">
                <Zap className="w-3 h-3 mr-1" />
                Practice
              </Badge>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/exercises/${exercise.id}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {exercise.title}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {exercise.description || "No description available"}
        </p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {questionCount > 0 && (
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              <span>{questionCount} questions</span>
            </div>
          )}
          {timeLimit > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{timeLimit} mins</span>
            </div>
          )}
        </div>

        {exercise.average_score && exercise.total_attempts && exercise.total_attempts > 0 && (
          <div className="flex items-center gap-1 mt-3 text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            <span>{Math.round(exercise.average_score)}% avg score</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link href={`/exercises/${exercise.id}`}>Start Practice</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
