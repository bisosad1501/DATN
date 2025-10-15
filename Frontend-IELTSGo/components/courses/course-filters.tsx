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
  { value: "LISTENING", label: "Listening" },
  { value: "READING", label: "Reading" },
  { value: "WRITING", label: "Writing" },
  { value: "SPEAKING", label: "Speaking" },
]

const LEVEL_OPTIONS = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
]

const DURATION_OPTIONS = [
  { value: "short", label: "Short (< 2 hours)" },
  { value: "medium", label: "Medium (2-5 hours)" },
  { value: "long", label: "Long (> 5 hours)" },
]

const PRICE_OPTIONS = [
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
]

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Highest Rated" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
]

export function CourseFiltersComponent({ filters, onFiltersChange, onSearch }: CourseFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || "")
  const [isOpen, setIsOpen] = useState(false)

  const handleSkillToggle = (skill: string) => {
    const currentSkills = filters.skill || []
    const newSkills = currentSkills.includes(skill)
      ? currentSkills.filter((s) => s !== skill)
      : [...currentSkills, skill]
    onFiltersChange({ ...filters, skill: newSkills })
  }

  const handleLevelToggle = (level: string) => {
    const currentLevels = filters.level || []
    const newLevels = currentLevels.includes(level)
      ? currentLevels.filter((l) => l !== level)
      : [...currentLevels, level]
    onFiltersChange({ ...filters, level: newLevels })
  }

  const handleClearFilters = () => {
    onFiltersChange({})
    setSearchValue("")
    onSearch("")
  }

  const activeFilterCount =
    (filters.skill?.length || 0) + (filters.level?.length || 0) + (filters.duration ? 1 : 0) + (filters.price ? 1 : 0)

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
                        checked={filters.skill?.includes(option.value)}
                        onCheckedChange={() => handleSkillToggle(option.value)}
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
                        checked={filters.level?.includes(option.value)}
                        onCheckedChange={() => handleLevelToggle(option.value)}
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
                <Label className="text-base font-semibold mb-3 block">Duration</Label>
                <Select
                  value={filters.duration}
                  onValueChange={(value) => onFiltersChange({ ...filters, duration: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">Price</Label>
                <Select value={filters.price} onValueChange={(value) => onFiltersChange({ ...filters, price: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select price" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
          {filters.skill?.map((skill) => (
            <Badge key={skill} variant="secondary" className="gap-1">
              {SKILL_OPTIONS.find((s) => s.value === skill)?.label}
              <X className="w-3 h-3 cursor-pointer" onClick={() => handleSkillToggle(skill)} />
            </Badge>
          ))}
          {filters.level?.map((level) => (
            <Badge key={level} variant="secondary" className="gap-1">
              {LEVEL_OPTIONS.find((l) => l.value === level)?.label}
              <X className="w-3 h-3 cursor-pointer" onClick={() => handleLevelToggle(level)} />
            </Badge>
          ))}
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-7">
              Clear all
            </Button>
          )}
        </div>

        <Select value={filters.sort} onValueChange={(value: any) => onFiltersChange({ ...filters, sort: value })}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
