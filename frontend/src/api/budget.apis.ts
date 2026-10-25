import type { CategoryStatus } from "@/api/category.apis"
import { api, type ApiClient } from "@/lib/api"

// Budget APIs. Every function uses the browser client by default; on the
// Next.js server pass `await getServerApi()` as the last argument.

/** One row on the Budgets page: an expense category with its budget for the month. */
export type BudgetItem = {
  categoryId: number
  categoryName: string
  colourCode: string
  /** 0 = inactive (shown only because it already has a budget), 1 = active */
  categoryStatus: CategoryStatus
  /** null = no budget saved for this month */
  budgetId: number | null
  /** 0 when no budget */
  amount: number
  spent: number
}

export type BudgetMonth = { year: number; month: number; items: BudgetItem[] }

/** GET /budgets: the month's budgets merged with active expense categories */
export const getBudgets = (period: { year: number; month: number }, client: ApiClient = api) =>
  client.get<BudgetMonth>("/budgets", { params: period })

/**
 * PUT /budgets: amount > 0 creates/updates, 0 removes the budget.
 * Returns the refreshed month (same shape as getBudgets).
 */
export const saveBudgets = (
  body: { year: number; month: number; items: { categoryId: number; amount: number }[] },
  client: ApiClient = api
) => client.put<BudgetMonth>("/budgets", body)
