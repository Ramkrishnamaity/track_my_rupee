import { TrendingDown, TrendingUp, Wallet, type LucideIcon } from "lucide-react"

import type { MonthTotals } from "@/api/dashboard.apis"
import { Card } from "@/components/ui/card"
import { formatINR } from "@/lib/format"
import { cn } from "@/lib/utils"

type Stat = {
  label: string
  key: "income" | "expense" | "saving"
  icon: LucideIcon
  /** icon tile colors */
  tone: string
  /** amount text color */
  text: string
}

const stats: Stat[] = [
  {
    label: "Total income",
    key: "income",
    icon: TrendingUp,
    tone: "bg-income/12 text-income",
    text: "text-income",
  },
  {
    label: "Total expenses",
    key: "expense",
    icon: TrendingDown,
    tone: "bg-expense/12 text-expense",
    text: "text-expense",
  },
  { label: "Balance", key: "saving", icon: Wallet, tone: "bg-primary/12 text-primary", text: "text-primary" },
]

/**
 * Renders the stat cards only; the parent page provides the grid.
 * Without `totals` (still loading, or failed) the amounts show "—".
 */
export function StatCards({ totals }: { totals?: MonthTotals | null }) {
  return (
    <>
      {stats.map((s) => (
        <Card key={s.label} className="gap-0 px-5 py-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
            <span className={cn("flex size-9 items-center justify-center rounded-xl", s.tone)}>
              <s.icon className="size-4.5" />
            </span>
          </div>
          <p
            className={cn(
              "amount mt-3 text-2xl font-semibold",
              !totals ? "text-muted-foreground" : totals[s.key] < 0 ? "text-expense" : s.text
            )}
          >
            {totals ? formatINR(totals[s.key]) : "—"}
          </p>
        </Card>
      ))}
    </>
  )
}
