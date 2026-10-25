import { sql } from "drizzle-orm"
import { bigint, check, pgTable, smallint, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core"

import { users } from "./users"

/** categories.type: 1 = income, 2 = expense */
export const CATEGORY_TYPE = { income: 1, expense: 2 } as const
export type CategoryType = (typeof CATEGORY_TYPE)[keyof typeof CATEGORY_TYPE]

/** categories.status: 0 = inactive, 1 = active */
export const CATEGORY_STATUS = { inactive: 0, active: 1 } as const
export type CategoryStatus = (typeof CATEGORY_STATUS)[keyof typeof CATEGORY_STATUS]

// Column comments are added in the migration SQL (Drizzle can't generate them).
export const categories = pgTable(
  "categories",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    userId: bigint({ mode: "number" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar({ length: 20 }).notNull(),
    type: smallint().$type<CategoryType>().notNull(),
    status: smallint().$type<CategoryStatus>().notNull().default(CATEGORY_STATUS.active),
    colourCode: varchar({ length: 20 }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    // One name per user + type, ignoring case ("Food" and "food" clash).
    // Also serves as the index for "all categories of this user".
    uniqueIndex("categories_user_type_name_unique").on(t.userId, t.type, sql`lower(${t.name})`),
    check("categories_type_check", sql`${t.type} IN (1, 2)`),
    check("categories_status_check", sql`${t.status} IN (0, 1)`),
  ]
)

export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
