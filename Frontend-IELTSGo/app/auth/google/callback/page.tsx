"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authApi } from "@/lib/api/auth"
import type { User } from "@/types"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"

export default function GoogleCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Processing Google authentication...")

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // First, try to read tokens from query params (backend redirect)
        const success = searchParams.get("success")
        let accessToken = searchParams.get("access_token")
        let refreshToken = searchParams.get("refresh_token")
        let userId = searchParams.get("user_id")
        let email = searchParams.get("email")
        let role = searchParams.get("role")
        let error = searchParams.get("error")

        // Fallback: some OAuth flows (or proxies) may return tokens in URL fragment (#)
        // Parse window.location.hash if tokens are not present in query params
        if ((!accessToken || !refreshToken) && typeof window !== "undefined") {
          try {
            const hash = window.location.hash || ""
            if (hash.startsWith("#")) {
              const params = new URLSearchParams(hash.slice(1))
              accessToken = accessToken || params.get("access_token")
              refreshToken = refreshToken || params.get("refresh_token")
              userId = userId || params.get("user_id")
              email = email || params.get("email")
              role = role || params.get("role")
              error = error || params.get("error")
            }
          } catch (hashErr) {
            console.warn("Failed to parse URL fragment for tokens:", hashErr)
          }
        }

        console.log("[GoogleCallback] Parsed params/fragment:", {
          success,
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          userId,
          email,
          role,
          error,
          url: typeof window !== "undefined" ? window.location.href : undefined,
        })

        // Handle error from backend
        if (error) {
          setStatus("error")
          setMessage(`Google authentication failed: ${error}`)
          setTimeout(() => router.push("/login"), 3000)
          return
        }

        // Backend redirect with tokens
        if (success === "true" && accessToken && refreshToken && userId && email && role) {
          console.log("[GoogleCallback] Processing backend redirect with tokens")
          setMessage("Storing authentication tokens...")

          // Store tokens
          localStorage.setItem("access_token", accessToken)
          localStorage.setItem("refresh_token", refreshToken)

          // Get full profile from user service to get actual fullName
          let fullName = ""
          let bio = ""
          let avatar = ""
          let targetBandScore: number | undefined
          try {
            // Import userApi dynamically to avoid circular dependency
            const { userApi } = await import("@/lib/api/user")
            const profile = await userApi.getProfile()
            fullName = (profile.full_name && profile.full_name.trim()) || ""
            bio = profile.bio || ""
            avatar = profile.avatar_url || ""
            targetBandScore = profile.target_band_score
          } catch (error) {
            console.warn("Failed to fetch profile after Google login:", error)
            // Don't fallback to email - leave fullName empty
            fullName = ""
          }

          // Store user data
          const userData: User = {
            id: userId,
            email: email,
            role: role as "student" | "instructor" | "admin",
            fullName: fullName || "",
            bio: bio || undefined,
            avatar: avatar || undefined,
            targetBandScore: targetBandScore,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }

          localStorage.setItem("user_data", JSON.stringify(userData))
          console.log("[GoogleCallback] Stored user data:", userData)

          setStatus("success")
          setMessage("Successfully authenticated! Redirecting...")

          // Redirect based on role
          const redirectPath = userData.role === "admin" 
            ? "/admin" 
            : userData.role === "instructor" 
            ? "/instructor" 
            : "/dashboard"
          
          console.log("[GoogleCallback] Redirecting to:", redirectPath)
          
          // Use window.location.href instead of router.push to force a full page reload
          // This ensures AuthContext re-initializes with the new tokens
          setTimeout(() => {
            window.location.href = redirectPath
          }, 1500)
          return
        }

        // Fallback: Old flow with code (shouldn't happen now)
        console.log("[GoogleCallback] Backend redirect condition not met, trying code exchange flow")
        const code = searchParams.get("code")
        const state = searchParams.get("state")

        if (code) {
          console.log("[GoogleCallback] Found authorization code, exchanging for tokens...")
          setMessage("Processing authorization code...")

          // Verify state (CSRF protection)
          const storedState = localStorage.getItem("oauth_state")
          if (storedState && state !== storedState) {
            setStatus("error")
            setMessage("Invalid state parameter. Possible CSRF attack.")
            setTimeout(() => router.push("/login"), 3000)
            return
          }

          // Clear stored state
          localStorage.removeItem("oauth_state")

          // Exchange code for tokens (mobile flow)
          const response = await authApi.googleExchangeToken(code, state || undefined)

          if (!response.success || !response.data) {
            throw new Error(response.error?.message || "Failed to authenticate with Google")
          }

          // Store tokens
          localStorage.setItem("access_token", response.data.access_token)
          localStorage.setItem("refresh_token", response.data.refresh_token)

          // Get full profile from user service to get actual fullName
          let fullName = ""
          let bio = ""
          let avatar = ""
          let targetBandScore: number | undefined
          try {
            // Import userApi dynamically to avoid circular dependency
            const { userApi } = await import("@/lib/api/user")
            const profile = await userApi.getProfile()
            fullName = (profile.full_name && profile.full_name.trim()) || ""
            bio = profile.bio || ""
            avatar = profile.avatar_url || ""
            targetBandScore = profile.target_band_score
          } catch (error) {
            console.warn("Failed to fetch profile after Google token exchange:", error)
            // Don't fallback to email - leave fullName empty
            fullName = ""
          }

          // Store user data
          const userData: User = {
            id: response.data.user_id,
            email: response.data.email,
            role: response.data.role,
            fullName: fullName || "",
            bio: bio || undefined,
            avatar: avatar || undefined,
            targetBandScore: targetBandScore,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }

          localStorage.setItem("user_data", JSON.stringify(userData))

          setStatus("success")
          setMessage("Successfully authenticated! Redirecting...")

          // Redirect based on role
          setTimeout(() => {
            if (userData.role === "admin") {
              router.push("/admin")
            } else if (userData.role === "instructor") {
              router.push("/instructor")
            } else {
              router.push("/dashboard")
            }
          }, 1500)
          return
        }

        // No valid params
        setStatus("error")
        setMessage("No authentication data received")
        setTimeout(() => router.push("/login"), 3000)
      } catch (error: any) {
        console.error("Google callback error:", error)
        setStatus("error")
        setMessage(error.message || "Authentication failed. Please try again.")
        setTimeout(() => router.push("/login"), 3000)
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-4">
        <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
          <div className="flex flex-col items-center space-y-4">
            {/* Icon */}
            {status === "loading" && (
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            )}
            {status === "success" && (
              <CheckCircle className="h-12 w-12 text-green-500" />
            )}
            {status === "error" && (
              <AlertCircle className="h-12 w-12 text-destructive" />
            )}

            {/* Title */}
            <h2 className="text-2xl font-bold text-center">
              {status === "loading" && "Authenticating..."}
              {status === "success" && "Success!"}
              {status === "error" && "Authentication Failed"}
            </h2>

            {/* Message */}
            <p className="text-center text-muted-foreground">
              {message}
            </p>

            {/* Progress indicator */}
            {status === "loading" && (
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: "70%" }} />
              </div>
            )}
          </div>
        </div>

        {/* Help text */}
        {status === "error" && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            You will be redirected to the login page...
          </p>
        )}
      </div>
    </div>
  )
}
