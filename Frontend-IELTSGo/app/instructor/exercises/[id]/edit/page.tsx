"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Save, X, Eye, Plus, Trash2, GripVertical, CheckCircle, Circle } from "lucide-react"

export default function ExerciseBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const [exercise, setExercise] = useState({
    title: "",
    type: "reading",
    difficulty: "medium",
    timeLimit: 60,
    questions: [],
  })
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null)

  const addQuestion = () => {
    const newQuestion = {
      id: `temp-${Date.now()}`,
      type: "multiple_choice",
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      points: 1,
    }
    setExercise({
      ...exercise,
      questions: [...exercise.questions, newQuestion],
    })
    setSelectedQuestionIndex(exercise.questions.length)
  }

  const selectedQuestion = selectedQuestionIndex !== null ? exercise.questions[selectedQuestionIndex] : null

  return (
    <div className="min-h-screen relative">
      {/* Top Bar */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4 flex-1">
            <Input
              value={exercise.title}
              onChange={(e) => setExercise({ ...exercise, title: e.target.value })}
              placeholder="Exercise Title"
              className="text-xl font-semibold border-none focus-visible:ring-0 max-w-md"
            />
            <Badge>Draft</Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              Publish
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar - Exercise Settings */}
        <div className="w-80 bg-white border-r overflow-y-auto p-4">
          <h3 className="font-semibold mb-4">Exercise Settings</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={exercise.type}
                onChange={(e) => setExercise({ ...exercise, type: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="reading">Reading</option>
                <option value="listening">Listening</option>
                <option value="writing">Writing</option>
                <option value="speaking">Speaking</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <select
                value={exercise.difficulty}
                onChange={(e) => setExercise({ ...exercise, difficulty: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Time Limit (minutes)</label>
              <Input
                type="number"
                value={exercise.timeLimit}
                onChange={(e) => setExercise({ ...exercise, timeLimit: Number.parseInt(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea rows={4} placeholder="Exercise description" />
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Questions</h3>
              <Button size="sm" onClick={addQuestion}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-1">
              {exercise.questions.map((q, index) => (
                <div
                  key={q.id}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                    selectedQuestionIndex === index ? "bg-primary text-white" : "hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedQuestionIndex(index)}
                >
                  <GripVertical className="w-4 h-4" />
                  <span className="text-sm flex-1">Question {index + 1}</span>
                  <Badge variant="outline" className="text-xs">
                    {q.points} pt
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <Card className="p-6">
            {selectedQuestion ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Question {selectedQuestionIndex! + 1}</h2>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Question Type</label>
                  <select className="w-full border rounded-md px-3 py-2">
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="true_false">True/False</option>
                    <option value="fill_blank">Fill in the Blank</option>
                    <option value="short_answer">Short Answer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Question Text *</label>
                  <Textarea value={selectedQuestion.questionText} placeholder="Enter your question" rows={3} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Options</label>
                  <div className="space-y-2">
                    {selectedQuestion.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            // Set correct answer
                          }}
                          className="flex-shrink-0"
                        >
                          {selectedQuestion.correctAnswer === optIndex ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        <Input
                          value={option}
                          placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                          className="flex-1"
                        />
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Option
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Explanation (Optional)</label>
                  <Textarea placeholder="Explain the correct answer" rows={3} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Points</label>
                  <Input type="number" value={selectedQuestion.points} min={1} />
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No question selected</p>
                <Button onClick={addQuestion}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Question
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Right Sidebar - Preview */}
        <div className="w-96 bg-white border-l p-4 overflow-y-auto">
          <div className="text-sm font-medium mb-4">Preview</div>
          <div className="border rounded-lg p-4 bg-gray-50">
            {selectedQuestion ? (
              <div className="space-y-4">
                <p className="font-medium">{selectedQuestion.questionText || "Question text will appear here"}</p>
                <div className="space-y-2">
                  {selectedQuestion.options.map((option, index) => (
                    <div
                      key={index}
                      className={`p-3 border rounded-lg ${
                        selectedQuestion.correctAnswer === index ? "border-green-500 bg-green-50" : "border-gray-200"
                      }`}
                    >
                      <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                      {option || `Option ${String.fromCharCode(65 + index)}`}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600">Select a question to preview</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
