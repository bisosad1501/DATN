import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Target, TrendingUp } from "lucide-react"
import type { Exercise } from "@/types"

interface ExerciseCardProps {
  exercise: Exercise
}

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-500/10 text-green-700 dark:text-green-400"
      case "intermediate":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
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
            {getSkillIcon(exercise.skill)} {exercise.skill}
          </Badge>
          <Badge className={getDifficultyColor(exercise.difficulty)}>{exercise.difficulty}</Badge>
        </div>
        <h3 className="font-semibold text-lg line-clamp-2">{exercise.title}</h3>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{exercise.description}</p>

        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{exercise.duration} mins</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            <span>{exercise.questions?.length || 0} questions</span>
          </div>
          {exercise.completionRate && (
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>{exercise.completionRate}% completed</span>
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
