"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useAuth } from "./auth-context"
import { userApi } from "@/lib/api/user"
import type { UserPreferences } from "@/types"

interface PreferencesContextType {
  preferences: UserPreferences | null
  isLoading: boolean
  error: string | null
  refreshPreferences: () => Promise<void>
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined)

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPreferences = async () => {
    if (!user) {
      setPreferences(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const prefs = await userApi.getPreferences()
      setPreferences(prefs)
      
      // Apply preferences immediately
      applyTheme(prefs.theme)
      applyFontSize(prefs.font_size)
      applyLocale(prefs.locale || 'vi')
      
      // Store in localStorage for faster access
      localStorage.setItem("user_preferences", JSON.stringify(prefs))
    } catch (err: any) {
      console.error("Failed to load preferences:", err)
      setError(err.message || "Failed to load preferences")
      
      // Try to load from localStorage as fallback
      const cached = localStorage.getItem("user_preferences")
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          setPreferences(parsed)
          applyTheme(parsed.theme)
          applyFontSize(parsed.font_size)
        } catch (e) {
          console.error("Failed to parse cached preferences:", e)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const refreshPreferences = async () => {
    await loadPreferences()
  }

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user) return

    try {
      // Optimistically update local state
      if (preferences) {
        const updated = { ...preferences, ...updates }
        setPreferences(updated)
        
        // Apply immediately
        if (updates.theme !== undefined) {
          applyTheme(updates.theme)
        }
        if (updates.font_size !== undefined) {
          applyFontSize(updates.font_size)
        }
        if (updates.locale !== undefined) {
          applyLocale(updates.locale)
        }
        
        // Store in localStorage
        localStorage.setItem("user_preferences", JSON.stringify(updated))
      }

      // Send to backend
      await userApi.updatePreferences(updates as any)
      
      // Reload to get server response
      await loadPreferences()
    } catch (err: any) {
      console.error("Failed to update preferences:", err)
      // Revert on error
      await loadPreferences()
      throw err
    }
  }

  // Load preferences when user changes
  useEffect(() => {
    loadPreferences()
  }, [user])

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        isLoading,
        error,
        refreshPreferences,
        updatePreferences,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (context === undefined) {
    throw new Error("usePreferences must be used within a PreferencesProvider")
  }
  return context
}

// Helper functions to apply preferences
let themeListener: ((e: MediaQueryListEvent) => void) | null = null
let currentMediaQuery: MediaQueryList | null = null

function applyTheme(theme: "light" | "dark" | "auto") {
  if (typeof window === "undefined") return
  
  const root = document.documentElement
  
  // Cleanup previous listener if exists
  if (currentMediaQuery && themeListener) {
    currentMediaQuery.removeEventListener("change", themeListener)
    currentMediaQuery = null
    themeListener = null
  }
  
  if (theme === "auto") {
    // Use system preference
    root.classList.remove("light", "dark")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    if (prefersDark) {
      root.classList.add("dark")
    } else {
      root.classList.add("light")
    }
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    themeListener = (e: MediaQueryListEvent) => {
      root.classList.remove("light", "dark")
      if (e.matches) {
        root.classList.add("dark")
      } else {
        root.classList.add("light")
      }
    }
    mediaQuery.addEventListener("change", themeListener)
    currentMediaQuery = mediaQuery
  } else {
    // Set explicit theme
    root.classList.remove("light", "dark")
    root.classList.add(theme)
  }
}

function applyFontSize(fontSize: "small" | "medium" | "large") {
  if (typeof window === "undefined") return
  
  const root = document.documentElement
  
  // Remove existing font size classes
  root.classList.remove("font-size-small", "font-size-medium", "font-size-large")
  
  // Add new font size class - CSS will handle the actual font-size application
  root.classList.add(`font-size-${fontSize}`)
  
  // Set CSS variables for components that might need them
  const fontSizeMap = {
    small: "0.875rem", // 14px (87.5% of 16px)
    medium: "1rem",     // 16px (100% of base)
    large: "1.125rem", // 18px (112.5% of 16px)
  }
  
  // Keep CSS variable for backward compatibility and component usage
  root.style.setProperty("--user-font-size", fontSizeMap[fontSize])
  
  // Set multiplier for calculations if needed
  const multiplierMap = {
    small: 0.875,
    medium: 1,
    large: 1.125,
  }
  root.style.setProperty("--font-size-multiplier", multiplierMap[fontSize].toString())
}

function applyLocale(locale: "vi" | "en") {
  if (typeof window === "undefined") return
  
  // Update HTML lang attribute
  document.documentElement.lang = locale
  
  // Sync with i18n store (lazy import to avoid circular dependency)
  import("@/lib/i18n/client").then(({ useI18nStore }) => {
    useI18nStore.getState().setLocale(locale)
  })
}

