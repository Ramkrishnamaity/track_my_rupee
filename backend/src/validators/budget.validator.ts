import { z } from "zod"

import { hasAtMostTwoDecimals } from "@/validators/common"

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

/** ₹0 means "no budget"; fits numeric(12,2), i.e. rupees with up to 2 decimals (paise). */
const amountSchema = z
  .number({ error: "amount must be a number" })
  .min(0, "amount can't be negative")
  .max(9_999_999_999.99, "amount is too large")
  .refine(hasAtMostTwoDecimals, { error: "amount can have at most 2 decimal places" })

/** GET /budgets?year=2026&month=10 */
export const getBudgetsQuery = z.object({
  year: yearSchema,
  month: monthSchema,
})

/** PUT /budgets { year, month, items: [{ categoryId, amount }] } */
export const saveBudgetsBody = z.strictObject({
  year: yearSchema,
  month: monthSchema,
  items: z
    .array(
      z.strictObject({
        categoryId: z.number({ error: "categoryId must be a number" }).int().positive("Invalid categoryId"),
        amount: amountSchema,
      })
    )
    .min(1, "items can't be empty")
    .max(200, "Too many items")
    .refine((items) => new Set(items.map((i) => i.categoryId)).size === items.length, {
      error: "Each categoryId can appear only once",
    }),
})

// Types of the cleaned values that reach the middlewares/controllers after `validate`.
export type GetBudgetsQuery = z.infer<typeof getBudgetsQuery>
export type SaveBudgetsBody = z.infer<typeof saveBudgetsBody>
