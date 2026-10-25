import type { Category, Transaction, User } from "@/db/schema"

declare global {
  namespace Express {
    interface Request {
      /** Unique ID of this request, set by the `requestId` middleware (also in X-Request-Id). */
      id: string
      /** Set by the `authenticate` middleware on protected routes. */
      user?: User
      /** Cleaned query string, set by `validate({ query })` (req.query is read-only in Express 5). */
      validatedQuery?: unknown
    }

    /** Values that middlewares hand to the controller via res.locals. */
    interface Locals {
      /** Set by `categoryExists`. */
      category?: Category
      /** Set by `transactionExists`. */
      transaction?: Transaction
    }
  }
}

export {}
