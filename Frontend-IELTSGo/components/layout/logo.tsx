import Image from "next/image"
import Link from "next/link"
import { APP_CONFIG } from "@/lib/constants/config"
import { BrandText } from "@/components/ui/brand-text"

interface LogoProps {
  collapsed?: boolean
  className?: string
  variant?: "default" | "white"
  /** Nếu true, không bọc trong Link (dùng khi đã có Link bên ngoài hoặc không cần link) */
  noLink?: boolean
}

/**
 * Logo component - Centralized logo component for easy maintenance
 * - Icon: hình tròn, scale với font-size-multiplier
 * - Text: BrandText component tự động adapt dark mode
 * - Chỉ cần sửa ở đây để thay đổi toàn bộ hệ thống
 */
export function Logo({ collapsed = false, className = "", variant = "default", noLink = false }: LogoProps) {
  const logoContent = (
    <>
      {/* Icon: Logo hình tròn, cùng size với avatar */}
      <Image 
        src="/images/logo.png" 
        alt={`${APP_CONFIG.name} Logo`} 
        width={200} 
        height={120} 
        className="object-cover flex-shrink-0 rounded-full"
        style={{
          height: `calc(2.5rem * var(--font-size-multiplier, 1))`,
          width: `calc(2.5rem * var(--font-size-multiplier, 1))`,
        }}
        priority
      />
      {/* Text: BrandText - tự động adapt dark mode */}
      {!collapsed && (
        <BrandText 
          variant={variant} 
          className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight whitespace-nowrap" 
        />
      )}
    </>
  )

  if (noLink) {
    return (
      <div className={`inline-flex items-center gap-3 ${className}`}>
        {logoContent}
      </div>
    )
  }

  return (
    <Link 
      href="/" 
      className={`inline-flex items-center gap-3 ${className} group hover:opacity-90 transition-opacity`}
    >
      {logoContent}
    </Link>
  )
}
