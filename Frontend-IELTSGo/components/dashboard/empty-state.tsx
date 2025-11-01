"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useTranslations } from "@/lib/i18n"
import { BookOpen, Target, TrendingUp, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

interface EmptyStateProps {
  type: "chart" | "activity"
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  illustration?: React.ReactNode
}

export function EmptyState({ 
  type, 
  title, 
  description, 
  actionLabel, 
  actionHref,
  illustration 
}: EmptyStateProps) {
  const t = useTranslations('dashboard')
  const tCommon = useTranslations('common')

  const defaultContent = {
    chart: {
      title: title || t('emptyState.chart.title') || "Chưa có dữ liệu học tập",
      description: description || t('emptyState.chart.description') || "Bắt đầu học để xem biểu đồ tiến độ của bạn",
      actionLabel: actionLabel || t('emptyState.chart.action') || "Khám phá khóa học",
      actionHref: actionHref || "/courses",
      icon: TrendingUp,
    },
    activity: {
      title: title || t('emptyState.activity.title') || "Chưa có hoạt động",
      description: description || t('emptyState.activity.description') || "Hoàn thành bài học hoặc bài tập đầu tiên để xem hoạt động ở đây",
      actionLabel: actionLabel || t('emptyState.activity.action') || "Bắt đầu học",
      actionHref: actionHref || "/courses",
      icon: BookOpen,
    },
  }

  const content = defaultContent[type]
  const Icon = content.icon

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Illustration */}
      <div className="relative mb-6">
        {illustration || (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full blur-2xl" />
            <div className="relative bg-muted/50 rounded-full p-6">
              <Icon className="h-12 w-12 text-muted-foreground" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-primary animate-pulse" />
          </div>
        )}
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold mb-2">{content.title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        {content.description}
      </p>

      {/* Action Button */}
      {content.actionHref && (
        <Button asChild size="sm" className="gap-2">
          <Link href={content.actionHref}>
            {content.actionLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  )
}

