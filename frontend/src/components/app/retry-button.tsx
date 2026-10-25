"use client"

import { useRouter } from "next/navigation"
import { RotateCw } from "lucide-react"

import { Button } from "@/components/ui/button"

/** "Try again" for error states: reloads the page's server data. */
export function RetryButton() {
  const router = useRouter()
  return (
    <Button variant="outline" className="rounded-xl" onClick={() => router.refresh()}>
      <RotateCw /> Try again
    </Button>
  )
}
