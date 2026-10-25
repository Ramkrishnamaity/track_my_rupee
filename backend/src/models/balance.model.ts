import { and, asc, eq, sql } from "drizzle-orm"

import { db } from "@/db"
import { balances } from "@/db/schema"

type Period = { year: number; month: number }

/** Income, expense and saving of one month (0s when the month has no transactions yet). */
export type MonthTotals = Period & { income: number; expense: number; saving: number }

const emptyMonth = (period: Period): MonthTotals => ({ ...period, income: 0, expense: 0, saving: 0 })

const totalsColumns = {
  year: balances.year,
  month: balances.month,
  income: balances.income,
  expense: balances.expense,
  saving: balances.saving,
}

export const BalanceModel = {
  /** The month's totals. The balances row only exists after the month's first transaction. */
  async findMonth(userId: number, period: Period): Promise<MonthTotals> {
    const [row] = await db
      .select(totalsColumns)
      .from(balances)
      .where(
        and(eq(balances.userId, userId), eq(balances.year, period.year), eq(balances.month, period.month))
      )
      .limit(1)
    return row ? { ...row, saving: row.saving ?? 0 } : emptyMonth(period)
  },

  /** Every month from `from` to `to` (inclusive), oldest first; months without a row are 0s. */
  async listRange(userId: number, from: Period, to: Period): Promise<MonthTotals[]> {
    const rows = await db
      .select(totalsColumns)
      .from(balances)
      .where(
        and(
          eq(balances.userId, userId),
          // Row comparison: (2026, 5) <= (year, month) <= (2026, 10); uses the (user_id, year, month) index.
          sql`(${balances.year}, ${balances.month}) >= (${from.year}, ${from.month})`,
          sql`(${balances.year}, ${balances.month}) <= (${to.year}, ${to.month})`
        )
      )
      .orderBy(asc(balances.year), asc(balances.month))

    const byMonth = new Map(rows.map((row) => [`${row.year}-${row.month}`, row]))
    const months: MonthTotals[] = []
    for (let i = from.year * 12 + from.month - 1; i <= to.year * 12 + to.month - 1; i++) {
      const period = { year: Math.floor(i / 12), month: (i % 12) + 1 }
      const row = byMonth.get(`${period.year}-${period.month}`)
      months.push(row ? { ...row, saving: row.saving ?? 0 } : emptyMonth(period))
    }
    return months
  },
}
