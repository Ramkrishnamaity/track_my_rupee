"use client"

import type { Category } from "@/api/category.apis"
import { QueryFilter } from "@/components/app/query-filter"

/** Category filter. Stored as ?category=<id> (absent = all). */
export function CategoryFilter({
  value,
  categories,
}: {
  value: string
  /** Categories to offer (already narrowed by the type filter). */
  categories: Category[]
}) {
  return (
    <QueryFilter
      param="category"
      label="Category"
      value={value}
      defaultValue="all"
      options={[
        { value: "all", label: "All" },
        ...categories.map((c) => ({ value: String(c.id), label: c.name, color: c.colourCode })),
      ]}
    />
  )
}
