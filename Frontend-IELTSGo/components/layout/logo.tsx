import Image from "next/image"
import Link from "next/link"
import { APP_CONFIG } from "@/lib/constants/config"
import { BrandText } from "@/components/ui/brand-text"

interface LogoProps {
  collapsed?: boolean
  className?: string
  variant?: "default" | "white" // For different backgrounds
}

export function Logo({ collapsed = false, className = "", variant = "default" }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-3 ${className}`}>
      <Image src="/images/logo.png" alt={`${APP_CONFIG.name} Logo`} width={40} height={40} className="object-contain" />
      {!collapsed && <BrandText variant={variant} className="text-2xl" />}
    </Link>
  )
}
