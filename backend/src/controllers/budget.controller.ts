import type { RequestHandler } from "express"

import { BudgetModel } from "@/models/budget.model"
import { ApiResponse } from "@/utils/api-response"
import type { GetBudgetsQuery, SaveBudgetsBody } from "@/validators/budget.validator"

// Business logic only; the route's middlewares already checked login, input and categories.

/** GET /budgets?year=&month= */
export const getBudgets: RequestHandler = async (req, res) => {
  const { year, month } = req.validatedQuery as GetBudgetsQuery
  const items = await BudgetModel.listForMonth(req.user!.id, { year, month })

  ApiResponse.success(res, "Budgets fetched", { year, month, items })
}

/** PUT /budgets { year, month, items: [{ categoryId, amount }] } */
export const saveBudgets: RequestHandler = async (req, res) => {
  const { year, month, items } = req.body as SaveBudgetsBody
  await BudgetModel.saveForMonth(req.user!.id, { year, month }, items)

  // Return the refreshed month so the page can show it right away.
  const updated = await BudgetModel.listForMonth(req.user!.id, { year, month })
  ApiResponse.success(res, "Budgets saved", { year, month, items: updated })
}
