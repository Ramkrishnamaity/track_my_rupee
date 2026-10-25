import { and, asc, eq, inArray, isNotNull, or, sql } from "drizzle-orm"

import { db } from "@/db"
import { CATEGORY_STATUS, CATEGORY_TYPE, budgets, categories, transactions } from "@/db/schema"

type Period = { year: number; month: number }

/** One row on the Budgets page. */
export type BudgetItem = {
  categoryId: number
  categoryName: string
  colourCode: string
  /** 1 = active, 0 = inactive (an inactive category shows only if it already has a budget) */
  categoryStatus: number
  /** null = no budget saved yet for this month */
  budgetId: number | null
  amount: number
  spent: number
}

export type BudgetChange = { categoryId: number; amount: number }

export const BudgetModel = {
  /**
   * The month's budgets merged with the user's expense categories:
   * - every saved budget row (even if its category was deactivated later)
   * - every ACTIVE expense category without a budget → amount 0, spent 0
   */
  async listForMonth(userId: number, { year, month }: Period): Promise<BudgetItem[]> {
    const rows = await db
      .select({
        categoryId: categories.id,
        categoryName: categories.name,
        colourCode: categories.colourCode,
        categoryStatus: categories.status,
        budgetId: budgets.id,
        amount: budgets.amount,
        spent: budgets.spent,
      })
      .from(categories)
      .leftJoin(
        budgets,
        and(
          eq(budgets.categoryId, categories.id),
          eq(budgets.userId, userId),
          eq(budgets.year, year),
          eq(budgets.month, month)
        )
      )
      .where(
        and(
          eq(categories.userId, userId),
          eq(categories.type, CATEGORY_TYPE.expense),
          or(eq(categories.status, CATEGORY_STATUS.active), isNotNull(budgets.id))
        )
      )
      .orderBy(asc(sql`lower(${categories.name})`))

    // Categories without a budget come back with nulls → show them as 0.
    return rows.map((row) => ({
      ...row,
      budgetId: row.budgetId ?? null,
      amount: row.amount ?? 0,
      spent: row.spent ?? 0,
    }))
  },

  /** Only the budgets actually saved for the month (dashboard), by category name. */
  async listSetForMonth(userId: number, { year, month }: Period) {
    return db
      .select({
        budgetId: budgets.id,
        categoryId: categories.id,
        categoryName: categories.name,
        colourCode: categories.colourCode,
        amount: budgets.amount,
        spent: budgets.spent,
      })
      .from(budgets)
      .innerJoin(categories, eq(categories.id, budgets.categoryId))
      .where(and(eq(budgets.userId, userId), eq(budgets.year, year), eq(budgets.month, month)))
      .orderBy(asc(sql`lower(${categories.name})`))
  },

  /**
   * Saves the month in one DB transaction (all or nothing):
   * amount > 0 → create or update the budget; amount 0 → remove it.
   */
  async saveForMonth(userId: number, { year, month }: Period, changes: BudgetChange[]) {
    const toSave = changes.filter((change) => change.amount > 0)
    const toRemove = changes.filter((change) => change.amount === 0).map((change) => change.categoryId)

    await db.transaction(async (tx) => {
      if (toSave.length > 0) {
        await tx
          .insert(budgets)
          .values(
            toSave.map((change) => ({
              userId,
              categoryId: change.categoryId,
              year,
              month,
              amount: change.amount,
              // A new budget starts from what was already spent in this category this month.
              spent: sql<number>`(
                SELECT COALESCE(SUM(${transactions.amount}), 0) FROM ${transactions}
                WHERE ${transactions.userId} = ${userId}
                  AND ${transactions.categoryId} = ${change.categoryId}
                  AND ${transactions.year} = ${year}
                  AND ${transactions.month} = ${month}
                  AND ${transactions.type} = ${CATEGORY_TYPE.expense}
              )`,
            }))
          )
          .onConflictDoUpdate({
            target: [budgets.userId, budgets.year, budgets.month, budgets.categoryId],
            // Existing budget: only the limit changes; `spent` keeps its running total.
            set: { amount: sql`excluded.amount`, updatedAt: new Date() },
          })
      }

      if (toRemove.length > 0) {
        await tx
          .delete(budgets)
          .where(
            and(
              eq(budgets.userId, userId),
              eq(budgets.year, year),
              eq(budgets.month, month),
              inArray(budgets.categoryId, toRemove)
            )
          )
      }
    })
  },
}
