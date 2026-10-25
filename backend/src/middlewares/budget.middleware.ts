import type { RequestHandler } from "express"

import { CATEGORY_TYPE } from "@/db/schema"
import { CategoryModel } from "@/models/category.model"
import { ApiError } from "@/utils/api-error"
import type { SaveBudgetsBody } from "@/validators/budget.validator"

// Database checks for budget routes. They run after `authenticate` and `validate`.

/** 400 unless every categoryId in the body is one of the user's expense categories. */
export const budgetCategoriesValid: RequestHandler = async (req, _res, next) => {
  const { items } = req.body as SaveBudgetsBody
  const ids = items.map((item) => item.categoryId)

  const valid = await CategoryModel.findOwnIdsOfType(req.user!.id, ids, CATEGORY_TYPE.expense)
  const invalid = ids.filter((id) => !valid.has(id))
  if (invalid.length > 0) {
    throw new ApiError(
      400,
      `Budgets can only be set for your expense categories (invalid: ${invalid.join(", ")})`
    )
  }
  next()
}
