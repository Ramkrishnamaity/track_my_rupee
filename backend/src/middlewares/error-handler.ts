import type { ErrorRequestHandler } from "express"
import { ZodError } from "zod"

import { isProduction } from "@/config/env"
import { ApiError } from "@/utils/api-error"
import { ApiResponse } from "@/utils/api-response"
import { isUniqueViolation } from "@/utils/db-errors"

/** "name: Required, amount: Too small" from a zod error. */
function validationMessage(err: ZodError) {
  return err.issues
    .map((issue) => (issue.path.length ? `${issue.path.join(".")}: ${issue.message}` : issue.message))
    .join(", ")
}

/**
 * Turns any thrown error into { status: false, message }.
 * Express 5 forwards errors from async handlers here automatically.
 */
export const errorHandler: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
  if (err instanceof ApiError) {
    ApiResponse.error(res, err.message, err.statusCode)
    return
  }

  if (err instanceof ZodError) {
    ApiResponse.error(res, validationMessage(err), 400)
    return
  }

  // Malformed JSON body from express.json()
  if (err instanceof SyntaxError && "body" in err) {
    ApiResponse.error(res, "Invalid JSON body", 400)
    return
  }

  // Unique index hit. Middlewares check duplicates first with a friendlier message;
  // this catches the rare race where two requests pass that check at the same time.
  if (isUniqueViolation(err)) {
    ApiResponse.error(res, "This record already exists", 409)
    return
  }

  // Unexpected error: the request log line (pino-http) picks this up and logs it
  // with the stack, request ID and user, so it's written once, at "error" level.
  const error = err instanceof Error ? err : new Error(String(err))
  res.err = error
  // Only show the real error while developing.
  ApiResponse.error(res, isProduction ? "Something went wrong" : error.message, 500)
}
