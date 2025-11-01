"use client"

import type React from "react"

import { useState } from "react"
import { Navbar } from "./navbar"
import { Sidebar } from "./sidebar"
import { Footer } from "./footer"
import { cn } from "@/lib/utils"

interface AppLayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
  showFooter?: boolean
  hideNavbar?: boolean // Hide navbar when sidebar is shown (for dashboard-like pages)
}

export function AppLayout({ children, showSidebar = false, showFooter = true, hideNavbar = false }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col relative bg-background">
      {/* Only show navbar if not hidden */}
      {!hideNavbar && (
        <Navbar 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
          showMenuButton={showSidebar}
        />
      )}

      <div className="flex flex-1 relative z-10">
        {showSidebar && (
          <>
            {/* Desktop sidebar */}
            <div className="hidden lg:block">
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
          "flex-1 relative z-10",
          hideNavbar && showSidebar ? "bg-muted/30" : "bg-background"
        )}>
          {children}
        </main>
      </div>

      {showFooter && <Footer />}
    </div>
  )
}
