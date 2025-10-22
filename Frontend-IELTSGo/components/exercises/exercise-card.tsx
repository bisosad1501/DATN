import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Target, TrendingUp, GraduationCap, Zap } from "lucide-react"
import type { Exercise } from "@/types"

interface ExerciseCardProps {
  exercise: Exercise
  showCourseLink?: boolean  // NEW: Option to show course link
}

export function ExerciseCard({ exercise, showCourseLink = true }: ExerciseCardProps) {
  // Support both snake_case (backend) and camelCase (legacy)
  const skillType = exercise.skill_type || exercise.skillType || 'reading'
  const difficulty = exercise.difficulty || 'medium'
  const questionCount = exercise.total_questions || exercise.questionCount || 0
  const timeLimit = exercise.time_limit_minutes || exercise.timeLimit || 0
  const isFromCourse = !!(exercise.module_id && exercise.course_id)  // NEW: Check if from course
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
      case "beginner":
        return "bg-green-500/10 text-green-700 dark:text-green-400"
      case "medium":
      case "intermediate":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
      case "hard":
      case "advanced":
        return "bg-red-500/10 text-red-700 dark:text-red-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getSkillIcon = (skill: string) => {
    switch (skill.toLowerCase()) {
      case "listening":
        return "🎧"
      case "reading":
        return "📖"
      case "writing":
        return "✍️"
      case "speaking":
        return "🗣️"
      default:
        return "📝"
    }
  }

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant="secondary" className="text-xs">
            {getSkillIcon(skillType)} {skillType}
          </Badge>
          <div className="flex flex-col gap-1 items-end">
            <Badge className={getDifficultyColor(difficulty)}>{difficulty}</Badge>
            {/* NEW: Source badge */}
            {isFromCourse ? (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300">
                <GraduationCap className="w-3 h-3 mr-1" />
                Course
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300">
                <Zap className="w-3 h-3 mr-1" />
                Practice
              </Badge>
            )}
          </div>
        </div>
        <h3 className="font-semibold text-lg line-clamp-2">{exercise.title}</h3>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{exercise.description}</p>

        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          {timeLimit > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{timeLimit} mins</span>
            </div>
          )}
          {questionCount > 0 && (
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              <span>{questionCount} questions</span>
            </div>
          )}
          {exercise.average_score && exercise.total_attempts && exercise.total_attempts > 0 && (
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>{Math.round(exercise.average_score)}% avg score</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Link href={`/exercises/${exercise.id}`} className="w-full">
          <Button className="w-full">Start Practice</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
