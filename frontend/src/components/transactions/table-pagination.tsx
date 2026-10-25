import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type TablePaginationProps = {
  /** 1-based current page */
  page: number
  pageSize: number
  total: number
  pathname: string
  /** Other ?query values to keep in the links (month, type…). */
  query: Record<string, string>
}

/** Page numbers to show, with "…" gaps: 1 … 4 5 6 … 12 */
function pageList(page: number, pageCount: number): (number | "gap")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1)
  const pages = new Set([1, pageCount, page - 1, page, page + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b)
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ["gap" as const, p] : [p]))
}

/**
 * "Showing 1–10 of 48" + Prev / page numbers / Next.
 * Pages are links (?page=N), so they work without client JS. The backend will
 * later supply `total` and the rows for the requested page.
 */
export function TablePagination({ page, pageSize, total, pathname, query }: TablePaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  if (total === 0) return null

  const href = (p: number) => {
    const params = new URLSearchParams(query)
    if (p > 1) params.set("page", String(p))
    else params.delete("page")
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t px-1 pt-4 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">
          {from}–{to}
        </span>{" "}
        of <span className="font-medium text-foreground">{total}</span>
      </p>

      {pageCount > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-1">
          <PageLink href={href(page - 1)} disabled={page <= 1} label="Previous page">
            <ChevronLeft />
          </PageLink>
          {pageList(page, pageCount).map((p, i) =>
            p === "gap" ? (
              <span key={`gap-${i}`} className="px-1.5 text-muted-foreground">
                …
              </span>
            ) : (
              <PageLink key={p} href={href(p)} active={p === page} label={`Page ${p}`}>
                {p}
              </PageLink>
            )
          )}
          <PageLink href={href(page + 1)} disabled={page >= pageCount} label="Next page">
            <ChevronRight />
          </PageLink>
        </nav>
      )}
    </div>
  )
}

function PageLink({
  href,
  active,
  disabled,
  label,
  children,
}: {
  href: string
  active?: boolean
  disabled?: boolean
  label: string
  children: React.ReactNode
}) {
  const className = cn("size-9 rounded-lg", active && "pointer-events-none")
  if (disabled) {
    return (
      <Button variant="ghost" size="icon" disabled aria-label={label} className={className}>
        {children}
      </Button>
    )
  }
  return (
    <Button
      asChild
      variant={active ? "secondary" : "ghost"}
      size="icon"
      className={cn(className, active && "bg-primary/10 font-semibold text-primary")}
    >
      <Link href={href} aria-label={label} aria-current={active ? "page" : undefined} scroll={false}>
        {children}
      </Link>
    </Button>
  )
}
