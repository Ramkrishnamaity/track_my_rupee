import { redirect } from "next/navigation"

import { ApiError, type ApiClient, type ApiResponse } from "@/lib/api"
import { getServerApi } from "@/lib/api-server"
import { MIN_LOADING_MS, withMinLoading } from "@/lib/min-loading"

/**
 * Runs one API call on the Next.js server for a Suspense section:
 * keeps a loader up for at least `minMs` (pass 0 when there's no loader),
 * sends an expired session home, and returns the response data,
 * or null if the call failed (show the error state).
 *
 *   const totals = await loadOnServer((client) => getSummary(period, client), 0)
 */
export async function loadOnServer<T>(
  request: (client: ApiClient) => Promise<ApiResponse<T>>,
  minMs = MIN_LOADING_MS
): Promise<T | null> {
  try {
    const { data } = await withMinLoading(request(await getServerApi()), minMs)
    return data ?? null
  } catch (err) {
    if (err instanceof ApiError && err.statusCode === 401) redirect("/") // session expired
    return null
  }
}
