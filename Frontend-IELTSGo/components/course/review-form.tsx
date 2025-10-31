"use client"

import { useState, useEffect } from "react"
import { Star, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { coursesApi } from "@/lib/api/courses"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/contexts/auth-context"

interface Review {
  id: string
  user_id: string
  rating: number
  title?: string
  comment?: string
  created_at: string
}

interface ReviewFormProps {
  courseId: string
  onSuccess?: () => void
}

export function ReviewForm({ courseId, onSuccess }: ReviewFormProps) {
  const { user } = useAuth()
  const [existingReview, setExistingReview] = useState<Review | null>(null)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [loadingReview, setLoadingReview] = useState(true)
  const { toast } = useToast()

  // Load existing review on mount
  useEffect(() => {
    const loadExistingReview = async () => {
      if (!user?.id) {
        setLoadingReview(false)
        return
      }

      try {
        setLoadingReview(true)
        const response = await coursesApi.getCourseReviews(courseId)
        const reviews: Review[] = response?.data || []
        
        // Find current user's review
        const userReview = reviews.find((r) => r.user_id === user.id)
        
        if (userReview) {
          setExistingReview(userReview)
          setRating(userReview.rating)
          setTitle(userReview.title || "")
          setComment(userReview.comment || "")
        }
      } catch (error) {
        console.error("Failed to load existing review:", error)
      } finally {
        setLoadingReview(false)
      }
    }

    loadExistingReview()
  }, [courseId, user?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Rating is required only for new reviews (not for updates)
    if (!existingReview && rating === 0) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng chọn số sao đánh giá.",
      })
      return
    }

    try {
      setSubmitting(true)

      if (existingReview) {
        // Update existing review
        // Only send fields that have changed or are provided
        const updateData: { rating?: number; title?: string; comment?: string } = {}
        
        // Only update rating if user changed it
        if (rating !== existingReview.rating) {
          updateData.rating = rating
        }
        
        // Update title if provided
        const newTitle = title.trim() || undefined
        if (newTitle !== (existingReview.title || undefined)) {
          updateData.title = newTitle
        }
        
        // Update comment if provided
        const newComment = comment.trim() || undefined
        if (newComment !== (existingReview.comment || undefined)) {
          updateData.comment = newComment
        }

        // If nothing changed, show message
        if (Object.keys(updateData).length === 0) {
          toast({
            title: "Thông báo",
            description: "Bạn chưa thay đổi gì trong đánh giá.",
          })
          return
        }

        await coursesApi.updateCourseReview(courseId, updateData)

        toast({
          title: "Thành công",
          description: "Đánh giá của bạn đã được cập nhật!",
        })
      } else {
        // Create new review
        await coursesApi.createCourseReview(courseId, {
          rating,
          title: title.trim() || undefined,
          comment: comment.trim() || undefined,
        })

        toast({
          title: "Thành công",
          description: "Đánh giá của bạn đã được đăng thành công!",
        })

        // Reset form (will be reloaded via onSuccess)
        setRating(0)
        setTitle("")
        setComment("")
      }

      onSuccess?.()
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || 
        (existingReview ? "Không thể cập nhật đánh giá" : "Không thể gửi đánh giá")
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: errorMessage,
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingReview) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Đang tải...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {existingReview && <Edit2 className="w-5 h-5 text-primary" />}
          <CardTitle>{existingReview ? "Chỉnh sửa đánh giá của bạn" : "Viết đánh giá của bạn"}</CardTitle>
        </div>
        <CardDescription>
          {existingReview 
            ? "Bạn có thể cập nhật đánh giá của mình bất cứ lúc nào"
            : "Chia sẻ trải nghiệm của bạn với khóa học này"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>
              Đánh giá của bạn
              {existingReview && <span className="text-xs text-muted-foreground ml-2">(Có thể thay đổi)</span>}
            </Label>
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
            {existingReview && rating === 0 && (
              <p className="text-xs text-muted-foreground">
                Bạn đang giữ nguyên đánh giá {existingReview.rating} sao hiện tại
              </p>
            )}
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
          <Button 
            type="submit" 
            disabled={submitting || (!existingReview && rating === 0)} 
            className="w-full"
          >
            {submitting 
              ? (existingReview ? "Đang cập nhật..." : "Đang gửi...") 
              : (existingReview ? "Cập nhật đánh giá" : "Gửi đánh giá")
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
