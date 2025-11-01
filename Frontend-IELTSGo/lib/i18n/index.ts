/**
 * I18n module exports
 * Central export point for all i18n functionality
 */

export { useTranslations, useLocale } from './hooks'
export type { Locale } from './config'
export { locales, defaultLocale } from './config'
export {
  getNamespace,
  getKeyWithoutNamespace,
  isValidLocale,
  getBrowserLocale,
  formatNumber,
  formatCurrency,
} from './utils'
export {
  formatKey,
  getNamespaceFromKey,
  getKeyFromFullKey,
  validateKey,
  getNamespaceKeys,
  tKey,
  extractText,
} from './helpers'
export type {
  TranslationNamespace,
  TranslationKey,
  KeysOfNamespace,
} from './types'

// Re-export for convenience
export { useI18nStore } from './client'

