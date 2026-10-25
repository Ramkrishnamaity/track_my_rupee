import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"

import { CATEGORY_TYPE, getAllCategories, type Category } from "@/api/category.apis"
import { MonthPicker } from "@/components/app/month-picker"
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog"
import { CategoryFilter } from "@/components/transactions/category-filter"
import { TransactionsList } from "@/components/transactions/transactions-list"
import { TransactionsTable } from "@/components/transactions/transactions-table"
import { TypeFilter, type TypeFilterValue } from "@/components/transactions/type-filter"
import { Card, CardContent } from "@/components/ui/card"
import { ApiError } from "@/lib/api"
import { getServerApi } from "@/lib/api-server"
import { compareYearMonth, currentYearMonth, formatYearMonthParam, parseYearMonth } from "@/lib/month"

export const metadata: Metadata = { title: "Transactions" }

/** All the user's categories, for the filter and the Add form ([] if they can't be loaded). */
async function loadCategories(): Promise<Category[]> {
  try {
    const { data } = await getAllCategories(0, await getServerApi())
    return data?.items ?? []
  } catch (err) {
    if (err instanceof ApiError && err.statusCode === 401) redirect("/") // session expired
    return []
  }
}

export default async function TransactionsPage({ searchParams }: PageProps<"/transactions">) {
  const query = await searchParams
  const thisMonth = currentYearMonth()
  const parsed = parseYearMonth(query.month)
  // Future months aren't allowed: fall back to this month.
  const selected = compareYearMonth(parsed, thisMonth) > 0 ? thisMonth : parsed
  const type: TypeFilterValue = query.type === "income" || query.type === "expense" ? query.type : "all"
  const requestedPage = Number(query.page)
  const page = Number.isInteger(requestedPage) && requestedPage > 1 ? requestedPage : 1

  const categories = await loadCategories()
  // Category options follow the type filter; a category of the other type is ignored.
  const categoryOptions = categories.filter((c) => type === "all" || c.type === CATEGORY_TYPE[type])
  const category = categoryOptions.find((c) => String(c.id) === query.category)

  // ?query values the pagination links keep
  const keepQuery: Record<string, string> = {
    ...(typeof query.month === "string" && { month: query.month }),
    ...(type !== "all" && { type }),
    ...(category && { category: String(category.id) }),
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Transactions</h2>
        <div className="flex flex-wrap items-center gap-2">
          <TypeFilter value={type} />
          <CategoryFilter value={category ? String(category.id) : "all"} categories={categoryOptions} />
          <MonthPicker value={selected} max={thisMonth} />
          <AddTransactionDialog categories={categories} />
        </div>
      </div>

      <Card>
        <CardContent className="px-2 sm:px-4">
          {/* New key on every filter/page change → the table (with header) shows a loader row */}
          <Suspense
            key={`${formatYearMonthParam(selected)}-${type}-${category?.id ?? "all"}-${page}`}
            fallback={<TransactionsTable showActions loading />}
          >
            <TransactionsList
              year={selected.year}
              month={selected.month}
              type={type === "all" ? undefined : CATEGORY_TYPE[type]}
              categoryId={category?.id}
              page={page}
              query={keepQuery}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
