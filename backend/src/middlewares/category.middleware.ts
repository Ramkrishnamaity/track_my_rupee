import type { RequestHandler } from "express"

import { CategoryModel } from "@/models/category.model"
import { ApiError } from "@/utils/api-error"
import type {
  CategoryIdParams,
  CreateCategoryBody,
  UpdateCategoryBody,
} from "@/validators/category.validator"

// Database checks for category routes. They run after `authenticate` and `validate`,
// so req.user is set and req.params / req.body are already cleaned.

/**
 * 404 unless the category exists AND belongs to the logged-in user.
 * Passes it on as res.locals.category, so the controller doesn't load it again.
 */
export const categoryExists: RequestHandler = async (req, res, next) => {
  const { id } = req.params as unknown as CategoryIdParams
  const category = await CategoryModel.findOwn(req.user!.id, id)
  if (!category) throw new ApiError(404, "Category not found")

  res.locals.category = category
  next()
}

/**
 * 409 if the user already has a category with this name and type (case-insensitive).
 * Create: type comes from the body. Edit: type comes from the existing category
 * (run `categoryExists` first), and the category itself is excluded from the check.
 */
export const uniqueCategoryName: RequestHandler = async (req, res, next) => {
  const body = req.body as CreateCategoryBody | UpdateCategoryBody
  if (!body.name) return next() // edit without a new name: nothing to check

  const existing = res.locals.category
  const type = existing?.type ?? (body as CreateCategoryBody).type

  if (await CategoryModel.isNameTaken(req.user!.id, type, body.name, existing?.id)) {
    throw new ApiError(409, "You already have a category with this name")
  }
  next()
}
