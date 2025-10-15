"use client"

import { useEffect, useState } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)

    // Set initial value
    setMatches(media.matches)

    // Create event listener
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)

    // Add listener
    media.addEventListener("change", listener)

    // Cleanup
    return () => media.removeEventListener("change", listener)
  }, [query])

  return matches
}

// Predefined breakpoint hooks
export function useIsMobile() {
  return useMediaQuery("(max-width: 640px)")
}

export function useIsTablet() {
  return useMediaQuery("(min-width: 641px) and (max-width: 1024px)")
}

export function useIsDesktop() {
  return useMediaQuery("(min-width: 1025px)")
}
