"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { useTranslations } from '@/lib/i18n'

interface UserFiltersProps {
  filters: {
    search: string
    role: string
    status: string
  }
  onFilterChange: (key: string, value: string) => void
  onReset: () => void
}

export function UserFilters({ filters, onFilterChange, onReset }: UserFiltersProps) {

  const t = useTranslations('common')

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t('search_by_name_or_email')}
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          className="pl-10"
        />
      </div>

      <Select value={filters.role} onValueChange={(value) => onFilterChange("role", value)}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder={t('all_roles')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('all_roles')}</SelectItem>
          <SelectItem value="student">{t('student')}</SelectItem>
          <SelectItem value="instructor">{t('instructor')}</SelectItem>
          <SelectItem value="admin">{t('admin')}</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.status} onValueChange={(value) => onFilterChange("status", value)}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder={t('all_status')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('all_status')}</SelectItem>
          <SelectItem value="active">{t('active')}</SelectItem>
          <SelectItem value="suspended">{t('suspended')}</SelectItem>
          <SelectItem value="pending">{t('pending')}</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={onReset}>
        <X className="w-4 h-4 mr-2" />
        {t('reset')}
      </Button>
    </div>
  )
}
