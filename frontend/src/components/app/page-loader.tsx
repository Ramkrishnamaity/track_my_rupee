import { LogoMark } from "@/components/brand/logo"
import { TableCell, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

/**
 * Loader for a whole page or a section (e.g. a table reloading after a filter).
 * Brand mark with a spinning ring around it.
 */
export function PageLoader({ label = "Loading…", className }: { label?: string; className?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex min-h-[50vh] flex-col items-center justify-center gap-4 animate-in fade-in-0 duration-300",
        className
      )}
    >
      <div className="relative flex size-16 items-center justify-center">
        <span className="absolute inset-0 rounded-full border-[3px] border-primary/15" />
        <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-primary" />
        <LogoMark className="size-8" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

/** The same loader as a full-width table row, so the table header stays visible. */
export function TableLoaderRow({ colSpan, label }: { colSpan: number; label?: string }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="whitespace-normal">
        <PageLoader label={label} className="min-h-0 py-14" />
      </TableCell>
    </TableRow>
  )
}
