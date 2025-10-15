"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api/auth"
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
            // Get user data from token
            const userData = localStorage.getItem("user_data")
            if (userData) {
              setUser(JSON.parse(userData))
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
      
      // Store user data
      const userData: User = {
        id: response.data.user_id,
        email: response.data.email,
        role: response.data.role,
        fullName: response.data.email.split("@")[0], // Temporary until we get full name from user service
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
      
      // Store user data
      const userData: User = {
        id: response.data.user_id,
        email: response.data.email,
        role: response.data.role,
        fullName: response.data.email.split("@")[0],
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
      setUser(null)
      router.push("/login")
    }
  }

  const refreshUser = async () => {
    try {
      const validation = await authApi.validateToken()
      if (validation.success && validation.data?.valid) {
        const userData = localStorage.getItem("user_data")
        if (userData) {
          setUser(JSON.parse(userData))
        }
      }
    } catch (error) {
      console.error("Failed to refresh user:", error)
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
