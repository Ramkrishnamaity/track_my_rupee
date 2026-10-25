"use client"

import type { TransactionType } from "@/api/category.apis"
import { cn } from "@/lib/utils"

/** [ Expense | Income ] segmented switch used in the add forms. */
export function TypeSwitch({
  value,
  onChange,
}: {
  value: TransactionType
  onChange: (value: TransactionType) => void
}) {
  return (
    <div role="radiogroup" aria-label="Type" className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
      {(["expense", "income"] as const).map((t) => (
        <button
          key={t}
          type="button"
          role="radio"
          aria-checked={value === t}
          onClick={() => onChange(t)}
          className={cn(
            "h-9 rounded-lg text-sm font-medium capitalize transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
            value === t
              ? cn("bg-card shadow-sm", t === "income" ? "text-income" : "text-expense")
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {t}
        </button>
      ))}
    </div>
  )
}
