import { randomBytes } from "node:crypto"
import { CodeChallengeMethod, OAuth2Client } from "google-auth-library"

import { env } from "@/config/env"

const client = new OAuth2Client({
  clientId: env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET,
  redirectUri: env.GOOGLE_REDIRECT_URI,
})

export type GoogleProfile = {
  googleId: string
  email: string
  name: string
  avatarUrl: string | null
}

/**
 * Step 1: build the Google sign-in URL.
 * `state` (anti-CSRF) and `codeVerifier` (PKCE) must be kept until the callback.
 */
export async function createGoogleAuthRequest() {
  const state = randomBytes(32).toString("base64url")
  const { codeVerifier, codeChallenge } = await client.generateCodeVerifierAsync()

  const url = client.generateAuthUrl({
    scope: ["openid", "email", "profile"],
    access_type: "online", // we don't need Google refresh tokens
    prompt: "select_account", // always let the user pick an account
    state,
    code_challenge_method: CodeChallengeMethod.S256,
    code_challenge: codeChallenge,
  })

  return { url, state, codeVerifier }
}

/**
 * Step 2 (callback): swap the one-time code for tokens, verify Google's ID token
 * and return the user's profile.
 */
export async function getGoogleProfile(code: string, codeVerifier: string): Promise<GoogleProfile> {
  const { tokens } = await client.getToken({ code, codeVerifier })
  if (!tokens.id_token) throw new Error("Google did not return an ID token")

  // Checks signature, issuer (Google), audience (our client id) and expiry.
  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: env.GOOGLE_CLIENT_ID,
  })
  const payload = ticket.getPayload()

  if (!payload?.sub || !payload.email) throw new Error("Google profile is missing id or email")
  if (!payload.email_verified) throw new Error("Google email is not verified")

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name?.trim() || payload.email.split("@")[0]!,
    avatarUrl: payload.picture ?? null,
  }
}
