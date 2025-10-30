"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { coursesApi } from "@/lib/api/courses"
import { useToast } from "@/hooks/use-toast"

interface ReviewFormProps {
  courseId: string
  onSuccess?: () => void
}

export function ReviewForm({ courseId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng chọn số sao đánh giá.",
      })
      return
    }

    try {
      setSubmitting(true)
      await coursesApi.createCourseReview(courseId, {
        rating,
        title: title.trim() || undefined,
        comment: comment.trim() || undefined,
      })

      toast({
        title: "Thành công",
        description: "Đánh giá của bạn đã được đăng thành công!",
      })

      // Reset form
      setRating(0)
      setTitle("")
      setComment("")

      onSuccess?.()
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || "Không thể gửi đánh giá"
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: errorMessage,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Viết đánh giá của bạn</CardTitle>
        <CardDescription>
          Chia sẻ trải nghiệm của bạn với khóa học này
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Đánh giá của bạn</Label>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const starValue = i + 1
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        starValue <= (hoverRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="review-title">Tiêu đề (tùy chọn)</Label>
            <Input
              id="review-title"
              placeholder="Tóm tắt đánh giá của bạn"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="review-comment">Nhận xét (tùy chọn)</Label>
            <Textarea
              id="review-comment"
              placeholder="Chia sẻ chi tiết về khóa học..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Submit */}
          <Button type="submit" disabled={submitting || rating === 0} className="w-full">
            {submitting ? "Đang gửi..." : "Gửi đánh giá"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

