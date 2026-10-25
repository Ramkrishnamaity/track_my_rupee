import { useId } from "react"

import { cn } from "@/lib/utils"

type LogoMarkProps = {
  className?: string
}

/** The square app icon: brand gradient tile with a rupee sign. */
export function LogoMark({ className }: LogoMarkProps) {
  const gradientId = useId()

  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className={cn("size-9 shrink-0", className)}>
      <defs>
        <linearGradient id={gradientId} x1="4" y1="2" x2="36" y2="38">
          <stop offset="0" stopColor="var(--brand-from)" />
          <stop offset="1" stopColor="var(--brand-to)" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill={`url(#${gradientId})`} />
      {/* Rising-trend accent behind the rupee */}
      <path
        d="M7 31.5 15 25l5 3.5 13-11"
        stroke="white"
        strokeOpacity="0.22"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* ₹ */}
      <path
        d="M13 10.5h14M13 16h14M13 10.5h4.5c3.6 0 6 2.4 6 5.5s-2.4 5.5-6 5.5H13l9.5 8"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

type LogoProps = {
  className?: string
  markClassName?: string
  /** Hide the "TrackMyRupee" text and show only the icon. */
  iconOnly?: boolean
}

/** Full logo: icon + "TrackMyRupee" wordmark. */
export function Logo({ className, markClassName, iconOnly }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={markClassName} />
      {iconOnly ? (
        <span className="sr-only">TrackMyRupee</span>
      ) : (
        <span className="text-lg font-semibold tracking-tight">
          Track<span className="text-muted-foreground">My</span>
          <span className="text-primary">Rupee</span>
        </span>
      )}
    </span>
  )
}
