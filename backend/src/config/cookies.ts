import type { CookieOptions } from "express"

import { env, isProduction } from "@/config/env"
import { durationToMs } from "@/utils/jwt"

/** Holds the login session JWT. */
export const SESSION_COOKIE = "tmr_session"

/** Short-lived cookie that carries state + PKCE verifier through the Google redirect. */
export const OAUTH_COOKIE = "tmr_oauth"
export const OAUTH_TTL = "10m"

const base: CookieOptions = {
  httpOnly: true, // JavaScript in the browser can't read it
  secure: isProduction, // HTTPS only in production
  sameSite: "lax", // sent on normal navigation, not on cross-site POSTs (CSRF protection)
}

export const sessionCookieOptions: CookieOptions = {
  ...base,
  path: "/",
  maxAge: durationToMs(env.JWT_EXPIRES_IN),
}

export const oauthCookieOptions: CookieOptions = {
  ...base,
  path: "/api/v1/auth/google", // only sent to the login + callback routes
  maxAge: durationToMs(OAUTH_TTL),
}

/** Options to pass to res.clearCookie (must match path/flags, without maxAge). */
export const clearOptions = ({ maxAge: _maxAge, ...rest }: CookieOptions) => rest
