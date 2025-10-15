"use client"

import { useState, useEffect } from "react"
import { InstructorLayout } from "@/components/instructor/instructor-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { instructorApi } from "@/lib/api/instructor"
import type { Exercise } from "@/types"
import { Plus, Search, Edit, Trash2, Eye, Clock, Target } from "lucide-react"
import Link from "next/link"

export default function InstructorExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")

  useEffect(() => {
    loadExercises()
  }, [])

  const loadExercises = async () => {
    try {
      setLoading(true)
      const data = await instructorApi.getExercises()
      setExercises(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to load exercises:", error)
      setExercises([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this exercise?")) return

    try {
      await instructorApi.deleteExercise(id)
      setExercises(exercises.filter((e) => e.id !== id))
    } catch (error) {
      console.error("Failed to delete exercise:", error)
    }
  }

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || exercise.type === filterType
    return matchesSearch && matchesType
  })

  if (loading) {
    return (
      <InstructorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading exercises...</div>
        </div>
      </InstructorLayout>
    )
  }

  return (
    <InstructorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Exercises</h1>
            <p className="text-muted-foreground mt-1">Create and manage practice exercises</p>
          </div>
          <Link href="/instructor/exercises/create">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Exercise
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border rounded-md"
          >
            <option value="all">All Types</option>
            <option value="listening">Listening</option>
            <option value="reading">Reading</option>
            <option value="writing">Writing</option>
            <option value="speaking">Speaking</option>
          </select>
        </div>

        {/* Exercises Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => (
            <Card key={exercise.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Exercise Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground line-clamp-2">{exercise.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{exercise.description}</p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {exercise.type}
                  </Badge>
                </div>

                {/* Exercise Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{exercise.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    <span>{exercise.questionCount || 0} questions</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{exercise.difficulty}</Badge>
                  <Badge variant="outline">{exercise.skill}</Badge>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Link href={`/instructor/exercises/${exercise.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/exercises/${exercise.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(exercise.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No exercises found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterType !== "all"
                ? "Try adjusting your filters"
                : "Create your first exercise to get started"}
            </p>
            {!searchQuery && filterType === "all" && (
              <Link href="/instructor/exercises/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Exercise
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </InstructorLayout>
  )
}
