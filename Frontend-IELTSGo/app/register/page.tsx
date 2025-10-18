"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BrandText } from "@/components/ui/brand-text"

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "student" as "student" | "instructor",
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
      {/* Left side - Image */}
      <div className="hidden lg:flex flex-1 bg-accent items-center justify-center p-8">
        <div className="max-w-md text-center space-y-6">
          <h2 className="text-4xl font-bold text-foreground">Start Your IELTS Journey Today</h2>
          <p className="text-lg text-muted-foreground">
            Get personalized learning paths, practice exercises, and expert guidance to achieve your target band score.
          </p>
          <div className="space-y-4 pt-8 text-left">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold">Comprehensive Courses</h3>
                <p className="text-sm text-muted-foreground">Access 500+ lessons covering all IELTS skills</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold">Practice Exercises</h3>
                <p className="text-sm text-muted-foreground">Test your skills with real IELTS-style questions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold">Track Progress</h3>
                <p className="text-sm text-muted-foreground">Monitor your improvement with detailed analytics</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <Link href="/" className="inline-block">
              <Image src="/images/logo.png" alt="IELTSGo" width={80} height={80} className="mx-auto" />
            </Link>
            <h1 className="mt-6 text-3xl font-bold">
              Join <BrandText className="text-3xl" />
            </h1>
            <p className="mt-2 text-muted-foreground">Create your account and start learning today</p>
          </div>

          {/* Error Alert */}
          {apiError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
            />

            <div className="space-y-2">
              <Label htmlFor="targetBandScore" className="text-sm font-medium">
                Target Band Score (Optional)
              </Label>
              <Select
                value={formData.targetBandScore}
                onValueChange={(value) => setFormData({ ...formData, targetBandScore: value })}
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

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </form>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
