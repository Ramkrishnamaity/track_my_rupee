"use client"

import { ErrorView } from "@/components/app/error-view"

// A logged-in page crashed: shown inside the app (sidebar and header stay).
export default function AppError(props: { error: unknown; retry: () => void }) {
  return <ErrorView {...props} />
}
