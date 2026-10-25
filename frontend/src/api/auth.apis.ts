import { api, type ApiClient } from "@/lib/api"

// Auth APIs. Every function uses the browser client by default; on the
// Next.js server pass `await getServerApi()` as the last argument.

export type CurrentUser = {
  id: number
  email: string
  name: string
  avatarUrl: string | null
  timezone: string
  /** ISO date string (UTC) */
  createdAt: string
}

/** GET /auth/me: the logged-in user (401 if not logged in) */
export const getMe = (client: ApiClient = api) => client.get<CurrentUser>("/auth/me")

/** POST /auth/logout: clears the login cookie */
export const logout = (client: ApiClient = api) => client.post("/auth/logout")
