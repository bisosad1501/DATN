"use client"

import { useState } from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CourseFilters } from "@/lib/api/courses"

interface CourseFiltersProps {
  filters: CourseFilters
  onFiltersChange: (filters: CourseFilters) => void
  onSearch: (search: string) => void
}

const SKILL_OPTIONS = [
  { value: "listening", label: "Listening" },
  { value: "reading", label: "Reading" },
  { value: "writing", label: "Writing" },
  { value: "speaking", label: "Speaking" },
  { value: "general", label: "General" },
]

const LEVEL_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
]

const ENROLLMENT_TYPE_OPTIONS = [
  { value: "free", label: "Free" },
  { value: "premium", label: "Premium" },
]

export function CourseFiltersComponent({ filters, onFiltersChange, onSearch }: CourseFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || "")
  const [isOpen, setIsOpen] = useState(false)

  const handleSkillChange = (skill: string) => {
    // Backend uses single skill_type, not array
    onFiltersChange({ ...filters, skill_type: filters.skill_type === skill ? undefined : skill })
  }

  const handleLevelChange = (level: string) => {
    // Backend uses single level, not array
    onFiltersChange({ ...filters, level: filters.level === level ? undefined : level })
  }
  
  const handleEnrollmentTypeChange = (type: string) => {
    onFiltersChange({ ...filters, enrollment_type: filters.enrollment_type === type ? undefined : type })
  }

  const handleClearFilters = () => {
    onFiltersChange({})
    setSearchValue("")
    onSearch("")
  }

  const activeFilterCount =
    (filters.skill_type ? 1 : 0) + (filters.level ? 1 : 0) + (filters.enrollment_type ? 1 : 0) + (filters.is_featured ? 1 : 0)

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSearch(searchValue)
              }
            }}
            className="pl-10"
          />
        </div>
        <Button onClick={() => onSearch(searchValue)}>Search</Button>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative bg-transparent">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Courses</SheetTitle>
              <SheetDescription>Refine your search with these filters</SheetDescription>
            </SheetHeader>

            <div className="space-y-6 mt-6">
              <div>
                <Label className="text-base font-semibold mb-3 block">Skill Type</Label>
                <div className="space-y-2">
                  {SKILL_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`skill-${option.value}`}
                        checked={filters.skill_type === option.value}
                        onCheckedChange={() => handleSkillChange(option.value)}
                      />
                      <label
                        htmlFor={`skill-${option.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">Level</Label>
                <div className="space-y-2">
                  {LEVEL_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`level-${option.value}`}
                        checked={filters.level === option.value}
                        onCheckedChange={() => handleLevelChange(option.value)}
                      />
                      <label
                        htmlFor={`level-${option.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">Enrollment Type</Label>
                <div className="space-y-2">
                  {ENROLLMENT_TYPE_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`enrollment-${option.value}`}
                        checked={filters.enrollment_type === option.value}
                        onCheckedChange={() => handleEnrollmentTypeChange(option.value)}
                      />
                      <label
                        htmlFor={`enrollment-${option.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={filters.is_featured || false}
                  onCheckedChange={(checked) => onFiltersChange({ ...filters, is_featured: checked as boolean })}
                />
                <label htmlFor="featured" className="text-sm font-medium cursor-pointer">
                  Featured courses only
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={handleClearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
                <Button className="flex-1" onClick={() => setIsOpen(false)}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {filters.skill_type && (
            <Badge variant="secondary" className="gap-1">
              {SKILL_OPTIONS.find((s) => s.value === filters.skill_type)?.label}
              <X className="w-3 h-3 cursor-pointer" onClick={() => handleSkillChange(filters.skill_type!)} />
            </Badge>
          )}
          {filters.level && (
            <Badge variant="secondary" className="gap-1">
              {LEVEL_OPTIONS.find((l) => l.value === filters.level)?.label}
              <X className="w-3 h-3 cursor-pointer" onClick={() => handleLevelChange(filters.level!)} />
            </Badge>
          )}
          {filters.enrollment_type && (
            <Badge variant="secondary" className="gap-1">
              {ENROLLMENT_TYPE_OPTIONS.find((e) => e.value === filters.enrollment_type)?.label}
              <X className="w-3 h-3 cursor-pointer" onClick={() => handleEnrollmentTypeChange(filters.enrollment_type!)} />
            </Badge>
          )}
          {filters.is_featured && (
            <Badge variant="secondary" className="gap-1">
              Featured
              <X className="w-3 h-3 cursor-pointer" onClick={() => onFiltersChange({ ...filters, is_featured: false })} />
            </Badge>
          )}
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-7">
              Clear all
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
