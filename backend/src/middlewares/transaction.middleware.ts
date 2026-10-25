import type { RequestHandler } from "express"

import { CATEGORY_STATUS } from "@/db/schema"
import { CategoryModel } from "@/models/category.model"
import { TransactionModel } from "@/models/transaction.model"
import { ApiError } from "@/utils/api-error"
import { nowInTimezone } from "@/utils/date"
import type { CreateTransactionBody, TransactionIdParams } from "@/validators/transaction.validator"

// Database checks for transaction routes. They run after `authenticate` and `validate`,
// so req.user is set and req.params / req.body are already cleaned.

/** 400 unless the category is the user's own, active, and of the same type (income/expense). */
export const transactionCategoryValid: RequestHandler = async (req, _res, next) => {
  const { categoryId, type } = req.body as CreateTransactionBody
  const category = await CategoryModel.findOwn(req.user!.id, categoryId)

  if (!category) throw new ApiError(400, "Category not found")
  if (category.type !== type) {
    throw new ApiError(400, `"${category.name}" is an ${category.type === 1 ? "income" : "expense"} category`)
  }
  if (category.status !== CATEGORY_STATUS.active) {
    throw new ApiError(400, `"${category.name}" is inactive; activate it on the Categories page first`)
  }
  next()
}

/** 400 if the date and time are later than "now" on the user's own clock. */
export const transactionNotInFuture: RequestHandler = (req, _res, next) => {
  const { date, time } = req.body as CreateTransactionBody
  const now = nowInTimezone(req.user!.timezone)

  // "2026-11-01 00:30" style strings compare correctly in alphabetical order.
  if (`${date} ${time.slice(0, 5)}` > `${now.date} ${now.time}`) {
    throw new ApiError(400, "Transaction date and time can't be in the future")
  }
  next()
}

/**
 * 404 unless the transaction exists AND belongs to the logged-in user.
 * Passes it on as res.locals.transaction, so the controller doesn't load it again.
 */
export const transactionExists: RequestHandler = async (req, res, next) => {
  const { id } = req.params as unknown as TransactionIdParams
  const transaction = await TransactionModel.findOwn(req.user!.id, id)
  if (!transaction) throw new ApiError(404, "Transaction not found")

  res.locals.transaction = transaction
  next()
}
