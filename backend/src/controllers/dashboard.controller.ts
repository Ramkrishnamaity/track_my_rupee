import type { RequestHandler } from "express"

import { BalanceModel } from "@/models/balance.model"
import { BudgetModel } from "@/models/budget.model"
import { TransactionModel } from "@/models/transaction.model"
import { ApiResponse } from "@/utils/api-response"
import type {
  IncomeVsExpensesQuery,
  PeriodQuery,
  RecentTransactionsQuery,
} from "@/validators/dashboard.validator"

// Business logic only; the route's middlewares already checked login and input.

/** GET /dashboard/summary?year=&month=: the Income, Expenses and Balance cards */
export const getSummary: RequestHandler = async (req, res) => {
  const period = req.validatedQuery as PeriodQuery
  const totals = await BalanceModel.findMonth(req.user!.id, period)
  ApiResponse.success(res, "Summary fetched", totals)
}

/** GET /dashboard/spending-by-category?year=&month=: the donut chart */
export const getSpendingByCategory: RequestHandler = async (req, res) => {
  const period = req.validatedQuery as PeriodQuery
  const items = await TransactionModel.spendingByCategory(req.user!.id, period)
  const total = items.reduce((sum, item) => sum + item.amount, 0)
  ApiResponse.success(res, "Spending by category fetched", { ...period, total, items })
}

/** GET /dashboard/budgets?year=&month=: only the budgets saved for the month */
export const getBudgets: RequestHandler = async (req, res) => {
  const period = req.validatedQuery as PeriodQuery
  const items = await BudgetModel.listSetForMonth(req.user!.id, period)
  ApiResponse.success(res, "Budgets fetched", { ...period, items })
}

/** GET /dashboard/recent-transactions?limit=10: latest across all months */
export const getRecentTransactions: RequestHandler = async (req, res) => {
  const { limit } = req.validatedQuery as RecentTransactionsQuery
  const items = await TransactionModel.recent(req.user!.id, limit)
  ApiResponse.success(res, "Recent transactions fetched", { items })
}

/** GET /dashboard/income-vs-expenses?from=2026-05&to=2026-10: the chart, one item per month */
export const getIncomeVsExpenses: RequestHandler = async (req, res) => {
  const { from, to } = req.validatedQuery as IncomeVsExpensesQuery
  const items = await BalanceModel.listRange(req.user!.id, from, to)
  ApiResponse.success(res, "Income vs expenses fetched", { from, to, items })
}
