import { z } from "zod"

/** Longest range for the Income vs Expenses chart, in months (inclusive). */
export const MAX_RANGE_MONTHS = 12

const yearSchema = z.coerce
  .number({ error: "year must be a number" })
  .int("year must be a whole number")
  .min(2000, "year must be between 2000 and 2100")
  .max(2100, "year must be between 2000 and 2100")

const monthSchema = z.coerce
  .number({ error: "month must be a number" })
  .int("month must be a whole number")
  .min(1, "month must be between 1 and 12")
  .max(12, "month must be between 1 and 12")

/** "2026-10" → { year: 2026, month: 10 } */
const yearMonthSchema = (label: string) =>
  z
    .string({ error: `${label} is required` })
    .regex(/^(20\d{2}|2100)-(0[1-9]|1[0-2])$/, `${label} must look like 2026-10`)
    .transform((value) => ({ year: Number(value.slice(0, 4)), month: Number(value.slice(5, 7)) }))

/** Month index used to compare and count months: 2026-10 → 2026*12 + 9 */
export const monthIndex = ({ year, month }: { year: number; month: number }) => year * 12 + (month - 1)

/** ?year=2026&month=10 (summary, spending by category, budgets) */
export const periodQuery = z.object({ year: yearSchema, month: monthSchema })

/** ?limit=10 */
export const recentTransactionsQuery = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

/** ?from=2026-05&to=2026-10 (at most 12 months, from ≤ to) */
export const incomeVsExpensesQuery = z
  .object({ from: yearMonthSchema("from"), to: yearMonthSchema("to") })
  // The range checks only run once both from and to are valid ("when"),
  // so a bad format shows just the format message.
  .refine(({ from, to }) => monthIndex(from) <= monthIndex(to), {
    error: "from must be the same as or before to",
    when: (payload) => payload.issues.length === 0,
  })
  .refine(({ from, to }) => monthIndex(to) - monthIndex(from) + 1 <= MAX_RANGE_MONTHS, {
    error: `The range can be at most ${MAX_RANGE_MONTHS} months`,
    when: (payload) => payload.issues.length === 0,
  })

// Types of the cleaned values that reach the controllers after `validate`.
export type PeriodQuery = z.infer<typeof periodQuery>
export type RecentTransactionsQuery = z.infer<typeof recentTransactionsQuery>
export type IncomeVsExpensesQuery = z.infer<typeof incomeVsExpensesQuery>
