import type { Metadata } from "next"
import Link from "next/link"
import { Compass } from "lucide-react"

import { Logo } from "@/components/brand/logo"
import { EmptyState } from "@/components/app/empty-state"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = { title: "Page not found" }

/** 404 for any unknown URL. */
export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16">
      <Link href="/" aria-label="TrackMyRupee home">
        <Logo />
      </Link>
      <EmptyState
        icon={Compass}
        title="Page not found"
        action={
          <Button asChild className="rounded-xl">
            <Link href="/">Go home</Link>
          </Button>
        }
      />
    </main>
  )
}
