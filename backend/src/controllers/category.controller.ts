import type { RequestHandler } from "express"

import { CategoryModel, toPublicCategory } from "@/models/category.model"
import { ApiResponse } from "@/utils/api-response"
import type {
  AllCategoriesQuery,
  CreateCategoryBody,
  ListCategoriesQuery,
  UpdateCategoryBody,
  UpdateCategoryStatusBody,
} from "@/validators/category.validator"

// Business logic only. By the time these run, the route's middlewares have
// checked login (authenticate), input (validate) and the database
// (categoryExists / uniqueCategoryName).

/** GET /categories?type=&status=&page=&limit= */
export const listCategories: RequestHandler = async (req, res) => {
  const { type, status, page, limit } = req.validatedQuery as ListCategoriesQuery
  const { rows, total } = await CategoryModel.list(req.user!.id, { type, status }, page, limit)

  ApiResponse.success(res, "Categories fetched", {
    items: rows.map(toPublicCategory),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}

/** GET /categories/all?type=0|1|2: every category for dropdowns (0 = all types), no pagination */
export const listAllCategories: RequestHandler = async (req, res) => {
  const { type } = req.validatedQuery as AllCategoriesQuery
  const rows = await CategoryModel.listAll(req.user!.id, type === 0 ? undefined : type)
  ApiResponse.success(res, "Categories fetched", { items: rows.map(toPublicCategory) })
}

/** POST /categories { name, type, colourCode } */
export const createCategory: RequestHandler = async (req, res) => {
  const category = await CategoryModel.create(req.user!.id, req.body as CreateCategoryBody)
  ApiResponse.success(res, "Category created", toPublicCategory(category), 201)
}

/** PATCH /categories/:id { name?, colourCode? } */
export const updateCategory: RequestHandler = async (req, res) => {
  const category = await CategoryModel.update(
    req.user!.id,
    res.locals.category!.id,
    req.body as UpdateCategoryBody
  )
  ApiResponse.success(res, "Category updated", toPublicCategory(category))
}

/** PATCH /categories/:id/status { status: 0 | 1 } */
export const updateCategoryStatus: RequestHandler = async (req, res) => {
  const { status } = req.body as UpdateCategoryStatusBody
  const category = await CategoryModel.setStatus(req.user!.id, res.locals.category!.id, status)
  ApiResponse.success(
    res,
    status === 1 ? "Category activated" : "Category deactivated",
    toPublicCategory(category)
  )
}
