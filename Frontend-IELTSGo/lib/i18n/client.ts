"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { defaultLocale, locales, type Locale } from './config'

interface I18nState {
  locale: Locale
  setLocale: (locale: Locale) => void
}

// Client-side i18n store (syncs with user preferences)
export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      locale: defaultLocale, // Default locale
      setLocale: (locale: Locale) => {
        set({ locale })
        // Update HTML lang attribute
        if (typeof document !== 'undefined') {
          document.documentElement.lang = locale
        }
      },
    }),
    {
      name: 'i18n-locale',
    }
  )
)

