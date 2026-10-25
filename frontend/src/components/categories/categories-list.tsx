import { redirect } from "next/navigation"

import { CATEGORY_STATUS, getCategories, type CategoryStatus, type CategoryType } from "@/api/category.apis"
import { CategoriesTable } from "@/components/categories/categories-table"
import { TablePagination } from "@/components/transactions/table-pagination"
import { ApiError } from "@/lib/api"
import { getServerApi } from "@/lib/api-server"
import { withMinLoading } from "@/lib/min-loading"

export const CATEGORIES_PAGE_SIZE = 10

type CategoriesListProps = {
  type?: CategoryType
  status?: CategoryStatus
  page: number
  /** ?query values to keep in the pagination links */
  query: Record<string, string>
}

/** Loads one page of categories on the server, then renders the table + pagination. */
export async function CategoriesList({ type, status, page, query }: CategoriesListProps) {
  const isFiltered = type !== undefined || status !== CATEGORY_STATUS.active

  let result
  try {
    result = await withMinLoading(
      getCategories({ type, status, page, limit: CATEGORIES_PAGE_SIZE }, await getServerApi())
    )
  } catch (err) {
    if (err instanceof ApiError && err.statusCode === 401) redirect("/") // session expired
    return <CategoriesTable categories={[]} isFiltered={isFiltered} loadFailed />
  }

  const items = result.data?.items ?? []
  const { total = 0, totalPages = 0 } = result.data?.pagination ?? {}

  // Page past the end (e.g. its last category was just deactivated) → go to the last page.
  if (page > 1 && page > totalPages) {
    const params = new URLSearchParams(query)
    if (totalPages > 1) params.set("page", String(totalPages))
    const qs = params.toString()
    redirect(qs ? `/categories?${qs}` : "/categories")
  }

  return (
    <>
      <CategoriesTable categories={items} isFiltered={isFiltered} />
      <TablePagination
        page={page}
        pageSize={CATEGORIES_PAGE_SIZE}
        total={total}
        pathname="/categories"
        query={query}
      />
    </>
  )
}
