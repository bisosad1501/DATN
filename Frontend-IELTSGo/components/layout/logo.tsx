import Image from "next/image"
import Link from "next/link"
import { APP_CONFIG } from "@/lib/constants/config"
import { BrandText } from "@/components/ui/brand-text"

interface LogoProps {
  collapsed?: boolean
  className?: string
  variant?: "default" | "white"
}

/**
 * Logo component - đơn giản như các hệ thống thực tế
 * Icon và text, kích thước cố định hợp lý, scale đơn giản với font-size-multiplier
 */
export function Logo({ collapsed = false, className = "", variant = "default" }: LogoProps) {
  return (
    <Link 
      href="/" 
      className={`inline-flex items-center gap-3 ${className} group hover:opacity-90 transition-opacity`}
    >
      {/* Icon: Logo mới - hình tròn, cùng size với avatar */}
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
      {/* Text: BrandText - size lớn hơn để nổi bật */}
      {!collapsed && (
        <BrandText 
          variant={variant} 
          className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight whitespace-nowrap" 
        />
      )}
    </Link>
  )
}
