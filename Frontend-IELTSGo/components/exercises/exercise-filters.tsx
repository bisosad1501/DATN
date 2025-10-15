"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Search } from "lucide-react"
import type { ExerciseFilters } from "@/lib/api/exercises"

interface ExerciseFiltersProps {
  filters: ExerciseFilters
  onFiltersChange: (filters: ExerciseFilters) => void
  onSearch: (search: string) => void
}

export function ExerciseFiltersComponent({ filters, onFiltersChange, onSearch }: ExerciseFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || "")
  const [localFilters, setLocalFilters] = useState<ExerciseFilters>(filters)

  const skills = ["Listening", "Reading", "Writing", "Speaking"]
  const types = ["Multiple Choice", "Fill in Blanks", "True/False", "Matching", "Essay"]
  const difficulties = ["Beginner", "Intermediate", "Advanced"]

  const handleCheckboxChange = (category: keyof ExerciseFilters, value: string) => {
    const currentValues = (localFilters[category] as string[]) || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value]

    const newFilters = { ...localFilters, [category]: newValues }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchValue)
  }

  const handleSortChange = (sort: string) => {
    const newFilters = { ...localFilters, sort: sort as ExerciseFilters["sort"] }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    setLocalFilters({})
    setSearchValue("")
    onFiltersChange({})
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search exercises..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>

        <div className="flex gap-2">
          <Select value={localFilters.sort || "newest"} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="difficulty">Difficulty</SelectItem>
            </SelectContent>
          </Select>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="bg-transparent">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Exercises</SheetTitle>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                <div>
                  <Label className="text-base font-semibold mb-3 block">Skills</Label>
                  <div className="space-y-2">
                    {skills.map((skill) => (
                      <div key={skill} className="flex items-center space-x-2">
                        <Checkbox
                          id={`skill-${skill}`}
                          checked={localFilters.skill?.includes(skill)}
                          onCheckedChange={() => handleCheckboxChange("skill", skill)}
                        />
                        <label htmlFor={`skill-${skill}`} className="text-sm cursor-pointer">
                          {skill}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-3 block">Exercise Type</Label>
                  <div className="space-y-2">
                    {types.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={localFilters.type?.includes(type)}
                          onCheckedChange={() => handleCheckboxChange("type", type)}
                        />
                        <label htmlFor={`type-${type}`} className="text-sm cursor-pointer">
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-3 block">Difficulty</Label>
                  <div className="space-y-2">
                    {difficulties.map((difficulty) => (
                      <div key={difficulty} className="flex items-center space-x-2">
                        <Checkbox
                          id={`difficulty-${difficulty}`}
                          checked={localFilters.difficulty?.includes(difficulty)}
                          onCheckedChange={() => handleCheckboxChange("difficulty", difficulty)}
                        />
                        <label htmlFor={`difficulty-${difficulty}`} className="text-sm cursor-pointer">
                          {difficulty}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button variant="outline" onClick={clearFilters} className="w-full bg-transparent">
                  Clear All Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
}
