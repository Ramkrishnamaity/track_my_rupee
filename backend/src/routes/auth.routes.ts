import { Router } from "express"

import { getMe, googleCallback, logout, startGoogleLogin } from "@/controllers/auth.controller"
import { authenticate } from "@/middlewares/authenticate"
import { authLimiter } from "@/middlewares/rate-limit"

export const authRouter = Router()

authRouter.get("/google", authLimiter, startGoogleLogin) // → redirects to Google
authRouter.get("/google/callback", authLimiter, googleCallback) // ← Google redirects back here
authRouter.get("/me", authenticate, getMe)
authRouter.post("/logout", logout)
