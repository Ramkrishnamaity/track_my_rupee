"use client"

import { Send, Sparkles } from "lucide-react"

import { BlockedSection } from "@/components/app/blocked-section"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Design only: natural-language parsing gets wired up with the AI feature.
/** Header "Quick add" button + popup to type a transaction like you'd say it. */
export function QuickAddDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          aria-label="Quick add"
          className="h-10 rounded-xl border-0 bg-linear-to-r from-brand-from to-brand-to px-3 text-white shadow-md shadow-primary/25 hover:opacity-90 sm:px-4"
        >
          <Sparkles />
          <span className="hidden sm:inline">Quick add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-0 rounded-2xl p-0 sm:max-w-lg">
        {/* Not built yet: the whole card is unusable, with an "Under development" cursor label.
            The padding is on the wrapper so the cursor covers the full card. The ✕ sits on top
            (outside the blocked part) and still closes it, as do clicking outside and Esc. */}
        <BlockedSection className="grid gap-4 p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <Sparkles className="size-4" />
              </span>
              Quick add
            </DialogTitle>
            <DialogDescription>Type it like you&apos;d say it</DialogDescription>
          </DialogHeader>
          <form className="relative flex">
            <label className="sr-only" htmlFor="quick-add">
              Describe a transaction
            </label>
            <textarea
              id="quick-add"
              rows={4}
              placeholder="e.g. Spent 250 on lunch at Swiggy yesterday"
              className="min-h-28 w-full resize-none rounded-xl border bg-background px-3 py-2.5 pr-12 text-sm outline-none placeholder:text-muted-foreground"
            />
            <Button
              type="button"
              size="icon"
              className="absolute right-2 bottom-2 size-8 rounded-lg"
              aria-label="Add"
            >
              <Send />
            </Button>
          </form>
        </BlockedSection>
      </DialogContent>
    </Dialog>
  )
}
