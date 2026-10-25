"use client"

import { QueryFilter } from "@/components/app/query-filter"
import type { TransactionType } from "@/api/category.apis"

export type TypeFilterValue = "all" | TransactionType

/** All / Expense / Income filter. Stored in the URL as ?type= (absent = all). */
export function TypeFilter({ value }: { value: TypeFilterValue }) {
  return (
    <QueryFilter
      param="type"
      label="Type"
      value={value}
      defaultValue="all"
      options={[
        { value: "all", label: "All" },
        { value: "expense", label: "Expense" },
        { value: "income", label: "Income" },
      ]}
    />
  )
}
