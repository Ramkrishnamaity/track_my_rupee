"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

import { useCurrentUser } from "@/components/app/user-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logout as logoutApi } from "@/api/auth.apis"
import { initials } from "@/lib/user"
import { cn } from "@/lib/utils"

/** The user's Google photo, or their initials when there is none. */
export function UserAvatar({
  className,
  fallbackClassName,
}: {
  className?: string
  /** e.g. a bigger text size for large avatars */
  fallbackClassName?: string
}) {
  const user = useCurrentUser()

  return (
    <Avatar className={className}>
      {user.avatarUrl && (
        // no-referrer: Google photo URLs can refuse requests that send a Referer
        <AvatarImage src={user.avatarUrl} alt={user.name} referrerPolicy="no-referrer" />
      )}
      <AvatarFallback
        className={cn(
          "bg-linear-to-br from-brand-from to-brand-to font-semibold text-white",
          fallbackClassName
        )}
      >
        {initials(user.name)}
      </AvatarFallback>
    </Avatar>
  )
}

export function UserMenu() {
  const user = useCurrentUser()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  async function logout() {
    setLoggingOut(true)
    try {
      await logoutApi()
    } finally {
      // Go home and drop any cached logged-in pages.
      router.replace("/")
      router.refresh()
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-label="Open account menu"
      >
        <UserAvatar className="size-9" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="font-medium text-foreground">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" disabled={loggingOut} onSelect={logout}>
          <LogOut /> {loggingOut ? "Logging out…" : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
