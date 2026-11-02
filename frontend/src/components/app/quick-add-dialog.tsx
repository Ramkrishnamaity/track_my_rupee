"use client"

import { useState } from "react"
import { ArrowDown, Check, Send, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { readQuickAdd, type QuickAddResult } from "@/components/app/quick-add-sample"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { formatINR } from "@/lib/format"
import { cn } from "@/lib/utils"

/** Header "Quick add" button + popup: type a transaction like you'd say it, review, save. */
export function QuickAddDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          aria-label="Quick add"
          className="h-10 rounded-xl border-0 bg-linear-to-r from-brand-from to-brand-to px-3 text-white shadow-md shadow-primary/25 hover:opacity-90 sm:px-4"
        >
          <Sparkles />
          <span className="hidden sm:inline">Quick add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl sm:max-w-lg">
        {/* Mounted fresh on every open, so it starts empty each time. */}
        {open && <QuickAddForm onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  )
}

// Design phase: the text is read by simple rules (quick-add-sample.ts) after a short pause, and
// Save only shows a toast; nothing is stored yet. The real AI parser and save come later.
function QuickAddForm({ onDone }: { onDone: () => void }) {
  const [text, setText] = useState("")
  const [reading, setReading] = useState(false)
  const [result, setResult] = useState<QuickAddResult | null>(null)

  function read() {
    if (!text.trim() || reading) return
    setReading(true)
    setResult(null)
    setTimeout(
      () => {
        setResult(readQuickAdd(text))
        setReading(false)
      },
      600 + Math.random() * 500
    )
  }

  function save() {
    toast.success(`${result?.type === "income" ? "Income" : "Expense"} added`)
    onDone()
  }

  const fields = result && [
    { label: "Amount", value: result.amount === null ? "—" : formatINR(result.amount), amount: true },
    { label: "Type", value: result.type === "income" ? "Income" : "Expense" },
    { label: "Category", value: result.category },
    { label: result.type === "income" ? "Received via" : "Paid via", value: result.method },
    { label: "Date", value: result.date },
    { label: "Note", value: result.note },
  ]

  return (
    <div className="grid gap-4">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-lg">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/12 text-primary">
            <Sparkles className="size-4" />
          </span>
          Quick add
        </DialogTitle>
        <DialogDescription>Type it like you&apos;d say it</DialogDescription>
      </DialogHeader>

      <form
        className="relative flex"
        onSubmit={(e) => {
          e.preventDefault()
          read()
        }}
      >
        <label className="sr-only" htmlFor="quick-add">
          Describe a transaction
        </label>
        <textarea
          id="quick-add"
          rows={3}
          autoFocus
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setResult(null) // the shown details no longer match the text
          }}
          onKeyDown={(e) => {
            // Enter reads the text, Shift+Enter adds a new line.
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault()
              read()
            }
          }}
          placeholder="e.g. Spent 250 on lunch at Swiggy yesterday"
          className="min-h-24 w-full resize-none rounded-xl border bg-background px-3 py-2.5 pr-12 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
        />
        <Button
          type="submit"
          size="icon"
          className="absolute right-2 bottom-2 size-8 rounded-lg"
          disabled={!text.trim() || reading}
          aria-label="Read"
        >
          {reading ? <Spinner /> : <Send />}
        </Button>
      </form>

      {reading && (
        <p
          className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground"
          aria-live="polite"
        >
          <Sparkles className="size-4 animate-pulse text-primary" /> Understanding…
        </p>
      )}

      {fields && (
        <div className="grid gap-4 animate-in fade-in-0 slide-in-from-top-1 duration-300">
          <div className="flex justify-center text-muted-foreground">
            <ArrowDown className="size-4" />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {fields.map((f) => (
              <div key={f.label} className="min-w-0 rounded-2xl bg-muted/60 px-3.5 py-3">
                <p className="text-[11px] text-muted-foreground">{f.label}</p>
                <p className={cn("mt-0.5 truncate", f.amount ? "amount font-semibold" : "font-medium")}>
                  {f.value}
                </p>
              </div>
            ))}
          </div>

          {result.amount === null ? (
            <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Couldn&apos;t find an amount. Add one, e.g. &ldquo;250&rdquo; or &ldquo;15k&rdquo;.
            </p>
          ) : (
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-income/10 px-4 py-3 text-sm">
              <span className="flex items-center gap-2 font-medium text-income">
                <Check className="size-4" /> Looks right? Save in one tap
              </span>
              <Button
                size="sm"
                className="rounded-full bg-income px-4 text-income-foreground hover:bg-income/90"
                onClick={save}
              >
                Save
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
