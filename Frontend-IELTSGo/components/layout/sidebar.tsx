"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Logo } from "./logo"
import { SIDEBAR_NAV_ITEMS } from "@/lib/constants/navigation"
import { cn } from "@/lib/utils"
import * as Icons from "lucide-react"

interface SidebarProps {
  className?: string
  defaultCollapsed?: boolean
}

export function Sidebar({ className, defaultCollapsed = false }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-20" : "w-[280px]",
        className,
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b px-4">
        <Logo collapsed={collapsed} />
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-2">
          {SIDEBAR_NAV_ITEMS.map((item) => {
            const Icon = Icons[item.icon as keyof typeof Icons] as any
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground",
                  collapsed && "justify-center",
                )}
                title={collapsed ? item.title : undefined}
              >
                {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                {!collapsed && <span>{item.title}</span>}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Collapse button */}
      <div className="border-t p-4">
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="w-full">
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>
    </aside>
  )
}
