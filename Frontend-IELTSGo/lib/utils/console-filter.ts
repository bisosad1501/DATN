/**
 * Console error filter to suppress known/expected errors during development
 * This helps keep the console clean while backend APIs are being implemented
 */

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error
  const originalWarn = console.warn

  // List of error patterns to suppress
  const suppressPatterns = [
    /Failed to load resource.*404.*Not Found/i,
    /progress\/summary/i,
    /progress\/analytics/i,
    /progress\/history/i,
    /Request failed with status code 404.*progress/i,
  ]

  console.error = (...args: any[]) => {
    const errorMessage = args.join(' ')
    const shouldSuppress = suppressPatterns.some(pattern => pattern.test(errorMessage))
    
    if (!shouldSuppress) {
      originalError.apply(console, args)
    }
  }

  console.warn = (...args: any[]) => {
    const warnMessage = args.join(' ')
    const shouldSuppress = suppressPatterns.some(pattern => pattern.test(warnMessage))
    
    if (!shouldSuppress) {
      originalWarn.apply(console, args)
    }
  }

  // Log that filter is active
  console.log('[Console Filter] Suppressing known 404 errors for unimplemented progress endpoints')
}

export {}
