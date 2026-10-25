import { SignJWT, jwtVerify, type JWTPayload } from "jose"

import { env } from "@/config/env"

const secret = new TextEncoder().encode(env.JWT_SECRET)
const ISSUER = "trackmyrupee-api"

/**
 * Each token type gets its own audience, so a token made for one purpose
 * (e.g. the short-lived Google login state) can never be used as another
 * (e.g. a login session).
 */
export type TokenPurpose = "session" | "oauth"

export async function signToken(
  payload: JWTPayload,
  { purpose, expiresIn, subject }: { purpose: TokenPurpose; expiresIn: string; subject?: string }
) {
  const jwt = new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setAudience(purpose)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
  if (subject) jwt.setSubject(subject)
  return jwt.sign(secret)
}

/** Returns the payload, or null if the token is invalid, expired or for another purpose. */
export async function verifyToken<T extends JWTPayload = JWTPayload>(
  token: string,
  purpose: TokenPurpose
): Promise<T | null> {
  try {
    const { payload } = await jwtVerify<T>(token, secret, {
      issuer: ISSUER,
      audience: purpose,
      algorithms: ["HS256"],
    })
    return payload
  } catch {
    return null
  }
}

/** "7d" → 604800000 (ms), for cookie maxAge. */
export function durationToMs(duration: string) {
  const match = /^(\d+)([smhd])$/.exec(duration)
  if (!match) throw new Error(`Invalid duration: ${duration}`)
  const unit = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2] as "s" | "m" | "h" | "d"]
  return Number(match[1]) * unit
}
