import type { RequestHandler } from "express"

import { ApiError } from "@/utils/api-error"

/** Runs when no route matched. */
export const notFound: RequestHandler = (req) => {
  throw new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`)
}
