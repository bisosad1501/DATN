"use client"

import { useEffect } from "react"
import { usePreferences } from "@/lib/contexts/preferences-context"
import { useI18nStore } from "@/lib/i18n/client"

/**
 * Client component to sync locale from user preferences to HTML lang attribute
 * Runs on client side to update document.documentElement.lang dynamically
 */
export function LocaleSync() {
  const { preferences } = usePreferences()

  useEffect(() => {
    if (preferences?.locale) {
      // Update i18n store
      useI18nStore.getState().setLocale(preferences.locale)
      // Update HTML lang attribute (also done by setLocale, but ensure it's set)
      document.documentElement.lang = preferences.locale
    } else {
      // Fallback to default
      const defaultLocale = 'vi'
      useI18nStore.getState().setLocale(defaultLocale)
      document.documentElement.lang = defaultLocale
    }
  }, [preferences?.locale])

  return null
}



