"use client"

import { Bell, Search, User, LogOut, SettingsIcon, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTranslations } from '@/lib/i18n'

interface AdminHeaderProps {
  breadcrumbs?: { label: string; href?: string }[]
}

export function AdminHeader({ breadcrumbs }: AdminHeaderProps) {

  const t = useTranslations('common')

  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#ED372A]/20 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="flex h-16 items-center justify-between px-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm min-w-0">
          {breadcrumbs?.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && <span className="text-[#ED372A]/40">/</span>}
              {crumb.href ? (
                <a href={crumb.href} className="text-[#101615]/70 hover:text-[#ED372A] transition-colors">
                  {crumb.label}
                </a>
              ) : (
                <span className="font-medium text-[#101615]">{crumb.label}</span>
              )}
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 max-w-lg mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#101615]/40" />
            <Input 
              type="search" 
              placeholder={t('search_users_courses_exercises')} 
              className="pl-10 bg-[#FEF7EC]/50 border-[#ED372A]/20 focus:bg-white focus:border-[#ED372A]" 
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative hover:bg-[#FEF7EC]">
            <Bell className="h-5 w-5 text-[#101615]" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ED372A] text-xs text-white font-medium">
              3
            </span>
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{user?.fullName?.charAt(0) || "A"}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user?.fullName || "Admin"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{t('admin_account')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                <User className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/admin/system/settings")}>
                <SettingsIcon className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                <Eye className="mr-2 h-4 w-4" />
                Switch to Student View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/instructor")}>
                <Eye className="mr-2 h-4 w-4" />
                Switch to Instructor View
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
