import type { RequestHandler } from "express"

import { SESSION_COOKIE, clearOptions, sessionCookieOptions } from "@/config/cookies"
import { UserModel } from "@/models/user.model"
import { ApiError } from "@/utils/api-error"
import { verifyToken } from "@/utils/jwt"

/**
 * Protects a route: reads the session cookie, checks the JWT and loads the user
 * into `req.user`. Responds 401 if not logged in.
 */
export const authenticate: RequestHandler = async (req, res, next) => {
  const token = (req.cookies as Record<string, unknown>)[SESSION_COOKIE]
  if (typeof token !== "string" || !token) throw new ApiError(401, "Please log in to continue")

  const payload = await verifyToken(token, "session")
  const userId = Number(payload?.sub)
  if (!payload || !Number.isSafeInteger(userId)) {
    res.clearCookie(SESSION_COOKIE, clearOptions(sessionCookieOptions))
    throw new ApiError(401, "Your session has expired, please log in again")
  }

  // Load fresh from the DB, so a deleted account can't keep using an old cookie.
  const user = await UserModel.findById(userId)
  if (!user) {
    res.clearCookie(SESSION_COOKIE, clearOptions(sessionCookieOptions))
    throw new ApiError(401, "Account not found, please log in again")
  }

  req.user = user
  next()
}
