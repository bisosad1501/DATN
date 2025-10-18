import { cn } from "@/lib/utils"

interface BrandTextProps {
  className?: string
  variant?: "default" | "white"
  size?: "sm" | "md" | "lg" | "xl"
}

/**
 * Component hiển thị text "IELTSGo" với màu sắc đúng brand:
 * - IELTS: màu đen (#101615)
 * - Go: màu đỏ (#ED372A)
 */
export function BrandText({ className = "", variant = "default", size = "md" }: BrandTextProps) {
  const ieltsColor = variant === "white" ? "text-white" : "text-[#101615]"
  const goColor = variant === "white" ? "text-white/90" : "text-[#ED372A]"
  
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  }
  
  return (
    <span className={cn("font-heading font-bold", sizeClasses[size], className)}>
      <span className={ieltsColor}>IELTS</span>
      <span className={goColor}>Go</span>
    </span>
  )
}
