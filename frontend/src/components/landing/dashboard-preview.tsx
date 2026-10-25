import { ArrowDownRight, ArrowUpRight } from "lucide-react"

import { monthlyTrend, recentTransactions, spendingByCategory, summary } from "@/lib/landing-data"
import { formatINR } from "@/lib/format"
import { cn } from "@/lib/utils"

const CHART_W = 320
const CHART_H = 120

/** Smooth SVG path through the values (simple Catmull-Rom → Bézier). */
function smoothPath(values: number[], min: number, max: number) {
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * CHART_W,
    CHART_H - ((v - min) / (max - min)) * CHART_H,
  ])
  return pts.reduce((d, [x, y], i) => {
    if (i === 0) return `M${x},${y}`
    const [x0, y0] = pts[i - 2] ?? pts[i - 1]
    const [x1, y1] = pts[i - 1]
    const [x3, y3] = pts[i + 1] ?? [x, y]
    const c1 = [x1 + (x - x0) / 6, y1 + (y - y0) / 6]
    const c2 = [x - (x3 - x1) / 6, y - (y3 - y1) / 6]
    return `${d} C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${x},${y}`
  }, "")
}

const stats = [
  { label: "Income", ...summary.income },
  { label: "Expenses", ...summary.expenses },
  { label: "Balance", ...summary.balance },
]

export function DashboardPreview({ className }: { className?: string }) {
  const all = [...monthlyTrend.income, ...monthlyTrend.expenses]
  const min = Math.min(...all) * 0.85
  const max = Math.max(...all) * 1.05

  // Donut segments on a circle with circumference 100, starting at 12 o'clock.
  const segments = spendingByCategory.map((c, i) => ({
    ...c,
    offset: 25 - spendingByCategory.slice(0, i).reduce((sum, p) => sum + p.value, 0),
  }))

  return (
    <div className={cn("rounded-3xl border bg-surface p-3 shadow-2xl shadow-primary/10 sm:p-4", className)}>
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {stats.map((s) => {
          // For expenses, going down is good news.
          const good = s.label === "Expenses" ? s.change < 0 : s.change > 0
          return (
            <div key={s.label} className="rounded-2xl bg-card p-3 sm:p-4">
              <p className="text-[11px] font-medium text-muted-foreground sm:text-xs">{s.label}</p>
              <p className="amount mt-1.5 text-sm font-semibold sm:text-lg">{formatINR(s.amount)}</p>
              <span
                className={cn(
                  "mt-2 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold sm:text-[11px]",
                  good ? "bg-income/12 text-income" : "bg-expense/12 text-expense"
                )}
              >
                {Math.abs(s.change)}%
                {s.change > 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-2 grid gap-2 sm:mt-3 sm:grid-cols-5 sm:gap-3">
        {/* Line chart */}
        <div className="rounded-2xl bg-card p-4 sm:col-span-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Income vs Expenses</p>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              Jan – Jul
            </span>
          </div>
          <div className="mt-2 flex gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-chart-1" /> Income
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-chart-2" /> Expenses
            </span>
          </div>
          <svg
            viewBox={`0 -6 ${CHART_W} ${CHART_H + 12}`}
            className="mt-3 h-28 w-full overflow-visible"
            preserveAspectRatio="none"
            aria-label="Line chart of income and expenses from January to July"
            role="img"
          >
            {[0, 0.25, 0.5, 0.75, 1].map((t) => (
              <line
                key={t}
                x1="0"
                x2={CHART_W}
                y1={t * CHART_H}
                y2={t * CHART_H}
                stroke="var(--border)"
                strokeDasharray="3 4"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <path
              d={smoothPath(monthlyTrend.income, min, max)}
              fill="none"
              stroke="var(--chart-1)"
              strokeWidth="2.5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={smoothPath(monthlyTrend.expenses, min, max)}
              fill="none"
              stroke="var(--chart-2)"
              strokeWidth="2.5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
            {monthlyTrend.months.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>

        {/* Donut */}
        <div className="rounded-2xl bg-card p-4 sm:col-span-2">
          <p className="text-sm font-semibold">Spending by category</p>
          <div className="mt-3 flex items-center gap-4 sm:flex-col sm:gap-3">
            <svg
              viewBox="0 0 42 42"
              className="size-24 shrink-0 sm:size-28"
              role="img"
              aria-label="Donut chart of spending by category"
            >
              {segments.map((s) => (
                <circle
                  key={s.name}
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="none"
                  stroke={s.color}
                  strokeWidth="6"
                  strokeDasharray={`${s.value - 1} ${101 - s.value}`}
                  strokeDashoffset={s.offset}
                />
              ))}
            </svg>
            <ul className="grid w-full gap-1 text-[11px]">
              {spendingByCategory.slice(0, 4).map((c) => (
                <li key={c.name} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="size-2 rounded-full" style={{ background: c.color }} />
                    {c.name}
                  </span>
                  <span className="font-medium">{c.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="mt-2 rounded-2xl bg-card p-4 sm:mt-3">
        <p className="text-sm font-semibold">Recent transactions</p>
        <ul className="mt-2 divide-y">
          {recentTransactions.slice(0, 4).map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{t.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  {t.category} · {t.method} · {t.date}
                </p>
              </div>
              <span
                className={cn(
                  "amount shrink-0 text-sm font-semibold",
                  t.type === "income" ? "text-income" : "text-foreground"
                )}
              >
                {t.type === "income" ? "+" : "−"}
                {formatINR(t.amount)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
