import type { Metadata } from "next"
import { Suspense } from "react"

import { CATEGORY_STATUS, CATEGORY_TYPE } from "@/api/category.apis"
import { CategoriesList } from "@/components/categories/categories-list"
import { CategoriesTable } from "@/components/categories/categories-table"
import { AddCategoryDialog } from "@/components/categories/category-dialogs"
import { StatusFilter, type StatusFilterValue } from "@/components/categories/status-filter"
import { TypeFilter, type TypeFilterValue } from "@/components/transactions/type-filter"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = { title: "Categories" }

export default async function CategoriesPage({ searchParams }: PageProps<"/categories">) {
  const query = await searchParams
  const type: TypeFilterValue = query.type === "income" || query.type === "expense" ? query.type : "all"
  // Status defaults to "active" when ?status= is missing.
  const status: StatusFilterValue =
    query.status === "all" || query.status === "inactive" ? query.status : "active"
  const requestedPage = Number(query.page)
  const page = Number.isInteger(requestedPage) && requestedPage > 1 ? requestedPage : 1

  // ?query values the pagination links keep
  const keepQuery: Record<string, string> = {
    ...(type !== "all" && { type }),
    ...(status !== "active" && { status }),
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Categories</h2>
        <div className="flex flex-wrap items-center gap-2">
          <TypeFilter value={type} />
          <StatusFilter value={status} />
          <AddCategoryDialog />
        </div>
      </div>

      <Card>
        <CardContent className="px-2 sm:px-4">
          {/* New key on every filter/page change → the table (with header) shows a loader row while it reloads */}
          <Suspense key={`${type}-${status}-${page}`} fallback={<CategoriesTable loading />}>
            <CategoriesList
              type={type === "all" ? undefined : CATEGORY_TYPE[type]}
              status={status === "all" ? undefined : CATEGORY_STATUS[status]}
              page={page}
              query={keepQuery}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
