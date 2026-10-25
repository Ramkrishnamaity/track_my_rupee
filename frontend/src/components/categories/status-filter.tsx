"use client"

import { QueryFilter } from "@/components/app/query-filter"

export type StatusFilterValue = "all" | "active" | "inactive"

/** All / Active / Inactive filter. Stored as ?status= (absent = active). */
export function StatusFilter({ value }: { value: StatusFilterValue }) {
  return (
    <QueryFilter
      param="status"
      label="Status"
      value={value}
      defaultValue="active"
      options={[
        { value: "all", label: "All" },
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ]}
    />
  )
}
