import { cache } from "react"
import { cookies } from "next/headers"

import { getMe, type CurrentUser } from "@/api/auth.apis"
import { SESSION_COOKIE, getServerApi } from "@/lib/api-server"

export type { CurrentUser }

/**
 * The logged-in user, or null. Server-only (reads the request cookies).
 * Wrapped in `cache`, so the layout and the page share one API call per request.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  // No cookie → not logged in, no need to ask the API.
  if (!(await cookies()).has(SESSION_COOKIE)) return null

  try {
    const { data } = await getMe(await getServerApi())
    return data ?? null
  } catch {
    // 401 (expired/invalid session) or API not reachable
    return null
  }
})
