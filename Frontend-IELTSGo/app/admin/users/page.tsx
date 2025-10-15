"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { UserTable } from "@/components/admin/user-table"
import { UserFilters } from "@/components/admin/user-filters"
import { UserFormModal } from "@/components/admin/user-form-modal"
import { Button } from "@/components/ui/button"
import { Plus, Download } from "lucide-react"
import { adminApi } from "@/lib/api/admin"
import type { User } from "@/types"
import { useToast } from "@/hooks/use-toast"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    status: "all",
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [filters])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await adminApi.getUsers(filters)
      setUsers(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error("Failed to fetch users:", error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value })
  }

  const handleResetFilters = () => {
    setFilters({ search: "", role: "all", status: "all" })
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setModalOpen(true)
  }

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      await adminApi.deleteUser(userId)
      toast({
        title: "Success",
        description: "User deleted successfully",
      })
      fetchUsers()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (userId: string, status: "active" | "suspended") => {
    try {
      await adminApi.updateUser(userId, { status })
      toast({
        title: "Success",
        description: `User ${status === "active" ? "activated" : "suspended"} successfully`,
      })
      fetchUsers()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (data: Partial<User>) => {
    try {
      if (editingUser) {
        await adminApi.updateUser(editingUser.id, data)
        toast({
          title: "Success",
          description: "User updated successfully",
        })
      } else {
        await adminApi.createUser(data)
        toast({
          title: "Success",
          description: "User created successfully",
        })
      }
      setModalOpen(false)
      setEditingUser(null)
      fetchUsers()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingUser ? "update" : "create"} user`,
        variant: "destructive",
      })
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage all users in the system</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        <UserFilters filters={filters} onFilterChange={handleFilterChange} onReset={handleResetFilters} />

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <UserTable users={users} onEdit={handleEdit} onDelete={handleDelete} onToggleStatus={handleToggleStatus} />
        )}

        <UserFormModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setEditingUser(null)
          }}
          onSubmit={handleSubmit}
          user={editingUser}
        />
      </div>
    </AdminLayout>
  )
}
