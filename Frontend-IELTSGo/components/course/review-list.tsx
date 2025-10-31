"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { coursesApi } from "@/lib/api/courses"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"

interface Review {
  id: string
  user_id: string
  course_id: string
  rating: number
  title?: string
  comment?: string
  helpful_count: number
  is_approved: boolean
  created_at: string
  user_name?: string
  user_email?: string
  user_avatar_url?: string
}

interface ReviewListProps {
  courseId: string
  refreshTrigger?: number // For triggering refresh from parent
}

export function ReviewList({ courseId, refreshTrigger }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true)
        const response = await coursesApi.getCourseReviews(courseId)
        // Backend returns null for empty, handle gracefully
        setReviews(response?.data || [])
      } catch (error) {
        console.error("[ReviewList] Failed to fetch reviews:", error)
        setReviews([])
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [courseId, refreshTrigger])

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Đang tải đánh giá...</p>
        </CardContent>
      </Card>
    )
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Chưa có đánh giá nào.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  {review.user_avatar_url && (
                    <AvatarImage src={review.user_avatar_url} alt={review.user_name || review.user_email || 'avatar'} />
                  )}
                  <AvatarFallback>
                    {review.user_name 
                      ? review.user_name
                          .split(" ")
                          .map(word => word[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      : "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      {review.user_name || "Người dùng ẩn danh"}
                    </span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(review.created_at), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Star rating */}
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.title && (
                    <CardTitle className="mt-2 text-base">
                      {review.title}
                    </CardTitle>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          {review.comment && (
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {review.comment}
              </p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}

