"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react"
import { adminApi } from "@/lib/api/admin"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils/date"

interface ContentItem {
  id: string
  type: "course" | "exercise" | "lesson"
  title: string
  author: string
  status: "pending" | "approved" | "rejected"
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
}

export default function AdminContentPage() {
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")
  const { toast } = useToast()

  useEffect(() => {
    fetchContent()
  }, [activeTab])

  const fetchContent = async () => {
    try {
      setLoading(true)
      const response = await adminApi.getContentReviewQueue(activeTab)
      setContent(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error("Failed to fetch content:", error)
      setContent([])
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (id: string, status: "approved" | "rejected") => {
    try {
      await adminApi.reviewContent(id, status)
      toast({
        title: "Success",
        description: `Content ${status} successfully`,
      })
      fetchContent()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to review content",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-500">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-500">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return null
    }
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      course: "bg-blue-500",
      exercise: "bg-purple-500",
      lesson: "bg-green-500",
    }
    return <Badge className={colors[type as keyof typeof colors]}>{type}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Content Management</h1>
        <p className="text-muted-foreground mt-1">Review and moderate content submissions</p>
      </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">Pending Review</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-6">
            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : content.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">No content found</CardContent>
              </Card>
            ) : (
              content.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getTypeBadge(item.type)}
                          {getStatusBadge(item.status)}
                        </div>
                        <CardTitle>{item.title}</CardTitle>
                        <CardDescription>
                          By {item.author} • Submitted {formatDate(item.submittedAt)}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                        {item.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-600 hover:bg-green-50 bg-transparent"
                              onClick={() => handleReview(item.id, "approved")}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                              onClick={() => handleReview(item.id, "rejected")}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {item.reviewedAt && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Reviewed by {item.reviewedBy} on {formatDate(item.reviewedAt)}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
  )
}
