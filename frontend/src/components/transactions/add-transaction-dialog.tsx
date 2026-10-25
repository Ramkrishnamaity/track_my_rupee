"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { CATEGORY_STATUS, CATEGORY_TYPE, type Category } from "@/api/category.apis"
import {
  PAYMENT_METHOD,
  PAYMENT_METHOD_LABEL,
  createTransaction,
  type PaymentMethod,
} from "@/api/transaction.apis"
import { LoadingButton } from "@/components/app/loading-button"
import { TypeSwitch } from "@/components/transactions/type-switch"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ApiError } from "@/lib/api"
import type { TransactionType } from "@/api/category.apis"
import { cn } from "@/lib/utils"

const pad = (n: number) => String(n).padStart(2, "0")

/** Now on the user's own clock, in the formats <input type="date|time"> expect. */
function nowForInputs() {
  const d = new Date()
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  }
}

const fieldClass = "h-10 rounded-xl"

/** "Add transaction" button + manual entry form. `categories` = all the user's categories. */
export function AddTransactionDialog({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 rounded-xl px-4">
          <Plus />
          <span className="hidden sm:inline">Add transaction</span>
          <span className="sr-only sm:hidden">Add transaction</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl sm:max-w-lg">
        {/* Mounted fresh on every open, so the fields reset each time. */}
        {open && <TransactionForm categories={categories} onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function TransactionForm({ categories, onDone }: { categories: Category[]; onDone: () => void }) {
  const router = useRouter()
  const [defaults] = useState(nowForInputs)
  const [type, setType] = useState<TransactionType>("expense")
  const [categoryId, setCategoryId] = useState("")
  const [method, setMethod] = useState<string>(String(PAYMENT_METHOD.upi))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>()

  // Only active categories of the chosen type can be used.
  const options = categories.filter(
    (c) => c.type === CATEGORY_TYPE[type] && c.status === CATEGORY_STATUS.active
  )

  function changeType(next: TransactionType) {
    setType(next)
    setCategoryId("") // the old choice belongs to the other type
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    if (!categoryId) {
      setError(`Choose a ${type === "income" ? "source" : "category"}`)
      return
    }

    setSaving(true)
    setError(undefined)
    try {
      const { message } = await createTransaction({
        type: CATEGORY_TYPE[type],
        categoryId: Number(categoryId),
        paymentMethod: Number(method) as PaymentMethod,
        title: String(form.get("title")),
        amount: Number(form.get("amount")),
        date: String(form.get("date")),
        time: String(form.get("time")),
      })
      toast.success(message)
      onDone()
      router.refresh() // reload the list (totals and budgets were updated on the server)
    } catch (err) {
      // e.g. "Transaction date and time can't be in the future": shown in the form
      setError(err instanceof ApiError ? err.message : "Couldn't save the transaction")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <DialogHeader>
        <DialogTitle className="text-lg">Add transaction</DialogTitle>
        <DialogDescription>Enter the details of your income or expense.</DialogDescription>
      </DialogHeader>

      <fieldset disabled={saving} className="grid gap-4">
        <TypeSwitch value={type} onChange={changeType} />

        <div className="grid gap-2">
          <Label htmlFor="tx-amount">Amount</Label>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground">
              ₹
            </span>
            <Input
              id="tx-amount"
              name="amount"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              required
              autoFocus
              placeholder="0"
              className={cn(fieldClass, "amount pl-8 text-lg font-semibold")}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="tx-title">Description</Label>
          <Input
            id="tx-title"
            name="title"
            required
            maxLength={50}
            placeholder={type === "income" ? "e.g. Salary – Acme Corp" : "e.g. Lunch at Swiggy"}
            className={fieldClass}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="tx-category">{type === "income" ? "Source" : "Category"}</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="tx-category" className={cn(fieldClass, "w-full")}>
                <SelectValue placeholder={options.length ? "Select" : "None yet"} />
              </SelectTrigger>
              <SelectContent>
                {options.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    <span className="size-2 shrink-0 rounded-full" style={{ background: c.colourCode }} />
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {options.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No active {type} categories.{" "}
                <Link href="/categories" className="font-medium text-primary hover:underline">
                  Add one
                </Link>
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tx-method">{type === "income" ? "Received via" : "Paid via"}</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger id="tx-method" className={cn(fieldClass, "w-full")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PAYMENT_METHOD_LABEL).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tx-date">Date</Label>
            <Input
              id="tx-date"
              name="date"
              type="date"
              required
              max={defaults.date}
              defaultValue={defaults.date}
              className={fieldClass}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tx-time">Time</Label>
            <Input
              id="tx-time"
              name="time"
              type="time"
              required
              defaultValue={defaults.time}
              className={fieldClass}
            />
          </div>
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="-mt-2 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" className="h-10 rounded-xl" disabled={saving}>
            Cancel
          </Button>
        </DialogClose>
        <LoadingButton
          type="submit"
          className="h-10 rounded-xl px-5"
          loading={saving}
          loadingText="Saving…"
          disabled={options.length === 0}
        >
          Save {type}
        </LoadingButton>
      </DialogFooter>
    </form>
  )
}
