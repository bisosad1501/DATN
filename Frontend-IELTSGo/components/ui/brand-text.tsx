import { cn } from "@/lib/utils"

interface BrandTextProps {
  className?: string
  variant?: "default" | "white"
  size?: "sm" | "md" | "lg" | "xl"
}

/**
 * Component hiển thị text "IELTSGo" với màu sắc đúng brand:
 * - IELTS: màu đen (#101615) trong light mode, màu trắng trong dark mode
 * - Go: màu đỏ (#ED372A)
 */
export function BrandText({ className = "", variant = "default", size = "md" }: BrandTextProps) {
  // In dark mode, use white/s Foreground colors. In light mode, use brand colors.
  const ieltsColor = variant === "white" 
    ? "text-white" 
    : "text-[#101615] dark:text-foreground"
  const goColor = variant === "white" 
    ? "text-white/90" 
    : "text-[#ED372A] dark:text-primary"
  
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  }
  
  // If className contains text size classes (text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, etc.),
  // prioritize className over size prop. Otherwise use size prop.
  const hasTextSizeClass = className.match(/\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)\b/)
  const sizeClass = hasTextSizeClass ? "" : sizeClasses[size]
  
  // For large text sizes (4xl+), inner spans should inherit font-size to avoid CSS override
  // Note: text-2xl and text-3xl are considered normal sizes and should keep default behavior
  const isLargeText = hasTextSizeClass && /text-(4xl|5xl|6xl|7xl|8xl|9xl)/.test(className)
  const innerSpanStyle = isLargeText ? { fontSize: 'inherit', lineHeight: 'inherit' } : undefined
  
  return (
    <span 
      className={cn("font-heading font-bold inline-flex items-center", sizeClass, className)} 
      style={{ lineHeight: 'inherit' }}
    >
      <span className={ieltsColor} style={innerSpanStyle}>IELTS</span>
      <span className={goColor} style={innerSpanStyle}>Go</span>
    </span>
  )
}
