import { cookies } from "next/headers"

import { env } from "@/config/env"
import { createApiClient } from "@/lib/api"

/** Must match SESSION_COOKIE in backend/src/config/cookies.ts */
export const SESSION_COOKIE = "tmr_session"

/**
 * API client for Server Components / Server Actions.
 * Requests from the Next.js server don't carry the browser's cookies, so this
 * forwards the login cookie from the incoming page request:
 *   const api = await getServerApi()
 *   const { data } = await api.get<Transaction[]>("/transactions")
 */
export async function getServerApi() {
  const session = (await cookies()).get(SESSION_COOKIE)
  return createApiClient({
    baseURL: env.API_URL, // the server calls the backend directly
    headers: session ? { cookie: `${SESSION_COOKIE}=${session.value}` } : {},
  })
}
