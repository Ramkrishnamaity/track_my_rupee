import { LoaderCircle } from "lucide-react"

import { cn } from "@/lib/utils"

/** Small spinning circle for "working…" states (buttons, switches, inline). */
export function Spinner({ className }: { className?: string }) {
  return (
    <LoaderCircle
      role="status"
      aria-label="Loading"
      className={cn("size-4 shrink-0 animate-spin", className)}
    />
  )
}
