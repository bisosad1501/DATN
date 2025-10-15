"use client"

import type React from "react"

import { useAuth } from "@/lib/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface RoleProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: ("student" | "instructor" | "admin")[]
  fallbackPath?: string
}

export function RoleProtectedRoute({ children, allowedRoles, fallbackPath = "/dashboard" }: RoleProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login")
      } else if (!allowedRoles.includes(user.role)) {
        router.push(fallbackPath)
      }
    }
  }, [user, isLoading, allowedRoles, fallbackPath, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}
