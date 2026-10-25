import { Router } from "express"

import { deleteAccount, resetAccount } from "@/controllers/settings.controller"
import { authenticate } from "@/middlewares/authenticate"

export const settingsRouter = Router()

// Every settings route needs a logged-in user, so check that once for the whole router.
settingsRouter.use(authenticate)

// Danger zone (no input to validate: they act on the logged-in user)
settingsRouter.post("/reset-account", resetAccount)
settingsRouter.delete("/account", deleteAccount)
