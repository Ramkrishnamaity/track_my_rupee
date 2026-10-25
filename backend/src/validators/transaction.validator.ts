import { z } from "zod"

import { hasAtMostTwoDecimals } from "@/validators/common"

const typeSchema = z.union([z.literal(1), z.literal(2)], {
  error: "type must be 1 (income) or 2 (expense)",
})
const paymentMethodSchema = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)], {
  error: "paymentMethod must be 1 (UPI), 2 (Card), 3 (Cash) or 4 (Bank)",
})
const idSchema = (label: string) =>
  z.coerce
    .number({ error: `Invalid ${label}` })
    .int(`Invalid ${label}`)
    .positive(`Invalid ${label}`)

/** "2026-11-01", and a real calendar day (no 2026-02-30). */
const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "date must look like 2026-11-01")
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number) as [number, number, number]
    const parsed = new Date(Date.UTC(year, month - 1, day))
    return (
      parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day
    )
  }, "date is not a real calendar date")
  .refine((value) => {
    const year = Number(value.slice(0, 4))
    return year >= 2000 && year <= 2100
  }, "date must be between the years 2000 and 2100")

/** "13:45" or "13:45:30" (24-hour) */
const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, "time must look like 13:45")

/** GET /transactions?year=2026&month=10&type=2&categoryId=4&page=1&limit=10 */
export const listTransactionsQuery = z.object({
  year: z.coerce.number({ error: "year must be a number" }).int().min(2000).max(2100),
  month: z.coerce.number({ error: "month must be a number" }).int().min(1).max(12),
  type: z.coerce.number().pipe(typeSchema).optional(),
  categoryId: idSchema("categoryId").optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
})

/** POST /transactions */
export const createTransactionBody = z.strictObject({
  type: typeSchema,
  categoryId: idSchema("categoryId"),
  paymentMethod: paymentMethodSchema,
  title: z.string().trim().min(1, "title is required").max(50, "title can be at most 50 characters"),
  amount: z
    .number({ error: "amount must be a number" })
    .positive("amount must be more than 0")
    .max(9_999_999_999.99, "amount is too large")
    .refine(hasAtMostTwoDecimals, { error: "amount can have at most 2 decimal places" }),
  date: dateSchema,
  time: timeSchema,
})

export const transactionIdParams = z.object({ id: idSchema("transaction id") })

// Types of the cleaned values that reach the middlewares/controllers after `validate`.
export type ListTransactionsQuery = z.infer<typeof listTransactionsQuery>
export type CreateTransactionBody = z.infer<typeof createTransactionBody>
export type TransactionIdParams = z.infer<typeof transactionIdParams>
