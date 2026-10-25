import { sql } from "drizzle-orm"
import { bigint, check, numeric, pgTable, smallint, timestamp, uniqueIndex } from "drizzle-orm/pg-core"

import { users } from "./users"

// One row per user per month, created with the month's first transaction.
// `income` / `expense` are running totals (+amount on add, −amount on delete, in the
// same DB transaction). `saving` is calculated by Postgres on every insert/update.
// Column comments are added in the migration SQL (Drizzle can't generate them).
export const balances = pgTable(
  "balances",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    userId: bigint({ mode: "number" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    year: smallint().notNull(),
    month: smallint().notNull(),
    income: numeric({ precision: 14, scale: 2, mode: "number" }).notNull().default(0),
    expense: numeric({ precision: 14, scale: 2, mode: "number" }).notNull().default(0),
    saving: numeric({ precision: 14, scale: 2, mode: "number" }).generatedAlwaysAs(sql`income - expense`),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    // One row per user per month; also the index for monthly lookups and the chart range.
    uniqueIndex("balances_user_year_month_unique").on(t.userId, t.year, t.month),
    check("balances_year_check", sql`${t.year} BETWEEN 2000 AND 2100`),
    check("balances_month_check", sql`${t.month} BETWEEN 1 AND 12`),
    check("balances_income_check", sql`${t.income} >= 0`),
    check("balances_expense_check", sql`${t.expense} >= 0`),
  ]
)

export type Balance = typeof balances.$inferSelect
export type NewBalance = typeof balances.$inferInsert
