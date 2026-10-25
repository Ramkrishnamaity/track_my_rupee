import { timingSafeEqual } from "node:crypto"
import type { Request, RequestHandler, Response } from "express"

import {
  OAUTH_COOKIE,
  OAUTH_TTL,
  SESSION_COOKIE,
  clearOptions,
  oauthCookieOptions,
  sessionCookieOptions,
} from "@/config/cookies"
import { env } from "@/config/env"
import { UserModel, toPublicUser } from "@/models/user.model"
import { createGoogleAuthRequest, getGoogleProfile } from "@/services/google-oauth.service"
import { ApiResponse } from "@/utils/api-response"
import { signToken, verifyToken } from "@/utils/jwt"

type OAuthState = { state: string; codeVerifier: string; timezone: string | null }

/** Accepts only real IANA zones like "Asia/Kolkata"; anything else → null. */
function parseTimezone(value: unknown) {
  if (typeof value !== "string" || !value || value.length > 64) return null
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value })
    return value
  } catch {
    return null
  }
}

function sameString(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

/** Send the browser back to the frontend home page with a short error code. */
function failLogin(res: Response, reason: "cancelled" | "expired" | "failed") {
  res.clearCookie(OAUTH_COOKIE, clearOptions(oauthCookieOptions))
  res.redirect(`${env.FRONTEND_URL}/?login_error=${reason}`)
}

/**
 * GET /auth/google?tz=Asia/Kolkata
 * Starts login: remembers state + PKCE verifier in a signed cookie, then redirects to Google.
 */
export const startGoogleLogin: RequestHandler = async (req, res) => {
  const { url, state, codeVerifier } = await createGoogleAuthRequest()
  const timezone = parseTimezone(req.query.tz)

  const oauthToken = await signToken({ state, codeVerifier, timezone } satisfies OAuthState, {
    purpose: "oauth",
    expiresIn: OAUTH_TTL,
  })
  res.cookie(OAUTH_COOKIE, oauthToken, oauthCookieOptions)
  res.redirect(url)
}

/**
 * GET /auth/google/callback?code=…&state=…
 * Google sends the browser here. Verifies state, exchanges the code, creates or
 * updates the user, sets the session cookie and redirects to the dashboard.
 */
export const googleCallback = async (req: Request, res: Response) => {
  // User pressed "Cancel" on Google's screen.
  if (req.query.error) return failLogin(res, "cancelled")

  const { code, state } = req.query
  const stored = await verifyToken<OAuthState>(String(req.cookies?.[OAUTH_COOKIE] ?? ""), "oauth")
  if (typeof code !== "string" || typeof state !== "string" || !stored || !sameString(state, stored.state)) {
    return failLogin(res, "expired")
  }

  try {
    const profile = await getGoogleProfile(code, stored.codeVerifier)
    const user = await UserModel.upsertFromGoogle(profile, stored.timezone)

    const sessionToken = await signToken(
      {},
      {
        purpose: "session",
        expiresIn: env.JWT_EXPIRES_IN,
        subject: String(user.id),
      }
    )
    res.clearCookie(OAUTH_COOKIE, clearOptions(oauthCookieOptions))
    res.cookie(SESSION_COOKIE, sessionToken, sessionCookieOptions)
    res.redirect(`${env.FRONTEND_URL}/dashboard`)
  } catch (err) {
    req.log.error({ err }, "Google login failed")
    failLogin(res, "failed")
  }
}

/** GET /auth/me: the logged-in user. */
export const getMe: RequestHandler = (req, res) => {
  ApiResponse.success(res, "Logged in user", toPublicUser(req.user!))
}

/** POST /auth/logout: clears the session cookie. */
export const logout: RequestHandler = (_req, res) => {
  res.clearCookie(SESSION_COOKIE, clearOptions(sessionCookieOptions))
  ApiResponse.success(res, "Logged out")
}
