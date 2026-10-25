import { bigint, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core"

// Column names are camelCase here and snake_case in Postgres (casing: "snake_case").
// Timestamps are timestamptz: stored in UTC, converted for display on the frontend.
export const users = pgTable("users", {
  id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  /** Google's permanent account id (the "sub" claim). Used to find the user at login. */
  googleId: varchar({ length: 64 }).notNull().unique("users_google_id_unique"),
  email: varchar({ length: 255 }).notNull().unique(),
  name: varchar({ length: 120 }).notNull(),
  /** Google profile photo; null when the account has none (UI shows initials). */
  avatarUrl: text(),
  /** IANA time zone from the browser, e.g. "Asia/Kolkata". Used for day/month boundaries. */
  timezone: varchar({ length: 64 }).notNull().default("Asia/Kolkata"),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
