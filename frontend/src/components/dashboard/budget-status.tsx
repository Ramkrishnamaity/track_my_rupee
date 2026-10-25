import Link from "next/link"
import { CircleAlert, Target } from "lucide-react"

import type { SetBudget } from "@/api/dashboard.apis"
import { EmptyState } from "@/components/app/empty-state"
import { PageLoader } from "@/components/app/page-loader"
import { RetryButton } from "@/components/app/retry-button"
import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatINR } from "@/lib/format"
import { cn } from "@/lib/utils"

type BudgetStatusProps = {
  /** e.g. "This month" or "March 2025" */
  periodLabel: string
  budgets?: SetBudget[]
  /** True while loading: header + loader. */
  loading?: boolean
  /** True when the budgets couldn't be loaded. */
  loadFailed?: boolean
}

export function BudgetStatus({
  periodLabel,
  budgets = [],
  loading = false,
  loadFailed = false,
}: BudgetStatusProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Budgets</CardTitle>
        <CardDescription>{periodLabel}</CardDescription>
        <CardAction>
          <Link href="/budgets" className="text-sm font-medium text-primary hover:underline">
            Manage
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent className="flex-1 justify-between gap-4">
        {loading ? (
          <PageLoader label="Loading budgets…" className="min-h-0 flex-1 py-14" />
        ) : loadFailed ? (
          <EmptyState
            icon={CircleAlert}
            tone="error"
            title="Couldn't load budgets"
            action={<RetryButton />}
            className="flex-1"
          />
        ) : budgets.length === 0 ? (
          <EmptyState icon={Target} title="No budgets set" className="flex-1" />
        ) : (
          budgets.map((b) => {
            const pct = Math.round((b.spent / b.amount) * 100)
            const over = b.spent > b.amount
            const near = !over && pct >= 80
            return (
              <div key={b.budgetId}>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ background: b.colourCode }} />
                    {b.categoryName}
                  </span>
                  {over ? (
                    <Badge variant="expense">Over by {formatINR(b.spent - b.amount)}</Badge>
                  ) : near ? (
                    <Badge variant="warning">{pct}% used</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">{pct}% used</span>
                  )}
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      over ? "bg-expense" : near ? "bg-warning" : "bg-primary"
                    )}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <p className="amount mt-1.5 text-xs text-muted-foreground">
                  {formatINR(b.spent)} of {formatINR(b.amount)}
                </p>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
