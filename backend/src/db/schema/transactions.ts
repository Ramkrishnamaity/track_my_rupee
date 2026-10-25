import { sql } from "drizzle-orm"
import {
  bigint,
  check,
  date,
  index,
  numeric,
  pgTable,
  smallint,
  time,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core"

import { categories, type CategoryType } from "./categories"
import { users } from "./users"

/** transactions.payment_method: 1 = UPI, 2 = Card, 3 = Cash, 4 = Bank */
export const PAYMENT_METHOD = { upi: 1, card: 2, cash: 3, bank: 4 } as const
export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD]

// Transactions are never edited: only added or deleted (so no updatedAt).
// `date` and `time` are the user's own clock, as entered; `year` and `month` come from `date`.
// Column comments are added in the migration SQL (Drizzle can't generate them).
export const transactions = pgTable(
  "transactions",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    userId: bigint({ mode: "number" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categoryId: bigint({ mode: "number" })
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    /** Same values as categories.type: 1 = income, 2 = expense */
    type: smallint().$type<CategoryType>().notNull(),
    paymentMethod: smallint().$type<PaymentMethod>().notNull(),
    title: varchar({ length: 50 }).notNull(),
    amount: numeric({ precision: 12, scale: 2, mode: "number" }).notNull(),
    /** "2026-11-01" */
    date: date({ mode: "string" }).notNull(),
    /** "00:30:00" */
    time: time().notNull(),
    year: smallint().notNull(),
    month: smallint().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // Monthly lists, filters and totals
    index("transactions_user_year_month_idx").on(t.userId, t.year, t.month),
    // "Recent transactions" (newest first)
    index("transactions_user_date_time_idx").on(t.userId, t.date.desc(), t.time.desc()),
    // Fast cleanup when a category is deleted (cascade)
    index("transactions_category_idx").on(t.categoryId),
    check("transactions_type_check", sql`${t.type} IN (1, 2)`),
    check("transactions_payment_method_check", sql`${t.paymentMethod} IN (1, 2, 3, 4)`),
    check("transactions_amount_check", sql`${t.amount} > 0`),
    check("transactions_year_check", sql`${t.year} BETWEEN 2000 AND 2100`),
    check("transactions_month_check", sql`${t.month} BETWEEN 1 AND 12`),
  ]
)

export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
