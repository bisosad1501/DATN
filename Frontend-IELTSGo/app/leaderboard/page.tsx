"use client"

import React, { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { leaderboardApi } from "@/lib/api/notifications"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Loader2, Trophy, Medal, Award, Clock, Target, TrendingUp, Sparkles } from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"
import { cn } from "@/lib/utils"

type Period = "daily" | "weekly" | "monthly" | "all-time"

interface BackendLeaderboardEntry {
  rank: number
  user_id: string
  full_name: string
  avatar_url?: string
  total_points: number
  current_streak_days: number
  total_study_hours: number
  achievements_count: number
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [period, setPeriod] = useState<Period>("all-time")
  const [page, setPage] = useState(1)
  const [leaderboard, setLeaderboard] = useState<BackendLeaderboardEntry[]>([])
  const [userRank, setUserRank] = useState<BackendLeaderboardEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    total_pages: 1,
  })

  useEffect(() => {
    loadLeaderboard()
  }, [period, page, user])

  const loadLeaderboard = async () => {
    try {
      setLoading(true)
      const response = await leaderboardApi.getLeaderboard(period, page, 50)
      setLeaderboard(response.leaderboard || [])
      setPagination(response.pagination || pagination)

      if (user) {
        try {
          const rank = await leaderboardApi.getUserRank()
          setUserRank(rank)
        } catch (error) {
          console.error("Failed to load user rank:", error)
        }
      }
    } catch (error) {
      console.error("Failed to load leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod)
    setPage(1)
  }

  const formatStudyHours = (hours: number) => {
    if (hours === 0) return "0h"
    if (hours < 1) {
      const minutes = Math.round(hours * 60)
      return minutes > 0 ? `${minutes}m` : "0m"
    }
    if (hours < 10) return `${hours.toFixed(1)}h`
    return `${Math.round(hours)}h`
  }

  const isCurrentUser = (entry: BackendLeaderboardEntry) => {
    return user && entry.user_id === user.id
  }

  const getPeriodLabel = (p: Period) => {
    switch (p) {
      case "daily":
        return "Hôm nay"
      case "weekly":
        return "Tuần này"
      case "monthly":
        return "Tháng này"
      case "all-time":
        return "Tất cả thời gian"
      default:
        return p
    }
  }

  // Calculate percentage for progress visualization
  const getProgressPercentage = (entry: BackendLeaderboardEntry, maxPoints: number) => {
    if (maxPoints === 0) return 0
    return Math.min((entry.total_points / maxPoints) * 100, 100)
  }

  const maxPoints = leaderboard.length > 0 ? Math.max(...leaderboard.map((e) => e.total_points), 1) : 1

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Bảng Xếp Hạng</h1>
          <p className="text-base text-muted-foreground max-w-2xl">
            Theo dõi thứ hạng của bạn và cạnh tranh với cộng đồng học viên IELTS
          </p>
        </div>

        {/* Period Tabs */}
        <div className="mb-6">
          <Tabs value={period} onValueChange={(v) => handlePeriodChange(v as Period)}>
            <TabsList className="inline-flex h-11 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-full md:w-auto">
              <TabsTrigger
                value="daily"
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
              >
                Hôm nay
              </TabsTrigger>
              <TabsTrigger
                value="weekly"
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
              >
                Tuần này
              </TabsTrigger>
              <TabsTrigger
                value="monthly"
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
              >
                Tháng này
              </TabsTrigger>
              <TabsTrigger
                value="all-time"
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
              >
                Tất cả
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* User Rank Card - Only show if user has rank */}
        {userRank && (
          <Card className="mb-6 overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-primary/3 to-background">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Rank Badge */}
                  <div className="flex-shrink-0">
                    {userRank.rank <= 3 ? (
                      <div className="relative">
                        {userRank.rank === 1 && (
                          <Trophy className="h-10 w-10 text-yellow-500 fill-yellow-500" />
                        )}
                        {userRank.rank === 2 && (
                          <Medal className="h-9 w-9 text-gray-400 fill-gray-400" />
                        )}
                        {userRank.rank === 3 && (
                          <Medal className="h-9 w-9 text-amber-600 fill-amber-600" />
                        )}
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted border-2">
                        <span className="text-lg font-bold text-muted-foreground">#{userRank.rank}</span>
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                      <AvatarImage src={userRank.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {userRank.full_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-lg truncate">{userRank.full_name}</p>
                        <Badge variant="default" className="text-xs px-2 py-0.5">
                          Bạn
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {userRank.total_points.toLocaleString()} điểm
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-end">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span className="text-lg font-bold">{userRank.achievements_count}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Thành tích</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-lg font-bold">{formatStudyHours(userRank.total_study_hours)}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Thời gian</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-lg font-bold">{userRank.current_streak_days}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Chuỗi</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard Table */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/30 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">Bảng Xếp Hạng</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {getPeriodLabel(period)} • {pagination.total > 0 ? `${pagination.total} học viên` : "Đang tải..."}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="p-20 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Trophy className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium mb-2">Chưa có dữ liệu</p>
                <p className="text-sm text-muted-foreground">Bắt đầu học để thấy thứ hạng của bạn!</p>
              </div>
            ) : (
              <>
                <div className="divide-y">
                  {leaderboard.map((entry, index) => {
                    const isUser = isCurrentUser(entry)
                    const isTopThree = entry.rank <= 3
                    const progressPercent = getProgressPercentage(entry, maxPoints)

                    return (
                      <div
                        key={entry.user_id}
                        className={cn(
                          "group relative transition-all duration-200",
                          "hover:bg-muted/30",
                          isUser && "bg-primary/5 border-l-4 border-l-primary",
                          isTopThree && index === 0 && "bg-gradient-to-r from-yellow-50/30 to-transparent dark:from-yellow-950/10",
                        )}
                      >
                        <div className="flex items-center gap-4 px-6 py-4">
                          {/* Rank */}
                          <div className="flex-shrink-0 w-12 flex items-center justify-center">
                            {isTopThree ? (
                              <div className="relative">
                                {entry.rank === 1 && (
                                  <Trophy className="h-8 w-8 text-yellow-500 fill-yellow-500" />
                                )}
                                {entry.rank === 2 && (
                                  <Medal className="h-7 w-7 text-gray-400 fill-gray-400" />
                                )}
                                {entry.rank === 3 && (
                                  <Medal className="h-7 w-7 text-amber-600 fill-amber-600" />
                                )}
                              </div>
                            ) : (
                              <span className="text-base font-semibold text-muted-foreground">#{entry.rank}</span>
                            )}
                          </div>

                          {/* Avatar */}
                          <Avatar className="h-11 w-11 border border-border shadow-sm flex-shrink-0">
                            <AvatarImage src={entry.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback className="bg-muted text-foreground font-medium">
                              {entry.full_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          {/* User Info & Progress */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm truncate">{entry.full_name}</p>
                              {isUser && (
                                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                  Bạn
                                </Badge>
                              )}
                            </div>
                            {/* Progress Bar */}
                            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all duration-500",
                                  entry.rank === 1 && "bg-gradient-to-r from-yellow-400 to-yellow-600",
                                  entry.rank === 2 && "bg-gradient-to-r from-gray-300 to-gray-500",
                                  entry.rank === 3 && "bg-gradient-to-r from-amber-400 to-amber-600",
                                  entry.rank > 3 && "bg-primary",
                                )}
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="hidden md:flex items-center gap-6 flex-shrink-0">
                            <div className="flex items-center gap-2 text-sm">
                              <Award className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold min-w-[2ch] text-right">{entry.achievements_count}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold min-w-[3ch] text-right">
                                {formatStudyHours(entry.total_study_hours)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Target className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold min-w-[2ch] text-right">{entry.current_streak_days}</span>
                            </div>
                            <div className="text-right min-w-[5ch]">
                              <span className="font-bold text-base">{entry.total_points.toLocaleString()}</span>
                              <span className="text-xs text-muted-foreground ml-1">điểm</span>
                            </div>
                          </div>

                          {/* Mobile Stats */}
                          <div className="md:hidden flex flex-col items-end gap-1">
                            <span className="font-bold text-sm">{entry.total_points.toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground">điểm</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Pagination */}
                {pagination.total_pages > 1 && (
                  <div className="border-t p-4 bg-muted/20">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              if (page > 1) setPage(page - 1)
                            }}
                            className={page === 1 ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                        {Array.from({ length: pagination.total_pages }, (_, i) => i + 1)
                          .filter((p) => {
                            return p === 1 || p === pagination.total_pages || (p >= page - 1 && p <= page + 1)
                          })
                          .map((p, idx, arr) => {
                            const showEllipsisBefore = idx > 0 && arr[idx] - arr[idx - 1] > 1
                            return (
                              <React.Fragment key={p}>
                                {showEllipsisBefore && (
                                  <PaginationItem>
                                    <PaginationEllipsis />
                                  </PaginationItem>
                                )}
                                <PaginationItem>
                                  <PaginationLink
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      setPage(p)
                                    }}
                                    isActive={p === page}
                                  >
                                    {p}
                                  </PaginationLink>
                                </PaginationItem>
                              </React.Fragment>
                            )
                          })}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              if (page < pagination.total_pages) setPage(page + 1)
                            }}
                            className={page === pagination.total_pages ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
