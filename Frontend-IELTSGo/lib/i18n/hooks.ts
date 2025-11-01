"use client"

import { useI18nStore } from './client'
import viMessages from '@/messages/vi.json'
import enMessages from '@/messages/en.json'

type Messages = typeof viMessages

// Translation function type
type TFunction = (key: string, params?: Record<string, string | number>) => string

const messages: Record<'vi' | 'en', Messages> = {
  vi: viMessages,
  en: enMessages,
}

// Get nested value from object by dot notation path
function getNestedValue(obj: any, path: string): string | undefined {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

// Format message with parameters
function formatMessage(template: string, params?: Record<string, string | number>): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key]?.toString() || match
  })
}

/**
 * Hook to get translation function
 * Supports namespaced keys: "common.welcome" or namespace parameter
 * 
 * @example
 * const t = useTranslations('settings')
 * t('title') // → "settings.title"
 * 
 * @example
 * const t = useTranslations()
 * t('common.welcome') // → Direct key access
 */
export function useTranslations(namespace?: string): TFunction {
  const locale = useI18nStore((state) => state.locale)
  const localeMessages = messages[locale]

  return (key: string, params?: Record<string, string | number>) => {
    let fullKey: string
    
    // If key already contains dots, it might be a full path or a relative path
    if (key.includes('.')) {
      // If namespace is provided and key starts with namespace, strip it (fix: t('common.xxx') when namespace is 'common')
      if (namespace && key.startsWith(namespace + '.')) {
        // Strip namespace prefix: "common.xxx" → "xxx" when namespace is "common"
        const keyWithoutNamespace = key.substring(namespace.length + 1)
        fullKey = namespace ? `${namespace}.${keyWithoutNamespace}` : keyWithoutNamespace
      } else if (namespace && !key.startsWith(namespace + '.')) {
        // Try with namespace first: "homepage.features.deepCourses.title"
        const namespacedKey = `${namespace}.${key}`
        const message = getNestedValue(localeMessages, namespacedKey)
        if (message) {
          return formatMessage(message, params)
        }
        // Fallback to using key as-is (might be a root-level key)
        fullKey = key
      } else {
        // Fallback to using key as-is (might be a root-level key)
        fullKey = key
      }
    } else {
      // No dots: prepend namespace if provided
      fullKey = namespace ? `${namespace}.${key}` : key
    }
    
    const message = getNestedValue(localeMessages, fullKey)
    
    if (!message) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[i18n] Missing translation for key: ${fullKey} (locale: ${locale}, namespace: ${namespace || 'none'})`)
      }
      return fullKey // Return key if translation missing
    }

    return formatMessage(message, params)
  }
}

// Hook to get current locale and setter
export function useLocale() {
  const locale = useI18nStore((state) => state.locale)
  const setLocale = useI18nStore((state) => state.setLocale)
  
  return { locale, setLocale }
}

