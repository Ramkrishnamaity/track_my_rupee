import { randomUUID } from "node:crypto"
import type { RequestHandler } from "express"

/**
 * Gives every request a new UUID, available as `req.id` and sent back in the
 * `X-Request-Id` response header. Logging will use it later.
 */
export const requestId: RequestHandler = (req, res, next) => {
  req.id = randomUUID()
  res.setHeader("X-Request-Id", req.id)
  next()
}
