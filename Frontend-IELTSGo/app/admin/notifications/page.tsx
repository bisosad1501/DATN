"use client"

import { useState } from "react"
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
import { useTranslations } from '@/lib/i18n'

interface NotificationTemplate {
  id: string
  name: string
  subject: string
  content: string
  type: "email" | "push" | "in-app"
  createdAt: string
}

export default function AdminNotificationsPage() {

  const t = useTranslations('common')

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
        title: t('notifications_sent'),
        description: t('bulk_notifications_sent_successfully'),
      })
      setBulkForm({ recipient: "all", type: "email", subject: "", content: "" })
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failed_to_send_notifications'),
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
        title: t('notification_scheduled'),
        description: t('notification_scheduled_successfully'),
      })
      setScheduleForm({ recipient: "all", type: "email", subject: "", content: "", scheduledAt: "" })
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failed_to_schedule_notification'),
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
      title: t('template_saved'),
      description: t('template_saved_successfully'),
    })
    setTemplateForm({ name: "", subject: "", content: "", type: "email" })
  }

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id))
    toast({
      title: t('template_deleted'),
      description: t('template_deleted_successfully'),
    })
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{t('notification_center')}</h1>
        <p className="text-muted-foreground mt-1">{t('admin_notifications_description')}</p>
      </div>

        <Tabs defaultValue="bulk" className="space-y-6">
          <TabsList>
            <TabsTrigger value="bulk" className="gap-2">
              <Send className="h-4 w-4" />
              {t('bulk_send')}
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-2">
              <Clock className="h-4 w-4" />
              {t('schedule')}
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <FileText className="h-4 w-4" />
              {t('templates')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bulk" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('send_bulk_notification')}</CardTitle>
                <CardDescription>{t('send_notifications_to_multiple_users_at_')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('recipient_group')}</Label>
                    <Select
                      value={bulkForm.recipient}
                      onValueChange={(value) => setBulkForm({ ...bulkForm, recipient: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('all_users')}</SelectItem>
                        <SelectItem value="students">{t('students_only')}</SelectItem>
                        <SelectItem value="instructors">{t('instructors_only')}</SelectItem>
                        <SelectItem value="active">{t('active_users')}</SelectItem>
                        <SelectItem value="inactive">{t('inactive_users')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('notification_type')}</Label>
                    <Select value={bulkForm.type} onValueChange={(value) => setBulkForm({ ...bulkForm, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">{t('email')}</SelectItem>
                        <SelectItem value="push">{t('push_notification')}</SelectItem>
                        <SelectItem value="in-app">{t('in_app_notification')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('subject')}</Label>
                  <Input
                    placeholder={t('enter_notification_subject')}
                    value={bulkForm.subject}
                    onChange={(e) => setBulkForm({ ...bulkForm, subject: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('message_content')}</Label>
                  <Textarea
                    placeholder={t('enter_notification_message')}
                    rows={6}
                    value={bulkForm.content}
                    onChange={(e) => setBulkForm({ ...bulkForm, content: e.target.value })}
                  />
                </div>

                <Button onClick={handleBulkSend} disabled={loading} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  {t('send_notification')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('schedule_notification')}</CardTitle>
                <CardDescription>{t('schedule_notifications_description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('recipient_group')}</Label>
                    <Select
                      value={scheduleForm.recipient}
                      onValueChange={(value) => setScheduleForm({ ...scheduleForm, recipient: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('all_users')}</SelectItem>
                        <SelectItem value="students">{t('students_only')}</SelectItem>
                        <SelectItem value="instructors">{t('instructors_only')}</SelectItem>
                        <SelectItem value="active">{t('active_users')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('notification_type')}</Label>
                    <Select
                      value={scheduleForm.type}
                      onValueChange={(value) => setScheduleForm({ ...scheduleForm, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">{t('email')}</SelectItem>
                        <SelectItem value="push">{t('push_notification')}</SelectItem>
                        <SelectItem value="in-app">{t('in_app_notification')}</SelectItem>
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
                  <Label>{t('subject')}</Label>
                  <Input
                    placeholder={t('enter_notification_subject')}
                    value={scheduleForm.subject}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, subject: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('message_content')}</Label>
                  <Textarea
                    placeholder={t('enter_notification_message')}
                    rows={6}
                    value={scheduleForm.content}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, content: e.target.value })}
                  />
                </div>

                <Button onClick={handleSchedule} disabled={loading} className="w-full">
                  <Clock className="h-4 w-4 mr-2" />{t('schedule_notification')}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('create_template')}</CardTitle>
                <CardDescription>{t('save_notification_templates_for_quick_re')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('template_name')}</Label>
                    <Input
                      placeholder={t('eg_welcome_email')}
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t('type')}</Label>
                    <Select
                      value={templateForm.type}
                      onValueChange={(value: any) => setTemplateForm({ ...templateForm, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">{t('email')}</SelectItem>
                        <SelectItem value="push">{t('push_notification')}</SelectItem>
                        <SelectItem value="in-app">{t('in_app_notification')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('subject')}</Label>
                  <Input
                    placeholder={t('enter_template_subject')}
                    value={templateForm.subject}
                    onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('content')}</Label>
                  <Textarea
                    placeholder={t('enter_template_content')}
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
                <CardTitle>{t('saved_templates')}</CardTitle>
                <CardDescription>{t('manage_your_notification_templates')}</CardDescription>
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
  )
}
