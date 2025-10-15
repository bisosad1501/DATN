import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { SkillType } from "@/types"

interface SkillProgressCardProps {
  skill: SkillType
  currentScore: number
  targetScore: number
  exercisesCompleted: number
}

const skillConfig: Record<SkillType, { label: string; color: string }> = {
  LISTENING: {
    label: "Listening",
    color: "bg-blue-500",
  },
  READING: {
    label: "Reading",
    color: "bg-green-500",
  },
  WRITING: {
    label: "Writing",
    color: "bg-purple-500",
  },
  SPEAKING: {
    label: "Speaking",
    color: "bg-orange-500",
  },
}

export function SkillProgressCard({ skill, currentScore, targetScore, exercisesCompleted }: SkillProgressCardProps) {
  const config = skillConfig[skill]
  
  // Ensure valid numbers to prevent NaN
  const validCurrentScore = typeof currentScore === 'number' && !isNaN(currentScore) ? currentScore : 0
  const validTargetScore = typeof targetScore === 'number' && !isNaN(targetScore) ? targetScore : 9
  const validExercisesCompleted = typeof exercisesCompleted === 'number' && !isNaN(exercisesCompleted) ? exercisesCompleted : 0
  
  const progress = validTargetScore > 0 ? (validCurrentScore / validTargetScore) * 100 : 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>{config?.label || 'Unknown'}</span>
          <span className="text-2xl font-bold">{validCurrentScore.toFixed(1)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Progress to target</span>
            <span>{validTargetScore.toFixed(1)}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <div className="text-sm text-muted-foreground">{validExercisesCompleted} exercises completed</div>
      </CardContent>
    </Card>
  )
}
