/**
 * TypeScript types for translation keys
 * Auto-generated from messages/*.json files
 * 
 * Run: pnpm i18n:extract to regenerate types
 */

import type { locales } from './config'

type Locale = (typeof locales)[number]

// Base translation structure
type TranslationStructure = {
  common?: Record<string, string>
  settings?: Record<string, string>
  dashboard?: Record<string, string>
  courses?: Record<string, string>
  exercises?: Record<string, string>
  profile?: Record<string, string>
  leaderboard?: Record<string, string>
  auth?: Record<string, string>
  notifications?: Record<string, string>
}

// Extract keys from namespace
type ExtractKeys<T extends Record<string, string>> = keyof T & string

// Get all possible translation keys
type TranslationKeys = {
  [K in keyof TranslationStructure]: TranslationStructure[K] extends Record<string, string>
    ? ExtractKeys<TranslationStructure[K]>
    : never
}[keyof TranslationStructure]

// Namespace types
export type TranslationNamespace = keyof TranslationStructure

// Key with namespace format: "namespace.key"
export type TranslationKey<T extends TranslationNamespace = TranslationNamespace> =
  T extends TranslationNamespace
    ? `${T}.${ExtractKeys<NonNullable<TranslationStructure[T]>>}`
    : never

// Helper to get keys for a namespace
export type KeysOfNamespace<T extends TranslationNamespace> = ExtractKeys<
  NonNullable<TranslationStructure[T]>
>

// Usage example:
// const key: TranslationKey<'common'> = 'common.welcome' // ✅
// const key: TranslationKey<'common'> = 'common.invalid' // ❌ Type error

export type { Locale, TranslationStructure, TranslationKeys }

