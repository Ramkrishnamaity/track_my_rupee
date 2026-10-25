"use client"

import { Button } from "@/components/ui/button"
import { GoogleIcon } from "@/components/icons/google-icon"
import { env } from "@/config/env"
import { cn } from "@/lib/utils"

type GoogleSignInButtonProps = {
  className?: string
  size?: "default" | "lg"
  label?: string
  /** Phones: a round icon-only button (label kept for screen readers); sm and up: icon + label. */
  compact?: boolean
}

const LOGIN_URL = `${env.API_URL}/auth/google`

/**
 * Starts Google login on the backend, which redirects to Google and back.
 * Sends the browser's time zone so day/month totals use the user's clock.
 */
export function GoogleSignInButton({
  className,
  size = "default",
  label = "Continue with Google",
  compact = false,
}: GoogleSignInButtonProps) {
  // Add the time zone to the link just before the browser follows it.
  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    event.currentTarget.href = `${LOGIN_URL}?tz=${encodeURIComponent(tz)}`
  }

  return (
    <Button
      asChild
      variant="outline"
      size={size}
      className={cn(
        "gap-2.5 rounded-full bg-card font-medium shadow-sm",
        size === "lg" ? "h-12 px-6 text-base" : "px-4",
        compact && "w-9 px-0 sm:w-auto sm:px-4",
        className
      )}
    >
      {/* Plain link as a fallback if JavaScript hasn't loaded yet. */}
      <a href={LOGIN_URL} onClick={handleClick} aria-label={compact ? label : undefined}>
        <GoogleIcon className={size === "lg" ? "size-5" : undefined} />
        {compact ? <span className="hidden sm:inline">{label}</span> : label}
      </a>
    </Button>
  )
}
