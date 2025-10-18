"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Logo } from "@/components/layout/logo"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  children?: Array<{
    title: string
    href: string
  }>
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
    children: [
      { title: "All Users", href: "/admin/users" },
      { title: "Students", href: "/admin/users?role=student" },
      { title: "Instructors", href: "/admin/users?role=instructor" },
      { title: "Admins", href: "/admin/users?role=admin" },
    ],
  },
  {
    title: "Content",
    href: "/admin/content",
    icon: BookOpen,
    children: [
      { title: "All Content", href: "/admin/content" },
      { title: "Courses", href: "/admin/content?type=course" },
      { title: "Lessons", href: "/admin/content?type=lesson" },
      { title: "Exercises", href: "/admin/content?type=exercise" },
    ],
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    children: [
      { title: "Overview", href: "/admin/analytics" },
      { title: "User Analytics", href: "/admin/analytics?tab=users" },
      { title: "Course Analytics", href: "/admin/analytics?tab=courses" },
      { title: "Revenue", href: "/admin/analytics?tab=revenue" },
    ],
  },
  {
    title: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
    children: [
      { title: "Send Notification", href: "/admin/notifications" },
      { title: "Templates", href: "/admin/notifications?tab=templates" },
      { title: "History", href: "/admin/notifications?tab=history" },
    ],
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    children: [
      { title: "General", href: "/admin/settings" },
      { title: "Email", href: "/admin/settings?tab=email" },
      { title: "Security", href: "/admin/settings?tab=security" },
      { title: "System Health", href: "/admin/settings?tab=health" },
    ],
  },
]

interface SidebarProps {
  className?: string
  defaultCollapsed?: boolean
}

export function AdminSidebar({ className, defaultCollapsed = false }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === href
    }
    return pathname.startsWith(href.split('?')[0])
  }

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
    )
  }

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r bg-background transition-all duration-300 h-screen",
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
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            const isExpanded = expandedItems.includes(item.title)
            const hasChildren = item.children && item.children.length > 0

            return (
              <div key={item.href}>
                {/* Parent item */}
                <div className="flex items-center">
                  <Link
                    href={item.href}
                    className={cn(
                      "flex flex-1 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active && !hasChildren
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground",
                      collapsed && "justify-center",
                    )}
                    title={collapsed ? item.title : undefined}
                  >
                    {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                    {!collapsed && <span className="flex-1">{item.title}</span>}
                  </Link>
                  {hasChildren && !collapsed && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.preventDefault()
                        toggleExpanded(item.title)
                      }}
                    >
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isExpanded && "transform rotate-180"
                        )}
                      />
                    </Button>
                  )}
                </div>

                {/* Children items */}
                {hasChildren && !collapsed && isExpanded && (
                  <div className="ml-8 mt-1 flex flex-col gap-1">
                    {item.children!.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "rounded-lg px-3 py-1.5 text-sm transition-colors",
                          isActive(child.href)
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        )}
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
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
