"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useSidebarNavItems } from "@/components/navigation/all-nav-items"
import { Logo } from "@/components/layout/logo"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/contexts/auth-context"
import { cn } from "@/lib/utils"
import { useTranslations } from "@/lib/i18n"
import * as Icons from "lucide-react"

interface SidebarProps {
  className?: string
  defaultCollapsed?: boolean
}

export function Sidebar({ className, defaultCollapsed = false }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const { user } = useAuth()
  const t = useTranslations('common')
  const SIDEBAR_NAV_ITEMS = useSidebarNavItems()

  // Check if pathname matches or starts with href (for nested routes)
  const isActiveRoute = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.fullName) {
      const names = user.fullName.split(" ")
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      }
      return user.fullName.substring(0, 2).toUpperCase()
    }
    return "U"
  }

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen border-r bg-background transition-all duration-300",
        collapsed ? "w-20" : "w-[280px]",
        className,
      )}
    >
      {/* Logo Section */}
      <div className={cn(
        "flex items-center border-b shrink-0 transition-all duration-300",
        collapsed ? "h-16 justify-center px-2" : "h-16 px-4"
      )}>
        <Logo collapsed={collapsed} noLink={false} />
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-0.5 px-3 py-4">
          {SIDEBAR_NAV_ITEMS.map((item, index) => {
            // Handle separator
            if ('type' in item && item.type === 'separator') {
              if (collapsed) return null
              return (
                <div key={`sep-${index}`} className="my-3">
                  <Separator />
                  <div className="px-3 py-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {item.label}
                    </p>
                  </div>
                </div>
              )
            }

            // Handle navigation item
            if ('href' in item) {
              const Icon = Icons[item.icon as keyof typeof Icons] as any
              const isActive = isActiveRoute(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    "hover:bg-accent/50 active:bg-accent",
                    isActive 
                      ? "bg-primary/10 text-primary font-semibold shadow-sm" 
                      : "text-muted-foreground hover:text-foreground",
                    collapsed && "justify-center px-2.5",
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  {/* Active indicator */}
                  {isActive && !collapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                  )}
                  
                  {Icon && (
                    <Icon 
                      className={cn(
                        "h-5 w-5 flex-shrink-0 transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )} 
                    />
                  )}
                  {!collapsed && (
                    <span className={cn("flex-1", isActive && "font-semibold")}>
                      {item.title}
                    </span>
                  )}
                  
                  {/* Hover tooltip for collapsed state */}
                  {collapsed && isActive && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {item.title}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full border-4 border-transparent border-r-popover" />
                    </div>
                  )}
                </Link>
              )
            }

            return null
          })}
        </nav>
      </ScrollArea>

      {/* User Section */}
      {!collapsed && user && (
        <div className="border-t px-4 py-3 shrink-0">
          <Link
            href={`/users/${user.id}`}
            className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent/50 transition-colors group"
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatar} alt={user.fullName} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </Link>
        </div>
      )}

      {collapsed && user && (
        <div className="border-t p-3 shrink-0 flex justify-center">
          <Link
            href={`/users/${user.id}`}
            className="relative"
            title={user.fullName || user.email}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={user.fullName} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      )}

      {/* Collapse Toggle */}
      <div className="border-t px-4 py-2 shrink-0 hidden lg:block">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-start h-9"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="text-xs text-muted-foreground">{t('collapse')}</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  )
}
