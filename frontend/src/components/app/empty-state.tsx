import type { LucideIcon } from "lucide-react"

import { TableCell, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  /** Optional button/link, e.g. "Add category" or "Try again". */
  action?: React.ReactNode
  /** Red icon tint for errors instead of the brand colour. */
  tone?: "default" | "error"
  className?: string
}

/**
 * "Nothing here" message: a softly floating icon + a title. Use the same component
 * everywhere and only change the icon and title, e.g.
 *   <EmptyState icon={Tags} title="No categories yet" />
 */
export function EmptyState({ icon: Icon, title, action, tone = "default", className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-4 py-14 text-center animate-in fade-in-0 zoom-in-95 duration-500",
        className
      )}
    >
      <span
        className={cn(
          "flex size-14 items-center justify-center rounded-2xl motion-safe:animate-float",
          tone === "error" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
        )}
      >
        <Icon className="size-6" />
      </span>
      <p className="mt-4 font-medium">{title}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/** The same message as a full-width table row, so the table header stays visible. */
export function TableEmptyRow({ colSpan, ...props }: EmptyStateProps & { colSpan: number }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="whitespace-normal">
        <EmptyState {...props} />
      </TableCell>
    </TableRow>
  )
}
