import { Router } from "express"

import {
  getBudgets,
  getIncomeVsExpenses,
  getRecentTransactions,
  getSpendingByCategory,
  getSummary,
} from "@/controllers/dashboard.controller"
import { authenticate } from "@/middlewares/authenticate"
import { validate } from "@/middlewares/validate"
import { incomeVsExpensesQuery, periodQuery, recentTransactionsQuery } from "@/validators/dashboard.validator"

export const dashboardRouter = Router()

// Every dashboard route needs a logged-in user, so check that once for the whole router.
dashboardRouter.use(authenticate)

// Read-only: input validation → controller

dashboardRouter.get("/summary", validate({ query: periodQuery }), getSummary)

dashboardRouter.get("/spending-by-category", validate({ query: periodQuery }), getSpendingByCategory)

dashboardRouter.get("/budgets", validate({ query: periodQuery }), getBudgets)

dashboardRouter.get(
  "/recent-transactions",
  validate({ query: recentTransactionsQuery }),
  getRecentTransactions
)

dashboardRouter.get("/income-vs-expenses", validate({ query: incomeVsExpensesQuery }), getIncomeVsExpenses)
