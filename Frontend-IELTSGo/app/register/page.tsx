"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, BookOpen, PenTool, BarChart3, Sparkles, CheckCircle2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Logo } from "@/components/layout/logo"

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "student" as "student" | "instructor",
    targetBandScore: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [apiError, setApiError] = useState("")

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError("")

    if (!validateForm()) return

    setIsLoading(true)
    try {
      await register({
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        role: formData.role,
        fullName: formData.fullName || undefined,
        targetBandScore: formData.targetBandScore ? parseFloat(formData.targetBandScore) : undefined,
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message 
        || error.message 
        || "Registration failed. Please try again."
      setApiError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleRegister = async () => {
    setApiError("")
    setIsGoogleLoading(true)
    try {
      await loginWithGoogle()
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message 
        || error.message 
        || "Google registration failed. Please try again."
      setApiError(errorMessage)
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Promotional Content */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-accent via-accent/80 to-primary/5 items-center justify-center p-8 relative overflow-hidden">
        {/* Enhanced Decorative shapes */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        
        {/* Floating sparkles */}
        <div className="absolute top-40 left-32 text-primary/20">
          <Sparkles className="h-8 w-8 animate-pulse" />
        </div>
        <div className="absolute bottom-32 right-40 text-primary/15">
          <Sparkles className="h-6 w-6 animate-pulse delay-500" />
        </div>
        
        <div className="max-w-2xl text-center space-y-10 relative z-10 px-6">
          {/* Header with gradient text effect */}
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight text-foreground">
              Bắt đầu hành trình IELTS ngay hôm nay
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
              Nhận lộ trình học tập cá nhân hóa, bài tập thực hành và hướng dẫn chuyên sâu để đạt được điểm số mục tiêu.
            </p>
          </div>
          
          {/* Enhanced Features with icons */}
          <div className="space-y-4 pt-6 text-left max-w-xl mx-auto">
            <div className="group flex items-start gap-4 p-5 rounded-xl bg-card/40 backdrop-blur-md border-2 border-border/40 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1">
              <div className="p-2.5 rounded-lg bg-primary/15 group-hover:bg-primary/25 transition-colors flex-shrink-0 group-hover:scale-110">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm sm:text-base mb-1 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  Khóa học toàn diện
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Truy cập 500+ bài học bao phủ tất cả kỹ năng IELTS
                </p>
              </div>
            </div>
            <div className="group flex items-start gap-4 p-5 rounded-xl bg-card/40 backdrop-blur-md border-2 border-border/40 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1">
              <div className="p-2.5 rounded-lg bg-primary/15 group-hover:bg-primary/25 transition-colors flex-shrink-0 group-hover:scale-110">
                <PenTool className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm sm:text-base mb-1 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  Bài tập thực hành
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Kiểm tra kỹ năng với câu hỏi theo phong cách IELTS thực tế
                </p>
              </div>
            </div>
            <div className="group flex items-start gap-4 p-5 rounded-xl bg-card/40 backdrop-blur-md border-2 border-border/40 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1">
              <div className="p-2.5 rounded-lg bg-primary/15 group-hover:bg-primary/25 transition-colors flex-shrink-0 group-hover:scale-110">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm sm:text-base mb-1 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  Theo dõi tiến độ
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Giám sát sự tiến bộ với phân tích chi tiết
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        
        <div className="w-full max-w-md space-y-8 relative z-10">
          {/* Logo and Welcome Message */}
          <div className="text-center space-y-4">
            <Logo className="justify-center" />
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Tạo tài khoản
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Bắt đầu hành trình IELTS của bạn ngay hôm nay
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {apiError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5 bg-card/50 backdrop-blur-sm p-6 rounded-lg border border-border/50 shadow-sm">
            <FormField
              label="Full Name"
              name="fullName"
              type="text"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(value) => setFormData({ ...formData, fullName: value })}
              error={errors.fullName}
              required
            />

            <FormField
              label="Email"
              name="email"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(value) => setFormData({ ...formData, email: value })}
              error={errors.email}
              required
            />

            <FormField
              label="Password"
              name="password"
              type="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={(value) => setFormData({ ...formData, password: value })}
              error={errors.password}
              required
              autoComplete="new-password"
            />

            <FormField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={(value) => setFormData({ ...formData, confirmPassword: value })}
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
            />

            <div className="space-y-2">
              <Label htmlFor="targetBandScore" className="text-sm font-medium">
                Điểm số mục tiêu (Tùy chọn)
              </Label>
              <Select
                value={formData.targetBandScore}
                onValueChange={(value) => setFormData({ ...formData, targetBandScore: value })}
              >
                <SelectTrigger id="targetBandScore">
                  <SelectValue placeholder="Chọn điểm số mục tiêu của bạn" />
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

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Bằng việc tạo tài khoản, bạn đồng ý với{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Điều khoản dịch vụ
              </Link>{" "}
              và{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Chính sách bảo mật
              </Link>
            </p>
          </form>

          {/* Login Link */}
          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              Đã có tài khoản?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
