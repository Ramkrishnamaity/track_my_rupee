import { api, type ApiClient, type Paginated } from "@/lib/api"

// Category APIs. Every function uses the browser client by default; on the
// Next.js server pass `await getServerApi()` as the last argument.

/** 1 = income, 2 = expense */
export const CATEGORY_TYPE = { income: 1, expense: 2 } as const
export type CategoryType = (typeof CATEGORY_TYPE)[keyof typeof CATEGORY_TYPE]

/** 0 = inactive, 1 = active */
export const CATEGORY_STATUS = { inactive: 0, active: 1 } as const
export type CategoryStatus = (typeof CATEGORY_STATUS)[keyof typeof CATEGORY_STATUS]

export type Category = {
  id: number
  name: string
  type: CategoryType
  status: CategoryStatus
  /** e.g. "#F97316" */
  colourCode: string
  createdAt: string
  updatedAt: string
}

/** 1 → "income", 2 → "expense" (labels, badges, the type switch) */
/** Name form of the type, used by the type switches and filters in the UI. */
export type TransactionType = "income" | "expense"

export const categoryTypeName = (type: CategoryType): TransactionType =>
  type === CATEGORY_TYPE.income ? "income" : "expense"

export type GetCategoriesParams = {
  type?: CategoryType
  status?: CategoryStatus
  page?: number
  limit?: number
}

/** GET /categories: one page, with optional type/status filters */
export const getCategories = (params: GetCategoriesParams, client: ApiClient = api) =>
  client.get<Paginated<Category>>("/categories", { params })

/** GET /categories/all: every category for dropdowns (type 0 = all), no paging */
export const getAllCategories = (type: 0 | CategoryType = 0, client: ApiClient = api) =>
  client.get<{ items: Category[] }>("/categories/all", { params: { type } })

/** POST /categories: new categories start active */
export const createCategory = (
  body: { name: string; type: CategoryType; colourCode: string },
  client: ApiClient = api
) => client.post<Category>("/categories", body)

/** PATCH /categories/:id: name and/or colour (type can't change) */
export const updateCategory = (
  id: number,
  body: { name?: string; colourCode?: string },
  client: ApiClient = api
) => client.patch<Category>(`/categories/${id}`, body)

/** PATCH /categories/:id/status: activate (1) or deactivate (0) */
export const updateCategoryStatus = (id: number, status: CategoryStatus, client: ApiClient = api) =>
  client.patch<Category>(`/categories/${id}/status`, { status })
