"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { useTranslations } from '@/lib/i18n'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "6xl" | "7xl" | "full"
  variant?: "default" | "narrow" | "wide"
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
}

/**
 * PageContainer - Unified container component for consistent spacing across all pages
 * 
 * Centralized spacing management:
 * - Horizontal padding: px-4 sm:px-6 lg:px-8
 * - Vertical padding: py-8 sm:py-12 lg:py-16
 * 
 * To change spacing globally, modify this component only.
 * 
 * @example
 * ```tsx
 * <PageContainer>
 *   <h1>{t('page_title')}</h1>
 * </PageContainer>
 * ```
 * 
 * @example
 * ```tsx
 * <PageContainer maxWidth="4xl" className="custom-class">
 *   <Content />
 * </PageContainer>
 * ```
 */
export function PageContainer({ 
  children, 
  className,
  maxWidth,
  variant = "default"
}: PageContainerProps) {

  const t = useTranslations('common')

  // Variant-based max width (if maxWidth prop not provided)
  const variantMaxWidth = variant === "narrow" ? "4xl" : variant === "wide" ? "7xl" : undefined
  const finalMaxWidth = maxWidth || variantMaxWidth

  return (
    <div 
      className={cn(
        "container mx-auto",
        "px-4 sm:px-6 lg:px-8",
        "py-8 sm:py-12 lg:py-16",
        finalMaxWidth && maxWidthClasses[finalMaxWidth],
        className
      )}
    >
      {children}
    </div>
  )
}
