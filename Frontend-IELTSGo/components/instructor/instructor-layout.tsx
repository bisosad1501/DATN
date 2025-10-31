import type { ReactNode } from "react"
import { InstructorNavbar } from "./instructor-navbar"

interface InstructorLayoutProps {
  children: ReactNode
}

export function InstructorLayout({ children }: InstructorLayoutProps) {
  return (
    <div className="min-h-screen relative">
      <InstructorNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">{children}</main>
    </div>
  )
}
