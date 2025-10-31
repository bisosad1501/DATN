"use client"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  label: string
  name: string
  type?: "text" | "email" | "password" | "number" | "textarea"
  placeholder?: string
  value: string | number | undefined
  onChange: (value: string) => void
  error?: string
  required?: boolean
  disabled?: boolean
  className?: string
  rows?: number
  autoComplete?: string
  autoFocus?: boolean
}

export function FormField({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required,
  disabled,
  className,
  rows = 4,
  autoComplete,
  autoFocus,
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false)
  const id = `field-${name}`
  const isPassword = type === "password"
  const inputType = isPassword && showPassword ? "text" : type

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {type === "textarea" ? (
        <Textarea
          id={id}
          name={name}
          placeholder={placeholder}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={rows}
          autoFocus={autoFocus}
          className={cn(error && "border-destructive focus-visible:ring-destructive")}
        />
      ) : (
        <div className="relative">
          <Input
            id={id}
            name={name}
            type={inputType}
            placeholder={placeholder}
            autoFocus={autoFocus}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            {...(autoComplete ? { autoComplete } : {})}
            className={cn(
              error && "border-destructive focus-visible:ring-destructive",
              isPassword && "pr-10"
            )}
          />
          {isPassword && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={disabled}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          )}
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
