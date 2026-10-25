import { Router } from "express"

import { authRouter } from "@/routes/auth.routes"
import { budgetRouter } from "@/routes/budget.routes"
import { categoryRouter } from "@/routes/category.routes"
import { dashboardRouter } from "@/routes/dashboard.routes"
import { settingsRouter } from "@/routes/settings.routes"
import { transactionRouter } from "@/routes/transaction.routes"
import { ApiResponse } from "@/utils/api-response"

/** All API routes, mounted under /api/v1 in app.ts. Add new feature routers here. */
export const apiRouter = Router()

// GET /api/v1/health: quick "is the API up?" check (no login needed).
apiRouter.get("/health", (_req, res) => {
  ApiResponse.success(res, "API is running")
})

apiRouter.use("/auth", authRouter)
apiRouter.use("/categories", categoryRouter)
apiRouter.use("/budgets", budgetRouter)
apiRouter.use("/transactions", transactionRouter)
apiRouter.use("/dashboard", dashboardRouter)
apiRouter.use("/settings", settingsRouter)
