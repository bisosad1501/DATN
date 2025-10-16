"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, PenTool, Activity, TrendingUp, TrendingDown, Bell } from "lucide-react"
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
          user: { id: "1", name: "John Doe", email: "john@example.com" },
          description: "New user registered",
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          type: "course",
          user: { id: "2", name: "Jane Smith", email: "jane@example.com" },
          description: "Completed IELTS Writing Masterclass",
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        },
      ] as any)
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
      <AdminLayout breadcrumbs={[{ label: "Dashboard" }]}>
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-24 bg-gray-200"></CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout breadcrumbs={[{ label: "Dashboard" }]}>
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Users */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-5 w-5 opacity-75" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                {stats.userGrowth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{Math.abs(stats.userGrowth)}% this month</span>
              </div>
              <div className="mt-3 space-y-1 text-xs opacity-90">
                <div>Students: {stats.totalStudents}</div>
                <div>Instructors: {stats.totalInstructors}</div>
                <div>Admins: {stats.totalAdmins}</div>
              </div>
            </CardContent>
          </Card>

          {/* Total Courses */}
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-5 w-5 opacity-75" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalCourses.toLocaleString()}</div>
              <div className="mt-3 space-y-1 text-sm opacity-90">
                <div>Active: {stats.activeCourses}</div>
                <div>Draft: {stats.draftCourses}</div>
              </div>
            </CardContent>
          </Card>

          {/* Total Exercises */}
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Exercises</CardTitle>
              <PenTool className="h-5 w-5 opacity-75" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalExercises.toLocaleString()}</div>
              <div className="mt-3 space-y-1 text-sm opacity-90">
                <div>Submissions today: {stats.submissionsToday}</div>
                <div>Avg completion: {stats.averageCompletionRate}%</div>
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Activity className="h-5 w-5 opacity-75" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${stats.systemHealth === "healthy" ? "bg-green-300" : stats.systemHealth === "warning" ? "bg-yellow-300" : "bg-red-300"}`}
                ></div>
                <span className="text-lg font-semibold">
                  {stats.systemHealth === "healthy"
                    ? "Operational"
                    : stats.systemHealth === "warning"
                      ? "Warning"
                      : "Critical"}
                </span>
              </div>
              <div className="mt-3 space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>CPU</span>
                    <span>{stats.cpuUsage}%</span>
                  </div>
                  <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: `${stats.cpuUsage}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Memory</span>
                    <span>{stats.memoryUsage}%</span>
                  </div>
                  <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: `${stats.memoryUsage}%` }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>User Growth (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#ED372A" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Enrollment Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Statistics (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="enrollments" fill="#ED372A" name="New Enrollments" />
                  <Bar dataKey="completions" fill="#101615" name="Completions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed & Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Activity Feed */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activity.actorAvatar || "/placeholder.svg"} />
                      <AvatarFallback>{activity.actorName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{activity.actorName}</span>{" "}
                        <span className="text-gray-600">{activity.action}</span>
                      </p>
                      <p className="text-xs text-gray-500">{formatDistanceToNow(activity.timestamp)}</p>
                    </div>
                    <Badge
                      variant={
                        activity.type === "user" ? "default" : activity.type === "course" ? "secondary" : "outline"
                      }
                    >
                      {activity.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Bell className="mr-2 h-4 w-4" />
                Create Notification
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Add New User
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <BookOpen className="mr-2 h-4 w-4" />
                Review Pending Content
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Activity className="mr-2 h-4 w-4" />
                View System Logs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
