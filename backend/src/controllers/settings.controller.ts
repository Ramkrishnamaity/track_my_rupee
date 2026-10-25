import type { RequestHandler } from "express"

import { SESSION_COOKIE, clearOptions, sessionCookieOptions } from "@/config/cookies"
import { UserModel } from "@/models/user.model"
import { ApiResponse } from "@/utils/api-response"

// Danger zone. Business logic only; `authenticate` already loaded req.user.

/** POST /settings/reset-account: delete all data, keep the account (stays logged in) */
export const resetAccount: RequestHandler = async (req, res) => {
  await UserModel.resetData(req.user!.id)
  ApiResponse.success(res, "Your account has been reset")
}

/** DELETE /settings/account: delete the account and all its data, then log out */
export const deleteAccount: RequestHandler = async (req, res) => {
  await UserModel.delete(req.user!.id)
  res.clearCookie(SESSION_COOKIE, clearOptions(sessionCookieOptions))
  ApiResponse.success(res, "Your account has been deleted")
}
