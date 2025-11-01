/**
 * I18n utility functions
 */

import type { Locale } from './config'

/**
 * Get namespace from translation key
 * @example "common.welcome" → "common"
 */
export function getNamespace(key: string): string | null {
  const parts = key.split('.')
  return parts.length > 1 ? parts[0] : null
}

/**
 * Get key without namespace
 * @example "common.welcome" → "welcome"
 */
export function getKeyWithoutNamespace(key: string): string {
  const parts = key.split('.')
  return parts.length > 1 ? parts.slice(1).join('.') : key
}

/**
 * Validate locale
 */
export function isValidLocale(locale: string): locale is Locale {
  return locale === 'vi' || locale === 'en'
}

/**
 * Get browser locale
 */
export function getBrowserLocale(): Locale {
  if (typeof window === 'undefined') return 'vi'
  
  const browserLang = navigator.language || (navigator as any).userLanguage
  const langCode = browserLang.split('-')[0].toLowerCase()
  
  return isValidLocale(langCode) ? langCode : 'vi'
}

/**
 * Format number with locale
 */
export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US').format(value)
}

/**
 * Format currency with locale
 */
export function formatCurrency(value: number, locale: Locale, currency = 'VND'): string {
  return new Intl.NumberFormat(
    locale === 'vi' ? 'vi-VN' : 'en-US',
    { style: 'currency', currency }
  ).format(value)
}

