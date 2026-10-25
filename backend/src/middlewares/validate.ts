import type { RequestHandler } from "express"
import type { ZodType } from "zod"

type Schemas = {
  body?: ZodType
  params?: ZodType
  query?: ZodType
}

/**
 * Validates the request with zod schemas before the controller runs.
 * Invalid input throws a ZodError → the error handler replies 400 with the reason.
 * Valid input is replaced by the cleaned value (trimmed, numbers converted, defaults set).
 *
 *   router.post("/", validate({ body: createCategoryBody }), createCategory)
 */
export const validate =
  (schemas: Schemas): RequestHandler =>
  (req, _res, next) => {
    if (schemas.params) req.params = schemas.params.parse(req.params) as typeof req.params
    if (schemas.body) req.body = schemas.body.parse(req.body)
    // Express 5 makes req.query read-only, so the cleaned query goes here.
    if (schemas.query) req.validatedQuery = schemas.query.parse(req.query)
    next()
  }
