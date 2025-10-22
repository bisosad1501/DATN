"use client"

import { AppLayout } from "@/components/layout/app-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProgressChart } from "@/components/dashboard/progress-chart"
import { useState, useEffect } from "react"
import { progressApi } from "@/lib/api/progress"
import { Button } from "@/components/ui/button"

export default function ProgressPage() {
  return (
    <ProtectedRoute>
      <ProgressContent />
    </ProtectedRoute>
  )
}

function ProgressContent() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d")
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const data = await progressApi.getProgressAnalytics(timeRange)
        console.log('[Progress Page] Analytics data received:', data)
        console.log('[Progress Page] Study time by day:', data.studyTimeByDay)
        setAnalytics(data)
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
        console.error("Error details:", error.response?.data || error.message)
        // Mock data for demo
        setAnalytics({
          studyTimeByDay: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
            minutes: Math.floor(Math.random() * 120) + 30,
          })),
          scoresBySkill: [
            { skill: "Listening", scores: [6.5, 7.0, 7.0, 7.5, 7.5] },
            { skill: "Reading", scores: [7.0, 7.5, 8.0, 8.0, 8.5] },
            { skill: "Writing", scores: [6.0, 6.5, 7.0, 7.0, 7.5] },
            { skill: "Speaking", scores: [6.5, 7.0, 7.0, 7.5, 8.0] },
          ],
          completionRate: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
            rate: Math.floor(Math.random() * 40) + 60,
          })),
          exercisesByType: [
            { type: "Reading", count: 15, avgScore: 8.0 },
            { type: "Listening", count: 12, avgScore: 7.5 },
            { type: "Writing", count: 10, avgScore: 7.0 },
            { type: "Speaking", count: 8, avgScore: 7.5 },
          ],
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [timeRange])

  return (
    <AppLayout showSidebar={true} showFooter={false}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Progress Analytics</h1>
            <p className="text-muted-foreground">Detailed insights into your learning journey</p>
          </div>
          <div className="flex gap-2">
            <Button variant={timeRange === "7d" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("7d")}>
              7 Days
            </Button>
            <Button variant={timeRange === "30d" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("30d")}>
              30 Days
            </Button>
            <Button variant={timeRange === "90d" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("90d")}>
              90 Days
            </Button>
            <Button variant={timeRange === "all" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("all")}>
              All Time
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading analytics...</p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="study-time" className="space-y-6">
            <TabsList>
              <TabsTrigger value="study-time">Study Time</TabsTrigger>
              <TabsTrigger value="completion">Completion Rate</TabsTrigger>
              <TabsTrigger value="exercises">Exercises</TabsTrigger>
            </TabsList>

            <TabsContent value="study-time" className="space-y-6">
              <ProgressChart
                title="Daily Study Time"
                data={analytics?.studyTimeByDay || []}
                color="#ED372A"
                valueLabel="minutes"
              />
            </TabsContent>

            <TabsContent value="completion" className="space-y-6">
              <ProgressChart
                title="Daily Completion Rate"
                data={analytics?.completionRate || []}
                color="#10B981"
                valueLabel="%"
              />
            </TabsContent>

            <TabsContent value="exercises" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {analytics?.exercisesByType?.map((item: any) => (
                  <Card key={item.type}>
                    <CardHeader>
                      <CardTitle className="text-base">{item.type}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Completed</span>
                          <span className="font-bold">{item.count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Avg Score</span>
                          <span className="font-bold">{item.avgScore.toFixed(1)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  )
}
