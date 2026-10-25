/** Shortest time a page/section loader stays on screen, so it doesn't just flash. */
export const MIN_LOADING_MS = 500

/**
 * Waits for `work`, but takes at least MIN_LOADING_MS in total. Use it for the
 * data behind a PageLoader:
 *   const result = await withMinLoading(getCategories(...))
 * A 10 ms response is shown after 500 ms; a 900 ms response after 900 ms (no extra wait).
 * Errors are also held until the minimum, so the loader never flickers.
 */
export async function withMinLoading<T>(work: Promise<T>, ms = MIN_LOADING_MS): Promise<T> {
  const minimum = new Promise((resolve) => setTimeout(resolve, ms))
  try {
    return await work
  } finally {
    await minimum
  }
}
