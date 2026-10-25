import type { RequestHandler } from "express"

import { TransactionModel } from "@/models/transaction.model"
import { ApiResponse } from "@/utils/api-response"
import type { CreateTransactionBody, ListTransactionsQuery } from "@/validators/transaction.validator"

// Business logic only; the route's middlewares already checked login, input and the database.

/** GET /transactions?year=&month=&type=&categoryId=&page=&limit= */
export const listTransactions: RequestHandler = async (req, res) => {
  const { year, month, type, categoryId, page, limit } = req.validatedQuery as ListTransactionsQuery
  const { rows, total } = await TransactionModel.list(
    req.user!.id,
    { year, month, type, categoryId },
    page,
    limit
  )

  ApiResponse.success(res, "Transactions fetched", {
    items: rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}

/** POST /transactions: also updates balances and budgets.spent */
export const createTransaction: RequestHandler = async (req, res) => {
  const transaction = await TransactionModel.create(req.user!.id, req.body as CreateTransactionBody)
  ApiResponse.success(res, "Transaction added", transaction, 201)
}

/** DELETE /transactions/:id: also reverses balances and budgets.spent */
export const deleteTransaction: RequestHandler = async (req, res) => {
  await TransactionModel.delete(req.user!.id, res.locals.transaction!)
  ApiResponse.success(res, "Transaction deleted")
}
