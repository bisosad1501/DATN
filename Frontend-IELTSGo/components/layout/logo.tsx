import Image from "next/image"
import Link from "next/link"
import { APP_CONFIG } from "@/lib/constants/config"

interface LogoProps {
  collapsed?: boolean
  className?: string
}

export function Logo({ collapsed = false, className = "" }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-3 ${className}`}>
      <Image src="/images/logo.png" alt={`${APP_CONFIG.name} Logo`} width={40} height={40} className="object-contain" />
      {!collapsed && <span className="text-2xl font-bold text-foreground">{APP_CONFIG.name}</span>}
    </Link>
  )
}
