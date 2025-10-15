"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Award, Download, Eye, UserPlus, CheckCircle } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const engagementData = [
  { date: "10/01", views: 120, enrollments: 45, completions: 12 },
  { date: "10/05", views: 150, enrollments: 52, completions: 18 },
  { date: "10/10", views: 180, enrollments: 68, completions: 25 },
  { date: "10/15", views: 210, enrollments: 75, completions: 32 },
]

const contentPerformance = [
  { title: "IELTS Reading Mastery", type: "Course", enrollments: 245, rating: 4.8 },
  { title: "Listening Practice Test 1", type: "Exercise", attempts: 189, avgScore: 78 },
  { title: "Writing Task 2 Guide", type: "Course", enrollments: 198, rating: 4.9 },
]

const COLORS = ["#ED372A", "#101615", "#FEF7EC", "#B92819"]

export default function InstructorAnalyticsPage() {
  const [dateRange, setDateRange] = useState("30")

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Analytics</h1>
          <p className="text-gray-600">Track your content performance</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Total Views</div>
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold">1,245</div>
              <div className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12.5%
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Enrollments</div>
                <UserPlus className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold">487</div>
              <div className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +8.3%
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Completions</div>
                <CheckCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-3xl font-bold">156</div>
              <div className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +15.2%
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Avg Rating</div>
                <Award className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold">4.7</div>
              <div className="text-sm text-gray-600 mt-1">Based on 89 reviews</div>
            </Card>
          </div>

          {/* Engagement Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Engagement Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="views" stroke="#3b82f6" name="Views" />
                <Line type="monotone" dataKey="enrollments" stroke="#10b981" name="Enrollments" />
                <Line type="monotone" dataKey="completions" stroke="#ED372A" name="Completions" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Content Performance Table */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Performing Content</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Rank</th>
                    <th className="text-left py-3 px-4">Title</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-left py-3 px-4">Enrollments</th>
                    <th className="text-left py-3 px-4">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {contentPerformance.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">#{index + 1}</td>
                      <td className="py-3 px-4 font-medium">{item.title}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            item.type === "Course" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">{item.enrollments || item.attempts}</td>
                      <td className="py-3 px-4">
                        {item.rating ? (
                          <div className="flex items-center">
                            <span className="text-yellow-500 mr-1">★</span>
                            {item.rating}
                          </div>
                        ) : (
                          <span>{item.avgScore}%</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Course Analytics</h3>
            <p className="text-gray-600">Detailed course performance metrics will appear here</p>
          </Card>
        </TabsContent>

        <TabsContent value="exercises">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Exercise Analytics</h3>
            <p className="text-gray-600">Detailed exercise performance metrics will appear here</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
