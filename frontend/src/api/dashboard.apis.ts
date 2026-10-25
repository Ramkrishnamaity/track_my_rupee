import type { Transaction } from "@/api/transaction.apis"
import { api, type ApiClient } from "@/lib/api"

// Dashboard APIs. Every function uses the browser client by default; on the
// Next.js server pass `await getServerApi()` as the last argument.

type Period = { year: number; month: number }

/** One month's totals (0s when the month has no transactions). saving = income − expense. */
export type MonthTotals = Period & { income: number; expense: number; saving: number }

export type CategorySpending = {
  categoryId: number
  categoryName: string
  colourCode: string
  amount: number
}

export type SetBudget = {
  budgetId: number
  categoryId: number
  categoryName: string
  colourCode: string
  amount: number
  spent: number
}

/** GET /dashboard/summary: the Income, Expenses and Balance cards */
export const getSummary = (period: Period, client: ApiClient = api) =>
  client.get<MonthTotals>("/dashboard/summary", { params: period })

/** GET /dashboard/spending-by-category: the donut chart, biggest first */
export const getSpendingByCategory = (period: Period, client: ApiClient = api) =>
  client.get<Period & { total: number; items: CategorySpending[] }>("/dashboard/spending-by-category", {
    params: period,
  })

/** GET /dashboard/budgets: only the budgets saved for the month */
export const getDashboardBudgets = (period: Period, client: ApiClient = api) =>
  client.get<Period & { items: SetBudget[] }>("/dashboard/budgets", { params: period })

/** GET /dashboard/recent-transactions: the latest across all months */
export const getRecentTransactions = (limit = 10, client: ApiClient = api) =>
  client.get<{ items: Transaction[] }>("/dashboard/recent-transactions", { params: { limit } })

/** GET /dashboard/income-vs-expenses?from=2026-05&to=2026-10: one item per month, oldest first */
export const getIncomeVsExpenses = (range: { from: string; to: string }, client: ApiClient = api) =>
  client.get<{ items: MonthTotals[] }>("/dashboard/income-vs-expenses", { params: range })
