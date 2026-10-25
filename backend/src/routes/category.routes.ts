import { Router } from "express"

import {
  createCategory,
  listAllCategories,
  listCategories,
  updateCategory,
  updateCategoryStatus,
} from "@/controllers/category.controller"
import { authenticate } from "@/middlewares/authenticate"
import { categoryExists, uniqueCategoryName } from "@/middlewares/category.middleware"
import { validate } from "@/middlewares/validate"
import {
  allCategoriesQuery,
  categoryIdParams,
  createCategoryBody,
  listCategoriesQuery,
  updateCategoryBody,
  updateCategoryStatusBody,
} from "@/validators/category.validator"

export const categoryRouter = Router()

// Every category route needs a logged-in user, so check that once for the whole router.
categoryRouter.use(authenticate)

// Each route: input validation → database checks → controller

categoryRouter.get("/", validate({ query: listCategoriesQuery }), listCategories)

categoryRouter.get("/all", validate({ query: allCategoriesQuery }), listAllCategories)

categoryRouter.post("/", validate({ body: createCategoryBody }), uniqueCategoryName, createCategory)

categoryRouter.patch(
  "/:id",
  validate({ params: categoryIdParams, body: updateCategoryBody }),
  categoryExists,
  uniqueCategoryName,
  updateCategory
)

categoryRouter.patch(
  "/:id/status",
  validate({ params: categoryIdParams, body: updateCategoryStatusBody }),
  categoryExists,
  updateCategoryStatus
)
