import {
  getDashboardBudgets,
  getIncomeVsExpenses,
  getSpendingByCategory,
  getSummary,
} from "@/api/dashboard.apis"
import { BudgetStatus } from "@/components/dashboard/budget-status"
import { CashflowChart } from "@/components/dashboard/cashflow-chart"
import { SpendingDonut } from "@/components/dashboard/spending-donut"
import { StatCards } from "@/components/dashboard/stat-cards"
import { formatYearMonthParam, type MonthRange, type YearMonth } from "@/lib/month"
import { loadOnServer } from "@/lib/server-load"

// Server parts of the dashboard: each loads its own data inside a Suspense boundary.
// Only the Budgets card shows a loader (with the minimum time); the stat cards and
// charts render straight away when their data arrives (0 minimum).

export async function StatCardsSection({ period }: { period: YearMonth }) {
  const totals = await loadOnServer((client) => getSummary(period, client), 0)
  return <StatCards totals={totals} />
}

export async function SpendingSection({ period, periodLabel }: { period: YearMonth; periodLabel: string }) {
  const spending = await loadOnServer((client) => getSpendingByCategory(period, client), 0)
  return <SpendingDonut periodLabel={periodLabel} spending={spending} />
}

export async function CashflowSection({ range, max }: { range: MonthRange; max: YearMonth }) {
  const result = await loadOnServer(
    (client) =>
      getIncomeVsExpenses(
        { from: formatYearMonthParam(range.from), to: formatYearMonthParam(range.to) },
        client
      ),
    0
  )
  return <CashflowChart range={range} max={max} months={result && result.items} />
}

export async function BudgetsSection({ period, periodLabel }: { period: YearMonth; periodLabel: string }) {
  const result = await loadOnServer((client) => getDashboardBudgets(period, client))
  return <BudgetStatus periodLabel={periodLabel} budgets={result?.items} loadFailed={!result} />
}
