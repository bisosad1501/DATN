"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { InstructorLayout } from "@/components/instructor/instructor-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { instructorApi } from "@/lib/api/instructor"
import { Send, Search, Bell, Users } from "lucide-react"
import { formatDistanceToNow } from "@/lib/utils/date"

interface Message {
  id: string
  studentId: string
  studentName: string
  studentAvatar?: string
  subject: string
  content: string
  timestamp: string
  read: boolean
}

export default function InstructorMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAnnouncement, setShowAnnouncement] = useState(false)
  const [announcementData, setAnnouncementData] = useState({
    title: "",
    content: "",
    targetAudience: "all",
  })

  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    try {
      setLoading(true)
      const data = await instructorApi.getMessages()
      setMessages(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to load messages:", error)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await instructorApi.sendAnnouncement(announcementData)
      alert("Announcement sent successfully!")
      setAnnouncementData({ title: "", content: "", targetAudience: "all" })
      setShowAnnouncement(false)
    } catch (error) {
      console.error("Failed to send announcement:", error)
      alert("Failed to send announcement")
    }
  }

  const filteredMessages = messages.filter(
    (msg) =>
      msg.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const unreadCount = messages.filter((m) => !m.read).length

  if (loading) {
    return (
      <InstructorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading messages...</div>
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
            <h1 className="text-3xl font-bold text-foreground">Messages & Communication</h1>
            <p className="text-muted-foreground mt-1">Communicate with your students</p>
          </div>
          <Button onClick={() => setShowAnnouncement(!showAnnouncement)}>
            <Bell className="w-4 h-4 mr-2" />
            Send Announcement
          </Button>
        </div>

        {/* Announcement Form */}
        {showAnnouncement && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Create Announcement</h2>
            <form onSubmit={handleSendAnnouncement} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Title</label>
                <Input
                  value={announcementData.title}
                  onChange={(e) => setAnnouncementData({ ...announcementData, title: e.target.value })}
                  placeholder="Announcement title..."
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Message</label>
                <Textarea
                  value={announcementData.content}
                  onChange={(e) => setAnnouncementData({ ...announcementData, content: e.target.value })}
                  placeholder="Write your announcement..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Target Audience</label>
                <select
                  value={announcementData.targetAudience}
                  onChange={(e) => setAnnouncementData({ ...announcementData, targetAudience: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="all">All Students</option>
                  <option value="course">Specific Course</option>
                  <option value="active">Active Students Only</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit">
                  <Send className="w-4 h-4 mr-2" />
                  Send Announcement
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAnnouncement(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Messages</div>
            <div className="text-2xl font-bold text-foreground mt-1">{messages.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Unread</div>
            <div className="text-2xl font-bold text-primary mt-1">{unreadCount}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Response Rate</div>
            <div className="text-2xl font-bold text-foreground mt-1">95%</div>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Messages List */}
        <div className="space-y-3">
          {filteredMessages.map((message) => (
            <Card
              key={message.id}
              className={`p-4 hover:shadow-md transition-shadow cursor-pointer ${!message.read ? "border-l-4 border-l-primary" : ""}`}
            >
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={message.studentAvatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {message.studentName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{message.studentName}</h3>
                      {!message.read && (
                        <Badge variant="default" className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(message.timestamp)}
                    </span>
                  </div>
                  <p className="font-medium text-sm text-foreground mb-1">{message.subject}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{message.content}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredMessages.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No messages found</h3>
            <p className="text-muted-foreground">{searchQuery ? "Try adjusting your search" : "No messages yet"}</p>
          </div>
        )}
      </div>
    </InstructorLayout>
  )
}
