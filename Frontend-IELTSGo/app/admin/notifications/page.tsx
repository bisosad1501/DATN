"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, Clock, FileText, Plus, Edit, Trash2 } from "lucide-react"
import { adminApi } from "@/lib/api/admin"
import { useToast } from "@/hooks/use-toast"

interface NotificationTemplate {
  id: string
  name: string
  subject: string
  content: string
  type: "email" | "push" | "in-app"
  createdAt: string
}

export default function AdminNotificationsPage() {
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: "1",
      name: "Welcome Email",
      subject: "Welcome to IELTSGo!",
      content: "Thank you for joining IELTSGo. Start your learning journey today!",
      type: "email",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Course Completion",
      subject: "Congratulations on completing the course!",
      content: "You have successfully completed the course. Keep up the great work!",
      type: "in-app",
      createdAt: new Date().toISOString(),
    },
  ])
  const { toast } = useToast()

  // Bulk Send Form State
  const [bulkForm, setBulkForm] = useState({
    recipient: "all",
    type: "email",
    subject: "",
    content: "",
  })

  // Scheduled Notification Form State
  const [scheduleForm, setScheduleForm] = useState({
    recipient: "all",
    type: "email",
    subject: "",
    content: "",
    scheduledAt: "",
  })

  // Template Form State
  const [templateForm, setTemplateForm] = useState({
    name: "",
    subject: "",
    content: "",
    type: "email" as "email" | "push" | "in-app",
  })

  const handleBulkSend = async () => {
    setLoading(true)
    try {
      await adminApi.sendBulkNotification(bulkForm)
      toast({
        title: "Notifications sent",
        description: "Bulk notifications have been sent successfully.",
      })
      setBulkForm({ recipient: "all", type: "email", subject: "", content: "" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send notifications.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSchedule = async () => {
    setLoading(true)
    try {
      await adminApi.scheduleNotification(scheduleForm)
      toast({
        title: "Notification scheduled",
        description: "Notification has been scheduled successfully.",
      })
      setScheduleForm({ recipient: "all", type: "email", subject: "", content: "", scheduledAt: "" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule notification.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTemplate = () => {
    const newTemplate: NotificationTemplate = {
      id: Date.now().toString(),
      ...templateForm,
      createdAt: new Date().toISOString(),
    }
    setTemplates([...templates, newTemplate])
    toast({
      title: "Template saved",
      description: "Notification template has been saved successfully.",
    })
    setTemplateForm({ name: "", subject: "", content: "", type: "email" })
  }

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id))
    toast({
      title: "Template deleted",
      description: "Notification template has been deleted.",
    })
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notification Center</h1>
          <p className="text-muted-foreground mt-2">Send bulk notifications, manage templates, and schedule messages</p>
        </div>

        <Tabs defaultValue="bulk" className="space-y-6">
          <TabsList>
            <TabsTrigger value="bulk" className="gap-2">
              <Send className="h-4 w-4" />
              Bulk Send
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-2">
              <Clock className="h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <FileText className="h-4 w-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bulk" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Send Bulk Notification</CardTitle>
                <CardDescription>Send notifications to multiple users at once</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Recipient Group</Label>
                    <Select
                      value={bulkForm.recipient}
                      onValueChange={(value) => setBulkForm({ ...bulkForm, recipient: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="students">Students Only</SelectItem>
                        <SelectItem value="instructors">Instructors Only</SelectItem>
                        <SelectItem value="active">Active Users</SelectItem>
                        <SelectItem value="inactive">Inactive Users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Notification Type</Label>
                    <Select value={bulkForm.type} onValueChange={(value) => setBulkForm({ ...bulkForm, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="push">Push Notification</SelectItem>
                        <SelectItem value="in-app">In-App Notification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    placeholder="Enter notification subject"
                    value={bulkForm.subject}
                    onChange={(e) => setBulkForm({ ...bulkForm, subject: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Message Content</Label>
                  <Textarea
                    placeholder="Enter notification message"
                    rows={6}
                    value={bulkForm.content}
                    onChange={(e) => setBulkForm({ ...bulkForm, content: e.target.value })}
                  />
                </div>

                <Button onClick={handleBulkSend} disabled={loading} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Send Notification
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Schedule Notification</CardTitle>
                <CardDescription>Schedule notifications to be sent at a specific time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Recipient Group</Label>
                    <Select
                      value={scheduleForm.recipient}
                      onValueChange={(value) => setScheduleForm({ ...scheduleForm, recipient: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="students">Students Only</SelectItem>
                        <SelectItem value="instructors">Instructors Only</SelectItem>
                        <SelectItem value="active">Active Users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Notification Type</Label>
                    <Select
                      value={scheduleForm.type}
                      onValueChange={(value) => setScheduleForm({ ...scheduleForm, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="push">Push Notification</SelectItem>
                        <SelectItem value="in-app">In-App Notification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Schedule Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={scheduleForm.scheduledAt}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledAt: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    placeholder="Enter notification subject"
                    value={scheduleForm.subject}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, subject: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Message Content</Label>
                  <Textarea
                    placeholder="Enter notification message"
                    rows={6}
                    value={scheduleForm.content}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, content: e.target.value })}
                  />
                </div>

                <Button onClick={handleSchedule} disabled={loading} className="w-full">
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule Notification
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Template</CardTitle>
                <CardDescription>Save notification templates for quick reuse</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Template Name</Label>
                    <Input
                      placeholder="e.g., Welcome Email"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={templateForm.type}
                      onValueChange={(value: any) => setTemplateForm({ ...templateForm, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="push">Push Notification</SelectItem>
                        <SelectItem value="in-app">In-App Notification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    placeholder="Enter template subject"
                    value={templateForm.subject}
                    onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    placeholder="Enter template content"
                    rows={6}
                    value={templateForm.content}
                    onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                  />
                </div>

                <Button onClick={handleSaveTemplate} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Save Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Saved Templates</CardTitle>
                <CardDescription>Manage your notification templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {templates.map((template) => (
                    <div key={template.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{template.name}</h4>
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">{template.type}</span>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">{template.subject}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{template.content}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteTemplate(template.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
