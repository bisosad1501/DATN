"use client"

import type React from "react"

import { AdminSidebar } from "./admin-sidebar"
import { AdminHeader } from "./admin-header"

interface AdminLayoutProps {
  children: React.ReactNode
  breadcrumbs?: { label: string; href?: string }[]
}

export function AdminLayout({ children, breadcrumbs }: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-accent">
      <AdminSidebar />
      <div className="flex-1 ml-72 flex flex-col">
        <AdminHeader breadcrumbs={breadcrumbs} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
