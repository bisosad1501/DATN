"use client"

import type React from "react"

import { useState } from "react"
import { Navbar } from "./navbar"
import { Sidebar } from "./sidebar"
import { TopBar } from "./topbar"
import { Footer } from "./footer"
import { cn } from "@/lib/utils"

interface AppLayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
  showFooter?: boolean
  hideNavbar?: boolean // Hide navbar when sidebar is shown (for dashboard-like pages)
  hideTopBar?: boolean // Hide topbar when custom header is used (e.g., DashboardHeader)
}

export function AppLayout({ children, showSidebar = false, showFooter = true, hideNavbar = false, hideTopBar = false }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col relative bg-background">
      {/* Show full navbar if not hidden */}
      {!hideNavbar && (
        <Navbar 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
          showMenuButton={showSidebar}
        />
      )}

      {/* Show compact topbar when sidebar is shown and navbar is hidden (unless custom header is used) */}
      {hideNavbar && showSidebar && !hideTopBar && (
        <div className="relative z-50">
          <TopBar />
        </div>
      )}

      <div className="flex flex-1 relative z-10 min-h-0">
        {showSidebar && (
          <>
            {/* Desktop sidebar */}
            <div className="hidden lg:block relative self-stretch">
              <Sidebar />
            </div>

            {/* Mobile sidebar */}
            {sidebarOpen && (
              <>
                <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
                <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
                  <Sidebar />
                </div>
              </>
            )}
          </>
        )}

        <main className={cn(
          "flex-1 relative z-10 flex flex-col",
          hideNavbar && showSidebar ? "bg-gradient-to-b from-background via-muted/20 to-background" : "bg-background"
        )}>
          {children}
        </main>
      </div>

      {showFooter && <Footer />}
    </div>
  )
}
