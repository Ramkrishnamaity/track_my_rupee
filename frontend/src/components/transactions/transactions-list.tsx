import { redirect } from "next/navigation"

import type { CategoryType } from "@/api/category.apis"
import { getTransactions } from "@/api/transaction.apis"
import { TablePagination } from "@/components/transactions/table-pagination"
import { TransactionsTable } from "@/components/transactions/transactions-table"
import { ApiError } from "@/lib/api"
import { getServerApi } from "@/lib/api-server"
import { withMinLoading } from "@/lib/min-loading"

export const TRANSACTIONS_PAGE_SIZE = 10

type TransactionsListProps = {
  year: number
  month: number
  type?: CategoryType
  categoryId?: number
  page: number
  /** ?query values to keep in the pagination links */
  query: Record<string, string>
}

/** Loads one page of a month's transactions on the server, then renders the table + pagination. */
export async function TransactionsList({
  year,
  month,
  type,
  categoryId,
  page,
  query,
}: TransactionsListProps) {
  const isFiltered = type !== undefined || categoryId !== undefined

  let result
  try {
    result = await withMinLoading(
      getTransactions(
        { year, month, type, categoryId, page, limit: TRANSACTIONS_PAGE_SIZE },
        await getServerApi()
      )
    )
  } catch (err) {
    if (err instanceof ApiError && err.statusCode === 401) redirect("/") // session expired
    return <TransactionsTable showActions isFiltered={isFiltered} loadFailed />
  }

  const items = result.data?.items ?? []
  const { total = 0, totalPages = 0 } = result.data?.pagination ?? {}

  // Page past the end (e.g. its last transaction was just deleted) → go to the last page.
  if (page > 1 && page > totalPages) {
    const params = new URLSearchParams(query)
    if (totalPages > 1) params.set("page", String(totalPages))
    const qs = params.toString()
    redirect(qs ? `/transactions?${qs}` : "/transactions")
  }

  return (
    <>
      <TransactionsTable transactions={items} showActions isFiltered={isFiltered} />
      <TablePagination
        page={page}
        pageSize={TRANSACTIONS_PAGE_SIZE}
        total={total}
        pathname="/transactions"
        query={query}
      />
    </>
  )
}
