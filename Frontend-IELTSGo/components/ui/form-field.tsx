"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
}: FormFieldProps) {
  const id = `field-${name}`

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
          className={cn(error && "border-destructive focus-visible:ring-destructive")}
        />
      ) : (
        <Input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          {...(autoComplete ? { autoComplete } : {})}
          className={cn(error && "border-destructive focus-visible:ring-destructive")}
        />
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
