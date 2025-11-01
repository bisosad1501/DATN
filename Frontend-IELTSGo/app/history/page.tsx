"use client"

import { AppLayout } from "@/components/layout/app-layout"
import { PageContainer } from "@/components/layout/page-container"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ActivityTimeline } from "@/components/dashboard/activity-timeline"
import { useState, useEffect } from "react"
import { progressApi } from "@/lib/api/progress"
import { Button } from "@/components/ui/button"
import { useTranslations } from '@/lib/i18n'

export default function HistoryPage() {

  const t = useTranslations('common')

  return (
    <ProtectedRoute>
      <HistoryContent />
    </ProtectedRoute>
  )
}

function HistoryContent() {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true)
        const data = await progressApi.getStudyHistory(page, 20)
        setHistory((prev) => (page === 1 ? data.data : [...prev, ...data.data]))
        setHasMore(page < data.totalPages)
      } catch (error) {
        console.error("Failed to fetch history:", error)
        // Mock data for demo
        const mockData = Array.from({ length: 20 }, (_, i) => ({
          id: `${page}-${i}`,
          type: ["course", "exercise", "lesson"][Math.floor(Math.random() * 3)] as any,
          title: `Activity ${page * 20 + i}`,
          completedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          duration: Math.floor(Math.random() * 60) + 15,
          score: Math.random() > 0.5 ? Math.floor(Math.random() * 3) + 6.5 : undefined,
        }))
        setHistory((prev) => (page === 1 ? mockData : [...prev, ...mockData]))
        setHasMore(page < 5)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [page])

  return (
    <AppLayout showSidebar={true} showFooter={false} hideNavbar={true}>
      <PageContainer maxWidth="4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('study_history')}</h1>
          <p className="text-muted-foreground">{t('complete_log_of_your_learning_activities')}</p>
        </div>

        {loading && page === 1 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">{t('loading_history')}</p>
            </div>
          </div>
        ) : (
          <>
            <ActivityTimeline activities={history} />

            {hasMore && (
              <div className="mt-6 text-center">
                <Button onClick={() => setPage((p) => p + 1)} disabled={loading} variant="outline">
                  {loading ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </>
        )}
      </PageContainer>
    </AppLayout>
  )
}
