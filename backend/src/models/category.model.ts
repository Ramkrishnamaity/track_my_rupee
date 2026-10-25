import { and, asc, count, eq, inArray, ne, sql } from "drizzle-orm"

import { db } from "@/db"
import { categories, type Category, type CategoryStatus, type CategoryType } from "@/db/schema"

/** What the API returns (userId is implied by the session). */
export type PublicCategory = Omit<Category, "userId">

export function toPublicCategory({ userId: _userId, ...category }: Category): PublicCategory {
  return category
}

type ListFilters = { type?: CategoryType; status?: CategoryStatus }

// Every query is scoped to the user, so nobody can read or change another user's data.
const ownCategory = (userId: number, categoryId: number) =>
  and(eq(categories.userId, userId), eq(categories.id, categoryId))

export const CategoryModel = {
  /** One page of the user's categories (income first, then by name) + the total count. */
  async list(userId: number, filters: ListFilters, page: number, limit: number) {
    const where = and(
      eq(categories.userId, userId),
      filters.type !== undefined ? eq(categories.type, filters.type) : undefined,
      filters.status !== undefined ? eq(categories.status, filters.status) : undefined
    )

    const [rows, [totals]] = await Promise.all([
      db
        .select()
        .from(categories)
        .where(where)
        .orderBy(asc(categories.type), asc(sql`lower(${categories.name})`))
        .limit(limit)
        .offset((page - 1) * limit),
      db.select({ total: count() }).from(categories).where(where),
    ])

    return { rows, total: totals?.total ?? 0 }
  },

  /** Every category of the user (optionally one type), income first then by name. No paging. */
  async listAll(userId: number, type?: CategoryType) {
    const rows = await db
      .select()
      .from(categories)
      .where(and(eq(categories.userId, userId), type !== undefined ? eq(categories.type, type) : undefined))
      .orderBy(asc(categories.type), asc(sql`lower(${categories.name})`))
    return rows
  },

  /** The user's category, or null if it doesn't exist / belongs to someone else. */
  async findOwn(userId: number, categoryId: number) {
    const [category] = await db.select().from(categories).where(ownCategory(userId, categoryId)).limit(1)
    return category ?? null
  },

  /** Which of these ids are the user's categories of the given type? */
  async findOwnIdsOfType(userId: number, ids: number[], type: CategoryType) {
    const rows = await db
      .select({ id: categories.id })
      .from(categories)
      .where(and(eq(categories.userId, userId), eq(categories.type, type), inArray(categories.id, ids)))
    return new Set(rows.map((row) => row.id))
  },

  /** Is this name already used by the user for this type? (case-insensitive) */
  async isNameTaken(userId: number, type: CategoryType, name: string, excludeId?: number) {
    const [row] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(
        and(
          eq(categories.userId, userId),
          eq(categories.type, type),
          eq(sql`lower(${categories.name})`, name.toLowerCase()),
          excludeId !== undefined ? ne(categories.id, excludeId) : undefined
        )
      )
      .limit(1)
    return row !== undefined
  },

  async create(userId: number, data: { name: string; type: CategoryType; colourCode: string }) {
    const [category] = await db
      .insert(categories)
      .values({ userId, ...data })
      .returning()
    return category!
  },

  async update(userId: number, categoryId: number, data: { name?: string; colourCode?: string }) {
    const [category] = await db
      .update(categories)
      .set(data)
      .where(ownCategory(userId, categoryId))
      .returning()
    return category!
  },

  async setStatus(userId: number, categoryId: number, status: CategoryStatus) {
    const [category] = await db
      .update(categories)
      .set({ status })
      .where(ownCategory(userId, categoryId))
      .returning()
    return category!
  },
}
