import type React from "react"
import { RoleProtectedRoute } from "@/components/auth/role-protected-route"
import { AdminLayout } from "@/components/admin/admin-layout"

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleProtectedRoute allowedRoles={["admin"]}>
      <AdminLayout>{children}</AdminLayout>
    </RoleProtectedRoute>
  )
}
