import { Router } from "express"

import { getBudgets, saveBudgets } from "@/controllers/budget.controller"
import { authenticate } from "@/middlewares/authenticate"
import { budgetCategoriesValid } from "@/middlewares/budget.middleware"
import { validate } from "@/middlewares/validate"
import { getBudgetsQuery, saveBudgetsBody } from "@/validators/budget.validator"

export const budgetRouter = Router()

// Every budget route needs a logged-in user, so check that once for the whole router.
budgetRouter.use(authenticate)

// Each route: input validation → database checks → controller

budgetRouter.get("/", validate({ query: getBudgetsQuery }), getBudgets)

budgetRouter.put("/", validate({ body: saveBudgetsBody }), budgetCategoriesValid, saveBudgets)
