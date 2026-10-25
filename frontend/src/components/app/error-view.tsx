"use client"

import { useEffect } from "react"
import { CircleAlert, RotateCw } from "lucide-react"

import { EmptyState } from "@/components/app/empty-state"
import { Button } from "@/components/ui/button"

/** Body of the error.tsx pages: shown when a page crashes unexpectedly. */
export function ErrorView({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <EmptyState
      icon={CircleAlert}
      tone="error"
      title="Something went wrong"
      className="flex-1 py-24"
      action={
        <Button variant="outline" className="rounded-xl" onClick={() => retry()}>
          <RotateCw /> Try again
        </Button>
      }
    />
  )
}
