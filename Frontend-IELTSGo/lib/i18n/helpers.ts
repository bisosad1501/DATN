/**
 * I18n Helper Functions
 * Utilities for easier i18n usage and development
 */

import type { Locale } from './config'

/**
 * Format translation key
 */
export function formatKey(namespace: string, key: string): string {
  return `${namespace}.${key}`
}

/**
 * Get namespace from key
 */
export function getNamespaceFromKey(key: string): string {
  const parts = key.split('.')
  return parts.length > 1 ? parts[0] : 'common'
}

/**
 * Get key without namespace
 */
export function getKeyFromFullKey(fullKey: string): string {
  const parts = fullKey.split('.')
  return parts.length > 1 ? parts.slice(1).join('.') : fullKey
}

/**
 * Validate translation key exists
 */
export function validateKey(
  key: string,
  messages: Record<string, any>,
  locale: Locale
): boolean {
  const parts = key.split('.')
  let current = messages
  for (const part of parts) {
    if (!current || typeof current !== 'object' || !(part in current)) {
      return false
    }
    current = current[part]
  }
  return typeof current === 'string'
}

/**
 * Get all keys for a namespace
 */
export function getNamespaceKeys(
  namespace: string,
  messages: Record<string, any>
): string[] {
  const ns = messages[namespace]
  if (!ns || typeof ns !== 'object') return []
  
  const keys: string[] = []
  function traverse(obj: any, prefix = '') {
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key
      if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        traverse(obj[key], fullKey)
      } else {
        keys.push(fullKey)
      }
    }
  }
  traverse(ns)
  return keys
}

/**
 * Type-safe translation key builder
 */
export function tKey(namespace: string, key: string): string {
  return `${namespace}.${key}`
}

/**
 * Extract text for translation (dev helper)
 */
export function extractText(text: string, namespace = 'common'): {
  key: string
  text: string
  namespace: string
} {
  const key = text
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .substring(0, 40)
  
  return {
    key,
    text,
    namespace,
  }
}

