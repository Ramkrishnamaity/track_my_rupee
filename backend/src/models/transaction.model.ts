import { and, count, desc, eq, sql } from "drizzle-orm"

import { db } from "@/db"
import {
  CATEGORY_TYPE,
  balances,
  budgets,
  categories,
  transactions,
  type CategoryType,
  type PaymentMethod,
  type Transaction,
} from "@/db/schema"

/** A transaction as the API returns it, with its category's name and colour. */
const transactionColumns = {
  id: transactions.id,
  type: transactions.type,
  paymentMethod: transactions.paymentMethod,
  title: transactions.title,
  amount: transactions.amount,
  date: transactions.date,
  time: transactions.time,
  year: transactions.year,
  month: transactions.month,
  categoryId: transactions.categoryId,
  categoryName: categories.name,
  colourCode: categories.colourCode,
  createdAt: transactions.createdAt,
}

// Newest first: by the user's date and time, then by insert order.
const newestFirst = [desc(transactions.date), desc(transactions.time), desc(transactions.id)]

type ListFilters = { year: number; month: number; type?: CategoryType; categoryId?: number }

export type NewTransactionInput = {
  type: CategoryType
  categoryId: number
  paymentMethod: PaymentMethod
  title: string
  amount: number
  /** "2026-11-01" */
  date: string
  /** "13:45" or "13:45:30" */
  time: string
}

/** year and month always come from the date the user entered ("2026-11-01" → 2026, 11). */
const periodOf = (date: string) => ({ year: Number(date.slice(0, 4)), month: Number(date.slice(5, 7)) })

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]

/**
 * Adds (+amount) or removes (−amount) a transaction's effect on the running totals:
 * - balances: income or expense of its month (row created if missing)
 * - budgets.spent: for expenses, if the category has a budget that month
 * `saving` is recalculated by Postgres automatically.
 */
async function applyToTotals(
  tx: Tx,
  userId: number,
  t: Pick<Transaction, "type" | "categoryId" | "amount" | "year" | "month">,
  sign: 1 | -1
) {
  const delta = t.amount * sign
  const isIncome = t.type === CATEGORY_TYPE.income

  await tx
    .insert(balances)
    .values({
      userId,
      year: t.year,
      month: t.month,
      income: isIncome ? Math.max(delta, 0) : 0,
      expense: isIncome ? 0 : Math.max(delta, 0),
    })
    .onConflictDoUpdate({
      target: [balances.userId, balances.year, balances.month],
      set: isIncome
        ? { income: sql`${balances.income} + ${delta}`, updatedAt: new Date() }
        : { expense: sql`${balances.expense} + ${delta}`, updatedAt: new Date() },
    })

  if (!isIncome) {
    await tx
      .update(budgets)
      .set({ spent: sql`${budgets.spent} + ${delta}`, updatedAt: new Date() })
      .where(
        and(
          eq(budgets.userId, userId),
          eq(budgets.categoryId, t.categoryId),
          eq(budgets.year, t.year),
          eq(budgets.month, t.month)
        )
      )
  }
}

export const TransactionModel = {
  /** One page of a month's transactions (newest first) + the total count. */
  async list(userId: number, filters: ListFilters, page: number, limit: number) {
    const where = and(
      eq(transactions.userId, userId),
      eq(transactions.year, filters.year),
      eq(transactions.month, filters.month),
      filters.type !== undefined ? eq(transactions.type, filters.type) : undefined,
      filters.categoryId !== undefined ? eq(transactions.categoryId, filters.categoryId) : undefined
    )

    const [rows, [totals]] = await Promise.all([
      db
        .select(transactionColumns)
        .from(transactions)
        .innerJoin(categories, eq(categories.id, transactions.categoryId))
        .where(where)
        .orderBy(...newestFirst)
        .limit(limit)
        .offset((page - 1) * limit),
      db.select({ total: count() }).from(transactions).where(where),
    ])

    return { rows, total: totals?.total ?? 0 }
  },

  /** The latest transactions across all months (dashboard). */
  async recent(userId: number, limit: number) {
    return db
      .select(transactionColumns)
      .from(transactions)
      .innerJoin(categories, eq(categories.id, transactions.categoryId))
      .where(eq(transactions.userId, userId))
      .orderBy(...newestFirst)
      .limit(limit)
  },

  /** A month's expenses added up per category, biggest first (dashboard donut). */
  async spendingByCategory(userId: number, period: { year: number; month: number }) {
    const amount = sql<number>`SUM(${transactions.amount})`.mapWith(Number)
    return db
      .select({
        categoryId: categories.id,
        categoryName: categories.name,
        colourCode: categories.colourCode,
        amount,
      })
      .from(transactions)
      .innerJoin(categories, eq(categories.id, transactions.categoryId))
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.year, period.year),
          eq(transactions.month, period.month),
          eq(transactions.type, CATEGORY_TYPE.expense)
        )
      )
      .groupBy(categories.id, categories.name, categories.colourCode)
      .orderBy(desc(amount))
  },

  /** The user's transaction, or null if it doesn't exist / belongs to someone else. */
  async findOwn(userId: number, transactionId: number) {
    const [row] = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.id, transactionId)))
      .limit(1)
    return row ?? null
  },

  /** Saves the transaction and updates balances + budgets.spent, all or nothing. */
  async create(userId: number, input: NewTransactionInput) {
    const id = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(transactions)
        .values({ userId, ...input, ...periodOf(input.date) })
        .returning()
      await applyToTotals(tx, userId, created!, 1)
      return created!.id
    })

    // Read it back with the category name/colour for the response.
    const [row] = await db
      .select(transactionColumns)
      .from(transactions)
      .innerJoin(categories, eq(categories.id, transactions.categoryId))
      .where(eq(transactions.id, id))
    return row!
  },

  /** Reverses its effect on balances + budgets.spent, then deletes it, all or nothing. */
  async delete(userId: number, transaction: Transaction) {
    await db.transaction(async (tx) => {
      await applyToTotals(tx, userId, transaction, -1)
      await tx
        .delete(transactions)
        .where(and(eq(transactions.userId, userId), eq(transactions.id, transaction.id)))
    })
  },
}
