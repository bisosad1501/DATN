"use client"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BookOpen, PenTool, Video } from "lucide-react"

interface QuickCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickCreateModal({ open, onOpenChange }: QuickCreateModalProps) {
  const router = useRouter()

  const options = [
    {
      title: "New Course",
      description: "Create a comprehensive IELTS course",
      icon: BookOpen,
      color: "bg-blue-500",
      action: () => {
        onOpenChange(false)
        router.push("/instructor/courses/create/edit")
      },
    },
    {
      title: "New Exercise",
      description: "Create a practice exercise",
      icon: PenTool,
      color: "bg-green-500",
      action: () => {
        onOpenChange(false)
        router.push("/instructor/exercises/create/edit")
      },
    },
    {
      title: "Upload Video",
      description: "Upload a video lesson",
      icon: Video,
      color: "bg-orange-500",
      action: () => {
        // Open video upload modal
      },
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">What would you like to create?</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 mt-4">
          {options.map((option) => (
            <Card
              key={option.title}
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={option.action}
            >
              <div className={`w-12 h-12 rounded-lg ${option.color} flex items-center justify-center mb-4`}>
                <option.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">{option.title}</h3>
              <p className="text-sm text-gray-600">{option.description}</p>
              <Button className="w-full mt-4 bg-primary hover:bg-primary/90">Start</Button>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
