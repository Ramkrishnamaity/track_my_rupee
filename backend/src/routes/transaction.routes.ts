import { Router } from "express"

import { createTransaction, deleteTransaction, listTransactions } from "@/controllers/transaction.controller"
import { authenticate } from "@/middlewares/authenticate"
import {
  transactionCategoryValid,
  transactionExists,
  transactionNotInFuture,
} from "@/middlewares/transaction.middleware"
import { validate } from "@/middlewares/validate"
import {
  createTransactionBody,
  listTransactionsQuery,
  transactionIdParams,
} from "@/validators/transaction.validator"

export const transactionRouter = Router()

// Every transaction route needs a logged-in user, so check that once for the whole router.
transactionRouter.use(authenticate)

// Each route: input validation → database checks → controller

transactionRouter.get("/", validate({ query: listTransactionsQuery }), listTransactions)

transactionRouter.post(
  "/",
  validate({ body: createTransactionBody }),
  transactionNotInFuture,
  transactionCategoryValid,
  createTransaction
)

transactionRouter.delete(
  "/:id",
  validate({ params: transactionIdParams }),
  transactionExists,
  deleteTransaction
)
