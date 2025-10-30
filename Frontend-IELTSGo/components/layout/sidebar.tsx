"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
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
      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 py-4">
        <nav className="flex flex-col gap-1">
          {SIDEBAR_NAV_ITEMS.map((item) => {
            const Icon = Icons[item.icon as keyof typeof Icons] as any
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary/10 text-primary border-l-4 border-primary" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground border-l-4 border-transparent",
                  collapsed && "justify-center px-2",
                )}
                title={collapsed ? item.title : undefined}
              >
                {Icon && <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} />}
                {!collapsed && <span className="flex-1">{item.title}</span>}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
    </aside>
  )
}
