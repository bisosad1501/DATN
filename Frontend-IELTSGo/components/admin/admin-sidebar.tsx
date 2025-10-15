"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  PenTool,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Shield,
  FileText,
  Activity,
  Database,
  FileSearch,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/layout/logo"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  children?: NavItem[]
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
      { title: "All Users", href: "/admin/users", icon: Users },
      { title: "Students", href: "/admin/users/students", icon: GraduationCap },
      { title: "Instructors", href: "/admin/users/instructors", icon: Shield },
      { title: "Admins", href: "/admin/users/admins", icon: Shield },
    ],
  },
  {
    title: "Content",
    href: "/admin/content",
    icon: BookOpen,
    children: [
      { title: "Courses", href: "/admin/content/courses", icon: BookOpen },
      { title: "Exercises", href: "/admin/content/exercises", icon: PenTool },
      { title: "Reviews", href: "/admin/content/reviews", icon: FileText },
      { title: "Question Bank", href: "/admin/content/questions", icon: FileSearch },
    ],
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    children: [
      { title: "Overview", href: "/admin/analytics", icon: BarChart3 },
      { title: "User Analytics", href: "/admin/analytics/users", icon: Users },
      { title: "Content Analytics", href: "/admin/analytics/content", icon: BookOpen },
      { title: "Engagement", href: "/admin/analytics/engagement", icon: Activity },
    ],
  },
  {
    title: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
  },
  {
    title: "System",
    href: "/admin/system",
    icon: Settings,
    children: [
      { title: "Settings", href: "/admin/system/settings", icon: Settings },
      { title: "Health Monitor", href: "/admin/system/health", icon: Activity },
      { title: "Logs", href: "/admin/system/logs", icon: FileText },
      { title: "Database", href: "/admin/system/database", icon: Database },
    ],
  },
]

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const pathname = usePathname()

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]))
  }

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-[#101615] text-white transition-all duration-300",
        collapsed ? "w-20" : "w-72",
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-gray-800 px-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Logo variant="light" size="sm" />
              <span className="font-heading text-lg font-bold text-primary">Admin</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-white hover:bg-gray-800"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => (
            <div key={item.title}>
              <Link
                href={item.href}
                onClick={(e) => {
                  if (item.children) {
                    e.preventDefault()
                    toggleExpanded(item.title)
                  }
                }}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(item.href) ? "bg-primary text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white",
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="flex-1">{item.title}</span>}
                {!collapsed && item.children && (
                  <ChevronRight
                    className={cn("h-4 w-4 transition-transform", expandedItems.includes(item.title) && "rotate-90")}
                  />
                )}
              </Link>

              {/* Submenu */}
              {!collapsed && item.children && expandedItems.includes(item.title) && (
                <div className="ml-4 mt-1 space-y-1 border-l border-gray-700 pl-4">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        isActive(child.href)
                          ? "bg-primary/20 text-primary"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white",
                      )}
                    >
                      <child.icon className="h-4 w-4" />
                      <span>{child.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-800 p-4">
          {!collapsed && (
            <div className="text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>All systems operational</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
