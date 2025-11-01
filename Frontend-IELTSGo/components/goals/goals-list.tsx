"use client"

import { useState, useEffect } from "react"
import { goalsApi, type StudyGoal } from "@/lib/api/goals"
import { GoalCard } from "./goal-card"
import { useToast } from "@/hooks/use-toast"
import { useTranslations } from "@/lib/i18n"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Target } from "lucide-react"

export function GoalsList() {
  const t = useTranslations('goals')
  const tCommon = useTranslations('common')
  const { toast } = useToast()
  const [goals, setGoals] = useState<StudyGoal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = async () => {
    try {
      setLoading(true)
      const response = await goalsApi.getGoals()
      setGoals(response.goals || [])
    } catch (error: any) {
      toast({
        title: tCommon('error'),
        description: error?.message || t('failed_to_create'),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (goalId: string) => {
    try {
      await goalsApi.deleteGoal(goalId)
      setGoals(goals.filter(g => g.id !== goalId))
      toast({
        title: t('goal_deleted'),
        description: tCommon('success'),
      })
    } catch (error: any) {
      toast({
        title: tCommon('error'),
        description: error?.message || t('failed_to_delete'),
        variant: "destructive",
      })
    }
  }

  const handleComplete = async (goalId: string) => {
    try {
      const updated = await goalsApi.completeGoal(goalId)
      setGoals(goals.map(g => g.id === goalId ? updated : g))
      toast({
        title: t('goal_completed'),
        description: tCommon('success'),
      })
    } catch (error: any) {
      toast({
        title: tCommon('error'),
        description: error?.message || t('failed_to_complete'),
        variant: "destructive",
      })
    }
  }

  const handleUpdate = async () => {
    // Refresh list after update
    await loadGoals()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  if (goals.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Target className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('no_goals')}</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {t('no_goals_description')}
          </p>
        </CardContent>
      </Card>
    )
  }

  // Group goals by status
  const notStarted = goals.filter(g => g.status === 'not_started')
  const inProgress = goals.filter(g => g.status === 'in_progress')
  const completed = goals.filter(g => g.status === 'completed')

  return (
    <div className="space-y-8">
      {/* In Progress Goals */}
      {inProgress.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">{t('in_progress')}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inProgress.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onDelete={handleDelete}
                onComplete={handleComplete}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Not Started Goals */}
      {notStarted.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">{t('not_started')}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {notStarted.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onDelete={handleDelete}
                onComplete={handleComplete}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Goals */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">{t('completed')}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completed.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onDelete={handleDelete}
                onComplete={handleComplete}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

