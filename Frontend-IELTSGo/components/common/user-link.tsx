"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface UserLinkProps {
  userId: string
  name: string
  avatarUrl?: string | null
  className?: string
  showAvatar?: boolean
  avatarSize?: "sm" | "md" | "lg"
}

export function UserLink({ 
  userId, 
  name, 
  avatarUrl, 
  className,
  showAvatar = false,
  avatarSize = "md"
}: UserLinkProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  }

  return (
    <Link 
      href={`/users/${userId}`}
      className={cn(
        "inline-flex items-center gap-2 hover:opacity-80 transition-opacity",
        className
      )}
    >
      {showAvatar && (
        <Avatar className={sizeClasses[avatarSize]}>
          <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={name} />
          <AvatarFallback>
            {name
              .split(" ")
              .map(word => word[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      <span className="font-medium hover:underline cursor-pointer">{name}</span>
    </Link>
  )
}

