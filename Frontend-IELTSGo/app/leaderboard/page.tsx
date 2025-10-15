"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { leaderboardApi } from "@/lib/api/notifications"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Medal } from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"

type Period = "daily" | "weekly" | "monthly" | "all-time"

interface LeaderboardEntry {
  rank: number
  userId: string
  userName: string
  userAvatar?: string
  points: number
  coursesCompleted: number
  exercisesCompleted: number
  studyTime: number
  streak: number
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [period, setPeriod] = useState<Period>("weekly")
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [period])

  const loadLeaderboard = async () => {
    try {
      setLoading(true)
      const response = await leaderboardApi.getLeaderboard(period, 1, 50)
      setLeaderboard(response.data || [])

      if (user) {
        const rank = await leaderboardApi.getUserRank(user.id, period)
        setUserRank(rank)
      }
    } catch (error) {
      console.error("Failed to load leaderboard:", error)
      // Mock data for demo
      setLeaderboard([
        {
          rank: 1,
          userId: "1",
          userName: "Nguyễn Văn A",
          points: 2500,
          coursesCompleted: 12,
          exercisesCompleted: 45,
          studyTime: 3600,
          streak: 15,
        },
        {
          rank: 2,
          userId: "2",
          userName: "Trần Thị B",
          points: 2300,
          coursesCompleted: 10,
          exercisesCompleted: 42,
          studyTime: 3200,
          streak: 12,
        },
        {
          rank: 3,
          userId: "3",
          userName: "Lê Văn C",
          points: 2100,
          coursesCompleted: 9,
          exercisesCompleted: 38,
          studyTime: 2900,
          streak: 10,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />
    return null
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500">1st</Badge>
    if (rank === 2) return <Badge className="bg-gray-400">2nd</Badge>
    if (rank === 3) return <Badge className="bg-amber-600">3rd</Badge>
    return <Badge variant="outline">{rank}th</Badge>
  }

  return (
    <AppLayout showSidebar showFooter>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">Compete with other learners and climb to the top!</p>
        </div>

        {userRank && (
          <Card className="mb-6 border-primary">
            <CardHeader>
              <CardTitle className="text-lg">Your Ranking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getRankIcon(userRank.rank)}
                    {getRankBadge(userRank.rank)}
                  </div>
                  <div>
                    <p className="font-semibold">{userRank.userName}</p>
                    <p className="text-sm text-muted-foreground">{userRank.points} points</p>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-semibold">{userRank.coursesCompleted}</p>
                    <p className="text-muted-foreground">Courses</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{userRank.exercisesCompleted}</p>
                    <p className="text-muted-foreground">Exercises</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{userRank.streak}</p>
                    <p className="text-muted-foreground">Day Streak</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="all-time">All Time</TabsTrigger>
          </TabsList>

          <TabsContent value={period}>
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center text-muted-foreground">Loading leaderboard...</div>
                ) : leaderboard.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">No data available</div>
                ) : (
                  <div className="divide-y">
                    {leaderboard.map((entry) => (
                      <div
                        key={entry.userId}
                        className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 flex items-center justify-center">
                            {getRankIcon(entry.rank) || (
                              <span className="text-lg font-bold text-muted-foreground">{entry.rank}</span>
                            )}
                          </div>
                          <Avatar>
                            <AvatarImage src={entry.userAvatar || "/placeholder.svg"} />
                            <AvatarFallback>{entry.userName.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{entry.userName}</p>
                            <p className="text-sm text-muted-foreground">{entry.points} points</p>
                          </div>
                        </div>
                        <div className="flex gap-6 text-sm">
                          <div className="text-center">
                            <p className="font-semibold">{entry.coursesCompleted}</p>
                            <p className="text-muted-foreground">Courses</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold">{entry.exercisesCompleted}</p>
                            <p className="text-muted-foreground">Exercises</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold">{entry.streak}</p>
                            <p className="text-muted-foreground">Streak</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
