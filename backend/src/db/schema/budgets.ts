import { sql } from "drizzle-orm"
import { bigint, check, numeric, pgTable, smallint, timestamp, uniqueIndex } from "drizzle-orm/pg-core"

import { categories } from "./categories"
import { users } from "./users"

// One row per user + expense category + month.
// `spent` is a running total: +amount when an expense transaction is added,
// −amount when it's deleted (transactions are never edited), in the same DB transaction.
// Column comments are added in the migration SQL (Drizzle can't generate them).
export const budgets = pgTable(
  "budgets",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    userId: bigint({ mode: "number" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categoryId: bigint({ mode: "number" })
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    year: smallint().notNull(),
    month: smallint().notNull(),
    // numeric = exact money (never float). mode "number" returns e.g. 18000.5 in JS.
    amount: numeric({ precision: 12, scale: 2, mode: "number" }).notNull(),
    spent: numeric({ precision: 12, scale: 2, mode: "number" }).notNull().default(0),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    // One budget per category per month; also the index for "this user's budgets for a month".
    uniqueIndex("budgets_user_year_month_category_unique").on(t.userId, t.year, t.month, t.categoryId),
    check("budgets_year_check", sql`${t.year} BETWEEN 2000 AND 2100`),
    check("budgets_month_check", sql`${t.month} BETWEEN 1 AND 12`),
    check("budgets_amount_check", sql`${t.amount} > 0`),
    check("budgets_spent_check", sql`${t.spent} >= 0`),
  ]
)

export type Budget = typeof budgets.$inferSelect
export type NewBudget = typeof budgets.$inferInsert
