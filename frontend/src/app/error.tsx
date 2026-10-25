"use client"

import { ErrorView } from "@/components/app/error-view"

// The home page crashed (logged-in pages use (app)/error.tsx).
export default function RootError(props: { error: unknown; retry: () => void }) {
  return <ErrorView {...props} />
}
