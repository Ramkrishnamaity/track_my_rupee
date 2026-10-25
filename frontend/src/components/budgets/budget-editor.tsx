"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CircleAlert, RotateCw, Target } from "lucide-react"
import { toast } from "sonner"

import { saveBudgets, type BudgetItem } from "@/api/budget.apis"
import { CATEGORY_STATUS } from "@/api/category.apis"
import { TableEmptyRow } from "@/components/app/empty-state"
import { LoadingButton } from "@/components/app/loading-button"
import { TableLoaderRow } from "@/components/app/page-loader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ApiError } from "@/lib/api"
import { formatINR } from "@/lib/format"
import { cn } from "@/lib/utils"

const COLUMNS = 4

/** Input text per category id. "" = no budget. */
type Limits = Record<number, string>

const toLimits = (rows: BudgetItem[]): Limits =>
  Object.fromEntries(rows.map((r) => [r.categoryId, r.amount > 0 ? String(r.amount) : ""]))

/** "" → 0 (remove); otherwise a number ≥ 0 with at most 2 decimals, or null if invalid. */
function parseAmount(raw: string): number | null {
  if (raw.trim() === "") return 0
  const value = Number(raw)
  if (!Number.isFinite(value) || value < 0 || !/^\d+(\.\d{1,2})?$/.test(raw.trim())) return null
  return value
}

type BudgetEditorProps = {
  year: number
  month: number
  items?: BudgetItem[]
  /** True while the month is loading: header + loader row. */
  loading?: boolean
  /** True when the month couldn't be loaded. */
  loadFailed?: boolean
}

/**
 * Month budgets per expense category: type a limit, see spent and progress, save.
 * The page remounts this (via `key`) when the month changes, which drops unsaved edits.
 */
export function BudgetEditor({
  year,
  month,
  items = [],
  loading = false,
  loadFailed = false,
}: BudgetEditorProps) {
  const router = useRouter()
  const [rows, setRows] = useState(items)
  const [limits, setLimits] = useState(() => toLimits(items))
  const [saving, setSaving] = useState(false)

  const saved = toLimits(rows)
  const changed = rows.filter((r) => limits[r.categoryId] !== saved[r.categoryId])
  const hasInvalid = rows.some((r) => parseAmount(limits[r.categoryId] ?? "") === null)

  async function save() {
    setSaving(true)
    try {
      const { message, data } = await saveBudgets({
        year,
        month,
        items: changed.map((r) => ({
          categoryId: r.categoryId,
          amount: parseAmount(limits[r.categoryId] ?? "") ?? 0,
        })),
      })
      // The server returns the refreshed month (incl. `spent` for new budgets).
      const fresh = data?.items ?? []
      setRows(fresh)
      setLimits(toLimits(fresh))
      toast.success(message)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't save the budgets")
    } finally {
      setSaving(false)
    }
  }

  const showFooter = !loading && !loadFailed && rows.length > 0

  return (
    <div className="grid gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead className="w-44">Budget</TableHead>
            <TableHead className="text-right">Spent</TableHead>
            <TableHead className="w-[32%]">Progress</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableLoaderRow colSpan={COLUMNS} label="Loading budgets…" />
          ) : loadFailed ? (
            <TableEmptyRow
              colSpan={COLUMNS}
              tone="error"
              icon={CircleAlert}
              title="Couldn't load budgets"
              action={
                <Button variant="outline" className="rounded-xl" onClick={() => router.refresh()}>
                  <RotateCw /> Try again
                </Button>
              }
            />
          ) : rows.length === 0 ? (
            <TableEmptyRow colSpan={COLUMNS} icon={Target} title="No expense categories yet" />
          ) : (
            rows.map((row) => {
              const raw = limits[row.categoryId] ?? ""
              const limit = parseAmount(raw)
              const invalid = limit === null
              const hasSavedBudget = row.budgetId !== null
              const hasLimit = hasSavedBudget && limit !== null && limit > 0
              const pct = hasLimit ? Math.round((row.spent / limit) * 100) : 0
              const over = hasLimit && row.spent > limit
              const near = hasLimit && !over && pct >= 80

              return (
                <TableRow key={row.categoryId}>
                  <TableCell>
                    <span className="flex items-center gap-2.5 font-medium">
                      <span className="size-3 shrink-0 rounded-full" style={{ background: row.colourCode }} />
                      {row.categoryName}
                      {row.categoryStatus === CATEGORY_STATUS.inactive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </span>
                  </TableCell>
                  <TableCell>
                    {/* Fixed width: a full-width input has no size of its own, so the
                        column would collapse when the table scrolls on small screens. */}
                    <label className="relative block w-40">
                      <span className="sr-only">Budget for {row.categoryName}</span>
                      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
                        ₹
                      </span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        placeholder="Set budget"
                        value={raw}
                        disabled={saving}
                        aria-invalid={invalid}
                        onChange={(e) => setLimits((l) => ({ ...l, [row.categoryId]: e.target.value }))}
                        className={cn(
                          "amount h-9 w-full rounded-lg border bg-background pr-2 pl-7 text-sm outline-none placeholder:font-sans placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-60",
                          invalid &&
                            "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                        )}
                      />
                    </label>
                  </TableCell>
                  <TableCell className="amount text-right font-medium">
                    {/* Spending is tracked per budget; without one it isn't known here. */}
                    {hasSavedBudget ? formatINR(row.spent) : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="min-w-56">
                    {hasLimit ? (
                      <div className="flex items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              over ? "bg-expense" : near ? "bg-warning" : "bg-primary"
                            )}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        {over ? (
                          <Badge variant="expense">Over by {formatINR(row.spent - limit)}</Badge>
                        ) : (
                          <span className="w-16 text-right text-xs text-muted-foreground">{pct}% used</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {!hasSavedBudget && limit ? "Save to see progress" : "No budget set"}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      {showFooter && (
        <div className="flex items-center justify-end gap-2 border-t px-1 pt-4">
          {hasInvalid ? (
            <span className="mr-auto text-sm text-destructive">Use amounts like 5000 or 5000.50</span>
          ) : (
            changed.length > 0 && (
              <span className="mr-auto text-sm text-muted-foreground">You have unsaved changes</span>
            )
          )}
          <Button
            variant="outline"
            className="h-10 rounded-xl"
            disabled={changed.length === 0 || saving}
            onClick={() => setLimits(saved)}
          >
            Reset
          </Button>
          <LoadingButton
            className="h-10 rounded-xl px-5"
            disabled={changed.length === 0 || hasInvalid}
            loading={saving}
            loadingText="Saving…"
            onClick={save}
          >
            Save budgets
          </LoadingButton>
        </div>
      )}
    </div>
  )
}
