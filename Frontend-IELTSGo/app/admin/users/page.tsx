"use client"

import { useState, useEffect } from "react"
import { UserTable } from "@/components/admin/user-table"
import { UserFilters } from "@/components/admin/user-filters"
import { UserFormModal } from "@/components/admin/user-form-modal"
import { Button } from "@/components/ui/button"
import { Plus, Download } from "lucide-react"
import { adminApi } from "@/lib/api/admin"
import type { User } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { useTranslations } from '@/lib/i18n'

export default function AdminUsersPage() {

  const t = useTranslations('common')

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
        title: t('error'),
        description: t('failed_to_load_users'),
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
    if (!confirm(t('are_you_sure_delete_user'))) return

    try {
      await adminApi.deleteUser(userId)
      toast({
        title: t('success'),
        description: t('user_deleted_successfully'),
      })
      fetchUsers()
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failed_to_delete_user'),
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (userId: string, status: "active" | "suspended") => {
    try {
      await adminApi.updateUser(userId, { status })
      toast({
        title: t('success'),
        description: status === "active" ? t('user_activated_successfully') : t('user_suspended_successfully'),
      })
      fetchUsers()
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failed_to_update_user_status'),
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (data: Partial<User>) => {
    try {
      if (editingUser) {
        await adminApi.updateUser(editingUser.id, data)
        toast({
          title: t('success'),
          description: t('user_updated_successfully'),
        })
      } else {
        await adminApi.createUser(data)
        toast({
          title: t('success'),
          description: t('user_created_successfully'),
        })
      }
      setModalOpen(false)
      setEditingUser(null)
      fetchUsers()
    } catch (error) {
      toast({
        title: t('error'),
        description: editingUser ? t('failed_to_update_user') : t('failed_to_create_user'),
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('user_management')}</h1>
          <p className="text-muted-foreground mt-1">{t('manage_all_users_in_the_system')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {t('export')}
          </Button>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('add_user')}
          </Button>
        </div>
      </div>

      <UserFilters filters={filters} onFilterChange={handleFilterChange} onReset={handleResetFilters} />

      {loading ? (
        <div className="text-center py-12">{t('loading')}</div>
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
  )
}
