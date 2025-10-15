"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

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
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          className="pl-10"
        />
      </div>

      <Select value={filters.role} onValueChange={(value) => onFilterChange("role", value)}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="All Roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="student">Student</SelectItem>
          <SelectItem value="instructor">Instructor</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.status} onValueChange={(value) => onFilterChange("status", value)}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="suspended">Suspended</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={onReset}>
        <X className="w-4 h-4 mr-2" />
        Reset
      </Button>
    </div>
  )
}
