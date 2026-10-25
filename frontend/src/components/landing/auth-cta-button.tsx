import Link from "next/link"
import { ArrowRight, LayoutDashboard } from "lucide-react"

import { Button } from "@/components/ui/button"
import { GoogleSignInButton } from "@/components/landing/google-sign-in-button"
import { cn } from "@/lib/utils"

type AuthCtaButtonProps = {
  /** From getCurrentUser() on the home page. */
  loggedIn: boolean
  className?: string
  size?: "default" | "lg"
  /** Label for visitors, e.g. "Login with Google" */
  label?: string
  /** Label for logged-in users */
  dashboardLabel?: string
  /** Phones: a round icon-only button (label kept for screen readers); sm and up: icon + label. */
  compact?: boolean
}

/** Visitors see "Continue with Google"; logged-in users see "Go to dashboard". */
export function AuthCtaButton({
  loggedIn,
  className,
  size = "default",
  label,
  dashboardLabel = "Go to dashboard",
  compact = false,
}: AuthCtaButtonProps) {
  if (!loggedIn)
    return <GoogleSignInButton className={className} size={size} label={label} compact={compact} />

  return (
    <Button
      asChild
      size={size}
      className={cn(
        "gap-2 rounded-full font-medium shadow-sm",
        size === "lg" ? "h-12 px-6 text-base" : "px-4",
        compact && "w-9 px-0 sm:w-auto sm:px-4",
        className
      )}
    >
      <Link href="/dashboard" aria-label={compact ? dashboardLabel : undefined}>
        <LayoutDashboard className={size === "lg" ? "size-5" : undefined} />
        {compact ? <span className="hidden sm:inline">{dashboardLabel}</span> : dashboardLabel}
        {size === "lg" && <ArrowRight />}
      </Link>
    </Button>
  )
}
