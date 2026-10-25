/** Postgres error code for a UNIQUE constraint / unique index violation. */
const UNIQUE_VIOLATION = "23505"

/**
 * True when a query failed because of a duplicate value.
 * Drizzle wraps driver errors, so the pg error may be on `cause`.
 */
export function isUniqueViolation(error: unknown): boolean {
  const err = error as { code?: string; cause?: { code?: string } } | null
  return err?.code === UNIQUE_VIOLATION || err?.cause?.code === UNIQUE_VIOLATION
}
