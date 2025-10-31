"use client"

import { useState, useEffect } from "react"
import { Search, X, Filter, Check, GraduationCap, Link2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { ExerciseFilters } from "@/lib/api/exercises"

interface ExerciseFiltersProps {
  filters: ExerciseFilters
  onFiltersChange: (filters: ExerciseFilters) => void
  onSearch: (search: string) => void
}

const SKILL_OPTIONS = [
  { value: "listening", label: "Listening", color: "bg-blue-500" },
  { value: "reading", label: "Reading", color: "bg-green-500" },
  { value: "writing", label: "Writing", color: "bg-orange-500" },
  { value: "speaking", label: "Speaking", color: "bg-purple-500" },
]

const TYPE_OPTIONS = [
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "fill_in_blanks", label: "Fill in Blanks" },
  { value: "true_false", label: "True/False" },
  { value: "matching", label: "Matching" },
  { value: "essay", label: "Essay" },
]

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy", color: "bg-emerald-500" },
  { value: "medium", label: "Medium", color: "bg-yellow-500" },
  { value: "hard", label: "Hard", color: "bg-red-500" },
]

export function ExerciseFiltersComponent({ filters, onFiltersChange, onSearch }: ExerciseFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || "")
  const [isOpen, setIsOpen] = useState(false)

  // Sync searchValue when filters.search changes externally
  useEffect(() => {
    setSearchValue(filters.search || "")
  }, [filters.search])

  const handleSkillChange = (skill: string) => {
    const currentSkills = filters.skill || []
    const newSkills = currentSkills.includes(skill)
      ? currentSkills.filter((s) => s !== skill)
      : [...currentSkills, skill]
    onFiltersChange({ ...filters, skill: newSkills.length > 0 ? newSkills : undefined })
  }

  const handleTypeChange = (type: string) => {
    const currentTypes = filters.type || []
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type]
    onFiltersChange({ ...filters, type: newTypes.length > 0 ? newTypes : undefined })
  }

  const handleDifficultyChange = (difficulty: string) => {
    const currentDifficulties = filters.difficulty || []
    const newDifficulties = currentDifficulties.includes(difficulty)
      ? currentDifficulties.filter((d) => d !== difficulty)
      : [...currentDifficulties, difficulty]
    onFiltersChange({ ...filters, difficulty: newDifficulties.length > 0 ? newDifficulties : undefined })
  }

  const handleClearFilters = () => {
    // Clear search first
    setSearchValue("")
    onSearch("")
    // Then clear all other filters
    onFiltersChange({
      search: undefined,
      skill: undefined,
      type: undefined,
      difficulty: undefined,
      sort: undefined,
    })
    // Close sheet if open
    if (isOpen) {
      setIsOpen(false)
    }
  }

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    (filters.skill?.length || 0) + 
    (filters.type?.length || 0) + 
    (filters.difficulty?.length || 0)

  return (
    <div className="space-y-5">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            placeholder="Search exercises by title or keyword..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSearch(searchValue)
              }
            }}
            className="pl-12 h-12 text-base border-2 focus:border-primary transition-all shadow-sm"
          />
        </div>
        <Button 
          onClick={() => onSearch(searchValue)} 
          className="h-12 px-8 text-base font-medium shadow-md hover:shadow-lg transition-shadow"
        >
          Search
        </Button>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              className="relative h-12 px-5 border-2 hover:border-primary transition-all shadow-sm"
            >
              <Filter className="w-4 h-4 mr-2" />
              <span className="font-medium">Filters</span>
              {activeFilterCount > 0 && (
                <Badge
                  className="absolute -top-2 -right-2 w-6 h-6 p-0 flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground shadow-md"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
            <div className="sticky top-0 bg-background z-10 border-b px-6 py-5 shadow-sm">
              <SheetHeader>
                <SheetTitle className="text-2xl font-bold tracking-tight">Filter Exercises</SheetTitle>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Narrow down your search to find the perfect exercise
                </p>
                <p className="text-xs text-muted-foreground mt-2 italic">
                  Tip: Select multiple options in the same category for "OR" logic (e.g., Listening OR Reading). Different categories use "AND" logic.
                </p>
              </SheetHeader>
            </div>

            <div className="px-6 py-6 space-y-8">
              {/* Skill Type */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold text-foreground">Skill Type</Label>
                  <p className="text-xs text-muted-foreground mt-1">Select one or more (OR logic)</p>
                </div>
                <div className="space-y-2.5">
                  {SKILL_OPTIONS.map((option) => {
                    const isSelected = filters.skill?.includes(option.value) || false
                    return (
                      <label
                        key={option.value}
                        htmlFor={`skill-${option.value}`}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                          "hover:bg-muted/50 hover:border-primary/30",
                          isSelected && "bg-primary/5 border-primary shadow-sm"
                        )}
                      >
                        <Checkbox
                          id={`skill-${option.value}`}
                          checked={isSelected}
                          onCheckedChange={() => handleSkillChange(option.value)}
                          className="w-5 h-5"
                        />
                        <span className={`w-3 h-3 rounded-full ${option.color} shadow-sm`}></span>
                        <span className={cn(
                          "flex-1 text-sm font-medium transition-colors",
                          isSelected && "text-primary"
                        )}>
                          {option.label}
                        </span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </label>
                    )
                  })}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Exercise Type */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold text-foreground">Exercise Type</Label>
                  <p className="text-xs text-muted-foreground mt-1">Select one or more (OR logic)</p>
                </div>
                <div className="space-y-2.5">
                  {TYPE_OPTIONS.map((option) => {
                    const isSelected = filters.type?.includes(option.value) || false
                    return (
                      <label
                        key={option.value}
                        htmlFor={`type-${option.value}`}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                          "hover:bg-muted/50 hover:border-primary/30",
                          isSelected && "bg-primary/5 border-primary shadow-sm"
                        )}
                      >
                        <Checkbox
                          id={`type-${option.value}`}
                          checked={isSelected}
                          onCheckedChange={() => handleTypeChange(option.value)}
                          className="w-5 h-5"
                        />
                        <span className={cn(
                          "flex-1 text-sm font-medium transition-colors",
                          isSelected && "text-primary"
                        )}>
                          {option.label}
                        </span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </label>
                    )
                  })}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Difficulty */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold text-foreground">Difficulty</Label>
                  <p className="text-xs text-muted-foreground mt-1">Select one or more (OR logic)</p>
                </div>
                <div className="space-y-2.5">
                  {DIFFICULTY_OPTIONS.map((option) => {
                    const isSelected = filters.difficulty?.includes(option.value) || false
                    return (
                      <label
                        key={option.value}
                        htmlFor={`difficulty-${option.value}`}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                          "hover:bg-muted/50 hover:border-primary/30",
                          isSelected && "bg-primary/5 border-primary shadow-sm"
                        )}
                      >
                        <Checkbox
                          id={`difficulty-${option.value}`}
                          checked={isSelected}
                          onCheckedChange={() => handleDifficultyChange(option.value)}
                          className="w-5 h-5"
                        />
                        <span className={`w-3 h-3 rounded-full ${option.color} shadow-sm`}></span>
                        <span className={cn(
                          "flex-1 text-sm font-medium transition-colors",
                          isSelected && "text-primary"
                        )}>
                          {option.label}
                        </span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-background border-t px-6 py-4 shadow-lg">
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 h-11 font-medium" 
                  onClick={handleClearFilters}
                  disabled={activeFilterCount === 0}
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
                <Button 
                  className="flex-1 h-11 font-medium shadow-md hover:shadow-lg transition-shadow" 
                  onClick={() => setIsOpen(false)}
                >
                  Apply Filters
                  {activeFilterCount > 0 && (
                    <Badge className="ml-2 bg-primary-foreground text-primary">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap py-2">
          <span className="text-sm font-medium text-muted-foreground mr-1">Active filters:</span>
          {filters.search && (
            <Badge 
              variant="secondary" 
              className="gap-1.5 px-3 py-1.5 text-sm font-medium border shadow-sm hover:shadow-md transition-shadow"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="max-w-[150px] truncate">{filters.search}</span>
              <button
                onClick={() => {
                  setSearchValue("")
                  onSearch("")
                }}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
                aria-label="Remove search filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </Badge>
          )}
          {filters.skill?.map((skill) => {
            const option = SKILL_OPTIONS.find((s) => s.value === skill)
            return option ? (
              <Badge 
                key={skill}
                variant="secondary" 
                className="gap-1.5 px-3 py-1.5 text-sm font-medium border shadow-sm hover:shadow-md transition-shadow"
              >
                <span className={`w-2.5 h-2.5 rounded-full ${option.color} shadow-sm`}></span>
                {option.label}
                <button
                  onClick={() => handleSkillChange(skill)}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
                  aria-label="Remove skill filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </Badge>
            ) : null
          })}
          {filters.type?.map((type) => {
            const option = TYPE_OPTIONS.find((t) => t.value === type)
            return option ? (
              <Badge 
                key={type}
                variant="secondary" 
                className="gap-1.5 px-3 py-1.5 text-sm font-medium border shadow-sm hover:shadow-md transition-shadow"
              >
                {option.label}
                <button
                  onClick={() => handleTypeChange(type)}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
                  aria-label="Remove type filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </Badge>
            ) : null
          })}
          {filters.difficulty?.map((difficulty) => {
            const option = DIFFICULTY_OPTIONS.find((d) => d.value === difficulty)
            return option ? (
              <Badge 
                key={difficulty}
                variant="secondary" 
                className="gap-1.5 px-3 py-1.5 text-sm font-medium border shadow-sm hover:shadow-md transition-shadow"
              >
                <span className={`w-2.5 h-2.5 rounded-full ${option.color} shadow-sm`}></span>
                {option.label}
                <button
                  onClick={() => handleDifficultyChange(difficulty)}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
                  aria-label="Remove difficulty filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </Badge>
            ) : null
          })}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearFilters} 
            className="h-8 px-3 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <X className="w-3.5 h-3.5 mr-1.5" />
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
