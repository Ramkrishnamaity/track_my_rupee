import type { Metadata } from "next"
import { Suspense } from "react"

import { BudgetStatus } from "@/components/dashboard/budget-status"
import { CashflowChart } from "@/components/dashboard/cashflow-chart"
import {
  BudgetsSection,
  CashflowSection,
  SpendingSection,
  StatCardsSection,
} from "@/components/dashboard/dashboard-sections"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { SpendingDonut } from "@/components/dashboard/spending-donut"
import { StatCards } from "@/components/dashboard/stat-cards"
import { MonthPicker } from "@/components/app/month-picker"
import { getCurrentUser } from "@/lib/auth"
import { firstName } from "@/lib/user"
import {
  compareYearMonth,
  currentYearMonth,
  formatYearMonthLabel,
  formatYearMonthParam,
  parseMonthRange,
  parseYearMonth,
} from "@/lib/month"

export const metadata: Metadata = { title: "Dashboard" }

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const user = (await getCurrentUser())!
  const thisMonth = currentYearMonth()
  const query = await searchParams
  const parsed = parseYearMonth(query.month)
  // Future months aren't allowed: fall back to this month.
  const selected = compareYearMonth(parsed, thisMonth) > 0 ? thisMonth : parsed
  const isThisMonth = compareYearMonth(selected, thisMonth) === 0
  const periodLabel = isThisMonth ? "This month" : formatYearMonthLabel(selected)
  const chartRange = parseMonthRange(query.from, query.to, thisMonth)
  // New key on change → that section reloads (stat cards and charts: no loader; budgets: loader)
  const monthKey = formatYearMonthParam(selected)
  const rangeKey = `${formatYearMonthParam(chartRange.from)}-${formatYearMonthParam(chartRange.to)}`

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Welcome back, {firstName(user.name)} 👋</h2>
          <p className="mt-1 text-muted-foreground">
            {isThisMonth
              ? "Here’s how your money is doing this month."
              : `Here’s how your money did in ${formatYearMonthLabel(selected)}.`}
          </p>
        </div>
        <MonthPicker value={selected} max={thisMonth} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Suspense key={monthKey} fallback={<StatCards />}>
          <StatCardsSection period={selected} />
        </Suspense>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Suspense key={rangeKey} fallback={<CashflowChart range={chartRange} max={thisMonth} />}>
          <CashflowSection range={chartRange} max={thisMonth} />
        </Suspense>
        <Suspense key={monthKey} fallback={<SpendingDonut periodLabel={periodLabel} />}>
          <SpendingSection period={selected} periodLabel={periodLabel} />
        </Suspense>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <RecentTransactions />
        <Suspense key={monthKey} fallback={<BudgetStatus periodLabel={periodLabel} loading />}>
          <BudgetsSection period={selected} periodLabel={periodLabel} />
        </Suspense>
      </div>
    </div>
  )
}
