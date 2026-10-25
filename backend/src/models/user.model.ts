import { eq } from "drizzle-orm"

import { db } from "@/db"
import { balances, budgets, categories, transactions, users, type User } from "@/db/schema"
import type { GoogleProfile } from "@/services/google-oauth.service"

/** What the API returns about a user (no internal fields like googleId). */
export type PublicUser = Pick<User, "id" | "email" | "name" | "avatarUrl" | "timezone" | "createdAt">

export function toPublicUser(user: User): PublicUser {
  const { id, email, name, avatarUrl, timezone, createdAt } = user
  return { id, email, name, avatarUrl, timezone, createdAt }
}

export const UserModel = {
  async findById(id: number) {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
    return user ?? null
  },

  /**
   * Log in = sign up: create the user on first Google login, otherwise refresh
   * their Google details. `timezone` is only updated when the browser sent one.
   */
  async upsertFromGoogle(profile: GoogleProfile, timezone: string | null) {
    const [user] = await db
      .insert(users)
      .values({ ...profile, ...(timezone && { timezone }) })
      .onConflictDoUpdate({
        target: users.googleId,
        set: {
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.avatarUrl,
          ...(timezone && { timezone }),
          updatedAt: new Date(),
        },
      })
      .returning()
    return user!
  },

  /**
   * Danger zone → Reset account: deletes all the user's data and keeps the user.
   * One DB transaction, so it's all or nothing.
   */
  async resetData(userId: number) {
    await db.transaction(async (tx) => {
      // Children first (they point to categories), then categories.
      await tx.delete(transactions).where(eq(transactions.userId, userId))
      await tx.delete(budgets).where(eq(budgets.userId, userId))
      await tx.delete(balances).where(eq(balances.userId, userId))
      await tx.delete(categories).where(eq(categories.userId, userId))
    })
  },

  /**
   * Danger zone → Delete account: deletes the user. Every table references
   * users with ON DELETE CASCADE, so all their data goes with it.
   */
  async delete(userId: number) {
    await db.delete(users).where(eq(users.id, userId))
  },
}
