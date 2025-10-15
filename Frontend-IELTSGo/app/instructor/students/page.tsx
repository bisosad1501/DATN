"use client"

import { useState, useEffect } from "react"
import { InstructorLayout } from "@/components/instructor/instructor-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { instructorApi } from "@/lib/api/instructor"
import { Search, Mail, TrendingUp, Award, Clock } from "lucide-react"
import Link from "next/link"

interface Student {
  id: string
  name: string
  email: string
  avatar?: string
  enrolledCourses: number
  completedExercises: number
  averageScore: number
  totalStudyTime: number
  lastActive: string
  progress: number
}

export default function InstructorStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      setLoading(true)
      const data = await instructorApi.getStudents()
      setStudents(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to load students:", error)
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <InstructorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading students...</div>
        </div>
      </InstructorLayout>
    )
  }

  return (
    <InstructorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Students</h1>
          <p className="text-muted-foreground mt-1">Track student progress and performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Students</div>
            <div className="text-2xl font-bold text-foreground mt-1">{students.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Active This Week</div>
            <div className="text-2xl font-bold text-foreground mt-1">
              {
                students.filter((s) => {
                  const lastActive = new Date(s.lastActive)
                  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  return lastActive > weekAgo
                }).length
              }
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Avg. Completion</div>
            <div className="text-2xl font-bold text-foreground mt-1">
              {students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.progress, 0) / students.length) : 0}
              %
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Avg. Score</div>
            <div className="text-2xl font-bold text-foreground mt-1">
              {students.length > 0
                ? Math.round(students.reduce((sum, s) => sum + s.averageScore, 0) / students.length)
                : 0}
              %
            </div>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Students List */}
        <div className="space-y-4">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <Avatar className="w-16 h-16">
                  <AvatarImage src={student.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {student.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                {/* Student Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{student.name}</h3>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                    <Link href={`mailto:${student.email}`}>
                      <Button variant="outline" size="sm">
                        <Mail className="w-4 h-4 mr-2" />
                        Contact
                      </Button>
                    </Link>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Overall Progress</span>
                      <span className="font-semibold text-foreground">{student.progress}%</span>
                    </div>
                    <Progress value={student.progress} className="h-2" />
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Courses</div>
                        <div className="font-semibold text-foreground">{student.enrolledCourses}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                        <Award className="w-4 h-4 text-green-500" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Exercises</div>
                        <div className="font-semibold text-foreground">{student.completedExercises}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <Award className="w-4 h-4 text-purple-500" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Avg. Score</div>
                        <div className="font-semibold text-foreground">{student.averageScore}%</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-orange-500" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Study Time</div>
                        <div className="font-semibold text-foreground">{student.totalStudyTime}h</div>
                      </div>
                    </div>
                  </div>

                  {/* Last Active */}
                  <div className="text-xs text-muted-foreground">
                    Last active: {new Date(student.lastActive).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No students found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? "Try adjusting your search" : "No students enrolled yet"}
            </p>
          </div>
        )}
      </div>
    </InstructorLayout>
  )
}
