"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import { usePreferences } from "@/lib/contexts/preferences-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Bell, Monitor, BookOpen, Lock, Save, Loader2, CheckCircle2 } from "lucide-react"
import type { UserPreferences, UpdatePreferencesRequest } from "@/types"

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  )
}

function SettingsContent() {
  const { user } = useAuth()
  const { preferences: contextPrefs, isLoading: contextLoading, updatePreferences: updateContextPrefs } = usePreferences()
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [originalPreferences, setOriginalPreferences] = useState<UserPreferences | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Sync with context preferences
  useEffect(() => {
    if (contextPrefs) {
      setPreferences(contextPrefs)
      setOriginalPreferences(JSON.parse(JSON.stringify(contextPrefs))) // Deep clone
    }
  }, [contextPrefs])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!preferences || !originalPreferences) return

    setIsSaving(true)
    setSuccessMessage("")
    setErrors({})

    try {
      // Build update payload - only include fields that have changed
      const updateData: UpdatePreferencesRequest = {}
      
      if (preferences.email_notifications !== originalPreferences.email_notifications) {
        updateData.email_notifications = preferences.email_notifications
      }
      if (preferences.push_notifications !== originalPreferences.push_notifications) {
        updateData.push_notifications = preferences.push_notifications
      }
      if (preferences.study_reminders !== originalPreferences.study_reminders) {
        updateData.study_reminders = preferences.study_reminders
      }
      if (preferences.weekly_report !== originalPreferences.weekly_report) {
        updateData.weekly_report = preferences.weekly_report
      }
      if (preferences.theme !== originalPreferences.theme) {
        updateData.theme = preferences.theme
      }
      if (preferences.font_size !== originalPreferences.font_size) {
        updateData.font_size = preferences.font_size
      }
      if (preferences.auto_play_next_lesson !== originalPreferences.auto_play_next_lesson) {
        updateData.auto_play_next_lesson = preferences.auto_play_next_lesson
      }
      if (preferences.show_answer_explanation !== originalPreferences.show_answer_explanation) {
        updateData.show_answer_explanation = preferences.show_answer_explanation
      }
      if (preferences.playback_speed !== originalPreferences.playback_speed) {
        updateData.playback_speed = preferences.playback_speed
      }
      if (preferences.profile_visibility !== originalPreferences.profile_visibility) {
        updateData.profile_visibility = preferences.profile_visibility
      }
      if (preferences.show_study_stats !== originalPreferences.show_study_stats) {
        updateData.show_study_stats = preferences.show_study_stats
      }

      // Check if there are any changes
      if (Object.keys(updateData).length === 0) {
        setSuccessMessage("No changes to save")
        setTimeout(() => setSuccessMessage(""), 2000)
        setIsSaving(false)
        return
      }

      // Use context update which handles API call and state sync
      await updateContextPrefs(updateData)
      setSuccessMessage("Settings saved successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
      
      // Preferences will be updated via context useEffect
    } catch (error: any) {
      setErrors({
        general: error.response?.data?.error?.message || "Failed to save settings",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AppLayout showSidebar={false} showFooter>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
            <p className="text-base text-muted-foreground">Manage your account settings and preferences</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <Alert className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">{successMessage}</AlertDescription>
            </Alert>
          )}

          {contextLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading settings...</span>
              </CardContent>
            </Card>
          ) : preferences ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Notifications Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <CardTitle>Notifications</CardTitle>
                  </div>
                  <CardDescription>Manage how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5 flex-1">
                      <Label htmlFor="email_notifications" className="text-base">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="email_notifications"
                      checked={preferences.email_notifications}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, email_notifications: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5 flex-1">
                      <Label htmlFor="push_notifications" className="text-base">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive push notifications</p>
                    </div>
                    <Switch
                      id="push_notifications"
                      checked={preferences.push_notifications}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, push_notifications: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5 flex-1">
                      <Label htmlFor="study_reminders" className="text-base">Study Reminders</Label>
                      <p className="text-sm text-muted-foreground">Get reminded about your study schedule</p>
                    </div>
                    <Switch
                      id="study_reminders"
                      checked={preferences.study_reminders}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, study_reminders: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5 flex-1">
                      <Label htmlFor="weekly_report" className="text-base">Weekly Report</Label>
                      <p className="text-sm text-muted-foreground">Receive weekly progress reports</p>
                    </div>
                    <Switch
                      id="weekly_report"
                      checked={preferences.weekly_report}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, weekly_report: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Display Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-primary" />
                    <CardTitle>Display</CardTitle>
                  </div>
                  <CardDescription>Customize your viewing experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme" className="text-base">Theme</Label>
                    <Select
                      value={preferences.theme}
                      onValueChange={(value: "light" | "dark" | "auto") =>
                        setPreferences({ ...preferences, theme: value })
                      }
                    >
                      <SelectTrigger id="theme" className="w-full md:w-[300px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="auto">Auto (System)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">Choose your preferred color theme</p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="font_size" className="text-base font-medium">Font Size</Label>
                      <span className="text-sm text-muted-foreground">
                        {preferences.font_size === "small" && "14px"}
                        {preferences.font_size === "medium" && "16px (Default)"}
                        {preferences.font_size === "large" && "18px"}
                      </span>
                    </div>
                    <Select
                      value={preferences.font_size}
                      onValueChange={(value: "small" | "medium" | "large") =>
                        setPreferences({ ...preferences, font_size: value })
                      }
                    >
                      <SelectTrigger id="font_size" className="w-full md:w-[300px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">
                          <span className="flex items-center gap-2">
                            <span className="text-xs">Aa</span>
                            <span>Small (14px)</span>
                          </span>
                        </SelectItem>
                        <SelectItem value="medium">
                          <span className="flex items-center gap-2">
                            <span className="text-sm">Aa</span>
                            <span>Medium (16px)</span>
                          </span>
                        </SelectItem>
                        <SelectItem value="large">
                          <span className="flex items-center gap-2">
                            <span className="text-base">Aa</span>
                            <span>Large (18px)</span>
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Adjust the text size for better readability. All text elements will scale proportionally.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Study Preferences Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <CardTitle>Study Preferences</CardTitle>
                  </div>
                  <CardDescription>Customize your learning experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5 flex-1">
                      <Label htmlFor="auto_play_next_lesson" className="text-base">Auto-play Next Lesson</Label>
                      <p className="text-sm text-muted-foreground">Automatically start the next lesson after completion</p>
                    </div>
                    <Switch
                      id="auto_play_next_lesson"
                      checked={preferences.auto_play_next_lesson}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, auto_play_next_lesson: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5 flex-1">
                      <Label htmlFor="show_answer_explanation" className="text-base">Show Answer Explanations</Label>
                      <p className="text-sm text-muted-foreground">Display explanations after answering questions</p>
                    </div>
                    <Switch
                      id="show_answer_explanation"
                      checked={preferences.show_answer_explanation}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, show_answer_explanation: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="playback_speed" className="text-base">Playback Speed</Label>
                    <Select
                      value={preferences.playback_speed.toString()}
                      onValueChange={(value) =>
                        setPreferences({ ...preferences, playback_speed: parseFloat(value) })
                      }
                    >
                      <SelectTrigger id="playback_speed" className="w-full md:w-[300px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.75">0.75x</SelectItem>
                        <SelectItem value="1.0">1.0x (Normal)</SelectItem>
                        <SelectItem value="1.25">1.25x</SelectItem>
                        <SelectItem value="1.5">1.5x</SelectItem>
                        <SelectItem value="2.0">2.0x</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">Video playback speed for lessons</p>
                  </div>
                </CardContent>
              </Card>

              {/* Privacy Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    <CardTitle>Privacy</CardTitle>
                  </div>
                  <CardDescription>Control your privacy settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="profile_visibility" className="text-base">Profile Visibility</Label>
                    <Select
                      value={preferences.profile_visibility}
                      onValueChange={(value: "public" | "friends" | "private") =>
                        setPreferences({ ...preferences, profile_visibility: value })
                      }
                    >
                      <SelectTrigger id="profile_visibility" className="w-full md:w-[300px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="friends">Friends Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">Control who can see your profile</p>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5 flex-1">
                      <Label htmlFor="show_study_stats" className="text-base">Show Study Stats</Label>
                      <p className="text-sm text-muted-foreground">Display your study statistics publicly</p>
                    </div>
                    <Switch
                      id="show_study_stats"
                      checked={preferences.show_study_stats}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, show_study_stats: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Error Message */}
              {errors.general && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSaving} size="lg" className="gap-2">
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Failed to load settings</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

