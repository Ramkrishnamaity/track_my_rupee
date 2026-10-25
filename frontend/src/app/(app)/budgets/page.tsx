import type { Metadata } from "next"
import { Suspense } from "react"

import { MonthPicker } from "@/components/app/month-picker"
import { BudgetEditor } from "@/components/budgets/budget-editor"
import { BudgetsList } from "@/components/budgets/budgets-list"
import { Card, CardContent } from "@/components/ui/card"
import { compareYearMonth, currentYearMonth, formatYearMonthParam, parseYearMonth } from "@/lib/month"

export const metadata: Metadata = { title: "Budgets" }

export default async function BudgetsPage({ searchParams }: PageProps<"/budgets">) {
  const thisMonth = currentYearMonth()
  const parsed = parseYearMonth((await searchParams).month)
  // Future months aren't allowed: fall back to this month.
  const selected = compareYearMonth(parsed, thisMonth) > 0 ? thisMonth : parsed

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Budgets</h2>
        <MonthPicker value={selected} max={thisMonth} />
      </div>

      <Card>
        <CardContent className="px-2 sm:px-4">
          {/* New key per month → loader row while it loads, and unsaved edits are dropped */}
          <Suspense
            key={formatYearMonthParam(selected)}
            fallback={<BudgetEditor year={selected.year} month={selected.month} loading />}
          >
            <BudgetsList year={selected.year} month={selected.month} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
