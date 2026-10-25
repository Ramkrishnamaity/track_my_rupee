"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Pencil, Plus } from "lucide-react"
import { toast } from "sonner"

import {
  CATEGORY_TYPE,
  categoryTypeName,
  createCategory,
  updateCategory,
  type Category,
} from "@/api/category.apis"
import { LoadingButton } from "@/components/app/loading-button"
import { Badge } from "@/components/ui/badge"
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
import { TypeSwitch } from "@/components/transactions/type-switch"
import { ApiError } from "@/lib/api"
import type { TransactionType } from "@/api/category.apis"
import { cn } from "@/lib/utils"

const PRESET_COLORS = [
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#14B8A6",
  "#0EA5E9",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
  "#64748B",
  "#78716C",
]

/** "Add category" button + form (type, name, color). New categories start active. */
export function AddCategoryDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 rounded-xl px-4">
          <Plus />
          <span className="hidden sm:inline">Add category</span>
          <span className="sr-only sm:hidden">Add category</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl sm:max-w-md">
        {/* Mounted fresh on every open, so the fields reset each time. */}
        {open && <CategoryForm onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  )
}

/** Pencil button + form to change a category's name and color. */
export function EditCategoryDialog({ category }: { category: Category }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="rounded-lg" aria-label={`Edit ${category.name}`}>
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl sm:max-w-md">
        {open && <CategoryForm category={category} onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  )
}

/** Add mode when `category` is missing; edit mode (name + color only) when given. */
function CategoryForm({ category, onDone }: { category?: Category; onDone: () => void }) {
  const router = useRouter()
  const editing = Boolean(category)
  const [type, setType] = useState<TransactionType>(category ? categoryTypeName(category.type) : "expense")
  const [name, setName] = useState(category?.name ?? "")
  const [color, setColor] = useState(category?.colourCode ?? PRESET_COLORS[6])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(undefined)
    try {
      const { message } = category
        ? await updateCategory(category.id, { name, colourCode: color })
        : await createCategory({ name, type: CATEGORY_TYPE[type], colourCode: color })
      toast.success(message)
      onDone()
      router.refresh() // reload the list with the change
    } catch (err) {
      // e.g. "You already have a category with this name": shown in the form
      setError(err instanceof ApiError ? err.message : "Couldn't save the category")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <DialogHeader>
        <DialogTitle className="text-lg">{editing ? "Edit category" : "Add category"}</DialogTitle>
        <DialogDescription>
          {editing
            ? "Change the name or color of this category."
            : "Create a category to organise your transactions."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-5">
        {editing ? (
          // The type can't change after creation (its transactions depend on it).
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            Type:
            <Badge variant={type === "income" ? "income" : "expense"} className="capitalize">
              {type}
            </Badge>
          </p>
        ) : (
          <TypeSwitch value={type} onChange={setType} />
        )}

        <div className="grid gap-2">
          <Label htmlFor="cat-name">Name</Label>
          <Input
            id="cat-name"
            name="name"
            required
            maxLength={20}
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={type === "income" ? "e.g. Bonus" : "e.g. Pets"}
            className="h-10 rounded-xl"
          />
        </div>

        <div className="grid gap-2">
          <Label id="cat-color-label">Color</Label>
          <div role="radiogroup" aria-labelledby="cat-color-label" className="grid grid-cols-6 gap-2">
            {PRESET_COLORS.map((c) => {
              const selected = c.toLowerCase() === color.toLowerCase()
              return (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-lg text-white outline-none transition-transform hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/50",
                    selected && "ring-2 ring-foreground/70 ring-offset-2 ring-offset-popover"
                  )}
                  style={{ background: c }}
                >
                  {selected && <Check className="size-4" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Live preview */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          Preview:
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
            style={{ background: `${color}1F`, color }}
          >
            <span className="size-2 rounded-full" style={{ background: color }} />
            {name.trim() || "Category name"}
          </span>
        </div>
      </div>

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
        <LoadingButton type="submit" className="h-10 rounded-xl px-5" loading={saving} loadingText="Saving…">
          {editing ? "Save changes" : "Save category"}
        </LoadingButton>
      </DialogFooter>
    </form>
  )
}
