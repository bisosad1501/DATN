"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, PenTool, TrendingUp, TrendingDown, Bell, Activity as ActivityIcon, FileText } from "lucide-react"
import { adminApi } from "@/lib/api/admin"
import type { DashboardStats, Activity as ActivityType } from "@/types/admin"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { formatDistanceToNow } from "@/lib/utils/date"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [userGrowthData, setUserGrowthData] = useState<{ date: string; count: number }[]>([])
  const [enrollmentData, setEnrollmentData] = useState<{ date: string; enrollments: number; completions: number }[]>([])
  const [activities, setActivities] = useState<ActivityType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(() => {
      loadActivities()
    }, 30000) // Refresh activities every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // TODO: Uncomment when backend admin API is implemented
      // const [statsData, growthData, enrollData, activitiesData] = await Promise.all([
      //   adminApi.getDashboardStats(),
      //   adminApi.getUserGrowthData(30),
      //   adminApi.getEnrollmentData(7),
      //   adminApi.getRecentActivities(20),
      // ])
      // setStats(statsData)
      // setUserGrowthData(growthData)
      // setEnrollmentData(enrollData)
      // setActivities(activitiesData)
      
      // Using mock data until backend is ready
      setStats({
        totalUsers: 1247,
        totalCourses: 45,
        totalExercises: 234,
        totalInstructors: 23,
        activeStudents: 892,
        newUsersThisWeek: 45,
        completionRate: 78.5,
        averageRating: 4.6,
      } as any)
      
      setUserGrowthData(
        Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
          count: Math.floor(Math.random() * 50) + 20,
        }))
      )
      
      setEnrollmentData(
        Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
          enrollments: Math.floor(Math.random() * 20) + 10,
          completions: Math.floor(Math.random() * 10) + 5,
        }))
      )
      
      setActivities([
        {
          id: "1",
          type: "user",
          action: "registered",
          actorName: "John Doe",
          actorAvatar: "/placeholder-user.jpg",
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          type: "course",
          action: "completed IELTS Writing Masterclass",
          actorName: "Jane Smith",
          actorAvatar: "/placeholder-user.jpg",
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        },
        {
          id: "3",
          type: "exercise",
          action: "submitted IELTS Reading Practice Test 5",
          actorName: "Mike Johnson",
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        {
          id: "4",
          type: "review",
          action: "reviewed Writing Task 2 submission",
          actorName: "Sarah Williams",
          actorAvatar: "/placeholder-user.jpg",
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        },
      ])
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadActivities = async () => {
    try {
      // TODO: Uncomment when backend admin API is implemented
      // const activitiesData = await adminApi.getRecentActivities(20)
      // setActivities(activitiesData)
      
      // Mock data - no need to refresh
    } catch (error) {
      console.error("Failed to load activities:", error)
    }
  }

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-32 bg-gray-200 rounded-lg"></CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your platform.</p>
        </div>
        {/* Stat Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Users */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium opacity-90">Total Users</CardTitle>
              <Users className="h-6 w-6 opacity-75" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold mb-2">{stats.totalUsers.toLocaleString()}</div>
              <div className="flex items-center gap-2 text-sm mb-3">
                {stats.userGrowth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span className="opacity-90">{Math.abs(stats.userGrowth)}% this month</span>
              </div>
              <div className="space-y-1 text-xs opacity-80 border-t border-white/20 pt-3">
                <div>Students: {stats.totalStudents}</div>
                <div>Instructors: {stats.totalInstructors}</div>
                <div>Admins: {stats.totalAdmins}</div>
              </div>
            </CardContent>
          </Card>

          {/* Total Courses */}
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium opacity-90">Total Courses</CardTitle>
              <BookOpen className="h-6 w-6 opacity-75" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold mb-4">{stats.totalCourses.toLocaleString()}</div>
              <div className="space-y-1 text-sm opacity-80 border-t border-white/20 pt-3">
                <div>Active: {stats.activeCourses}</div>
                <div>Draft: {stats.draftCourses}</div>
              </div>
            </CardContent>
          </Card>

          {/* Total Exercises */}
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium opacity-90">Total Exercises</CardTitle>
              <PenTool className="h-6 w-6 opacity-75" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold mb-4">{stats.totalExercises.toLocaleString()}</div>
              <div className="space-y-1 text-sm opacity-80 border-t border-white/20 pt-3">
                <div>Submissions today: {stats.submissionsToday}</div>
                <div>Avg completion: {stats.averageCompletionRate}%</div>
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium opacity-90">System Health</CardTitle>
              <ActivityIcon className="h-6 w-6 opacity-75" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-4">
                <div
                  className={`h-3 w-3 rounded-full animate-pulse ${stats.systemHealth === "healthy" ? "bg-green-300" : stats.systemHealth === "warning" ? "bg-yellow-300" : "bg-red-300"}`}
                ></div>
                <span className="text-lg font-semibold">
                  {stats.systemHealth === "healthy"
                    ? "Operational"
                    : stats.systemHealth === "warning"
                      ? "Warning"
                      : "Critical"}
                </span>
              </div>
              <div className="space-y-3 border-t border-white/20 pt-3">
                <div>
                  <div className="flex justify-between text-xs mb-1.5 opacity-80">
                    <span>CPU</span>
                    <span>{stats.cpuUsage}%</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all" style={{ width: `${stats.cpuUsage}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5 opacity-80">
                    <span>Memory</span>
                    <span>{stats.memoryUsage}%</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all" style={{ width: `${stats.memoryUsage}%` }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* User Growth Chart */}
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">User Growth (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Line type="monotone" dataKey="count" stroke="#ED372A" strokeWidth={3} dot={{ fill: '#ED372A', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Enrollment Statistics */}
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Enrollment Statistics (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Legend />
                  <Bar dataKey="enrollments" fill="#ED372A" name="New Enrollments" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="completions" fill="#101615" name="Completions" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed & Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Activity Feed */}
          <Card className="lg:col-span-2 shadow-lg">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {activities && activities.length > 0 ? (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <Avatar className="h-10 w-10 border-2 border-white shadow">
                        <AvatarImage src={activity.actorAvatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                          {activity.actorName?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-relaxed">
                          <span className="font-semibold text-gray-900">{activity.actorName || "Unknown"}</span>{" "}
                          <span className="text-gray-600">{activity.action || "performed an action"}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.timestamp ? formatDistanceToNow(activity.timestamp) : "Just now"}
                        </p>
                      </div>
                      <Badge
                        variant={activity.type === "user" ? "default" : activity.type === "course" ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {activity.type}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-lg">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              <Button className="w-full justify-start hover:bg-blue-50 hover:text-blue-600 transition-colors" variant="outline">
                <Bell className="mr-3 h-4 w-4" />
                Create Notification
              </Button>
              <Button className="w-full justify-start hover:bg-green-50 hover:text-green-600 transition-colors" variant="outline">
                <Users className="mr-3 h-4 w-4" />
                Add New User
              </Button>
              <Button className="w-full justify-start hover:bg-orange-50 hover:text-orange-600 transition-colors" variant="outline">
                <BookOpen className="mr-3 h-4 w-4" />
                Review Pending Content
              </Button>
              <Button className="w-full justify-start hover:bg-purple-50 hover:text-purple-600 transition-colors" variant="outline">
                <FileText className="mr-3 h-4 w-4" />
                View System Logs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
