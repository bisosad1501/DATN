import type React from "react"
import { RoleProtectedRoute } from "@/components/auth/role-protected-route"
import { InstructorLayout } from "@/components/instructor/instructor-layout"

export default function InstructorLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleProtectedRoute allowedRoles={["instructor", "admin"]}>
      <InstructorLayout>{children}</InstructorLayout>
    </RoleProtectedRoute>
  )
}
