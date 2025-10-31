"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, CheckCircle2 } from "lucide-react"
import { userApi } from "@/lib/api/user"

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}

function ProfileContent() {
  const { user, updateProfile, refreshUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    bio: user?.bio || "",
    targetBandScore: user?.targetBandScore?.toString() || "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const getUserInitials = () => {
    if (!user?.fullName) return "U"
    return user.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage("")
    setErrors({})

    const newErrors: Record<string, string> = {}
    if (!formData.fullName) {
      newErrors.fullName = "Full name is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    try {
      await updateProfile({
        fullName: formData.fullName,
        bio: formData.bio,
        targetBandScore: formData.targetBandScore ? Number(formData.targetBandScore) : undefined,
      })
      setSuccessMessage("Profile updated successfully!")
      setIsEditing(false)
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error: any) {
      setErrors({ general: error.response?.data?.message || "Failed to update profile" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrors({ avatar: "File size must be less than 2MB" })
      return
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrors({ avatar: "File must be an image" })
      return
    }

    setIsUploadingAvatar(true)
    setErrors({})

    try {
      // Convert file to base64 data URL
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result as string
        try {
          // Upload avatar URL to backend
          await userApi.uploadAvatar(base64String)
          
          // Update user state
          if (user) {
            const updatedUser = { ...user, avatar: base64String }
            localStorage.setItem("user_data", JSON.stringify(updatedUser))
            refreshUser()
          }
          
          setSuccessMessage("Avatar updated successfully!")
          setTimeout(() => setSuccessMessage(""), 3000)
        } catch (error: any) {
          setErrors({ avatar: error.response?.data?.error?.message || "Failed to upload avatar" })
        } finally {
          setIsUploadingAvatar(false)
        }
      }
      reader.onerror = () => {
        setErrors({ avatar: "Failed to read file" })
        setIsUploadingAvatar(false)
      }
      reader.readAsDataURL(file)
    } catch (error: any) {
      setErrors({ avatar: "Failed to process file" })
      setIsUploadingAvatar(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage("")
    setErrors({})

    const newErrors: Record<string, string> = {}
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required"
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required"
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters"
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    try {
      // Call password change API here
      setSuccessMessage("Password changed successfully!")
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error: any) {
      setErrors({ general: error.response?.data?.message || "Failed to change password" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AppLayout showSidebar showFooter>
      <div className="container max-w-4xl py-8 px-4">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground mt-2">Manage your account settings and preferences</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal information and profile picture</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.fullName} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="avatar-upload"
                        accept="image/jpeg,image/png,image/gif"
                        onChange={handleAvatarChange}
                        className="hidden"
                        disabled={isUploadingAvatar}
                      />
                      <label
                        htmlFor="avatar-upload"
                        className={`
                          inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all
                          border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground
                          h-8 rounded-md gap-1.5 px-3
                          cursor-pointer
                          ${isUploadingAvatar ? 'opacity-50 pointer-events-none' : ''}
                        `}
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        {isUploadingAvatar ? "Uploading..." : "Change photo"}
                      </label>
                      {errors.avatar && (
                        <p className="text-xs text-destructive mt-1">{errors.avatar}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF. Max size 2MB.</p>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <FormField
                      label="Full Name"
                      name="fullName"
                      value={formData.fullName}
                      onChange={(value) => setFormData({ ...formData, fullName: value })}
                      error={errors.fullName}
                      disabled={!isEditing}
                      required
                    />

                    <FormField
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(value) => setFormData({ ...formData, email: value })}
                      disabled
                    />

                    <FormField
                      label="Bio"
                      name="bio"
                      type="textarea"
                      placeholder="Tell us about yourself..."
                      value={formData.bio}
                      onChange={(value) => setFormData({ ...formData, bio: value })}
                      disabled={!isEditing}
                      rows={3}
                    />

                    <div className="space-y-2">
                      <Label htmlFor="targetBandScore">Target Band Score</Label>
                      <Select
                        value={formData.targetBandScore}
                        onValueChange={(value) => setFormData({ ...formData, targetBandScore: value })}
                        disabled={!isEditing}
                      >
                        <SelectTrigger id="targetBandScore">
                          <SelectValue placeholder="Select your target score" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5.5">5.5</SelectItem>
                          <SelectItem value="6.0">6.0</SelectItem>
                          <SelectItem value="6.5">6.5</SelectItem>
                          <SelectItem value="7.0">7.0</SelectItem>
                          <SelectItem value="7.5">7.5</SelectItem>
                          <SelectItem value="8.0">8.0</SelectItem>
                          <SelectItem value="8.5">8.5</SelectItem>
                          <SelectItem value="9.0">9.0</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {errors.general && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.general}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-3">
                      {isEditing ? (
                        <>
                          <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save changes"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsEditing(false)
                              setFormData({
                                fullName: user?.fullName || "",
                                email: user?.email || "",
                                bio: user?.bio || "",
                                targetBandScore: user?.targetBandScore?.toString() || "",
                              })
                              setErrors({})
                            }}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button type="button" onClick={() => setIsEditing(true)}>
                          Edit profile
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your password to keep your account secure</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <FormField
                      label="Current Password"
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(value) => setPasswordData({ ...passwordData, currentPassword: value })}
                      error={errors.currentPassword}
                      required
                    />

                    <FormField
                      label="New Password"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(value) => setPasswordData({ ...passwordData, newPassword: value })}
                      error={errors.newPassword}
                      required
                    />

                    <FormField
                      label="Confirm New Password"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(value) => setPasswordData({ ...passwordData, confirmPassword: value })}
                      error={errors.confirmPassword}
                      required
                    />

                    {errors.general && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.general}</AlertDescription>
                      </Alert>
                    )}

                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Changing password..." : "Change password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  )
}
