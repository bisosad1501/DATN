"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api/auth"
import { userApi } from "@/lib/api/user"
import type { User, LoginCredentials, RegisterData } from "@/types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  loginWithGoogle: () => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  updateProfile: (data: { fullName?: string; bio?: string; targetBandScore?: number }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("access_token")
        if (token) {
          // Validate token
          const validation = await authApi.validateToken()
          if (validation.success && validation.data?.valid) {
            // Get user data from localStorage first (for faster initial load)
            const userData = localStorage.getItem("user_data")
            if (userData) {
              const parsedUser = JSON.parse(userData)
              setUser(parsedUser)
            }
            
            // Then fetch fresh profile from backend to get actual fullName
            try {
              const profile = await userApi.getProfile()
              const existingUserData = localStorage.getItem("user_data")
              if (existingUserData) {
                const existingUser = JSON.parse(existingUserData)
                const updatedUser: User = {
                  ...existingUser,
                  fullName: (profile.full_name && profile.full_name.trim()) || existingUser.fullName || "",
                  bio: profile.bio || existingUser.bio || undefined,
                  avatar: profile.avatar_url || existingUser.avatar || undefined,
                  targetBandScore: profile.target_band_score || existingUser.targetBandScore,
                }
                localStorage.setItem("user_data", JSON.stringify(updatedUser))
                setUser(updatedUser)
              }
            } catch (error) {
              console.warn("Failed to fetch profile on load, using cached data:", error)
            }
          } else {
            // Token invalid, clear storage
            localStorage.removeItem("access_token")
            localStorage.removeItem("refresh_token")
            localStorage.removeItem("user_data")
          }
        }
      } catch (error) {
        console.error("Failed to load user:", error)
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        localStorage.removeItem("user_data")
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authApi.login(credentials)
      
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || "Login failed")
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
        const profile = await userApi.getProfile()
        fullName = (profile.full_name && profile.full_name.trim()) || ""
        bio = profile.bio || ""
        avatar = profile.avatar_url || ""
        targetBandScore = profile.target_band_score
      } catch (error) {
        console.warn("Failed to fetch profile after login:", error)
        // Don't fallback to email - leave fullName empty if not available
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
      setUser(userData)
      
      // Redirect based on role
      if (userData.role === "admin") {
        router.push("/admin")
      } else if (userData.role === "instructor") {
        router.push("/instructor")
      } else {
        router.push("/dashboard")
      }
    } catch (error: any) {
      throw error
    }
  }

  const loginWithGoogle = async () => {
    try {
      // Get Google OAuth URL
      const urlResponse = await authApi.getGoogleOAuthUrl()
      
      if (!urlResponse.success || !urlResponse.data) {
        throw new Error(urlResponse.error?.message || "Failed to get Google OAuth URL")
      }

      // Store state for verification
      localStorage.setItem("oauth_state", urlResponse.data.state)

      // Redirect to Google OAuth
      window.location.href = urlResponse.data.url
    } catch (error: any) {
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const response = await authApi.register(data)
      
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || "Registration failed")
      }

      // Store tokens
      localStorage.setItem("access_token", response.data.access_token)
      localStorage.setItem("refresh_token", response.data.refresh_token)
      
      // Get full profile from user service to get actual fullName (may have been set during registration)
      let fullName = data.fullName || ""
      let bio = ""
      let avatar = ""
      let targetBandScore: number | undefined = data.targetBandScore
      try {
        // Wait a bit for profile creation to complete
        await new Promise(resolve => setTimeout(resolve, 500))
        const profile = await userApi.getProfile()
        fullName = (profile.full_name && profile.full_name.trim()) || data.fullName || ""
        bio = profile.bio || ""
        avatar = profile.avatar_url || ""
        targetBandScore = profile.target_band_score || data.targetBandScore
      } catch (error) {
        console.warn("Failed to fetch profile after registration:", error)
        // Use provided fullName, don't fallback to email
        fullName = data.fullName || ""
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
      setUser(userData)
      
      // Redirect based on role
      if (userData.role === "instructor") {
        router.push("/instructor")
      } else {
        router.push("/dashboard")
      }
    } catch (error: any) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      localStorage.removeItem("user_data")
      
      // Disconnect SSE connection
      try {
        const { sseManager } = await import("@/lib/api/sse-manager")
        sseManager.destroy()
      } catch (error) {
        console.error("Failed to disconnect SSE on logout:", error)
      }
      
      setUser(null)
      router.push("/login")
    }
  }

  const refreshUser = async () => {
    try {
      const validation = await authApi.validateToken()
      if (validation.success && validation.data?.valid) {
        // Try to get updated profile from user service
        try {
          const profile = await userApi.getProfile()
          const userData = localStorage.getItem("user_data")
          if (userData) {
            const existingUser = JSON.parse(userData)
            // Only use full_name from backend if it exists and is not empty
            // Don't fallback to email - keep existing fullName or leave empty
            const updatedUser: User = {
              ...existingUser,
              fullName: (profile.full_name && profile.full_name.trim()) 
                ? profile.full_name.trim() 
                : (existingUser.fullName || ""),
              bio: profile.bio || existingUser.bio || undefined,
              avatar: profile.avatar_url || existingUser.avatar || undefined,
              targetBandScore: profile.target_band_score || existingUser.targetBandScore,
            }
            localStorage.setItem("user_data", JSON.stringify(updatedUser))
            setUser(updatedUser)
          } else {
            // No existing user data, create from profile
            const profile = await userApi.getProfile()
            const existingUserData = localStorage.getItem("user_data")
            const existingUser = existingUserData ? JSON.parse(existingUserData) : null
            const newUser: User = {
              id: existingUser?.id || "",
              email: profile.email || existingUser?.email || "",
              role: profile.role || existingUser?.role || "student",
              fullName: (profile.full_name && profile.full_name.trim()) || "",
              bio: profile.bio || undefined,
              avatar: profile.avatar_url || undefined,
              targetBandScore: profile.target_band_score,
              createdAt: profile.created_at || existingUser?.createdAt || new Date().toISOString(),
              updatedAt: profile.updated_at || existingUser?.updatedAt || new Date().toISOString(),
            }
            localStorage.setItem("user_data", JSON.stringify(newUser))
            setUser(newUser)
          }
        } catch (error) {
          // Fallback to localStorage if API fails
          const userData = localStorage.getItem("user_data")
          if (userData) {
            setUser(JSON.parse(userData))
          }
        }
      }
    } catch (error) {
      console.error("Failed to refresh user:", error)
      throw error
    }
  }

  const updateProfile = async (data: { fullName?: string; bio?: string; targetBandScore?: number }) => {
    try {
      await userApi.updateProfile({
        full_name: data.fullName,
        bio: data.bio,
        target_band_score: data.targetBandScore,
      })
      await refreshUser()
    } catch (error) {
      console.error("Failed to update profile:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        register,
        logout,
        refreshUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
