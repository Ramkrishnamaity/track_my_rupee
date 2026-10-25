"use client"

import { usePathname, useRouter } from "next/navigation"

/**
 * Returns a function that sets some ?query values while keeping the others
 * (e.g. changing the chart range keeps the selected ?month=).
 * Pass `null` to remove a value.
 */
export function useUpdateSearchParams() {
  const router = useRouter()
  const pathname = usePathname()

  return (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(window.location.search)
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) params.delete(key)
      else params.set(key, value)
    }
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }
}
